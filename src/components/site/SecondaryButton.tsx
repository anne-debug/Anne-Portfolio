"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";

/**
 * Framer component "Global UI/Buttons/Secondary Button".
 *
 * A dark pill. On hover an orange disc parked off the bottom-left corner grows
 * from 20px to 180px and floods the button.
 */
export function SecondaryButton({
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
    <Link
      href={href}
      className={`relative isolate flex items-center justify-center overflow-hidden rounded-full bg-grey-200 pt-[3px] pr-[30px] pb-[4px] pl-[30px] ${className ?? ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <motion.span
        aria-hidden
        className="absolute rounded-full bg-orange"
        style={{ left: -20, bottom: -20 }}
        initial={false}
        animate={
          hovered
            ? { width: 180, height: 180, x: -11, y: -55 }
            : { width: 20, height: 20, x: 0, y: 0 }
        }
        transition={{ type: "spring", stiffness: 500, damping: 60, mass: 1 }}
      />
      <span className="ts-body relative z-[1] text-off-white">{label}</span>
    </Link>
  );
}
