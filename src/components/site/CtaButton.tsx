"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";

/**
 * The six-petal flower mark that sits inside the CTA button.
 *
 * Framer could not serialise this component because its icon variable points at
 * an icon set the project no longer resolves, so the mark is redrawn here to
 * match Anne's capture of the Framer button (2026-11-17): one outline around
 * six round petals, with a hollow centre. Each petal is an arc of radius 4.35
 * centred 8.2 from the middle, running between its two neighbours' joins; the
 * earlier version stroked six whole overlapping circles, so their insides
 * crossed each other.
 */
const PETALS =
  "M11.72 8.59A4.35 4.35 0 1 1 20.28 8.59A4.35 4.35 0 1 1 24.55 16A4.35 4.35 0 1 1 20.28 23.41A4.35 4.35 0 1 1 11.72 23.41A4.35 4.35 0 1 1 7.45 16A4.35 4.35 0 1 1 11.72 8.59Z";

function FlowerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className ?? ""}`}
    >
      <path d={PETALS} />
      <circle cx={16} cy={16} r={3} />
    </svg>
  );
}

/** Framer component "CTA button". */
export function CtaButton({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      animate={{ scale: hovered ? 1.04 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 60, mass: 1 }}
      className="inline-block"
    >
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        /* Framer draws this button at 152x42 on its Phone frame and 55px tall
           from tablet up, so the height, type and mark all step. */
        className={`flex h-[42px] items-center gap-2 rounded-full bg-orange px-[30px] text-white tablet:h-[55px] tablet:pr-[23px] tablet:pl-[25px] ${className ?? ""}`}
      >
        <span className="ts-button text-[14px] text-white tablet:text-[16px]">
          {label}
        </span>
        <FlowerIcon className="size-[21px] tablet:size-[30px]" />
      </Link>
    </motion.div>
  );
}
