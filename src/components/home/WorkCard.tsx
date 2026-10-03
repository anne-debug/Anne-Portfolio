"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";

import { AppearEffect } from "@/lib/framer-effects";
import { PreviewMedia } from "@/components/project/PreviewMedia";
import type { ProjectPreview } from "@/lib/project-previews";
import { CARD_ASPECT } from "@/lib/thumbnails";

/**
 * Framer component "Work card".
 *
 * Two shapes are used on the home page: "Large Project Card" at 1038x350 lays
 * the cover and the copy side by side, "Project Card" at 504x540 stacks them.
 * Both fade up from 80px the first time they scroll into view, and reveal a
 * circular arrow button on hover.
 *
 * Framer collapses both shapes to the same stacked card on its Phone frame: a
 * 310px card with 17px of padding, a 276x224 cover across the top, then the
 * title at 22px and the summary at 14px. The card grows to fit rather than
 * holding a fixed height, which is what gives Framer its 456/461/440px cards.
 *
 * Every cover uses the one frame in `CARD_ASPECT`, because cards that sit beside
 * each other have to be the same size. The cover is the case study's shared
 * preview, a screenshot of its own hero captured at that same shape, so
 * `object-cover` fills the frame without cutting into it. Card heights follow
 * their covers rather than being fixed, and the two-up row stretches so both
 * cards end level.
 */

export interface WorkCardProps {
  variant: "large" | "standard";
  name: string;
  summary: string;
  preview: ProjectPreview;
  category: string;
  href: string;
}

function ArrowButton({ shown }: { shown: boolean }) {
  return (
    <motion.span
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-dark-charcoal"
      initial={false}
      animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.8 }}
      transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
      aria-hidden
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M4 12L12 4M12 4H5.5M12 4V10.5"
          stroke="var(--color-off-white)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.span>
  );
}

export function WorkCard({
  variant,
  name,
  summary,
  preview,
  category,
  href,
}: WorkCardProps) {
  const [hovered, setHovered] = useState(false);
  const large = variant === "large";

  const copy = (
    /* No explicit height: the row and the column both stretch this to the card,
       and a height of its own would opt it out of that and leave the footer
       floating under the summary instead of sitting on the bottom edge. */
    <div
      className={`flex w-full flex-1 flex-col gap-5 ${
        large ? "tablet:max-w-[450px]" : ""
      }`}
    >
      <div className="flex w-full flex-col gap-2.5">
        <h3 className="ts-heading-5 w-full text-left text-[22px] tablet:text-[36px]">
          {name}
        </h3>
        <p className="ts-body w-full text-left text-[14px] text-light-grey tablet:text-[16px]">
          {summary}
        </p>
      </div>

      {/* `mt-auto` holds this on the bottom edge whatever the copy above runs
          to, so the arrow keeps the card's own padding from the bottom and the
          right at every width and on every one of the three card shapes. */}
      <div className="mt-auto flex w-full items-center">
        <div className="flex flex-1 items-center gap-2.5">
          <span className="ts-button rounded-[30px] bg-dark-charcoal px-3 py-1 text-off-white">
            {category}
          </span>
        </div>
        <ArrowButton shown={hovered} />
      </div>
    </div>
  );

  // One frame for every card, so a pair sitting side by side matches. The
  // previews are captured at that same shape, so they fill it without a crop.
  const aspectRatio = CARD_ASPECT;

  /*
    The cover grows a little under the pointer, the same 1.03 over the same
    half second the More Projects cards use, clipped by the cover's own rounded
    box so what moves is the picture inside the frame rather than the card in
    the layout. These cards had only the arrow button answering the pointer,
    which left them feeling fixed next to every other card on the site.

    It is driven from `hovered` rather than a `group-hover:` class because that
    state is already here for the arrow and already covers focus, so a card
    reached by keyboard lifts too.
  */
  const coverMotion = `transition-transform duration-500 ${
    hovered ? "scale-[1.03]" : ""
  }`;

  // Phone stacks both shapes, so one cover across the card width serves both.
  const phoneCover = (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-white tablet:hidden"
      style={{ aspectRatio }}
    >
      <PreviewMedia
        preview={preview}
        alt={name}
        sizes="278px"
        className={coverMotion}
      />
    </div>
  );

  const wideCover = large ? (
    <div
      className="relative hidden flex-1 overflow-hidden rounded-lg bg-white tablet:block"
      style={{ aspectRatio }}
    >
      <PreviewMedia
        preview={preview}
        alt=""
        sizes="55vw"
        className={coverMotion}
      />
    </div>
  ) : (
    <div
      className="relative hidden w-full overflow-hidden rounded-lg bg-white tablet:block"
      style={{ aspectRatio }}
    >
      <PreviewMedia
        preview={preview}
        alt=""
        sizes="(width < 1200px) 45vw, 464px"
        className={coverMotion}
      />
    </div>
  );

  return (
    <AppearEffect
      enter={{
        opacity: 0,
        y: 80,
        transition: "spring-duration 0.4s 0.2 0s",
      }}
      trigger="onInView"
      threshold={0}
      /* No explicit height here: the two-up row stretches its items, and an
         explicit height would opt this one out of that and leave the pair
         ending at different points. */
      className={large ? "w-full" : "w-full tablet:w-[504px]"}
    >
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className={`flex h-full w-full flex-col items-start gap-5 overflow-clip rounded-2xl bg-light-grey-super p-4 tablet:p-5 ${
          large ? "tablet:flex-row tablet:items-stretch" : "tablet:flex-col"
        }`}
      >
        {phoneCover}
        {wideCover}
        {copy}
      </Link>
    </AppearEffect>
  );
}
