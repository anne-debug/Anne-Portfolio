"use client";

import Image from "next/image";

import { AppearEffect, type EnterState } from "@/lib/framer-effects";

/**
 * Framer section "Skills" on the home page.
 *
 * A 1060x687 stage holding a 1034x652 field of scattered pills, with the
 * heading and description centred on top. Each pill flies in from its own
 * direction the first time the section scrolls into view.
 *
 * Framer drops the scatter on its Phone frame and wraps the tags into a centred
 * row instead, two per line, under the heading. The flying entrances belong to
 * the scattered field and cannot come along: several of them start 200px to the
 * side, which on a 390px screen puts the tag outside the viewport, so the
 * observer that is meant to bring it back never fires and the tag never
 * appears. The phone tags get a short fade and rise in reading order instead.
 *
 * The pills are 12px in from the label rather than Framer's 15px: this build of
 * DM Sans sets the longer labels about 7% wider, and at 15px two of the rows
 * came out a pixel over the 310px column and broke one tag per line.
 */

const TITLE = "What I bring to the table";
const DESCRIPTION =
  "As a UX designer with a technical background, I combine user research, interface design, and frontend development to turn complex ideas into intuitive digital products.";

const ENTER = "spring-duration 0.8s 0 0.2s";

/**
 * The order Framer lays the tags out on its Phone frame, which is not the
 * order of the scattered field. Two labels are shorter there as well, and the
 * widths work out to two tags per row inside the 310px column.
 */
const PHONE_ORDER = [
  "Product Design",
  "User Experience Design",
  "User Interface Design",
  "Design Systems",
  "User Research",
  "Product Management",
  "Frontend Development",
  "Visual Design",
];

interface Tag {
  label: string;
  /** Framer shortens two of the labels on its Phone frame. */
  short?: string;
  x: number;
  y: number;
  rotate: number;
  enter: EnterState;
}

/** Positions are Framer's own rects inside the 1034x652 tag field. */
const TAGS: Tag[] = [
  { label: "Product Design", x: 408.38, y: 14.02, rotate: -10, enter: { opacity: 0, x: 50, y: 200, scale: 0.5, transition: ENTER } },
  { label: "User Experience Design", short: "UX Design", x: 718, y: 94.98, rotate: -9, enter: { opacity: 0, x: -100, y: 200, scale: 0.5, transition: ENTER } },
  { label: "Design Systems", x: 106, y: 108.98, rotate: 8, enter: { opacity: 0, x: 180, y: 150, scale: 0.5, transition: ENTER } },
  { label: "User Research", x: 3, y: 267.98, rotate: -7, enter: { opacity: 0, x: 200, y: 0, scale: 0.5, transition: ENTER } },
  { label: "User Interface Design", short: "UI Design", x: 821, y: 294.99, rotate: 7, enter: { opacity: 0, x: -200, y: 0, scale: 0.5, transition: ENTER } },
  { label: "Frontend Development", x: 34, y: 474.99, rotate: 3, enter: { opacity: 0, x: 180, y: -100, scale: 0.5, transition: ENTER } },
  { label: "Product Management", x: 732, y: 528.98, rotate: -15, enter: { opacity: 0, x: -100, y: -150, scale: 0.5, transition: ENTER } },
  { label: "Visual Design", x: 431, y: 592.01, rotate: -4, enter: { opacity: 0, x: 140, y: -150, scale: 0.5, transition: ENTER } },
];

/** Framer component "Ability tag". */
function AbilityTag({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[70px] bg-ability-blue px-6 py-3.5 whitespace-nowrap text-deep-blue ${className ?? ""}`}
      style={{
        fontFamily: "var(--font-dm-sans)",
        fontWeight: 500,
        fontSize: "16px",
        lineHeight: "1.5em",
      }}
    >
      {label}
    </span>
  );
}

export function Skills() {
  return (
    <section
      id="service"
      className="relative flex w-full items-center justify-center overflow-hidden tablet:h-[756px]"
    >
      {/* Desktop and tablet: the scattered field. `.skills-stage` scales it
          smoothly from 0.72 at the tablet breakpoint up to 1 at the desktop
          one, rather than stepping and jumping as the window crosses 1200. */}
      <div className="skills-stage relative hidden h-[687px] w-[1060px] shrink-0 tablet:block">
        <div className="absolute left-1/2 top-1/2 h-[652px] w-[1034px] -translate-x-1/2 -translate-y-1/2">
          {TAGS.map((tag) => (
            /* The resting rotation lives on the wrapper, because the appear
               effect never animates `rotate` for these tags. */
            <div
              key={tag.label}
              className="absolute origin-center"
              style={{
                left: tag.x,
                top: tag.y,
                transform: `rotate(${tag.rotate}deg)`,
              }}
            >
              <AppearEffect enter={tag.enter} trigger="onInView" threshold={0.5}>
                <AbilityTag label={tag.label} />
              </AppearEffect>
            </div>
          ))}
        </div>

        <div className="absolute left-1/2 top-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4">
          <div className="flex w-full flex-col items-center">
            <Image
              src="/vectors/ufo.png"
              alt=""
              width={100}
              height={100}
              className="size-[100px] object-contain"
            />
            <h2 className="ts-heading-2 max-w-[500px] text-center text-deep-blue">
              {TITLE}
            </h2>
          </div>
          <p
            className="max-w-[500px] text-center text-dark-charcoal"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "20px",
              letterSpacing: "-0.2px",
              lineHeight: "1.3em",
            }}
          >
            {DESCRIPTION}
          </p>
        </div>
      </div>

      {/* Phone: the same content, tags reflowed into a wrap */}
      <div className="flex w-full flex-col items-center gap-6 py-16 tablet:hidden">
        <Image
          src="/vectors/ufo.png"
          alt=""
          width={72}
          height={72}
          className="size-[72px] object-contain"
        />
        <h2 className="ts-heading-2 max-w-[320px] text-center text-deep-blue">
          {TITLE}
        </h2>
        <p
          className="max-w-[330px] text-center text-dark-charcoal"
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "14px",
            letterSpacing: "-0.2px",
            lineHeight: "1.3em",
          }}
        >
          {DESCRIPTION}
        </p>
        {/* Framer's phone row: 20px between lines, 15px between tags, centred */}
        <div className="flex w-full flex-wrap justify-center gap-x-[15px] gap-y-5">
          {PHONE_ORDER.map((name, i) => {
            const tag = TAGS.find((t) => t.label === name);
            if (!tag) return null;
            return (
              <AppearEffect
                key={name}
                enter={{
                  opacity: 0,
                  y: 12,
                  transition: `spring-duration 0.5s 0 ${(i * 0.05).toFixed(2)}s`,
                }}
                trigger="onInView"
                threshold={0.1}
              >
                <AbilityTag
                  label={tag.short ?? tag.label}
                  className="!px-3 !py-[7px] !text-[14px]"
                />
              </AppearEffect>
            );
          })}
        </div>
      </div>
    </section>
  );
}
