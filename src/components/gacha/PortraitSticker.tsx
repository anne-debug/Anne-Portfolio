"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import { sketchRect } from "./sketch";

/**
 * Anne's photo as a taped-on instant print.
 *
 * When it scrolls into view the ink frame draws itself first, and the photo
 * arrives as a pencil-like greyscale sketch before it warms into colour, the
 * same "drawn, then real" beat as the hero artworks. It can be picked up and
 * dragged, and springs back to where it was taped.
 */

const INK = "#2a3132";

export function PortraitSticker() {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      className="relative cursor-grab touch-none select-none active:cursor-grabbing"
      style={{ rotate: -7 }}
      drag={!reduce}
      dragSnapToOrigin
      dragElastic={0.4}
      whileHover={reduce ? undefined : { rotate: -3, scale: 1.03 }}
      whileDrag={{ scale: 1.08, rotate: 2 }}
      initial={reduce ? false : { opacity: 0, y: 16, rotate: -14 }}
      whileInView={{ opacity: 1, y: 0, rotate: -7 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ type: "spring", stiffness: 220, damping: 14 }}
    >
      <div className="relative bg-white p-[7%] pb-[24%]" style={{ boxShadow: "0 6px 14px rgba(0,0,0,0.12)" }}>
        <motion.div
          className="relative overflow-hidden"
          style={{ aspectRatio: "4 / 5" }}
          initial={reduce ? false : { filter: "grayscale(1) contrast(1.7) brightness(1.2)" }}
          whileInView={{ filter: "grayscale(0) contrast(1) brightness(1)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.1, delay: 0.7, ease: "easeOut" }}
        >
          <Image
            src="/images/anne-portrait.webp"
            alt="Anne smiling under willow trees on campus"
            fill
            sizes="160px"
            className="pointer-events-none object-cover"
            draggable={false}
          />
        </motion.div>
        <span
          className="absolute inset-x-0 bottom-[6%] text-center"
          style={{ fontFamily: "var(--font-mansalva)", color: INK, fontSize: "clamp(14px, 1.6vw, 19px)" }}
        >
          hi, it&apos;s me!
        </span>

        {/* the ink frame that draws itself */}
        <svg viewBox="0 0 100 130" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <motion.path
            d={sketchRect(1, 1, 98, 128, 3, 41, 0.8)}
            fill="none"
            stroke={INK}
            strokeWidth={1.4}
            vectorEffect="non-scaling-stroke"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* washi tape */}
      <div
        aria-hidden
        className="absolute -top-[5%] left-1/2 h-[9%] w-[46%] -translate-x-1/2 rotate-[4deg]"
        style={{ background: "rgba(255, 201, 60, 0.75)", clipPath: "polygon(3% 0, 97% 6%, 100% 100%, 0 94%)" }}
      />
    </motion.div>
  );
}
