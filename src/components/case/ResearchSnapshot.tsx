"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * What a study was made of, read as a figure rather than a sentence.
 *
 * The counts used to live inside the prose — "ten semi-structured interviews
 * and thirteen survey responses" — where they are the kind of thing a reader
 * skims past. Set as figures they are the first thing in the block, which is
 * what a research report does with them.
 *
 * ── The bar is not the data ──────────────────────────────────────────────
 * Every count is written out underneath in words and numerals, and the bar is
 * `aria-hidden`. It is there to make two proportions comparable at a glance —
 * eight in ten against twelve in thirteen — not to carry the numbers. Nothing
 * is lost by not seeing it, by not distinguishing the two colours, or by
 * having it never animate.
 */

export interface ResearchStatPart {
  /** Singular: "Builder". The count decides which form is drawn. */
  label: string;
  /** The plural, where adding an "s" would be wrong. */
  plural?: string;
  count: number;
}

/** "1 Admin", "2 Admins" — a count of one reads as one. */
const name = (part: ResearchStatPart) =>
  part.count === 1 ? part.label : (part.plural ?? `${part.label}s`);

export interface ResearchStat {
  /** The headline figure, as it should read: "10". */
  value: string;
  label: string;
  parts: ResearchStatPart[];
}

/** The bar and the dots: the accent for the first part, a tint for the rest. */
const TINT = "var(--color-ability-blue)";

export function ResearchSnapshot({
  objective,
  stats,
  accent,
}: {
  /** One line on what the study set out to learn. */
  objective: string;
  stats: ResearchStat[];
  /** Any CSS colour; the first part of every breakdown takes it. */
  accent: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex w-full flex-col gap-6">
      {/* `normal-case`, because every Body Large class carries Framer's
          `text-transform: capitalize`. */}
      <p className="ts-body-large-fluid w-full max-w-[760px] normal-case">
        {objective}
      </p>

      {/*
        Side by side from 810, stacked below it. Nothing is drawn around or
        above them — no card, no border, no fill.

        Each figure used to sit under a hairline. Two rules then ran through
        the same block a few lines apart, one grey above the number and the
        blue breakdown bar below it, and the grey one read as a second bar
        rather than as a grouping. The figures are 55px of IBM blue; they do
        not need a rule to be found. The one rule left in the block is under
        the pair, where it actually divides something.
      */}
      <div className="grid w-full grid-cols-1 gap-x-12 gap-y-10 tablet:grid-cols-2">
        {stats.map((stat) => {
          const total = stat.parts.reduce((sum, p) => sum + p.count, 0) || 1;
          return (
            <div key={stat.label} className="flex w-full flex-col gap-4">
              <div className="flex flex-col gap-1">
                {/*
                  `ts-heading-3` for the size ramp — 32px to 55px — and then
                  the family set back to the sans the rest of the block is in.
                  The class carries Instrument, which is the serif the page
                  titles are set in, and a serif numeral beside a DM Sans
                  label read as a quotation mark rather than as a figure
                  belonging to the words under it. Overriding the family
                  inline is how Metro, the resume and Selected Work do the
                  same thing.

                  `leading-none` so the figure sits on its label rather than
                  carrying a line box half its own height underneath.
                */}
                <span
                  className="ts-heading-3 leading-none"
                  style={{
                    color: accent,
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {stat.value}
                </span>
                {/* A label, not a heading: it names a figure inside a block
                    that already has one, and an `h4` here would put a rung on
                    the page's hierarchy that nothing hangs off. */}
                <p className="ts-body font-semibold">{stat.label}</p>
              </div>

              <div
                aria-hidden
                className="flex h-1.5 w-full overflow-hidden rounded-full"
              >
                {/* One sweep for the whole bar rather than a width animation
                    per part: the proportions are the point, and growing each
                    segment separately shows proportions that were never the
                    data on the way to the ones that are. */}
                <motion.span
                  className="flex h-full w-full origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }
                  }
                >
                  {stat.parts.map((part, i) => (
                    <span
                      key={part.label}
                      className="h-full"
                      style={{
                        width: `${(part.count / total) * 100}%`,
                        backgroundColor: i === 0 ? accent : TINT,
                      }}
                    />
                  ))}
                </motion.span>
              </div>

              <ul className="m-0 flex list-none flex-wrap items-center gap-x-5 gap-y-1.5 p-0">
                {stat.parts.map((part, i) => (
                  <li
                    key={part.label}
                    className="ts-body-small-light flex items-center gap-2"
                  >
                    <span
                      aria-hidden
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: i === 0 ? accent : TINT }}
                    />
                    {part.count} {name(part)}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
