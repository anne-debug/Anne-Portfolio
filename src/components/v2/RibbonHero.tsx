"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

import { V2 } from "./palette";

/**
 * Home hero, v2: a red ribbon that flows in from the left, loops once around
 * Anne's portrait and runs off to the right.
 *
 * The ribbon is one SVG path drawn twice. The first copy sits behind the
 * photo; the second sits in front of it, masked out where the loop's back arc
 * crosses the photo, so the loop reads as wrapping around her. Both copies
 * draw themselves in on load (pathLength), then the loose ends keep swaying
 * and lean toward the pointer. "Replay" draws it in again.
 *
 * Everything shares one 1200x660 coordinate space. Phones crop the same scene
 * to the portrait with a narrower viewBox and stack the text around it.
 */

const TITLE_1 = "Hi, this is";
const TITLE_2 = "Anne Lin";
const TAGLINE =
  "I’m a Product designer with tech BG, passionate about transforming complexity into clear, useful products that spark moments of delight and connection";

const PHOTO = { x: 600, y: 112, w: 280, h: 350 };
/** The part of the ribbon above this line, over the photo, is behind her. */
const RING_MID = 372;

function r(n: number) {
  return Math.round(n * 10) / 10;
}

function ribbonPath(w: number, lean: number) {
  const a = w + lean;
  const b = -w * 0.8 + lean * 0.6;
  return [
    `M -60,${r(250 + a)}`,
    `C 160,${r(200 - w + lean)} 330,${r(330 + w * 0.5)} 470,410`,
    `C 560,455 860,465 960,410`,
    `C 1010,380 990,330 900,320`,
    `C 800,306 620,306 540,326`,
    `C 470,342 450,386 520,425`,
    `C 640,500 900,${r(560 + b)} 1260,${r(520 - w + lean * 0.4)}`,
  ].join(" ");
}

function Stage({ viewBox, d, drawKey, className }: { viewBox: string; d: MotionValue<string>; drawKey: number; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion() ?? false;
  const draw = reduce
    ? { initial: { pathLength: 1 }, animate: { pathLength: 1 } }
    : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 2.2, ease: [0.45, 0, 0.2, 1] as const, delay: 0.3 } };
  const stroke = { fill: "none", stroke: V2.red, strokeWidth: 30, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <svg viewBox={viewBox} className={className} preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        <clipPath id={`${uid}-photo`}>
          <rect x={PHOTO.x} y={PHOTO.y} width={PHOTO.w} height={PHOTO.h} rx={36} />
        </clipPath>
        <mask id={`${uid}-front`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={1600} height={1100}>
          <rect x={-200} y={-200} width={1600} height={1100} fill="#fff" />
          <rect x={PHOTO.x - 4} y={PHOTO.y - 4} width={PHOTO.w + 8} height={RING_MID - PHOTO.y + 4} fill="#000" />
        </mask>
      </defs>

      <motion.path key={`b${drawKey}`} d={d} {...stroke} {...draw} />

      <motion.g
        key={`p${drawKey}`}
        initial={reduce ? false : { opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 18 }}
        style={{ originX: "740px", originY: "290px" }}
      >
        <rect x={PHOTO.x} y={PHOTO.y} width={PHOTO.w} height={PHOTO.h} rx={36} fill={V2.sky} />
        <image
          href="/images/anne-portrait.webp"
          x={PHOTO.x}
          y={PHOTO.y}
          width={PHOTO.w}
          height={PHOTO.h}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${uid}-photo)`}
        />
      </motion.g>

      <g mask={`url(#${uid}-front)`}>
        <motion.path key={`f${drawKey}`} d={d} {...stroke} {...draw} />
      </g>
    </svg>
  );
}

export function RibbonHero() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const [drawKey, setDrawKey] = useState(0);
  const t = useMotionValue(0);
  const lean = useSpring(0, { stiffness: 60, damping: 14 });

  useAnimationFrame((time) => {
    if (!reduce) t.set(time / 1000);
  });

  const d = useTransform([t, lean], ([time, l]: number[]) => ribbonPath(Math.sin(time * 0.9) * 22, l));

  function onMove(e: React.PointerEvent) {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    lean.set(((e.clientY - box.top) / box.height - 0.5) * 70);
  }

  const buttons = (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/about"
        className="rounded-full px-6 py-3 text-[16px] font-medium text-white transition-transform hover:scale-105"
        style={{ fontFamily: "var(--font-dm-sans)", background: V2.orange }}
      >
        About me
      </Link>
      <button
        type="button"
        onClick={() => setDrawKey((k) => k + 1)}
        className="rounded-full bg-white px-5 py-3 text-[15px] font-medium transition-transform hover:scale-105"
        style={{ fontFamily: "var(--font-dm-sans)", color: V2.ink, boxShadow: "0 0 0 1px rgba(42,49,50,0.15)" }}
      >
        Replay the ribbon
      </button>
    </div>
  );

  const title = (cls: string) => (
    <h1 className={`text-deep-blue ${cls}`} style={{ fontFamily: "var(--font-mansalva)", lineHeight: 1.02, letterSpacing: "-1px" }}>
      <span className="block">{TITLE_1}</span>
      <span className="block">{TITLE_2}</span>
    </h1>
  );

  const tagline = (cls: string) => (
    <p className={`text-dark-charcoal ${cls}`} style={{ fontFamily: "var(--font-dm-sans)", lineHeight: 1.4 }}>
      {TAGLINE}
    </p>
  );

  return (
    <section ref={ref} onPointerMove={onMove} className="relative w-full pt-6" aria-label="Introduction">
      {/* phone */}
      <div className="flex flex-col items-center gap-4 text-center tablet:hidden">
        {title("text-[52px]")}
        <Stage viewBox="420 70 640 520" d={d} drawKey={drawKey} className="h-auto w-[calc(100%+40px)] max-w-none" />
        {tagline("max-w-[340px] text-[15px]")}
        {buttons}
      </div>

      {/* tablet and up */}
      <div className="relative hidden aspect-[1200/660] w-full tablet:block">
        <Stage viewBox="0 0 1200 660" d={d} drawKey={drawKey} className="absolute inset-0 h-full w-full overflow-visible" />
        <div className="absolute left-0 top-[4%]">{title("text-[64px] desktop:text-[92px]")}</div>
        <div className="absolute bottom-[3%] left-0 flex w-[34%] flex-col gap-5">
          {tagline("text-[16px] desktop:text-[18px]")}
          {buttons}
        </div>
      </div>
    </section>
  );
}
