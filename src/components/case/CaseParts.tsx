"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { AppearEffect } from "@/lib/framer-effects";

/**
 * The vocabulary shared by every case study page, taken from the Framer
 * "Project Page" frames: a category pill, the title block, a four-column meta
 * grid, banners, a skills row, and the section headings.
 */

/* -------------------------------------------------------------------------- */
/* Category pill                                                               */
/* -------------------------------------------------------------------------- */

export function CategoryBadge({
  label,
  size = "large",
  variant = "outline",
}: {
  label: string;
  size?: "large" | "small";
  /**
   * Framer draws this two ways. `outline` is the orange rule in Inter, which
   * the rule-variant project cards and the pages not yet on the shared scale
   * still use. `solid` is the filled charcoal pill Metro and BudgetCart set
   * their project type in, which is the one a standardised hero takes.
   */
  variant?: "outline" | "solid";
}) {
  if (variant === "solid") {
    return (
      <span className="ts-button inline-flex items-center justify-center rounded-[30px] bg-dark-charcoal px-3 py-1 text-off-white">
        {label}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center rounded-full border border-orange px-[15px] py-[3px] text-orange"
      style={{
        fontFamily: "var(--font-inter)",
        fontWeight: size === "large" ? 400 : 300,
        fontSize: size === "large" ? "16px" : "14px",
        lineHeight: size === "large" ? "1.2em" : "1.5em",
      }}
    >
      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Header                                                                      */
/* -------------------------------------------------------------------------- */

export interface MetaEntry {
  label: string;
  value: string;
}

export function CaseHeader({
  category,
  title,
  description,
  meta,
  titleGap = 10,
  legacy = false,
  media,
}: {
  category: string;
  title: string;
  description: string;
  meta: MetaEntry[];
  /** Space between the title and its short description; Framer varies it. */
  titleGap?: number;
  /**
   * Framer's frame for Jubo and Little Chestnut Thief sets the project title in
   * italic Heading 1 over a plain Body description. Metro and BudgetCart set it
   * in Heading 2 over Body Large, which is the scale this portfolio keeps.
   * Those two pages have not been brought onto it yet, so they ask for the old
   * treatment here; see CASE_STUDY_DESIGN_SYSTEM.md.
   */
  legacy?: boolean;
  /**
   * The hero artwork. Given one, the header becomes the two-column shape Metro
   * and BudgetCart use — words on the left, artwork on the right — and the
   * facts fall into a 2x2 block, since half a row is too narrow to take four
   * across. Without one it stays a full-width stack.
   */
  media?: ReactNode;
}) {
  const split = Boolean(media);

  return (
    <header
      className={
        split
          ? "flex w-full flex-col items-start gap-[30px] tablet:flex-row tablet:items-center tablet:gap-10 desktop:gap-6"
          : "flex w-full flex-col items-start gap-[23px]"
      }
    >
      {/* Metro sets 20 between the badge and the title, 20 between the title
          and its line, and 120 before the facts. A single gap on this column
          cannot do all three, so the badge and the title block are one group
          and the space before the facts is the column's own. Framer's frame for
          the pages not yet on that scale keeps its flat 23. */}
      <div
        className={`flex w-full flex-1 flex-col items-start ${
          legacy ? "gap-[23px]" : "gap-[120px]"
        } ${split ? "" : "tablet:w-full"}`}
      >
        <div
          className={`flex w-full flex-col items-start ${
            legacy ? "gap-[23px]" : "gap-5"
          }`}
        >
          <CategoryBadge
            label={category}
            variant={legacy ? "outline" : "solid"}
          />

          <div className="flex w-full flex-col" style={{ gap: titleGap }}>
            <h1
              className={`w-full text-left text-grey-200 ${
                legacy ? "ts-heading-1 italic" : "ts-heading-2"
              }`}
            >
              {title}
            </h1>
            <p
              className={`w-full text-left ${
                legacy ? "ts-body text-grey-200" : "ts-body-large-fluid"
              }`}
            >
              {description}
            </p>
          </div>

          {/* Four across once there is room; two by two below that, so the facts
          read as a block on a phone rather than a column four deep. Beside
          artwork they stay 2x2 at every width — four would give each fact a
          third of a half-row. */}
        </div>

        <dl
          className={`grid w-full grid-cols-2 gap-x-[6px] gap-y-5 ${
            legacy ? "pt-5" : ""
          } ${
            split
              ? "tablet:gap-x-5"
              : "tablet:flex tablet:flex-row tablet:gap-2.5"
          }`}
        >
          {meta.map((entry) => (
            <div key={entry.label} className="flex flex-1 flex-col">
              {/* Metro and BudgetCart set the label semibold and the value
                plain, both in the page's own text colour. Framer's frame for
                the pages not yet on that scale prints the label grey and the
                value orange, which `legacy` keeps. */}
              <dt
                className={`ts-body ${legacy ? "text-grey-200" : "font-semibold"}`}
              >
                {entry.label} :
              </dt>
              <dd
                className={`ts-body max-w-[600px] ${legacy ? "text-orange" : ""}`}
              >
                {entry.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/*
        The artwork takes a little more of the row on desktop — 64% against the
        60% it keeps below — with the gap closing from 40 to 24 to pay for part
        of it. Anchored at the right edge, so it grows leftward and everything
        inside keeps its place; it is the same composition, drawn larger.

        64 is the ceiling, not a preference. The words column cannot go below
        309px without Ryze's title falling from two lines to three, which would
        change a hero rather than scale its artwork; 64% with a 24px gap leaves
        it 318px, nine to spare. Jubo's title is three lines either way.
      */}
      {media ? (
        <div className="w-full shrink-0 tablet:w-[60%] desktop:w-[64%]">
          {media}
        </div>
      ) : null}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Media                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * A full-width banner. Framer pins the hero banner to a fixed height and lets
 * later images size to their own aspect ratio, which `height` selects between.
 */
export function Banner({
  src,
  alt,
  height,
  radius = 20,
  priority = false,
}: {
  src: string;
  alt: string;
  /** A number fixes the height in pixels; "auto" keeps the image's own ratio. */
  height?: number | "auto";
  radius?: number;
  priority?: boolean;
}) {
  const fixed = typeof height === "number";

  return (
    <AppearEffect
      enter={{ opacity: 0, y: 40, transition: "spring-duration 0.6s 0 0s" }}
      trigger="onInView"
      threshold={0.1}
      className="w-full"
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          borderRadius: radius,
          ...(fixed ? { height } : {}),
        }}
      >
        {fixed ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="1000px"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={2000}
            height={1200}
            sizes="1000px"
            className="h-auto w-full"
            priority={priority}
          />
        )}
      </div>
    </AppearEffect>
  );
}

/* -------------------------------------------------------------------------- */
/* Skills                                                                      */
/* -------------------------------------------------------------------------- */

export interface Skill {
  name: string;
  icon: string;
}

/** Framer draws each skill as a 134px row: a 42%-wide icon then the name. */
export function SkillsRow({
  heading = "Skills",
  skills,
}: {
  heading?: string;
  skills: Skill[];
}) {
  return (
    <section className="flex w-full flex-col gap-5">
      <div className="flex w-full flex-col gap-2.5">
        <h2 className="ts-heading-3 w-full text-left">{heading}</h2>
        <div className="flex w-full flex-wrap items-start justify-start">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="flex w-[134px] items-center gap-2.5"
            >
              <span className="relative block size-[42px] shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={skill.icon}
                  alt=""
                  fill
                  sizes="42px"
                  className="object-contain"
                />
              </span>
              <span className="ts-body">{skill.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

/** A titled block: Heading 2 over its content, 20px apart. */
export function CaseSection({
  title,
  children,
  gap = 20,
  legacy = false,
  id,
}: {
  title?: string;
  children: ReactNode;
  gap?: number;
  /** The anchor the section rail jumps to. */
  id?: string;
  /**
   * Framer's own frame for Jubo and Little Chestnut Thief sets a section title
   * at Heading 2, the size Metro and BudgetCart keep for the project title.
   * Those two pages have not been brought onto the shared scale yet, so they
   * ask for the old size here rather than having it forced on every page; see
   * CASE_STUDY_DESIGN_SYSTEM.md.
   */
  legacy?: boolean;
}) {
  return (
    <section id={id} className="flex w-full flex-col" style={{ gap }}>
      {title ? (
        <h2
          className={`w-full text-left text-grey-200 ${
            legacy ? "ts-heading-2" : "ts-heading-3"
          }`}
        >
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

/**
 * A block inside a section: its title, and a line under it.
 *
 * Heading 5 over Heading 6, which is the step the scale takes below a section
 * title. Framer sets these at Heading 3, the size it gives the section titles
 * themselves, so a block read as loudly as the section holding it, and it set
 * the line under them in italics, which Metro keeps for captions and not for
 * headings.
 */
export function SubHeading({ title, lede }: { title: string; lede?: string }) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      <h3 className="ts-heading-5 w-full text-left">{title}</h3>
      {lede ? <p className="ts-heading-6 w-full text-left">{lede}</p> : null}
    </div>
  );
}

/** Body copy. Each string becomes its own paragraph, as Framer stores it. */
export function Paragraphs({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      {items.map((text, i) => (
        <p key={i} className={`ts-body w-full text-left ${className ?? ""}`}>
          {text}
        </p>
      ))}
    </div>
  );
}
