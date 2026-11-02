"use client";

import { motion, useReducedMotion } from "motion/react";

import { Reveal } from "./CaseExtras";

/**
 * Research findings, and what each one asked the design to do.
 *
 * Three of them, one under the other, each the full width of the column. Not
 * three cards in a row: the findings carry two paragraphs apiece, and a third
 * of a column is not enough to read them in. Not cards at all, in fact —
 * a rule above each is enough to separate them, and a border with a fill would
 * make static prose look like something to click.
 *
 * ── Why the implication is set apart ─────────────────────────────────────
 * The point of the section is the join between what was found and what was
 * done about it, and that join is invisible when both are body copy in the
 * same stack. The implication keeps the same type but takes an accent rule
 * down its left edge, so it reads as the answer to the paragraphs above it
 * rather than as one more of them.
 */

export interface ResearchInsight {
  id: string;
  /** "01", "02", "03" — the reading order, not a count of anything. */
  number: string;
  /** One word for what the finding is about: "Navigation". */
  theme: string;
  /** The finding itself, in one sentence. */
  finding: string;
  /** What was seen that led to it. Each string is its own paragraph. */
  body: string[];
  implication: string;
}

/** The small caps label used for the theme and for "Design Implication". */
const LABEL = "ts-body-small-light uppercase tracking-[0.08em]";

/**
 * How wide the prose runs.
 *
 * The column is 951px at a desktop, which at 16px is about 115 characters to
 * the line — far past where an eye reliably finds the start of the next one,
 * and these are the longest paragraphs on the page. The rules stay the full
 * width of the column, so the section keeps its shape while the text keeps a
 * readable measure; that pairing is the one the reference sheets use.
 */
const MEASURE = "max-w-[760px]";

export function ResearchInsights({
  insights,
  accent,
}: {
  insights: ResearchInsight[];
  /** Any CSS colour; the numbers and the implication rules take it. */
  accent: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex w-full flex-col gap-10">
      {insights.map((insight) => (
        /* One `Reveal` each rather than one around the three. They are a
           screen apart by the time they are read, so each arrives on its own
           as it is scrolled to — which is the stagger, without a stagger
           having to be timed. */
        <Reveal key={insight.id} className="w-full">
          <article className="flex w-full flex-col gap-4 border-t border-grey-100 pt-6">
            <p className="m-0 flex items-baseline gap-3">
              <span className="ts-body font-semibold" style={{ color: accent }}>
                {insight.number}
              </span>
              {/* The accent, like the number beside it: the two are one
                  label — `01 Navigation` — and colouring only half of it had
                  the theme read as a caption on the number rather than as
                  part of it. "Design Implication" below keeps the grey; it
                  names a different kind of thing. */}
              <span className={LABEL} style={{ color: accent }}>
                {insight.theme}
              </span>
            </p>

            {/*
              `h4`: the page runs `h2` for the section, `h3` for the blocks
              inside it, and this sits inside one of those. At 16→20px with
              medium weight it is the step below the `h3` above it and clearly
              above the copy underneath, which is the hierarchy the scale
              already describes — no new size invented for it.
            */}
            <h4
              className={`ts-body-large-fluid m-0 w-full font-medium normal-case text-grey-200 ${MEASURE}`}
            >
              {insight.finding}
            </h4>

            <div className={`flex w-full flex-col gap-2.5 ${MEASURE}`}>
              {insight.body.map((text, i) => (
                <p key={i} className="ts-body m-0 w-full">
                  {text}
                </p>
              ))}
            </div>

            <div
              className={`relative mt-1 flex w-full flex-col gap-1.5 pl-5 ${MEASURE}`}
            >
              {/* Drawn top to bottom as the insight arrives: it is the one
                  piece of movement in the block, and it goes the way the eye
                  is already going. */}
              <motion.span
                aria-hidden
                className="absolute top-0 left-0 h-full w-[2px] origin-top"
                style={{ backgroundColor: accent }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.15 }
                }
              />
              <p className={`m-0 ${LABEL}`}>Design Implication</p>
              <p className="ts-body m-0 w-full">{insight.implication}</p>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
