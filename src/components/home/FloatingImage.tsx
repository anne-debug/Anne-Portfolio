"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

import {
  AppearEffect,
  DragFloat,
  LoopEffect,
  Parallax,
  type EnterState,
} from "@/lib/framer-effects";

import {
  containRect,
  playPaintingBuild,
  type BuildHandle,
  type BuildStyle,
} from "./paintBuild";

/**
 * Framer component "Hero floating image".
 *
 * Six variants, each a single artwork laid into its box with `contain`, which
 * is what Framer's renders measure: the rooster is 689x1447 and still shows
 * whole inside a 198x252 box.
 *
 * On the page each instance is wrapped in the effects Framer hangs off it, in
 * the order Framer nests them: appear outermost, then parallax, then drag, then
 * the tap effect on the artwork itself. The Phone frame carries no appear and
 * no drag effect, only parallax and tap, so both are optional here.
 */

export const HERO_IMAGE_VARIANTS = {
  "Variant 1": "/images/KrnZsAaIfpST3UAK6wS3quNYEsM.png",
  "Variant 2": "/images/fa5MIFdKc3AGXJN8PmONakXBoXw.png",
  "Variant 3": "/images/nR7gXk9U2GWjdWCk3oKOkTJywDU.png",
  "Variant 4": "/images/U0MLykxWpDzK0XAsVrNEno3QNk.png",
  "Variant 5": "/images/x51Yv0saMM5icODfOEBZPpBAU8.png",
  "Variant 6": "/images/xezUDcmZB1DXOG8wjAEGUCozEjE.png",
} as const;

export type HeroImageVariant = keyof typeof HERO_IMAGE_VARIANTS;

/** How long the tapped pose is held before it eases back. */
const HOLD_MS = 3000;
/** Framer's own tap transition: "spring-duration 0.45s 0.25 0s". */
const PRESS = { type: "spring", duration: 0.45, bounce: 0.25 } as const;
/** The return is not part of Framer's data; it is slowed and settled flat. */
const RELEASE = { type: "spring", duration: 0.9, bounce: 0 } as const;

export interface FloatingImageProps {
  variant: HeroImageVariant;
  alt: string;
  /** Absolute placement inside the breakpoint's stage, in Framer's own units. */
  position: Pick<CSSProperties, "left" | "top" | "right" | "bottom"> & {
    width: number;
    height: number;
  };
  /** The layer's own angle. The tap effect turns from here and comes back. */
  rotation?: number;
  /** Framer's tap effect rotates by this much on top of `rotation`. */
  tapRotate?: number;
  appear?: EnterState;
  draggable?: boolean;
  parallaxSpeed?: number;
  priority?: boolean;
  /** How a tap replays the piece being made: pencil, ink, pastel or scribble. */
  buildStyle?: BuildStyle;
}

export function FloatingImage({
  variant,
  alt,
  position,
  rotation = 0,
  tapRotate = 0,
  appear,
  draggable = true,
  parallaxSpeed = 100,
  priority = false,
  buildStyle = "pencil",
}: FloatingImageProps) {
  const { width, height, ...offsets } = position;

  // A tap turns the artwork, it stays turned for three seconds, then it eases
  // back. The angle it returns to is always `rotation`, so repeated taps never
  // accumulate and the resting pose cannot drift.
  const [tapped, setTapped] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A tap also replays the piece being made, from blank paper to finished,
  // stroke by stroke in the piece's own medium, on a canvas laid exactly over
  // the picture. See `paintBuild.ts`.
  const reduceMotion = useReducedMotion();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const build = useRef<BuildHandle | null>(null);

  const playBuild = useCallback(() => {
    const img = imgRef.current;
    const cvs = canvasRef.current;
    if (!img || !cvs || !img.complete || !img.naturalWidth) return;

    // Layout size, which the tilt and the breathing loop do not change.
    const box = containRect(
      img.offsetWidth,
      img.offsetHeight,
      img.naturalWidth,
      img.naturalHeight,
    );
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    build.current?.cancel();
    cvs.width = Math.max(1, Math.round(box.width * dpr));
    cvs.height = Math.max(1, Math.round(box.height * dpr));
    Object.assign(cvs.style, {
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      visibility: "visible",
    });
    img.style.visibility = "hidden";

    let handle: BuildHandle;
    try {
      handle = playPaintingBuild(cvs, img, buildStyle);
    } catch {
      cvs.style.visibility = "hidden";
      img.style.visibility = "";
      return;
    }
    build.current = handle;
    void handle.done.then(() => {
      if (build.current !== handle) return;
      build.current = null;
      img.style.visibility = "";
      cvs.style.visibility = "hidden";
    });
  }, [buildStyle]);

  const onTap = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setTapped(true);
    timer.current = setTimeout(() => setTapped(false), HOLD_MS);
    if (!reduceMotion) playBuild();
  }, [playBuild, reduceMotion]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      build.current?.cancel();
    },
    [],
  );

  const artwork = (
    <motion.div
      className="size-full cursor-pointer"
      /* `rotate` is absolute, never incremented, so the default angle holds. */
      animate={{ rotate: rotation + (tapped ? tapRotate : 0), scale: tapped ? 0.9 : 1 }}
      transition={tapped ? PRESS : RELEASE}
      /* onTap covers mouse, pen and touch; onTapStart would fight the drag. */
      onTap={onTap}
    >
      <LoopEffect
        to={{ scale: 1.02, transition: "spring-duration 1.4s 0 0s" }}
        repeatType="mirror"
        repeatDelay="2s"
        className="relative size-full"
      >
        <Image
          ref={imgRef}
          src={HERO_IMAGE_VARIANTS[variant]}
          alt={alt}
          width={width}
          height={height}
          draggable={false}
          className="pointer-events-none size-full object-contain select-none"
          priority={priority}
        />
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute"
          style={{ visibility: "hidden" }}
        />
      </LoopEffect>
    </motion.div>
  );

  return (
    <div className="absolute" style={{ ...offsets, width, height }}>
      <AppearEffect enter={appear} trigger="onMount" className="size-full">
        <Parallax speed={parallaxSpeed} distance={200} className="size-full">
          {draggable ? (
            <DragFloat freeform snapBack className="size-full">
              {artwork}
            </DragFloat>
          ) : (
            artwork
          )}
        </Parallax>
      </AppearEffect>
    </div>
  );
}
