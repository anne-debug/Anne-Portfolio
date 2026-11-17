"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "motion/react";

import { EyeBeeMBee } from "@/components/case/EyeBeeM";
import { COZY } from "@/components/cozy/texture";

/**
 * "My latest moves", v2: the Framer "Recent life" clothesline (node sRQaUmdmD)
 * with the content of the old latest-moves cards.
 *
 * White polaroids hang from a sagging string on orange binder clips, each a
 * little tilted. They are wider than Framer's so each one can carry a
 * handwritten title, a date and a line or two about the move. Hover
 * straightens a polaroid and lifts it. On desktop each clip can be dragged
 * left and right along the string: it rides the sag, the polaroid swings
 * behind it, and it stays where it is let go. Phones scroll the line sideways
 * instead of overlapping the polaroids, so the writing stays readable.
 *
 * Photos are Anne's, in /public/images/moves (re-encoded, no EXIF). A move
 * without `photo` shows a tinted placeholder.
 */

interface Move {
  date?: string;
  title: string;
  text: string;
  tint: string;
  photo?: string;
  /** object-position for the photo's 4:3 crop */
  focus?: string;
  /** a round sticker: the bee on the polaroid's top right, the fig on its top
   *  left, the MOUX logo on the bottom right corner of the photo itself */
  sticker?: "ibm-bee" | "fig" | "moux";
  href?: string;
}

const MOVES: Move[] = [
  {
    title: "Fig AI Design Makeathon",
    date: "Fall 2027",
    text: "My team took 3rd place in the Fig AI Design Makeathon! I explored how to help people navigate and resolve conflicts when working with AI. Had learned so much from this project and my teammates and can’t wait to join more makeathons!",
    tint: COZY.butter,
    photo: "/images/moves/fig-makeathon.jpg",
    // the team's video tiles are on the right edge of the screenshot
    focus: "100% 50%",
    sticker: "fig",
  },
  {
    date: "Fall 2026",
    title: "MOUX",
    text: "This semester, I joined MOUX and started working with our client, NWTF, to improve the Learn to Hunt experience. So excited to dive into UX research next!!",
    tint: COZY.sage,
    photo: "/images/moves/moux-midpoint.jpg",
    sticker: "moux",
  },
  {
    date: "Sep 2026",
    title: "IBM internship",
    text: "I wrapped up my internship @IBM, where I worked on two meaningful projects in watsonx Orchestrate. I had so much fun working with IBM Bob to turn our design ideas into interactive prototypes!!",
    tint: COZY.sky,
    photo: "/images/moves/ibm-team.jpg",
    sticker: "ibm-bee",
  },
];

/** resting tilt of each polaroid, like they were clipped on by hand */
const TILT = [-5, 2.5, -2.5, 4];
/** how far the string sags at its middle, px */
const SAG = 36;
/** the string's ends sit this far down the line's box, px */
const END = 10;

const ORANGE = "#FF5A1F";
const NAVY = "#1E2A6B";

function Clip() {
  return (
    <svg viewBox="0 0 30 40" width={30} height={40} aria-hidden className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
      {/* wire handles */}
      <path d="M9 22 L7 6 Q7 2 11 2 Q14 2 14 6 L13 22" fill="none" stroke={NAVY} strokeWidth={2} strokeLinecap="round" />
      <path d="M21 22 L23 6 Q23 2 19 2 Q16 2 16 6 L17 22" fill="none" stroke={NAVY} strokeWidth={2} strokeLinecap="round" />
      {/* clip body */}
      <rect x={3} y={18} width={24} height={20} rx={2.5} fill={ORANGE} />
      <rect x={3} y={18} width={24} height={4} rx={2} fill="#000" opacity={0.12} />
    </svg>
  );
}

function Placeholder({ tint }: { tint: string }) {
  return (
    <div className="grid h-full w-full place-items-center" style={{ background: tint }}>
      <svg viewBox="0 0 48 40" width={30} aria-hidden className="opacity-50">
        <rect x={3} y={8} width={42} height={29} rx={6} fill="none" stroke="#2A3132" strokeWidth={2.5} />
        <path d="M16,8 L19,3 L29,3 L32,8" fill="none" stroke="#2A3132" strokeWidth={2.5} strokeLinejoin="round" />
        <circle cx={24} cy={22} r={8} fill="none" stroke="#2A3132" strokeWidth={2.5} />
      </svg>
    </div>
  );
}

/**
 * The bee from IBM's eye-bee-M, as a round white sticker. It is the same
 * artwork the IBM case study uses (`EyeBeeMBee`), which is drawn on the full
 * eye-bee-M box, so the window here shows only the bee's own bounds
 * (x 293 to 543 of 99.7 to 733.5). Its wings flutter once when it mounts.
 */
function BeeSticker() {
  return (
    <span
      aria-hidden
      className="absolute -right-3 -top-4 z-10 grid size-[58px] place-items-center rounded-full bg-white"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.18), 0 4px 10px -3px rgba(0,0,0,0.28)" }}
    >
      {/* head to the left, as if flying off that way */}
      <span className="relative block h-[30px] w-[38px] -rotate-[80deg] overflow-hidden">
        <EyeBeeMBee className="absolute top-1/2 h-auto w-[253.5%] max-w-none -translate-y-1/2 left-[-77.3%]" />
      </span>
    </span>
  );
}

/** The fig mark from the makeathon's logo (cropped from the file Anne sent), as a round white sticker. */
function FigSticker() {
  return (
    <span
      aria-hidden
      className="absolute -left-3 -top-4 z-10 grid size-[58px] -rotate-[8deg] place-items-center rounded-full bg-white"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.18), 0 4px 10px -3px rgba(0,0,0,0.28)" }}
    >
      <Image src="/images/moves/fig-mark.png" alt="" width={178} height={226} className="h-[38px] w-auto" draggable={false} />
    </span>
  );
}

/** The MOUX logo (the file Anne sent, navy ground and all) as a round sticker with a white rim, on the photo's bottom right corner. */
function MouxSticker() {
  return (
    <span
      aria-hidden
      className="absolute -bottom-3 -right-2 z-10 block size-[54px] rotate-[8deg] overflow-hidden rounded-full border-[3px] border-white bg-white"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.18), 0 4px 10px -3px rgba(0,0,0,0.28)" }}
    >
      {/* the mark sits small in its square, so it is enlarged inside the circle */}
      <Image src="/images/moves/moux-logo.png" alt="" width={200} height={200} className="size-full scale-[1.5] rounded-full object-cover" draggable={false} />
    </span>
  );
}

function Polaroid({ move, tilt, reduce }: { move: Move; tilt: number; reduce: boolean }) {
  const body = (
    <motion.article
      className="v2-paper relative flex flex-col bg-white px-3 pb-4 pt-3"
      style={{ rotate: tilt, transformOrigin: "50% 0%", boxShadow: "0 1px 2px rgba(0,0,0,0.10), 0 10px 22px -8px rgba(0,0,0,0.22)" }}
      whileHover={reduce ? undefined : { rotate: 0, y: -6, transition: { type: "spring", stiffness: 260, damping: 18 } }}
    >
      {move.sticker === "ibm-bee" && <BeeSticker />}
      {move.sticker === "fig" && <FigSticker />}
      <div className="relative">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EEE]">
          {move.photo ? <Image src={move.photo} alt="" fill sizes="300px" className="object-cover" style={{ objectPosition: move.focus }} draggable={false} /> : <Placeholder tint={move.tint} />}
        </div>
        {move.sticker === "moux" && <MouxSticker />}
      </div>
      {move.date && (
        <p className="mt-3 text-[10.5px] uppercase tracking-[0.08em] text-light-grey" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
          {move.date}
        </p>
      )}
      {/* same hand as the "Off the Screen" label above the heading */}
      <p className={`${move.date ? "mt-1" : "mt-3"} text-[21px] leading-[1.1]`} style={{ fontFamily: "var(--font-mansalva)", color: NAVY }}>
        {move.title}
      </p>
      <p className="mt-2 text-[14px] leading-[1.45] text-dark-charcoal" style={{ fontFamily: "var(--font-dm-sans)" }}>
        {move.text}
      </p>
    </motion.article>
  );
  return move.href ? (
    <a href={move.href} target="_blank" rel="noreferrer" className="block">
      {body}
    </a>
  ) : (
    body
  );
}

/** the row only fits (and so only drags) from the desktop breakpoint up; below it the line scrolls sideways */
const DESKTOP = "(min-width: 1200px)";
function useDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(DESKTOP);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(DESKTOP).matches,
    () => false,
  );
}

/**
 * One clip and its polaroid, hanging at column `i` of `n`. Dragging slides it
 * along the string: `x` is the drag, `y` keeps the clip on the string's curve
 * at its new place, and the whole thing swings about the clip with the speed
 * of the drag, like paper trailing behind a moving peg.
 */
function Hanging({
  i,
  n,
  rowRef,
  rowW,
  canDrag,
  reduce,
  children,
}: {
  i: number;
  n: number;
  rowRef: React.RefObject<HTMLDivElement | null>;
  rowW: number;
  canDrag: boolean;
  reduce: boolean;
  children: React.ReactNode;
}) {
  const x = useMotionValue(0);
  const y = useTransform(x, (v) => {
    if (!rowW) return 0;
    const t0 = (i + 0.5) / n;
    const t = Math.min(1, Math.max(0, t0 + v / rowW));
    return 4 * SAG * (t * (1 - t) - t0 * (1 - t0));
  });
  const speed = useVelocity(x);
  const swing = useSpring(useTransform(speed, [-1400, 0, 1400], [-8, 0, 8], { clamp: true }), { stiffness: 170, damping: 11 });

  return (
    <motion.div
      className={`flex flex-col items-center ${canDrag ? "cursor-grab touch-pan-y select-none active:cursor-grabbing" : ""}`}
      style={{ x, y, rotate: reduce ? 0 : swing, transformOrigin: "50% 14px" }}
      drag={canDrag ? "x" : false}
      dragConstraints={rowRef}
      dragElastic={0.08}
      dragMomentum={false}
      whileDrag={{ zIndex: 30 }}
    >
      {children}
    </motion.div>
  );
}

export function RecentMoves() {
  const reduce = useReducedMotion() ?? false;
  const n = MOVES.length;
  const canDrag = useDesktop();
  const rowRef = useRef<HTMLDivElement>(null);
  const [rowW, setRowW] = useState(0);
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const ro = new ResizeObserver(([e]) => setRowW(e.contentRect.width));
    ro.observe(row);
    return () => ro.disconnect();
  }, []);
  /** where the string is at the middle of column i (quadratic sag, ends at END) */
  const drop = (i: number) => {
    const t = (i + 0.5) / n;
    return END + 4 * SAG * t * (1 - t);
  };

  return (
    <section aria-labelledby="moves-title" className="w-full">
      <div className="mb-6 flex flex-col gap-4 desktop:flex-row desktop:items-end desktop:justify-between desktop:gap-10">
        <div>
          <p className="inline-block -rotate-[4deg] text-[22px] leading-[1.2] text-orange" style={{ fontFamily: "var(--font-mansalva)" }}>
            Off the Screen ✎
          </p>
          <h2 id="moves-title" className="ts-heading-2 mt-1 text-deep-blue">
            Recent Life
          </h2>
        </div>
        <p className="max-w-[420px] text-[16px] leading-[1.5] text-dark-charcoal" style={{ fontFamily: "var(--font-dm-sans)" }}>
          A little peek at what I’ve been working on and what I’m excited about next.
        </p>
      </div>

      {/* phones and tablets scroll the line sideways; on desktop it fits the column */}
      <div className="-mx-5 overflow-x-auto px-5 pb-8 pt-1 [scrollbar-width:none] tablet:-mx-10 tablet:px-10 desktop:mx-0 desktop:overflow-visible desktop:px-0 [&::-webkit-scrollbar]:hidden">
        {/* about 230px a polaroid while scrolling; desktop shares the column */}
        <div
          ref={rowRef}
          className="relative grid w-[var(--row-w)] gap-5 desktop:w-full"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, "--row-w": `${n * 250}px` } as React.CSSProperties}
        >
          {/* the string, edge to edge, sagging in the middle */}
          <svg className="pointer-events-none absolute inset-x-0 top-0 w-full" height={END + SAG + 12} viewBox={`0 0 100 ${END + SAG + 12}`} preserveAspectRatio="none" aria-hidden>
            <path d={`M0 ${END} Q50 ${END + 2 * SAG} 100 ${END}`} fill="none" style={{ stroke: "var(--color-dark-charcoal)" }} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
          </svg>
          {MOVES.map((m, i) => (
            <div key={m.title} style={{ paddingTop: drop(i) - 14 }}>
              <Hanging i={i} n={n} rowRef={rowRef} rowW={rowW} canDrag={canDrag} reduce={reduce}>
                <Clip />
                <div className="-mt-3 w-full max-w-[300px] px-2">
                  <Polaroid move={m} tilt={TILT[i % TILT.length]} reduce={reduce} />
                </div>
              </Hanging>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
