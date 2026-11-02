"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Zoomable } from "./Zoomable";

/**
 * How a design changed, and why — three areas, one under the other.
 *
 * Each area is its own block: a numbered heading, a line saying where it
 * travelled, a row of version buttons, the screenshot, and under it the
 * version's title and reasoning. The areas are stacked rather than tabbed, and
 * the versions inside an area are the only thing a reader has to switch.
 *
 * ── Why the areas are no longer tabs ─────────────────────────────────────
 * Tabs made two of the three areas invisible. A reader who never pressed
 * `Issues` never learned that Alerts became Issues, or why the Tickets panel
 * went away — the decisions were behind a control that looks optional. Down
 * the page all three are read in order, which is what a process section is
 * for. It costs scrolling; the screenshots are worth scrolling past.
 *
 * ── Why the copy moved below the screenshot ──────────────────────────────
 * It used to sit in a 30% column beside the picture, about 280px wide, which
 * is roughly 40 characters a line — for paragraphs this long that is six or
 * seven lines where there should be three. Below the picture it runs at the
 * same measure as the rest of the page's prose, and the picture gets the whole
 * column instead of two thirds of it.
 *
 * ── Why the frame is capped rather than cropped ──────────────────────────
 * These captures are not one shape: they run from 0.61 to 1.41 wide over tall,
 * because the early versions are full-page scrolls of a dense dashboard and
 * the later ones are shorter. The frame takes each picture's own proportions,
 * so nothing is cropped and nothing floats in a half-empty box, and a maximum
 * height per breakpoint keeps the tall ones from running a page and a half
 * down the screen. Where that cap bites, the picture is centred in the frame
 * and the frame is wider than the picture — invisible, because nothing is
 * drawn around it.
 *
 * ── Auto-advance ─────────────────────────────────────────────────────────
 * Deliberately not built. The reader is comparing screenshots and reading the
 * reasoning under them; having the thing move while they read is the opposite
 * of useful.
 */

/** One picture, where a version is shown by several rather than by one. */
export interface DesignShot {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface DesignIteration {
  id: string;
  /** The button's label: "V1", "V2", "V2.5", "Final". */
  version: string;
  /** What the version was trying to be: "A Task-Oriented Home". */
  title: string;
  /** The reasoning. Each string is its own paragraph. */
  description: string[];
  /** An accuracy note under the copy, where one is owed. */
  note?: string;
  /** The version's screen. Leave it out where `shots` carries the pictures. */
  imageSrc?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  /**
   * Several pictures instead of one, laid out as a grid.
   *
   * Metrics V2.5 was not a screen; it was four studies of what a metric card
   * might hold — Runtime, Network, Connections, Tools. Shown as one picture
   * they would have to be a montage someone made for the purpose, which is a
   * thing that never existed; shown as four they are what they are. Where
   * this is set the single image is ignored.
   */
  shots?: DesignShot[];
}

export interface DesignArea {
  id: string;
  /** "Home", "Issues", "Metrics". */
  label: string;
  /** Where the area travelled: "From Alerts and Tickets to Issue Investigation". */
  subtitle?: string;
  iterations: DesignIteration[];
}

/**
 * The one screen a version is shown by, or nothing where `shots` carries the
 * pictures instead.
 */
function screenOf(it: DesignIteration): DesignShot | null {
  if (it.shots?.length) return null;
  if (!it.imageSrc || !it.imageWidth || !it.imageHeight) return null;
  return {
    src: it.imageSrc,
    alt: it.imageAlt ?? "",
    width: it.imageWidth,
    height: it.imageHeight,
  };
}

/** The marker's glide from one version button to the next. */
const MARKER_TRANSITION = {
  type: "spring",
  stiffness: 320,
  damping: 28,
  mass: 0.8,
} as const;

const EASE = [0.16, 1, 0.3, 1] as const;
/**
 * The picture swap. One crossfade, not an exit followed by an enter: the
 * pictures are stacked and all that changes is which is opaque, so there is
 * no moment when the frame holds neither.
 */
const IMAGE_FADE = { duration: 0.25, ease: EASE } as const;
/** The frame reshaping between one picture's proportions and the next. */
const FRAME_TRANSITION = { duration: 0.3, ease: EASE } as const;
/** The copy under it arriving. */
const COPY_TRANSITION = { duration: 0.28, ease: EASE } as const;

/**
 * How tall a preview may get, per breakpoint.
 *
 * These are previews now, not the whole picture. Shown entire, the captures
 * run from 676 to 1549px tall in a desktop column — a reader coming to Issues
 * V2 had to scroll a dashboard and a half before reaching the next thing Anne
 * had to say. The frame takes the full width of the column and 500px of
 * height, the picture is laid in at that width with its height left to
 * follow, and whatever falls past the cap is clipped by the frame. Nothing is
 * resized and no file is touched: the lightbox opens the original.
 *
 * 500 at a desktop, which is the middle of the 450–550 Anne asked for and
 * about the height of the first screenful of each of these dashboards. Less
 * further down, in proportion to the window rather than to the column, since
 * the point is how much of a page a reader gives up to one picture.
 *
 * From 810 up every one of the nine overruns its cap, so the frame is the
 * same height whichever version is chosen and switching moves nothing on the
 * page below it. On a phone the column is narrow enough that four of them
 * fit, and there the frame is the picture's own height.
 */
const FRAME_CAP = "max-h-[360px] tablet:max-h-[440px] desktop:max-h-[500px]";

export function DesignIterationShowcase({
  areas,
  accent = "var(--color-orange)",
  note,
  className,
}: {
  areas: DesignArea[];
  /** Any CSS colour; the numbers and the selected version take it. */
  accent?: string;
  /** One line under the whole section, true of every screenshot in it. */
  note?: string;
  className?: string;
}) {
  const live = areas.filter((a) => a.iterations.length > 0);
  if (live.length === 0) return null;

  return (
    /*
      70px between the areas, which is what Research puts between its blocks
      and what Metro puts between blocks inside a section, with the page's own
      hairline between them. The rule is doing the work a tab boundary used to:
      saying where one area ends.
    */
    <div className={`flex w-full flex-col gap-[70px] ${className ?? ""}`}>
      {live.map((area, i) => (
        <div key={area.id} className="flex w-full flex-col gap-[70px]">
          {i > 0 ? (
            <span className="h-px w-full bg-grey-100" aria-hidden />
          ) : null}
          <AreaBlock area={area} index={i} accent={accent} />
        </div>
      ))}

      {/* Once, for all nine screenshots, rather than repeated under each. */}
      {note ? <p className="ts-body-small-light m-0 w-full">{note}</p> : null}
    </div>
  );
}

function AreaBlock({
  area,
  index,
  accent,
}: {
  area: DesignArea;
  index: number;
  accent: string;
}) {
  const uid = useId();
  const reduceMotion = useReducedMotion();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  /** Its own version, so switching one area leaves the others as they were. */
  const [vi, setVi] = useState(0);
  const select = useCallback((next: number, moveFocus = false) => {
    setVi(next);
    if (moveFocus) tabs.current[next]?.focus();
  }, []);

  /**
   * A tablist owns its arrow keys, and the page would otherwise scroll out
   * from under the reader on every press. Left and right as well as up and
   * down: the row is horizontal, but a reader reaching for the other pair
   * should not find nothing.
   */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const n = area.iterations.length;
      const go = (next: number) => {
        e.preventDefault();
        select((next + n) % n, true);
      };
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(vi + 1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(vi - 1);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(n - 1);
    },
    [area.iterations.length, select, vi],
  );

  const safe = Math.min(vi, area.iterations.length - 1);
  const iteration = area.iterations[safe];
  const panelId = `${uid}-panel`;
  const single = area.iterations.length === 1;

  /**
   * The preview scrolls, so it has a scroll position, and a scroll position
   * belongs to the version it was made against: arriving at V2 four hundred
   * pixels down a picture you have not seen the top of is disorienting, and
   * the versions are different lengths anyway. Every switch goes back to the
   * top, instantly rather than animated — the picture under it has changed,
   * so there is nothing for a smooth scroll to be continuous with.
   */
  /** The version's one screen, where it has one rather than several. */
  const screen = screenOf(iteration);
  /*
    The area's single screens, all mounted in the frame at once so that
    switching is a change of opacity rather than a load. A version shown by
    several studies is not in here: it has its own grid, and nothing in the
    frame to fade to.
  */
  const layers = area.iterations
    .map((it) => ({ id: it.id, shot: screenOf(it) }))
    .filter((l): l is { id: string; shot: DesignShot } => l.shot !== null);

  const stage = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (stage.current) stage.current.scrollTop = 0;
  }, [safe]);

  return (
    <section
      id={`design-${area.id}`}
      aria-labelledby={`${uid}-title`}
      className="flex w-full flex-col gap-5"
    >
      {/*
        `h3` under the section's own `h2`, at the size Research gives its
        blocks, with the body-sized line under it that `SubHeading` uses at
        that size. The number is the reading order and nothing else, so it is
        hidden from the heading's name rather than read out as "oh one".
      */}
      <div className="flex w-full flex-col gap-2.5">
        <h3
          id={`${uid}-title`}
          className="ts-heading-6 m-0 flex w-full items-baseline gap-3 text-left"
        >
          {/* The heading's own size and colour, inherited rather than
              restated: the number and the word are one line of type. It was
              blue for a round, which made it read as a label on the heading
              rather than part of it. */}
          <span aria-hidden>{String(index + 1).padStart(2, "0")}</span>
          {area.label}
        </h3>
        {area.subtitle ? (
          <p className="ts-body w-full text-left text-light-grey">
            {area.subtitle}
          </p>
        ) : null}
      </div>

      {/* ---- the versions ---------------------------------------------- */}
      {/*
        Compact, and only as wide as its buttons: a full-width row of three
        would read as a second level of section navigation, which is what the
        area tabs used to be and the mistake this layout is undoing. The rule
        under them carries the marker, so the row reads as one bar with a lit
        segment — Carbon's own treatment for a tab's indicator.
      */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        aria-label={`${area.label} versions`}
        onKeyDown={single ? undefined : onKeyDown}
        className="flex w-fit max-w-full flex-wrap border-b border-grey-100"
      >
        {area.iterations.map((it, i) => {
          const on = i === safe;
          return (
            <button
              key={it.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              id={`${uid}-tab-${it.id}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={panelId}
              tabIndex={on ? 0 : -1}
              onClick={() => select(i)}
              className={`relative min-h-11 cursor-pointer px-4 py-2.5 transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 ${
                on ? "" : "hover:bg-grey-50"
              }`}
              style={{ outlineColor: accent } as React.CSSProperties}
            >
              {on && !single ? (
                <motion.span
                  layoutId={`${uid}-marker`}
                  aria-hidden
                  className="absolute -bottom-px left-0 h-[2px] w-full"
                  style={{ backgroundColor: accent }}
                  transition={
                    reduceMotion ? { duration: 0 } : MARKER_TRANSITION
                  }
                />
              ) : null}
              {/* `grey-150` unselected, not `light-grey`: these are three
                  states of one control and only one of them is current, so
                  the other two step back further than body copy does. */}
              <span
                className={`ts-body font-semibold transition-colors duration-200 ${on ? "" : "text-grey-150"}`}
                style={on ? { color: accent } : undefined}
              >
                {it.version}
              </span>
            </button>
          );
        })}
      </div>

      {/* ---- what the version was trying to be, then the screenshot ----- */}
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${iteration.id}`}
        tabIndex={0}
        className="flex w-full flex-col gap-[30px] focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: accent } as React.CSSProperties}
      >
        {/*
          Keyed on the version, so the copy is replaced rather than crossfaded
          through a moment where both are laid out. Only the text is keyed; the
          pictures below are not, which is what keeps the frame from flashing.

          Full width, to the same edges as the screenshot under it. It ran at
          the 760px Research sets for its longest prose, which left the text
          stopping 190px short of the picture and the two reading as separate
          columns. Anne asked for one edge, and a version's reasoning is two
          or three paragraphs rather than a page of prose.
        */}
        <motion.div
          key={iteration.id}
          className="flex w-full flex-col gap-2.5"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : COPY_TRANSITION}
        >
          {/* `h4`: a step below the area's `h3`, at the size the research
              insights use for the same job. */}
          <h4 className="ts-body-large-fluid m-0 w-full font-medium normal-case text-grey-200">
            {iteration.title}
          </h4>
          {iteration.description.map((text, k) => (
            <p key={k} className="ts-body m-0 w-full">
              {text}
            </p>
          ))}
          {iteration.note ? (
            <p className="ts-body-small-light m-0 w-full">{iteration.note}</p>
          ) : null}
        </motion.div>

        {screen ? (
          <figure className="relative m-0 w-full">
            {/*
              The preview: the picture at the column's full width, in a box that
              stops at the cap and scrolls.

              It was clipped and that was all — there was more of the screenshot
              and the only way to any of it was the lightbox. Making the box a
              scroll container costs nothing and answers the obvious gesture:
              the picture is still the frame's width, still uncropped, still the
              original file, and the reader can run down it in place.

              ── Why every version is mounted at once ──────────────────────
              Switching used to unmount one picture and mount the next under
              `AnimatePresence mode="wait"`, which runs the exit to completion
              before the enter begins. Measured, that left the frame holding
              nothing but the page behind it for about 200ms — a white flash on
              every switch — and the incoming `img` was a new node that had to
              be fetched and decoded before it could paint, so the flash ran
              until it was ready rather than for a fixed time.

              All of the area's pictures are laid in on top of each other
              instead, and switching changes only their opacity. Nothing mounts,
              nothing unmounts, nothing reloads: by the time a version is chosen
              its picture has long since been decoded, because it has been
              sitting in the frame at zero opacity. It also makes fast clicking
              harmless — there is no exit to interrupt, only an opacity that
              gets a new target.

              `aspectRatio` is animated as a number rather than the frame being
              given Motion's `layout`. A layout animation reshapes a box by
              scaling it, and the scale lands on the picture inside, squeezing
              it for the length of the animation; animating the ratio changes
              the box's height with no transform anywhere near the content.
              Here it also sets what there is to scroll: the ratio gives the box
              the picture's full height, and the cap takes back everything past
              500px as overflow.

              No `overscroll-contain`. Lenis yields the wheel to a nested
              scroller only while that scroller can still move in the direction
              asked for, and it reads `overscroll-behavior` to decide; left at
              `auto`, reaching the bottom of the picture hands the page back
              rather than trapping a reader inside 500px of screenshot.
            */}
            <motion.div
              ref={stage}
              className={`relative w-full overflow-x-hidden overflow-y-auto rounded-[12px] ${FRAME_CAP}`}
              initial={false}
              animate={{
                aspectRatio: screen.width / screen.height,
              }}
              transition={reduceMotion ? { duration: 0 } : FRAME_TRANSITION}
            >
              <Zoomable
                src={screen.src}
                alt={screen.alt}
                width={screen.width}
                height={screen.height}
                fitZoom
                triggerClassName="relative"
              >
                {/*
                  The scrolled content, and so the thing that has to carry the
                  picture's full height: the layers inside it are absolute and
                  would leave the scroller nothing to scroll.
                */}
                <span
                  className="relative block w-full"
                  style={{
                    aspectRatio: `${screen.width} / ${screen.height}`,
                  }}
                >
                  {layers.map(({ id, shot }) => {
                    const shown = id === iteration.id;
                    return (
                      <motion.span
                        key={id}
                        /* Only the one on top is the picture being shown; the
                           others are behind it at zero opacity, so they are
                           out of the reading order. */
                        aria-hidden={!shown}
                        /* `inset-0` with the overflow hidden, not just pinned
                           to the top: an absolutely positioned child still
                           counts towards a scroll container's extent, so the
                           tallest version of the three was setting how far
                           every one of them scrolled — Home Final ran out at
                           its own foot and then kept going through 870px of
                           nothing. Held to the stage, which is the shown
                           picture's own shape, each layer stops where its
                           picture does. */
                        className="absolute inset-0 block overflow-hidden"
                        initial={false}
                        animate={{ opacity: shown ? 1 : 0 }}
                        transition={reduceMotion ? { duration: 0 } : IMAGE_FADE}
                      >
                        {/*
                          Laid in at the frame's full width with its height left
                          to follow, pinned to the top — rather than `fill` with
                          `object-cover`, which would fit whichever edge was
                          tighter. Nothing is cropped or resized; the file is
                          untouched and the lightbox opens all of it.

                          It matters during the switch. The frame animates from
                          one picture's proportions to the next, so for 300ms it
                          is a shape that belongs to neither, and `cover` reads
                          that shape: a landscape capture arriving into a frame
                          still as tall as the portrait one would be scaled up
                          to fill the height and lose 160px off its sides. A
                          width and an automatic height cannot do that — the
                          picture is the frame's width throughout, whatever the
                          frame is doing.
                        */}
                        <Image
                          src={shot.src}
                          alt={shown ? shot.alt : ""}
                          width={shot.width}
                          height={shot.height}
                          sizes="(width < 810px) 92vw, (width < 1200px) 95vw, 951px"
                          className="h-auto w-full"
                        />
                      </motion.span>
                    );
                  })}
                </span>
              </Zoomable>
            </motion.div>
            <ExpandCue />
          </figure>
        ) : null}

        {/*
          Several studies rather than one screen: a grid, two across from 810
          and one below it. Each is its own picture and opens on its own —
          they were four separate explorations and a montage of them would be
          a thing that never existed.
        */}
        {iteration.shots?.length ? (
          <div className="grid w-full grid-cols-1 gap-5 tablet:grid-cols-2">
            {iteration.shots.map((shot) => (
              <figure key={shot.src} className="relative m-0 w-full">
                <div
                  className="relative w-full overflow-hidden rounded-[12px]"
                  style={{ aspectRatio: `${shot.width} / ${shot.height}` }}
                >
                  <Zoomable
                    src={shot.src}
                    alt={shot.alt}
                    width={shot.width}
                    height={shot.height}
                    fitZoom
                    triggerClassName="relative"
                  >
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      width={shot.width}
                      height={shot.height}
                      sizes="(width < 810px) 92vw, (width < 1200px) 47vw, 465px"
                      className="h-auto w-full"
                    />
                  </Zoomable>
                </div>
                {/* No cue on these. Nothing is clipped at this size, so
                    there is nothing to say "there is more" about, and the
                    badge had to sit on top of the card's own content — it
                    covered the end of a credential expiry and a degraded
                    tool. The pill on the full screenshots above teaches the
                    behaviour; these are small enough to read where they
                    are. */}
              </figure>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * The expand cue, over the bottom right of a picture.
 *
 * A `span`, not a button: `Zoomable` already wraps the picture in one, named
 * `Enlarge: <alt>`, and a button inside a button does not survive parsing. It
 * is a label on that control, and `pointer-events-none` keeps the click and
 * the wheel going to the picture underneath — which also lets it sit outside
 * the scroller, so it holds still while a tall screenshot runs past.
 */
function ExpandCue() {
  return (
    <span
      aria-hidden
      className="ts-body-small-light pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full border border-grey-100 bg-[var(--color-off-white)]/95 px-3 py-1.5 text-light-grey"
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
      View full screenshot
    </span>
  );
}
