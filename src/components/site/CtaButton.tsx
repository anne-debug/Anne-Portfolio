"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";

/**
 * The six-petal flower mark that sits inside the CTA button.
 *
 * Framer could not serialise this component because its icon variable points at
 * an icon set the project no longer resolves, so the mark is redrawn here from
 * a capture of the rendered button.
 */
function FlowerIcon({ className }: { className?: string }) {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI) / 3 - Math.PI / 2;
    return {
      cx: 16 + Math.cos(angle) * 8.4,
      cy: 16 + Math.sin(angle) * 8.4,
    };
  });

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      aria-hidden
      className={`shrink-0 ${className ?? ""}`}
    >
      {petals.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={5.4} />
      ))}
      <circle cx={16} cy={16} r={4.3} />
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
