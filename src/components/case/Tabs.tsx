"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * Framer component "Tab Component" with its "Tab Btn" children.
 *
 * Two layouts, as Framer draws them:
 *
 * - Tablet and desktop keep the switcher. Three buttons over one panel, and the
 *   panel is a rounded card holding the handsets and the notes about them. A
 *   green marker sits on the part of the screen a note is about, with a line
 *   running out to the note itself.
 * - Mobile drops the switcher entirely. Framer's "Tab1 - Mobile" variant sets
 *   the button wrapper to `visible: false` and puts the panel's own heading
 *   above it, so the three panels read as stacked labelled cards instead.
 *
 * Both layouts are generated from the same panel data so they cannot drift.
 */

export interface TabStep {
  /** The phone screen artwork, or a still image shown at phone size. */
  screen: string;
  alt: string;
  /** Framer wraps some screens in its phone-frame PNG. */
  frame?: string;
  /** Numbered label above the explanation, e.g. "Live Cart estimator". */
  step: string;
  body: string;
  /** Animated GIFs must bypass the image optimiser. */
  unoptimized?: boolean;
  /**
   * Which side of the card this step's handset stands on when a panel holds
   * two of them. The notes run down the middle either way, so a step on the
   * right draws its marker pointing left.
   */
  side?: "left" | "right";
  /**
   * Where the marker sits down the handset, as a share of its height, so it
   * lands on the thing the note describes. Half way if it is not given.
   */
  anchor?: number;
  /**
   * How wide the handset is drawn, as a share of the card. Framer sizes each
   * one to the artwork it holds: the home screen is a cropped screenshot and
   * carries more width than the full handsets do.
   */
  share?: number;
  /**
   * The artwork's height over its width. A handset in Framer's frame is 2.05;
   * the cropped home screen is shorter. It is what lets the note be placed
   * level with the marker without measuring anything at runtime.
   */
  ratio?: number;
}

export interface TabPanel {
  title: string;
  steps: TabStep[];
}

/** The marker's dot, how far it laps onto the handset, and how far the line
    stops short of the note. */
const DOT = 14;
const OVERLAP = 3;
const CLEAR = 5;

/**
 * The green marker: a dot against the handset and a line out to the note.
 *
 * It is drawn in the row rather than inside the handset, because both ends of
 * it belong to other things: the dot sits on the handset's outer edge and the
 * line stops `CLEAR` short of the note's own box. Placing it over the screen
 * instead, which is what this did first, put the dot on whatever happened to be
 * under it — a price, a label, the "See More" control — and ran the line across
 * the interface on its way out.
 *
 * The dot's centre sits `OVERLAP` inside the handset's outer edge, so it laps
 * onto the bezel and reads as attached to the screen rather than floating
 * beside it, while still covering nothing but the frame.
 *
 * It is an elbow, not a straight run, because the two ends need not be level.
 * On a tab with two handsets the notes are one group centred on the row, while
 * each dot stays on its own feature, so the line leaves the dot, steps across
 * to the note's height half way over, and comes in level with it. Where the two
 * are already level — every tab with one handset — the upright is zero high and
 * what is drawn is a straight line.
 *
 * `dot` is a share of the row, known here. `note` is a CSS variable the panel
 * measures and writes, since where a note sits depends on how its text wraps.
 * Until it is written the marker falls back to the dot's own height, which is
 * the straight line it used to be.
 */
function Marker({
  at,
  index,
  from,
  to,
  toRight,
}: {
  /** How far down the row the dot sits. */
  at: number;
  /** Which note this marker belongs to. */
  index: number;
  /** The handset edge the dot sits on. */
  from: string;
  /** The note edge the line stops short of. */
  to: string;
  toRight: boolean;
}) {
  const dotY = `${at * 100}%`;
  const noteY = `var(--note-${index}, ${dotY})`;
  const near = `calc(${from} - ${OVERLAP}px)`;
  const far = `calc(${to} + ${CLEAR}px)`;
  const bar = "absolute rounded-full bg-green/45";

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 z-10"
      style={{ left: toRight ? near : far, right: toRight ? far : near }}
    >
      {/* Out of the dot, as far as the turn. */}
      <span
        className={`${bar} h-[2px]`}
        style={{
          top: dotY,
          transform: "translateY(-50%)",
          left: toRight ? 0 : "50%",
          right: toRight ? "50%" : 0,
        }}
      />
      {/* The step across to the note's height. Zero high when they are level. */}
      <span
        className={`${bar} w-[2px]`}
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          top: `min(${dotY}, ${noteY})`,
          height: `calc(max(${dotY}, ${noteY}) - min(${dotY}, ${noteY}))`,
        }}
      />
      {/* In to the note, level with it. */}
      <span
        className={`${bar} h-[2px]`}
        style={{
          top: noteY,
          transform: "translateY(-50%)",
          left: toRight ? "50%" : 0,
          right: toRight ? 0 : "50%",
        }}
      />
      <span
        className={`absolute flex items-center justify-center rounded-full bg-green/40 ${
          toRight ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
        }`}
        style={{
          width: DOT,
          height: DOT,
          top: dotY,
          marginTop: -DOT / 2,
        }}
      >
        <span className="size-[8px] rounded-full bg-green" />
      </span>
    </span>
  );
}

/**
 * A phone screen, optionally seated inside Framer's phone-frame image.
 *
 * `fluid` sizes it from its container instead of a pixel width, which is what
 * lets the card scale across the tablet range. The framed variant then measures
 * its screen in `cqw` — one percent of the handset — so the inset and the
 * corner hold their proportions at any size.
 */
function Screen({
  step,
  width,
  fluid = false,
}: {
  step: TabStep;
  width: number;
  fluid?: boolean;
}) {
  const height = Math.round(width * 2.05);

  if (!step.frame) {
    return (
      <Image
        src={step.screen}
        alt={step.alt}
        width={width}
        height={height}
        sizes={fluid ? "(width < 1200px) 30vw, 280px" : `${width}px`}
        className="h-auto shrink-0 object-contain"
        style={fluid ? { width: "100%" } : { width }}
        unoptimized={step.unoptimized}
      />
    );
  }

  return (
    <span
      className="relative block shrink-0"
      style={
        fluid
          ? {
              width: "100%",
              aspectRatio: "1 / 2.05",
              containerType: "inline-size",
            }
          : { width, height }
      }
    >
      <Image
        src={step.frame}
        alt=""
        fill
        sizes={fluid ? "(width < 1200px) 30vw, 280px" : `${width}px`}
        className="object-contain"
      />
      <Image
        src={step.screen}
        alt={step.alt}
        width={Math.round(width * 0.915)}
        height={Math.round(height * 0.968)}
        sizes={fluid ? "(width < 1200px) 30vw, 280px" : `${width}px`}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover"
        style={
          fluid
            ? { width: "91.5cqw", height: "198.4cqw", borderRadius: "12.4cqw" }
            : {
                width: Math.round(width * 0.915),
                height: Math.round(height * 0.968),
                borderRadius: Math.round(width * 0.124),
              }
        }
        unoptimized={step.unoptimized}
      />
    </span>
  );
}

/** A handset, sized as a share of the card. Its marker is drawn in the row. */
function Handset({ step }: { step: TabStep }) {
  return (
    <div className="relative w-full">
      <Screen step={step} width={265} fluid />
    </div>
  );
}

function Explanation({
  step,
  number,
  className,
  style,
  ref,
}: {
  step: TabStep;
  number: number;
  className?: string;
  style?: React.CSSProperties;
  /** The panel measures where this lands, to bend its marker to it. */
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      className={`flex flex-col gap-[7px] ${className ?? ""}`}
      style={style}
    >
      <p
        className="ts-body-large font-semibold"
        style={{ fontSize: "clamp(14px, 2.05cqw, 18px)" }}
      >
        {number}. {step.step}
      </p>
      <p className="ts-body" style={{ fontSize: "clamp(12px, 1.8cqw, 16px)" }}>
        {step.body}
      </p>
    </div>
  );
}

/**
 * Framer's "Tab1 - Mobile" variant: the switcher is hidden, the panel heading
 * sits above, and the content drops into a 350px card, 32px radius, holding a
 * 249.5px phone over a 261px caption. Framer hides the connector marker here,
 * so there is none.
 */
function MobilePanel({ panel, from }: { panel: TabPanel; from: number }) {
  return (
    <section className="flex w-full flex-col items-center gap-4">
      <h4
        className="text-grey-200"
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontWeight: 600,
          fontSize: "23px",
          letterSpacing: "-0.02em",
          lineHeight: "1.3em",
        }}
      >
        {panel.title}
      </h4>

      <div className="flex w-full max-w-[350px] flex-col items-center gap-[30px] rounded-[32px] bg-light-grey-super py-[30px]">
        {panel.steps.map((step, i) => (
          <div
            key={step.step}
            className="flex flex-col items-center gap-[30px]"
          >
            <Screen step={step} width={249.5} />
            <Explanation step={step} number={from + i} className="w-[261px]" />
          </div>
        ))}
      </div>
    </section>
  );
}

/** The note's box in the row, which both the note and its marker are set by. */
const NOTE_SINGLE = "44%";
/* The middle column is a little narrower than the note on a single tab, so the
   two markers either side of it have room to read as lines rather than as
   stubs: at 32% the right-hand one came to 12px on a desktop and 7px at 810. */
const NOTE_PAIR = "27%";
const PAIR_HALF = "13.5%";
/** Between the two notes of a pair — what they measured apart before the two
    of them became one group. */
const PAIR_GAP = "5.7cqw";

/** A step's drawn height, as a share of the card's width. */
const heightOf = (step: TabStep) => (step.share ?? 0.25) * (step.ratio ?? 2.05);

/**
 * The card used from 810 up.
 *
 * One handset means handset then note, side by side. Two means a handset at
 * each edge with both notes down the middle, each one pointing back at its own
 * screen.
 *
 * Every width is a share of the card, taken off Framer's own render: 8% of
 * padding each side, then a 35% handset against a 44% note on a single tab, or
 * a 25% handset either side of a 32% column of notes on the double. The card is
 * a container, so those shares and the type in them scale with the column
 * rather than stepping at a breakpoint.
 *
 * The notes are placed rather than stacked. A marker sits at a given depth down
 * its own handset, the handsets are centred in the row, and a note is put at
 * that same depth so the line arrives at its first line of type. Both come out
 * of `heightOf`, so neither is measured at runtime and the pair cannot drift
 * apart as the card scales.
 *
 * The card also holds one height across the three tabs, 81% of its own width as
 * Framer draws it, so switching tabs does not make the page jump under the
 * cross-fade. It is capped so a desktop column does not stretch it.
 */
function DesktopPanel({
  panel,
  from,
  tallest,
}: {
  panel: TabPanel;
  from: number;
  tallest: number;
}) {
  const left = panel.steps.find((s) => s.side !== "right") ?? panel.steps[0];
  const right = panel.steps.find((s) => s.side === "right");
  const single = panel.steps.length === 1;

  /** The row is as tall as the tallest handset in any tab, not just this one,
      so the card keeps one height and the page does not jump on a switch. */
  const rowH = tallest;
  /** Where a step's marker falls down that row, handsets being centred in it. */
  const depth = (step: TabStep) => {
    const h = heightOf(step);
    return ((rowH - h) / 2 + (step.anchor ?? 0.5) * h) / rowH;
  };
  /** A share of the card, written against the row inside its padding. */
  const across = (share: number) => `${(share / 0.84) * 100}%`;

  /**
   * Where each note actually sits, as a share of the row, written onto the row
   * as `--note-N` for its marker to bend to.
   *
   * It has to be measured. On a tab with two handsets the notes are one group
   * centred on the row, and where each lands inside that group depends on how
   * far its own text wraps, which changes with the width. Writing a custom
   * property rather than holding it in state keeps it out of the render: a
   * resize moves the markers without anything re-rendering.
   */
  const row = useRef<HTMLDivElement>(null);
  const notes = useRef<(HTMLDivElement | null)[]>([]);
  const place = useCallback(() => {
    const el = row.current;
    if (!el) return;
    const { top, height } = el.getBoundingClientRect();
    if (!height) return;
    notes.current.forEach((n, i) => {
      if (!n) return;
      const b = n.getBoundingClientRect();
      el.style.setProperty(
        `--note-${i}`,
        `${((b.top + b.height / 2 - top) / height) * 100}%`,
      );
    });
  }, []);

  useLayoutEffect(() => {
    place();
    const ro = new ResizeObserver(place);
    if (row.current) ro.observe(row.current);
    for (const n of notes.current) if (n) ro.observe(n);
    return () => ro.disconnect();
  }, [place, panel]);

  const note = (step: TabStep, i: number, style?: React.CSSProperties) => (
    <Explanation
      key={step.step}
      ref={(el) => {
        notes.current[i] = el;
      }}
      step={step}
      number={from + i}
      className={style ? "absolute" : undefined}
      style={
        style && {
          top: `${depth(step) * 100}%`,
          /* On a single tab the note is centred on its marker, not hung from
             it: Framer's render has the line meeting the middle of the block,
             within a pixel, and hanging it from the title left the group
             sitting low. */
          transform: "translateY(-50%)",
          ...style,
        }
      }
    />
  );

  return (
    <div
      /* Never wider than the 951px the article comes to on desktop: below 1200
         the section rail stops taking a column and the article grows past it,
         which would draw this card, and the handsets in it, larger on a tablet
         than on a desktop. */
      className="mx-auto w-full max-w-[951px] rounded-[24px] bg-light-grey-super"
      style={{ containerType: "inline-size" }}
    >
      {/* The padding is in container units, not percentages: a percentage would
          be read against the article outside the card, which is wider than the
          card once the cap bites, and the composition would come out a
          different shape either side of 1200. The composition sits a little low
          in the card, as Framer draws all three tabs, and the row is the same
          height in every tab so the card does not resize under the
          cross-fade. */}
      <div className="w-full px-[8cqw] pt-[13cqw] pb-[10cqw]">
        <div
          ref={row}
          className="relative w-full"
          style={{ height: `${rowH * 100}cqw` }}
        >
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2"
            style={{ width: across(left.share ?? 0.25) }}
          >
            <Handset step={left} />
          </div>

          {right ? (
            <div
              className="absolute top-1/2 right-0 -translate-y-1/2"
              style={{ width: across(right.share ?? 0.25) }}
            >
              <Handset step={right} />
            </div>
          ) : null}

          {single ? (
            note(panel.steps[0], 0, { right: 0, width: NOTE_SINGLE })
          ) : (
            /* The two notes are one group, centred on the row rather than each
               hung off its own marker, so the middle column sits level with the
               handsets either side of it. Their own spacing is unchanged; the
               markers bend to reach them. */
            <div
              className="absolute top-1/2 left-1/2 flex -translate-y-1/2 flex-col"
              style={{
                width: NOTE_PAIR,
                marginLeft: `-${PAIR_HALF}`,
                gap: PAIR_GAP,
              }}
            >
              {panel.steps.map((step, i) => note(step, i))}
            </div>
          )}

          {/* One marker per note, drawn last so it sits over the handset's
              bezel. Both ends are row coordinates: the handset edge it starts
              from and the note edge it stops short of. */}
          {panel.steps.map((step, i) => {
            const toRight = step.side !== "right";
            return (
              <Marker
                key={`marker-${step.step}`}
                at={depth(step)}
                index={i}
                toRight={toRight}
                from={across(step.share ?? 0.25)}
                /* The inset from the marker's own far side to the note's near
                   edge: 100% less the note's left edge on a single tab, and
                   the middle column's far side on a double, which comes to the
                   same figure whichever way the line runs. */
                to={single ? NOTE_SINGLE : `calc(50% + ${PAIR_HALF})`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Tabs({ panels }: { panels: TabPanel[] }) {
  const [index, setIndex] = useState(0);
  /** The steps are numbered straight through the three panels, 1 to 4. */
  const starts = panels.reduce<number[]>((acc, panel, i) => {
    acc.push(i === 0 ? 1 : acc[i - 1] + panels[i - 1].steps.length);
    return acc;
  }, []);
  /** The tallest handset anywhere in the three tabs, as a share of the card. */
  const tallest = Math.max(...panels.flatMap((p) => p.steps.map(heightOf)));

  return (
    <>
      {/* Phone: Framer hides the switcher and stacks the panels */}
      <div className="flex w-full flex-col gap-10 tablet:hidden">
        {panels.map((panel, i) => (
          <MobilePanel key={panel.title} panel={panel} from={starts[i]} />
        ))}
      </div>

      {/* Tablet and desktop: the switcher */}
      <div className="hidden w-full flex-col items-center gap-5 tablet:flex">
        <div
          role="tablist"
          aria-label="Budget awareness system"
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {panels.map((panel, i) => (
            <button
              key={panel.title}
              role="tab"
              type="button"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              /* The open tab is the filled one. Its size, spacing and place in
                 the row are the same either way; only the two colours swap. */
              className={`ts-body rounded-full px-6 py-2.5 transition-colors ${
                i === index
                  ? "bg-dark-charcoal text-off-white"
                  : "bg-light-grey-super text-grey-150 hover:text-dark-charcoal"
              }`}
            >
              {panel.title}
            </button>
          ))}
        </div>

        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              role="tabpanel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
              className="w-full"
            >
              <DesktopPanel
                panel={panels[index]}
                from={starts[index]}
                tallest={tallest}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
