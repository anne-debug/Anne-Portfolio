"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useId, useMemo, useRef, useState } from "react";

import { Zoomable } from "./Zoomable";

/**
 * A feature walkthrough: the steps in a row across the top, and the screenshot
 * for whichever one is selected beneath them at the full width of the column.
 *
 * It began as two columns, which gave the picture 65% of a 951px article —
 * about 586px for a screen that is 1292px of dense enterprise dashboard. The
 * steps are three short lines and do not need a column of their own, so they
 * moved above and the picture took the width back: 951px open, 1072px with the
 * rail folded away. Nothing about the interaction changed.
 *
 * The interaction follows the Ripplix "sticky step showcase" — a marker that
 * glides between steps rather than blinking from one to the next, and a
 * preview that fades out before the next one fades in. The look is entirely
 * this portfolio's: the type scale, the 10px picture frame, the grey-100
 * rules, the 0.2s ease on hover, and an accent the caller supplies.
 *
 * Content comes in through `steps`, so nothing about Home, Issues or Metrics
 * is known here.
 *
 * ── Why the preview cannot move the page ──────────────────────────────────
 * The frame is given an `aspectRatio` taken from the tallest step and keeps
 * it, so the box is the same height before, during and after a swap no matter
 * what the incoming picture measures. Inside it each step gets a clip box of
 * its own shape, centred, which is what rounds every step to the same corner
 * and letterboxes a step that is not the frame's shape. Nothing animates
 * width, height or offsets; only opacity and transform, which do not reflow.
 *
 * ── Auto-play ─────────────────────────────────────────────────────────────
 * Deliberately not built. `select()` is the single place a step changes, so
 * adding a timer later means calling it from an effect and clearing that timer
 * in the same handlers that already exist for pointer and focus — no rewrite.
 */

export interface ShowcaseStep {
  id: string;
  number?: string;
  title: string;
  subtitle?: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  /** The file's own pixels, so the frame can hold one shape for all of them. */
  imageWidth: number;
  imageHeight: number;
  /**
   * The corner radius the file already carries, in its own pixels — the
   * window curve a screenshot was cut to, as alpha. Omitted or 0 for a file
   * with square corners, such as a screen recording.
   *
   * It is not a styling choice. It is a measurement of the asset, and the
   * showcase needs it to clip every step to one corner; see `cornerShare`.
   */
  imageRadius?: number;
}

export interface StickyStepShowcaseProps {
  steps: ShowcaseStep[];
  initialStepIndex?: number;
  onStepChange?: (index: number) => void;
  /** Any CSS colour; defaults to the portfolio's orange. */
  accent?: string;
  /**
   * One line under the screen name, the same for every step — an accuracy
   * note about the pictures rather than a caption on any one of them.
   */
  note?: string;
  className?: string;
}

/** The marker's glide. From the Ripplix spec. */
const STEP_TRANSITION = {
  type: "spring",
  stiffness: 320,
  damping: 28,
  mass: 0.8,
} as const;

/**
 * The picture swap.
 *
 * `mode="wait"` means these run one after the other, so the pair has to add up
 * to the 300-400ms the interaction is meant to take rather than each taking
 * it. The outgoing frame is the one nobody looks at, so it gets 0.15s and the
 * incoming one keeps a readable 0.3s: 450ms end to end.
 */
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * How far outside the widest baked-in corner the clip is drawn, in that
 * file's own pixels.
 *
 * One pixel, which is the width of the antialiased ramp along a baked curve —
 * enough for the clip rather than the file to be what bounds every step, and
 * at display size it trims about three quarters of a pixel more off a window
 * edge than the screenshot already did.
 */
const CLIP_MARGIN = 1;
/**
 * The corner a set takes when not one of its files carries one.
 *
 * The clip below exists to reconcile files that disagree about their own
 * corners, and it can only ever take more away. With every step square — two
 * GIF recordings, which have no alpha to draw a curve with, and a capture
 * trimmed to its own edge — there is nothing left to reconcile, and the set
 * would come out hard-edged: the only pictures on the page with no corner at
 * all. 16px is what the rest of the case study rounds a picture to, and it is
 * within two pixels of the 21-over-1292 share the Issues screenshot used to
 * set here, so the section keeps the corner it has been showing.
 *
 * A pixel count rather than a share: a share of a frame that runs from 92vw to
 * 1072px leaves a phone with a 5px corner, which is not a corner. Any step that
 * does carry a baked curve still wins — this is the floor, not an override.
 */
const BARE_CORNER = 16;
const EXIT_TRANSITION = { duration: 0.15, ease: EASE } as const;
const ENTER_TRANSITION = { duration: 0.3, ease: EASE } as const;

export function StickyStepShowcase({
  steps,
  initialStepIndex = 0,
  onStepChange,
  accent = "var(--color-orange)",
  note,
  className,
}: StickyStepShowcaseProps) {
  const uid = useId();
  const reduceMotion = useReducedMotion();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Two ids rendering the same `layoutId` would fight over the marker, and a
   * duplicate React key silently drops a step, so the list is made unique
   * before anything renders and the clash is reported while developing.
   */
  const safeSteps = useMemo(() => {
    const seen = new Set<string>();
    return steps.filter((s) => {
      if (seen.has(s.id)) {
        if (process.env.NODE_ENV !== "production")
          console.error(
            `StickyStepShowcase: duplicate step id "${s.id}" was dropped.`,
          );
        return false;
      }
      seen.add(s.id);
      return true;
    });
  }, [steps]);

  const start = Math.min(Math.max(initialStepIndex, 0), safeSteps.length - 1);
  const [active, setActive] = useState(Math.max(start, 0));
  const index = Math.min(active, Math.max(safeSteps.length - 1, 0));

  const select = useCallback(
    (next: number, moveFocus = false) => {
      setActive(next);
      onStepChange?.(next);
      if (moveFocus) tabs.current[next]?.focus();
    },
    [onStepChange],
  );

  /**
   * A tablist owns its arrow keys, and the browser would otherwise scroll the
   * page out from under the reader on every press, so each one is swallowed.
   * Left and right are accepted as well as up and down: the list is a column
   * on a desktop and still a column on a phone, but a reader who reaches for
   * the horizontal pair should not find nothing.
   */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const last = safeSteps.length - 1;
      const go = (n: number) => {
        e.preventDefault();
        select((n + safeSteps.length) % safeSteps.length, true);
      };
      if (e.key === "ArrowDown" || e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") go(index - 1);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(last);
    },
    [index, safeSteps.length, select],
  );

  if (safeSteps.length === 0) return null;

  const step = safeSteps[index];

  /*
    ── One shape for the whole set ─────────────────────────────────────────
    The frame takes one shape and keeps it for every step, so the column
    cannot move when the picture changes.

    It used to take the shape of whichever step was showing, which was
    invisible only because every screen happened to measure 1292x919. The
    moment one of them does not — a recording at 960x681, say — the column
    jumps a little on every switch.

    Of the shapes on offer it takes the tallest, the smallest width over
    height. Each step is then laid in at its own shape and comes out no taller
    than the frame, so a wider one is letterboxed by a line or two top and
    bottom rather than being the one that overflows.
  */
  const tallest = safeSteps.reduce((a, b) =>
    b.imageWidth / b.imageHeight < a.imageWidth / a.imageHeight ? b : a,
  );
  const frameShape = `${tallest.imageWidth} / ${tallest.imageHeight}`;

  /*
    ── One corner for the whole set ────────────────────────────────────────
    The files do not agree about their own corners. A screenshot carries the
    prototype window's curve baked in as alpha — 16px on Issues, 25px on
    Metrics, both against their own 1292px width — and a screen recording
    carries none at all, because GIF has a single transparent colour and no
    alpha to draw a curve with. Three steps, three different corners.

    A clip can only take more away; it cannot put back a corner a file has
    already cut. So the corner they can all share is the widest of them, plus
    `CLIP_MARGIN`: every step is clipped to that, which rounds the shallower
    files further and gives the recording a corner it never had.

    The margin is why the clip, and not the widest file, is what every step
    ends up showing. Clipped to exactly the widest curve, that one file is
    still bounded by its own baked alpha rather than by the clip, and it keeps
    whatever its mask happens to carry — a half-pixel of ramp, a row of
    transparency along one edge — while its neighbours get a clean geometric
    arc. Measured on the page that read as one step a pixel and a half rounder
    than the other two. Landing the clip just outside the curve puts all three
    under one rule.

    It is held as a share of the file's own width, not as a pixel count,
    because the frame runs from 92vw on a phone to 1072px on a desktop. A
    fixed 21px would be the window's curve at one width and wrong at every
    other, while a share scales with the picture it belongs to — which is
    exactly what a baked-in corner does.
  */
  const cornerShare = Math.max(
    0,
    ...safeSteps.map((s) =>
      s.imageRadius ? (s.imageRadius + CLIP_MARGIN) / s.imageWidth : 0,
    ),
  );
  /*
    `border-radius` reads a lone percentage against width for the horizontal
    radius and against height for the vertical one, which on a 1.4:1 box draws
    an ellipse. The pair below asks for the same share twice, the second
    re-expressed against the box's own height, so the corner comes out
    circular at any size.
  */
  const corner = (s: ShowcaseStep) =>
    cornerShare === 0
      ? `${BARE_CORNER}px`
      : `${(cornerShare * 100).toFixed(4)}% / ${(
          cornerShare *
          100 *
          (s.imageWidth / s.imageHeight)
        ).toFixed(4)}%`;
  const single = safeSteps.length === 1;
  const tabId = (i: number) => `${uid}-tab-${safeSteps[i].id}`;
  const panelId = (i: number) => `${uid}-panel-${safeSteps[i].id}`;

  return (
    <div className={`flex w-full flex-col gap-8 ${className ?? ""}`}>
      {/* ---- the steps ------------------------------------------------- */}
      {/*
        Two shapes for one list.

        From 810 it is a grid of three, each carrying its number, title,
        subtitle and copy — `auto-rows-fr` is not needed, since each step is
        its own grid item and the row takes the tallest, so the three rules
        along the top stay on one line however the text wraps.

        Below 810 the copy comes out of the buttons and the three become a row
        of plain labels. Stacked, the three blocks of copy ran to most of a
        phone screen before the picture they describe had even started; the
        picture is the point of the section, and it was arriving below the
        fold. The active step's words now sit under the row instead, where
        only one of them is in the way at a time.

        `flex-1` rather than content-width labels: the three divide the column
        evenly, which keeps the rule under them continuous, gives every label
        the same target to hit, and holds the row to one line — three words
        this short have 100px each at 320 and need about half of it.
      */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        aria-label="Prototype areas"
        onKeyDown={single ? undefined : onKeyDown}
        className="flex w-full tablet:grid tablet:grid-cols-3 tablet:gap-x-8"
      >
        {safeSteps.map((s, i) => {
          const on = i === index;
          return (
            <button
              key={s.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              id={tabId(i)}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={panelId(i)}
              /* Roving tabindex: one stop for the whole list, then arrows. */
              tabIndex={on ? 0 : -1}
              onClick={() => select(i)}
              /* The rule runs under every step and the marker rides it, so
                 the three read as one bar with a lit segment rather than as
                 three separate cards, and the bar separates the row from the
                 screenshot under it. It is also where Carbon puts a tab's
                 indicator, which suits the thing being shown.

                 Above the steps instead, the rule sat immediately under the
                 section title and read as an underline of it. Stacked on a
                 phone the same rule becomes the divider between steps. */
              /* `min-h-11` is the 44px touch target, which the padding alone
                 does not reach for a single 16px label. `flex-1 basis-0` so
                 three labels of different lengths still take an equal third
                 of the row rather than sizing to their own words. */
              className={`relative min-h-11 flex-1 basis-0 cursor-pointer border-b border-grey-100 px-1 py-3 text-center transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 tablet:min-h-0 tablet:flex-none tablet:basis-auto tablet:px-0 tablet:pt-1 tablet:pr-4 tablet:pb-4 tablet:text-left ${
                on ? "" : "hover:bg-grey-50"
              }`}
              style={{ outlineColor: accent } as React.CSSProperties}
            >
              {/* The marker. One element shared across the steps, so Motion
                  moves it instead of fading one out and another in. */}
              {on && !single ? (
                <motion.span
                  layoutId={`${uid}-marker`}
                  aria-hidden
                  className="absolute -bottom-px left-0 h-[2px] w-full"
                  style={{ backgroundColor: accent }}
                  transition={reduceMotion ? { duration: 0 } : STEP_TRANSITION}
                />
              ) : null}

              {/*
                Three lines, all on one left edge: the number and the title
                together on the first, the subtitle under them, then the copy.

                The number and the title share a row because they are one
                label — `01 Home` — and the accent takes both at once when the
                step is selected. The 8px gap carries the stack; the title row
                adds 2px of its own so it sits 10px off the subtitle, and the
                subtitle and the copy keep the plain 8px between them.
              */}
              <span className="flex min-w-0 flex-col gap-2">
                <span className="flex flex-col">
                  <span className="mb-0.5 flex items-baseline justify-center gap-3 tablet:justify-start">
                    {s.number ? (
                      <span
                        /* The numbers order the three for a reader going
                           down a page. In a row of three they are counting
                           tabs that are already side by side, and they cost
                           a third of the label's width on a 320px phone. */
                        className="ts-body hidden font-semibold transition-colors duration-200 tablet:inline"
                        style={{
                          color: on ? accent : "var(--color-light-grey)",
                        }}
                      >
                        {s.number}
                      </span>
                    ) : null}
                    <span
                      className={`ts-body font-semibold transition-colors duration-200 ${on ? "" : "text-light-grey"}`}
                      style={on ? { color: accent } : undefined}
                    >
                      {s.title}
                    </span>
                  </span>
                  {/* Its own row rather than trailing the title behind a
                      dash: three of these ran to two lines in a column a
                      third of the page wide, and the dash was landing at the
                      end of a line as often as between the two words it was
                      meant to join. */}
                  {s.subtitle ? (
                    <span
                      className={`ts-body hidden font-semibold tablet:block ${on ? "text-grey-200" : "text-light-grey"}`}
                    >
                      {s.subtitle}
                    </span>
                  ) : null}
                </span>

                {/*
                  Shown at every width. Across a row the three fit on one line
                  of the page rather than stacking, so they no longer push the
                  picture out of sight the way a column of them did; on a phone
                  the active step's copy is still the last thing before its own
                  screenshot.
                */}
                <span
                  className={`ts-body hidden tablet:block ${on ? "text-dark-charcoal" : "text-light-grey"}`}
                >
                  {s.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ---- the preview ----------------------------------------------- */}
      <figure
        id={panelId(index)}
        role="tabpanel"
        aria-labelledby={tabId(index)}
        tabIndex={0}
        className="m-0 flex w-full flex-col gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: accent } as React.CSSProperties}
      >
        {/*
          The active step's words, below 810 only — above 810 they are still
          in the buttons, where all three are readable at once.

          All three are rendered into one grid cell and the inactive two are
          hidden with `invisible`, so the block is always as tall as the
          longest of them. Rendering only the active one would have the
          picture rise and fall by a line of text on every switch, which is
          the jump the frame below is built to avoid. `aria-hidden` keeps the
          two that are merely holding the height out of the reading order.
        */}
        <div className="grid tablet:hidden">
          {safeSteps.map((s, i) => (
            <div
              key={s.id}
              aria-hidden={i !== index}
              className={`col-start-1 row-start-1 flex flex-col gap-1 ${
                i === index ? "" : "invisible"
              }`}
            >
              {s.subtitle ? (
                <p className="ts-body m-0 font-semibold">{s.subtitle}</p>
              ) : null}
              <p className="ts-body m-0">{s.description}</p>
            </div>
          ))}
        </div>

        <Zoomable
          src={step.imageSrc}
          alt={step.imageAlt}
          width={step.imageWidth}
          height={step.imageHeight}
          cornerRadius={corner(step)}
          panOnDesktop
          pinchZoom
        >
          <div
            /*
              A box and nothing else: it holds the aspect ratio so the column
              cannot move when the picture changes, and it positions the two
              frames of the crossfade. No border, no background, no padding
              and no shadow — the double frame this used to show was a
              container drawn around a picture that already had a corner of
              its own, and nothing is drawn around it now.
            */
            className="relative w-full"
            style={{ aspectRatio: frameShape }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step.id}
                /* `justify-center` is what letterboxes a step whose shape is
                   not the frame's: its clip box sits in the middle of the
                   frame rather than against the top of it. */
                className="absolute inset-0 flex flex-col justify-center"
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 8, scale: 0.99 }
                }
                animate={
                  reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
                }
                /* The leaving frame carries its own, shorter timing: Motion
                   reads `transition` off the `exit` target when one is there,
                   which is the only way to give the two directions different
                   durations on a single element. */
                exit={
                  reduceMotion
                    ? { opacity: 0, transition: { duration: 0.12 } }
                    : {
                        opacity: 0,
                        y: -8,
                        scale: 0.99,
                        transition: EXIT_TRANSITION,
                      }
                }
                transition={
                  reduceMotion ? { duration: 0.12 } : ENTER_TRANSITION
                }
              >
                {/*
                  The clip. It takes the step's *own* shape, not the frame's,
                  so its edges are the picture's edges and the corner above
                  lands exactly on them. Sizing it to the frame instead would
                  put the curve a pixel or two off the picture on any step
                  that is letterboxed — a corner cut out of thin air beside
                  the one it was meant to round.
                */}
                <div
                  className="relative w-full overflow-hidden"
                  style={{
                    aspectRatio: `${step.imageWidth} / ${step.imageHeight}`,
                    borderRadius: corner(step),
                  }}
                >
                  <Image
                    src={step.imageSrc}
                    alt={step.imageAlt}
                    fill
                    sizes="(width < 810px) 92vw, (width < 1200px) 95vw, 1072px"
                    /* An animation has to reach the browser as the file it is:
                       the optimizer would hand back a single still frame and
                       the recording would simply stop. */
                    unoptimized={/\.gif$/i.test(step.imageSrc)}
                    /* The clip is already the picture's shape, so this changes
                       nothing today. It is the guard that keeps a mis-measured
                       `imageWidth` showing a letterboxed picture rather than a
                       stretched one. */
                    className="object-contain"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/*
            Below 810 only. On a desktop the picture says it can be opened
            through `cursor-zoom-in` and the pointer that reads it; a touch
            screen has neither, so the only way to find the lightbox was to
            guess that the picture was tappable.

            A `span`, not a button: `Zoomable` already wraps all of this in
            one, and a button inside a button is invalid and does not survive
            parsing. It is a label on the control rather than a control of its
            own, and the whole picture stays tappable with it.
          */}
          <span
            aria-hidden
            className="ts-body-small-light mt-2.5 flex items-center justify-center gap-1.5 rounded-full border border-grey-100 px-3 py-2 tablet:hidden"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path
                d="M8.4 1.4h4.2v4.2M12.6 1.4 8.1 5.9M5.6 12.6H1.4V8.4M1.4 12.6l4.5-4.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Expand
          </span>
        </Zoomable>

        {/*
          The accuracy note, and nothing else.

          A name for the picture used to sit above it — "Home Page" over the
          Home step, and so on. With the step's own label directly above in
          the tab row, and its subtitle and copy between the two on a phone,
          it was the third time the same word appeared on the way down to the
          picture. The note stays: it says what the prototype is, which
          nothing else on the page does.
        */}
        {note ? (
          <p className="ts-body-small-light w-full text-center">{note}</p>
        ) : null}
      </figure>
    </div>
  );
}
