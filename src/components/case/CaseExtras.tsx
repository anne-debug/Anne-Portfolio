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
/** The star's own width, and the space between it and the text it opens. */
export const STAR_SIZE = 14;
const STAR_GAP = 8;

export function StarGlyph({ size = STAR_SIZE }: { size?: number }) {
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
  /*
    One column is a stack. Two is a grid rather than a pair of stacks, because
    a stack lets each column set its own rhythm: the points end up at different
    heights and nothing lines up across the gap. `auto-rows-fr` gives every row
    the height of its tallest point, so the four read as a block.
  */
  const grid = columns === 2;

  return (
    <div
      className={
        grid
          ? "grid w-full grid-cols-1 gap-x-10 gap-y-6 tablet:auto-rows-fr tablet:grid-cols-2"
          : "flex w-full flex-col gap-10"
      }
    >
      <div className={grid ? "contents" : "flex flex-1 flex-col gap-2.5"}>
        {points.map((point) => (
          <div key={point.title} className="flex w-full flex-col gap-2">
            <div className="flex items-start" style={{ gap: STAR_GAP }}>
              <span className="pt-[4.5px] text-dark-charcoal">
                <StarGlyph />
              </span>
              <p className={`ts-body ${bold ? "font-semibold" : ""}`}>
                {point.title}
              </p>
            </div>
            {point.items?.length ? (
              /* Indented to where the title starts, not past it: the star and
                 the gap after it, and nothing more. Framer sets these without a
                 second marker — the arrow that opens each line is the marker —
                 so the only thing holding them in line with the title above is
                 this padding, and at the 32px it used to carry they sat 10px
                 adrift of it. */
              <ul
                className="flex flex-col gap-1"
                style={{ paddingLeft: STAR_SIZE + STAR_GAP }}
              >
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
  /** Framer's share of the column, from 810 up. A phone takes the lot. */
  width?: string;
  radius?: number;
}) {
  return (
    <AppearEffect
      enter={{ opacity: 0, y: 40, transition: "spring-duration 0.6s 0 0s" }}
      trigger="onInView"
      threshold={0.1}
      /* No side padding on a phone: the recording is the point of the section
         and 80% of an already narrow column, inset a further 20px either side,
         left it too small to follow. */
      className="flex w-full justify-center py-5 tablet:px-5"
    >
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="h-auto w-full object-cover tablet:w-[var(--video-w)]"
        style={
          { borderRadius: radius, "--video-w": width } as React.CSSProperties
        }
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
  ratio = 16 / 9,
  alt = "",
}: {
  slides: string[];
  /**
   * The slides' own shape, width over height. The stage takes the column and
   * derives its height from this, rather than standing at a fixed pixel height
   * the way Framer draws it: at 600px tall a 16:9 slide left a band of empty
   * card above and below it on a phone and was cut short on a desktop.
   */
  ratio?: number;
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
        style={{ aspectRatio: ratio }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0.4 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0.4 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 40,
              mass: 1,
            }}
            className="absolute inset-0"
          >
            <Image
              src={slides[index]}
              alt={`${alt} ${index + 1} of ${slides.length}`}
              fill
              sizes="(width < 810px) 92vw, 1200px"
              className="object-contain"
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous slide"
          className="absolute top-1/2 left-2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-dark-charcoal shadow-sm backdrop-blur transition hover:bg-white tablet:left-3 tablet:size-10"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3 5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next slide"
          className="absolute top-1/2 right-2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-dark-charcoal shadow-sm backdrop-blur transition hover:bg-white tablet:right-3 tablet:size-10"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="m6 3 5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
export function SkipButton({ href, label }: { href: string; label: string }) {
  return (
    /* Framer centres this button under the section. */
    <div className="flex w-full justify-center pt-[30px]">
      <Link
        href={href}
        className="flex items-center gap-3.5 rounded-full bg-orange px-10 py-2 text-off-white transition hover:brightness-105"
      >
        {/* One step below the section titles it sits under: a label, not a
            heading. */}
        <span className="ts-heading-6 text-off-white">{label}</span>
      </Link>
    </div>
  );
}

/** A plain wrapper that fades its children in on scroll. */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
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
