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
}: {
  label: string;
  size?: "large" | "small";
}) {
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
}: {
  category: string;
  title: string;
  description: string;
  meta: MetaEntry[];
  /** Space between the title and its short description; Framer varies it. */
  titleGap?: number;
}) {
  return (
    <header className="flex w-full flex-col items-start gap-[23px]">
      <CategoryBadge label={category} />

      <div className="flex w-full flex-col" style={{ gap: titleGap }}>
        <h1 className="ts-heading-1 w-full text-left italic">{title}</h1>
        <p className="ts-body w-full text-left text-grey-200">{description}</p>
      </div>

      {/* Four across once there is room; two by two below that, so the facts
          read as a block on a phone rather than a column four deep. */}
      <dl className="grid w-full grid-cols-2 gap-x-[6px] gap-y-5 pt-5 tablet:flex tablet:flex-row tablet:gap-2.5">
        {meta.map((entry) => (
          <div key={entry.label} className="flex flex-1 flex-col">
            <dt className="ts-body text-grey-200">{entry.label} :</dt>
            <dd className="ts-body max-w-[600px] text-orange">{entry.value}</dd>
          </div>
        ))}
      </dl>
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
          <Image src={src} alt={alt} fill sizes="1000px" className="object-cover" priority={priority} />
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
export function SkillsRow({ heading = "skills", skills }: { heading?: string; skills: Skill[] }) {
  return (
    <section className="flex w-full flex-col gap-5">
      <div className="flex w-full flex-col gap-2.5">
        <h3 className="ts-heading-3 w-full text-left">{heading}</h3>
        <div className="flex w-full flex-wrap items-start justify-start">
          {skills.map((skill) => (
            <div key={skill.name} className="flex w-[134px] items-center gap-2.5">
              <span className="relative block size-[42px] shrink-0 overflow-hidden rounded-lg">
                <Image src={skill.icon} alt="" fill sizes="42px" className="object-contain" />
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
}: {
  title?: string;
  children: ReactNode;
  gap?: number;
}) {
  return (
    <section className="flex w-full flex-col" style={{ gap }}>
      {title ? (
        <h2 className="ts-heading-2 w-full text-left text-grey-200">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

/** A lede line: Heading 3 with an italic Heading 4 beneath it. */
export function SubHeading({ title, lede }: { title: string; lede?: string }) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      <h3 className="ts-heading-3 w-full text-left">{title}</h3>
      {lede ? (
        <p className="ts-heading-4 w-full text-left italic">{lede}</p>
      ) : null}
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
