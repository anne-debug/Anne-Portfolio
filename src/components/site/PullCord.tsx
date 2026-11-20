"use client";

import { useId, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

/**
 * A lamp pull cord: a thin cord ending in a cream plastic pull. Tug it down
 * (drag, or tap/Enter) and it springs back and calls `onToggle`. The cord
 * stretches with the drag, and dips 5px on hover. Pinned to the top right
 * of every page (SiteLamp).
 *
 * Renders the cord and the pull one under the other; the parent places them
 * (a flex column whose top is where the cord hangs from).
 */

/** how far a drag has to pull before it counts */
const CLICK_AT = 26;

function Pull() {
  const id = useId();
  return (
    // 30% larger than the first version (22x36), with a deeper shadow, so it is easier to spot (Anne, 2026-11-20)
    <svg viewBox="0 0 24 40" width={29} height={47} aria-hidden className="drop-shadow-[0_4px_5px_rgba(0,0,0,0.38)]">
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#E9E1D2" />
          <stop offset="0.45" stopColor="#FFFDF7" />
          <stop offset="1" stopColor="#D8CDB8" />
        </linearGradient>
      </defs>
      <rect x={10} y={0} width={4} height={6} rx={1.5} fill="#CFC5B2" />
      <path d="M12 5 C6 5 4 14 4 24 C4 33 7 38 12 38 C17 38 20 33 20 24 C20 14 18 5 12 5 Z" fill={`url(#${id})`} stroke="#BDB19A" strokeWidth={0.8} />
      <path d="M8 14 C7.5 20 7.5 27 8.5 32" fill="none" stroke="#fff" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
    </svg>
  );
}

export function PullCord({
  cord,
  pressed,
  label,
  onToggle,
}: {
  /** cord length at rest, any CSS length */
  cord: string;
  pressed: boolean;
  label: string;
  onToggle: () => void;
}) {
  const dragged = useRef(false);
  const reduce = useReducedMotion() ?? false;
  const y = useMotionValue(0);
  const height = useTransform(y, (v) => `calc(${cord} + ${Math.max(0, v)}px)`);

  /** a tap still shows the tug */
  const tug = () => {
    onToggle();
    if (!reduce) animate(y, [0, CLICK_AT + 6, 0], { duration: 0.45, ease: "easeOut" });
  };

  return (
    <>
      <motion.span aria-hidden className="block w-[1.5px] shrink-0 bg-[#8C8576]" style={{ height }} />
      <motion.button
        type="button"
        aria-pressed={pressed}
        aria-label={label}
        className="pointer-events-auto -mt-px shrink-0 cursor-grab touch-none rounded-full outline-offset-4 active:cursor-grabbing"
        style={{ y }}
        // a hover tugs it 5px, a hint that it moves. The cord above stretches by
        // y and the pull also shifts by y, so y = 2.5 moves the pull 5px.
        whileHover={reduce ? undefined : { y: 2.5, transition: { duration: 0.22, ease: "easeOut" } }}
        drag={reduce ? false : "y"}
        dragConstraints={{ top: 0, bottom: 60 }}
        dragElastic={0.15}
        dragSnapToOrigin
        dragTransition={{ bounceStiffness: 500, bounceDamping: 14 }}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={(_, info) => {
          if (info.offset.y > CLICK_AT) onToggle();
          // a drag doesn't always end in a click (pointer released off the
          // pull); clear the flag after this event so the next tap counts
          window.setTimeout(() => {
            dragged.current = false;
          }, 0);
        }}
        // tap, Enter or Space; the click that ends a drag is skipped
        onClick={() => {
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          tug();
        }}
      >
        <Pull />
      </motion.button>
    </>
  );
}
