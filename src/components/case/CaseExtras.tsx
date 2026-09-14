"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

import { AppearEffect } from "@/lib/framer-effects";

/**
 * Pieces that appear on the longer case studies: bullet lists, the four-pointed
 * star bullets, looping video blocks, the slideshow, and the skip link.
 */

/* -------------------------------------------------------------------------- */
/* Bullets                                                                     */
/* -------------------------------------------------------------------------- */

/** The four-pointed star Framer draws as a vector beside each key point. */
export function StarGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      className="shrink-0"
    >
      <path d="M8 0c.4 3.6 1.3 5.4 3 6.4 1 .6 2.3.9 5 1.6-3.6.4-5.4 1.3-6.4 3-.6 1-.9 2.3-1.6 5-.4-3.6-1.3-5.4-3-6.4C4 9 2.7 8.7 0 8c3.6-.4 5.4-1.3 6.4-3C7 4 7.3 2.7 8 0Z" />
    </svg>
  );
}

export interface StarPoint {
  title: string;
  items?: string[];
}

/** A star-led point, optionally with plain sub-bullets beneath it. */
export function StarPointList({
  points,
  columns = 1,
  bold = false,
}: {
  points: StarPoint[];
  columns?: 1 | 2;
  bold?: boolean;
}) {
  const half = Math.ceil(points.length / 2);
  const groups = columns === 2 ? [points.slice(0, half), points.slice(half)] : [points];

  return (
    <div className={`flex w-full flex-col gap-10 ${columns === 2 ? "tablet:flex-row" : ""}`}>
      {groups.map((group, gi) => (
        <div key={gi} className="flex flex-1 flex-col gap-2.5">
          {group.map((point) => (
            <div key={point.title} className="flex w-full flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="pt-[4.5px] text-dark-charcoal">
                  <StarGlyph />
                </span>
                <p className={`ts-body ${bold ? "font-semibold" : ""}`}>{point.title}</p>
              </div>
              {point.items?.length ? (
                /* Framer indents these under the star without a second marker:
                   the arrow that opens each line is the marker. */
                <ul className="flex flex-col gap-1 pl-8">
                  {point.items.map((item) => (
                    <li key={item} className="ts-body text-dark-charcoal">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** A plain dot list, as used under "Overall Impact". */
export function BulletList({
  items,
  /** Framer marks some of these lists with a tick rather than a disc. */
  marker = "disc",
}: {
  items: string[];
  marker?: "disc" | "check";
}) {
  if (marker === "check") {
    return (
      <ul className="flex w-full flex-col gap-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              className="mt-[5px] shrink-0"
            >
              <path
                d="M2.5 8.5 6 12l7.5-8"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="ts-body text-dark-charcoal">{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="flex w-full list-disc flex-col gap-1 pl-5">
      {items.map((item) => (
        <li key={item} className="ts-body text-dark-charcoal">
          {item}
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/* Video                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Framer's community "Video" component as configured on these pages: uploaded
 * file, autoplaying, looping, muted, no controls, 10px radius, cover fit.
 */
export function VideoBlock({
  src,
  width = "80%",
  radius = 10,
}: {
  src: string;
  width?: string;
  radius?: number;
}) {
  return (
    <AppearEffect
      enter={{ opacity: 0, y: 40, transition: "spring-duration 0.6s 0 0s" }}
      trigger="onInView"
      threshold={0.1}
      className="flex w-full justify-center p-5"
    >
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="h-auto object-cover"
        style={{ width, borderRadius: radius }}
      />
    </AppearEffect>
  );
}

/* -------------------------------------------------------------------------- */
/* Slideshow                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Framer's "Slideshow" component: one slide at a time, 20px radius, arrows
 * only (autoplay and dragging are switched off on this page). The spring
 * matches Framer's stored transition of stiffness 200, damping 40, mass 1.
 */
export function Slideshow({
  slides,
  height = 600,
  alt = "",
}: {
  slides: string[];
  height?: number;
  alt?: string;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (step: number) => {
    setDirection(step);
    setIndex((i) => (i + step + slides.length) % slides.length);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        className="relative w-full overflow-hidden rounded-[20px]"
        style={{ height }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0.4 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0.4 }}
            transition={{ type: "spring", stiffness: 200, damping: 40, mass: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={slides[index]}
              alt={`${alt} ${index + 1} of ${slides.length}`}
              fill
              sizes="1200px"
              className="object-contain"
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous slide"
          className="absolute top-1/2 left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-dark-charcoal shadow-sm backdrop-blur transition hover:bg-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next slide"
          className="absolute top-1/2 right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-dark-charcoal shadow-sm backdrop-blur transition hover:bg-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide}
            type="button"
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`size-2 rounded-full transition ${i === index ? "bg-dark-charcoal" : "bg-grey-100"}`}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Skip link                                                                   */
/* -------------------------------------------------------------------------- */

/** The orange pill that jumps past the research section. */
export function SkipButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    /* Framer centres this button under the section. */
    <div className="flex w-full justify-center pt-[30px]">
      <Link
        href={href}
        className="flex items-center gap-3.5 rounded-full bg-orange px-10 py-2 text-off-white transition hover:brightness-105"
      >
        <span className="ts-heading-4 text-off-white">{label}</span>
      </Link>
    </div>
  );
}

/** A plain wrapper that fades its children in on scroll. */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AppearEffect
      enter={{ opacity: 0, y: 40, transition: "spring-duration 0.6s 0 0s" }}
      trigger="onInView"
      threshold={0.1}
      className={className}
    >
      {children}
    </AppearEffect>
  );
}
