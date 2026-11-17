"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

import { V2 } from "./palette";

/**
 * The "Anne Lin" wordmark, alive.
 *
 * Every beat, the whole word takes the next colour in the cycle and each
 * letter independently turns heavy or light. Mansalva has a single weight, so
 * "heavy" is a text stroke in the letter's own colour, which fattens the
 * strokes without changing the glyphs. The word keeps its width, so nothing
 * around it moves.
 *
 * Hovering speeds the beat up. With reduced motion it sits still in orange.
 */

const COLORS = [V2.orange, V2.blue, V2.ink, V2.red, V2.green];
const WORD = "Anne Lin";
const HEAVY = "0.075em";

/** Deterministic first frame, so server and client render the same thing. */
const FIRST = [true, false, true, false, false, true, false, true];

export function AnimatedLogo({ size = 32, className = "", label = true }: { size?: number; className?: string; label?: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const [beat, setBeat] = useState(0);
  const [heavy, setHeavy] = useState<boolean[]>(FIRST);
  const [fast, setFast] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(
      () => {
        setBeat((b) => b + 1);
        setHeavy(Array.from(WORD, () => Math.random() < 0.5));
      },
      fast ? 160 : 420,
    );
    return () => window.clearInterval(id);
  }, [reduce, fast]);

  const color = reduce ? V2.orange : COLORS[Math.floor(beat / 3) % COLORS.length];

  return (
    <span
      className={`inline-flex select-none items-baseline ${className}`}
      style={{ fontFamily: "var(--font-mansalva)", fontSize: size, lineHeight: 1.1, color }}
      onPointerEnter={() => setFast(true)}
      onPointerLeave={() => setFast(false)}
      aria-label={label ? WORD : undefined}
      role={label ? "img" : undefined}
    >
      {Array.from(WORD).map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block"
          style={{
            WebkitTextStroke: !reduce && heavy[i] ? `${HEAVY} ${color}` : `0 ${color}`,
            paintOrder: "stroke fill",
            transform: !reduce && heavy[i] ? "scale(1.04, 1.06)" : "none",
            whiteSpace: "pre",
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
