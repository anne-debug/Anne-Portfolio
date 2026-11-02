"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

/**
 * The parts a self-playing wireframe is made of.
 *
 * Solution Overview shows three drawings, and two of them are a move rather
 * than a screen: pinning something to Home, and choosing a different artifact
 * in Metrics. A still frame can show the state before or the state after; it
 * cannot show that one caused the other. These loop instead.
 *
 * The Issues demo got here first and keeps its own copy of this — it is
 * working and out of scope, and the point of sharing code is to stop drift,
 * not to go and introduce some.
 */

/** One beat of a loop: a name, and how long it is held in milliseconds. */
export interface Beat {
  id: string;
  ms: number;
}

/**
 * Runs a loop of beats while the drawing is on screen.
 *
 * Holds at the first beat for a visitor who asked for reduced motion, and
 * stops entirely while the section is scrolled past — a drawing nobody is
 * looking at has no business running timers.
 */
export function useBeats(beats: readonly Beat[]) {
  const root = useRef<HTMLDivElement | null>(null);
  const inView = useInView(root, { amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduceMotion || !inView) return;
    const t = setTimeout(
      () => setI((n) => (n + 1) % beats.length),
      beats[i].ms,
    );
    return () => clearTimeout(t);
  }, [beats, i, inView, reduceMotion]);

  const live = !reduceMotion && inView;
  return {
    root: root as RefObject<HTMLDivElement | null>,
    /** The beat being held, or the first one when the loop is not running. */
    beat: live ? beats[i].id : beats[0].id,
    live,
    reduceMotion: Boolean(reduceMotion),
  };
}

/**
 * The pointer, and the ring it leaves when it presses.
 *
 * An arrow rather than a hand or a tap circle: it stands in for a cursor on
 * the desktop these panels are drawn at. The white outline keeps it readable
 * over a dark row as well as over white.
 */
export function DemoPointer({
  at,
  pressing,
}: {
  /** Where it rests, as a share of the panel it is placed against. */
  at: { left: string; top: string; opacity: number };
  pressing?: boolean;
}) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute z-10 block"
      initial={false}
      animate={at}
      transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
    >
      {pressing ? (
        <motion.span
          className="absolute -top-1.5 -left-1.5 block size-6 rounded-full border"
          style={{ borderColor: "var(--wf-accent)" }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.55, 0], scale: [0.4, 1.25, 1.4] }}
          transition={{ duration: 0.75, delay: 0.55, ease: "easeOut" }}
        />
      ) : null}
      <svg width="13" height="17" viewBox="0 0 13 17" fill="none">
        <path
          d="M1.5 1.2 11 9.1l-4.3.5 2 4.6-2 .9-2-4.6-3.2 3z"
          fill="var(--wf-ink)"
          stroke="#fff"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
    </motion.span>
  );
}

/**
 * The crossfade a panel's contents get when the loop changes them.
 *
 * Short and opacity-only. The panel keeps its size either way, so there is
 * nothing for a longer or livelier transition to cover, and a drawing that
 * slides about reads as a demo of itself rather than of the design.
 */
export function DemoSwap({
  k,
  reduceMotion,
  className,
  children,
}: {
  /** Changing this is what plays the fade. */
  k: string;
  reduceMotion: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      key={k}
      className={className}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
