"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";

/**
 * Framer component "Navigation/Nav Link".
 *
 * Two stacked copies of the label sit on a 3D-rotated wrapper. Hovering turns
 * the wrapper a quarter turn about its top edge so the grey face rolls out and
 * the orange face rolls in.
 */
export function NavLink({
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
      className={`block h-6 overflow-hidden ${className ?? ""}`}
      style={{ perspective: "1200px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <motion.span
        className="block"
        style={{ transformStyle: "preserve-3d", transformOrigin: "center top" }}
        animate={{ rotateX: hovered ? -90 : 0 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0 }}
      >
        <span className="ts-body block h-6 leading-6 text-light-grey">
          {label}
        </span>
        <span
          className="ts-nav-link block h-6 leading-6 text-orange"
          style={{ transformOrigin: "center top", transform: "rotateX(90deg)" }}
        >
          {label}
        </span>
      </motion.span>
    </Link>
  );
}
