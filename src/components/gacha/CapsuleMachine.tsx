"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "motion/react";

import { COZY, CozyFilters } from "@/components/cozy/texture";
import { CAPSULES, type Capsule } from "./skills";
import { PortraitSticker } from "./PortraitSticker";

/**
 * "What I bring to the table", as a gumball machine with a face.
 *
 * Turn the knob and the machine squeezes its eyes shut while the gumballs
 * rattle, then one ball rolls out of the chute. Tap the ball and it pops into a
 * ticket: one skill, one line about where Anne used it, and a link to that case
 * study. The face on the glass watches the pointer and changes expression with
 * each step. Opened skills collect in a tray, and a plain list sits behind a
 * toggle for anyone who would rather skim.
 *
 * Style: flat fills with clean charcoal outlines, matched to the hero
 * doodles (see cozy/texture).
 * The machine is one SVG with a fixed 340x540 viewBox, so it scales as one
 * piece; the knob and the ball are HTML buttons laid over it in percentages of
 * that box, so they work by keyboard and screen reader.
 */

const VB_W = 340;
const VB_H = 540;
const DOME = { x: 170, y: 172, r: 132 };
const KNOB = { x: 170, y: 372, r: 27 };
const LAND = { x: 236, y: 466 };

const BODY = COZY.navy;
const GLASS = "rgba(234, 242, 255, 0.95)";
const BALL_COLORS = [COZY.sky, COZY.peach, "#FFFFFF", COZY.pink, COZY.butter, COZY.sky, COZY.orange, COZY.sage];

type Phase = "idle" | "cranking" | "dropping" | "ready" | "open";

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** Rows of small gumballs packed into the bottom of the dome. */
const BALLS = (() => {
  const rows: { y: number; xs: number[] }[] = [
    { y: 284, xs: [142, 171, 200] },
    { y: 259, xs: [97, 126, 155, 184, 213, 242] },
    { y: 233, xs: [80, 109, 138, 167, 196, 225, 254] },
    { y: 208, xs: [68, 97, 126, 155, 184, 213, 242, 271] },
  ];
  const out: { x: number; y: number; c: string; r: number }[] = [];
  let k = 0;
  for (const row of rows)
    for (const x of row.xs) {
      out.push({ x: x + ((k * 7) % 5) - 2, y: row.y + ((k * 3) % 4) - 2, c: BALL_COLORS[(k * 5) % BALL_COLORS.length], r: ((k * 47) % 80) - 40 });
      k++;
    }
  return out;
})();

function Gumball({ color, size = 40, mood = "smile" }: { color: string; size?: number; mood?: "smile" | "wow" }) {
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40" aria-hidden>
      <circle r={18} fill={color} stroke={COZY.ink} strokeWidth={2} />
      <path d="M-10,-8 A12,12 0 0 1 -2,-14" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
      <circle cx={-5} cy={-1} r={2} fill={COZY.ink} />
      <circle cx={5} cy={-1} r={2} fill={COZY.ink} />
      {mood === "smile" ? (
        <path d="M-5,5 Q0,10 5,5" stroke={COZY.ink} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      ) : (
        <ellipse cx={0} cy={7} rx={2.6} ry={3} fill={COZY.ink} />
      )}
    </svg>
  );
}

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Ticket({ capsule, number, onAgain, soldOut }: { capsule: Capsule; number: number; onAgain: () => void; soldOut: boolean }) {
  return (
    <div
      className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border p-6"
      style={{ background: COZY.paper, borderColor: "rgba(42,49,50,0.12)", boxShadow: "0 12px 30px rgba(42,49,50,0.08)" }}
    >
      <div className="flex items-center justify-between">
        <span
          className="rounded-full px-2.5 py-0.5 text-[12px] tracking-[0.08em] uppercase"
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", background: capsule.color, color: COZY.ink }}
        >
          No. {String(number).padStart(2, "0")} / {String(CAPSULES.length).padStart(2, "0")}
        </span>
        <Gumball color={capsule.color} size={30} />
      </div>
      <h3 className="mt-4 text-[28px] font-semibold leading-[1.15] tracking-[-0.5px] text-deep-blue" style={{ fontFamily: "var(--font-dm-sans)" }}>
        {capsule.skill}
      </h3>
      <p className="mt-3 text-[16px] leading-[1.45]" style={{ fontFamily: "var(--font-dm-sans)", color: COZY.ink }}>
        {capsule.story}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-dashed pt-4" style={{ borderColor: COZY.inkSoft }}>
        {capsule.href ? (
          <Link href={capsule.href} className="text-[14px] font-medium underline decoration-[1.5px] underline-offset-4 hover:opacity-70" style={{ fontFamily: "var(--font-dm-sans)", color: COZY.ink }}>
            {capsule.where} →
          </Link>
        ) : (
          <span className="text-[14px] font-medium" style={{ fontFamily: "var(--font-dm-sans)", color: COZY.ink }}>
            {capsule.where}
          </span>
        )}
        <button
          type="button"
          onClick={onAgain}
          className="rounded-full bg-dark-charcoal px-4 py-1.5 text-[14px] font-medium text-off-white transition-transform hover:scale-105 active:scale-95"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {soldOut ? "Refill the machine ↻" : "Turn again ↻"}
        </button>
      </div>
    </div>
  );
}

/** The face painted on the glass. */
function Face({ phase, soldOut, eyeX, eyeY }: { phase: Phase; soldOut: boolean; eyeX: ReturnType<typeof useSpring>; eyeY: ReturnType<typeof useSpring> }) {
  const L = { x: 136, y: 108 };
  const R = { x: 204, y: 108 };
  const squeeze = phase === "cranking";
  const sleepy = soldOut && phase !== "open";

  return (
    <g>
      <ellipse cx={112} cy={140} rx={15} ry={8} fill={COZY.blush} />
      <ellipse cx={228} cy={140} rx={15} ry={8} fill={COZY.blush} />

      {squeeze ? (
        <g stroke={COZY.ink} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d={`M${L.x - 12},${L.y - 9} L${L.x + 8},${L.y} L${L.x - 12},${L.y + 9}`} />
          <path d={`M${R.x + 12},${R.y - 9} L${R.x - 8},${R.y} L${R.x + 12},${R.y + 9}`} />
        </g>
      ) : sleepy ? (
        <g stroke={COZY.ink} strokeWidth={4} strokeLinecap="round" fill="none">
          <path d={`M${L.x - 13},${L.y + 2} Q${L.x},${L.y + 10} ${L.x + 13},${L.y + 2}`} />
          <path d={`M${R.x - 13},${R.y + 2} Q${R.x},${R.y + 10} ${R.x + 13},${R.y + 2}`} />
        </g>
      ) : (
        [L, R].map((e, i) => (
          <g key={i}>
            <ellipse cx={e.x} cy={e.y} rx={16} ry={phase === "dropping" ? 21 : 19} fill="#fff" />
            <motion.g style={{ x: eyeX, y: eyeY }}>
              <circle cx={e.x} cy={e.y + 2} r={8.5} fill={COZY.ink} />
              <circle cx={e.x + 3} cy={e.y - 1} r={2.6} fill="#fff" />
            </motion.g>
          </g>
        ))
      )}

      {squeeze ? (
        <path d="M152,136 Q170,166 188,136 Z" fill="#B4505F" />
      ) : phase === "dropping" ? (
        <ellipse cx={170} cy={145} rx={8} ry={10} fill="#B4505F" />
      ) : phase === "ready" ? (
        <g>
          <path d="M148,134 Q170,170 192,134 Z" fill="#B4505F" />
          <ellipse cx={170} cy={152} rx={9} ry={5} fill="#F29AA6" />
        </g>
      ) : sleepy ? (
        <path d="M162,144 Q170,140 178,144" stroke={COZY.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      ) : (
        <path d="M154,138 Q170,154 186,138" stroke={COZY.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

export function CapsuleMachine() {
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);

  const order = useRef<number[] | null>(null);
  const [inDome, setInDome] = useState<number[]>(() => CAPSULES.map((_, i) => i));
  const [collected, setCollected] = useState<number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [turns, setTurns] = useState(0);
  const [pops, setPops] = useState(0);
  const [showList, setShowList] = useState(false);

  const eyeX = useSpring(0, { stiffness: 260, damping: 22 });
  const eyeY = useSpring(0, { stiffness: 260, damping: 22 });

  const soldOut = inDome.length === 0;
  const busy = phase === "cranking" || phase === "dropping";
  const drawn = CAPSULES.length - inDome.length;

  const wait = (ms: number) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));

  function onPointerMove(e: React.PointerEvent) {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * VB_W - 170;
    const y = ((e.clientY - r.top) / r.height) * VB_H - 110;
    const d = Math.hypot(x, y) || 1;
    const k = Math.min(1, d / 160) * 6;
    eyeX.set((x / d) * k);
    eyeY.set((y / d) * k);
  }

  async function crank() {
    if (busy) return;
    if (soldOut) {
      order.current = null;
      setInDome(CAPSULES.map((_, i) => i));
      setCollected([]);
      setCurrent(null);
      setPhase("idle");
      return;
    }
    if (!order.current) order.current = shuffle(CAPSULES.map((_, i) => i));
    const next = order.current.find((i) => inDome.includes(i));
    if (next === undefined) return;

    setCurrent(null);
    setPhase("cranking");
    setTurns((t) => t + 1);
    await wait(900);
    setInDome((d) => d.filter((i) => i !== next));
    setCurrent(next);
    setPhase("dropping");
    await wait(700);
    setPhase("ready");
  }

  function open() {
    if (current === null) return;
    setCollected((c) => (c.includes(current) ? c : [...c, current]));
    setPops((p) => p + 1);
    setPhase("open");
  }

  function reopen(i: number) {
    if (busy) return;
    setCurrent(i);
    setPhase("open");
  }

  const ballShown = current !== null && (phase === "dropping" || phase === "ready");

  return (
    <section id="service" aria-labelledby="capsule-title" className="relative w-full py-10 tablet:py-16" onPointerMove={onPointerMove}>
      <div className="grid grid-cols-1 justify-items-center gap-10 tablet:grid-cols-[340px_minmax(0,440px)] tablet:grid-rows-[auto_1fr] tablet:justify-center tablet:gap-x-16 tablet:gap-y-6">
        {/* ── The machine, with Anne's photo leaning on it ── */}
        <div className="relative order-2 w-full max-w-[300px] tablet:order-none tablet:col-start-1 tablet:row-span-2 tablet:row-start-1 tablet:max-w-[340px]">
          <div className="absolute -left-[8%] -top-[3%] z-10 w-[38%] tablet:-left-[34%] tablet:w-[46%]">
            <PortraitSticker />
          </div>

          <div className="relative w-full" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
            <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
              <CozyFilters id={uid} />
              <defs>
                <clipPath id={`${uid}-dome`}>
                  <circle cx={DOME.x} cy={DOME.y} r={DOME.r - 4} />
                </clipPath>
              </defs>

              <ellipse cx={170} cy={526} rx={140} ry={9} fill="rgba(78,64,58,0.1)" />

              <g filter={`url(#${uid}-crayon)`}>
                {/* base */}
                <rect x={44} y={480} width={252} height={34} rx={10} fill={COZY.ink} />
                {/* body */}
                <path d="M84,306 L256,306 L282,468 Q284,482 270,482 L70,482 Q56,482 58,468 Z" fill={BODY} />
                {/* front plate */}
                <rect x={122} y={326} width={96} height={130} rx={14} fill="#fff" stroke={COZY.ink} strokeWidth={2.5} />
                {/* chute */}
                <path d="M146,456 L146,432 Q146,412 170,412 Q194,412 194,432 L194,456 Z" fill={COZY.ink} />
                {/* collar */}
                <rect x={70} y={290} width={200} height={24} rx={10} fill={COZY.ink} />
                {/* dome */}
                <circle cx={DOME.x} cy={DOME.y} r={DOME.r} fill={GLASS} />
              </g>

              {/* gumballs */}
              <g clipPath={`url(#${uid}-dome)`}>
                {BALLS.map((b, i) =>
                  i >= BALLS.length - drawn ? null : (
                    <motion.g
                      key={i}
                      initial={false}
                      animate={
                        phase === "cranking" && !reduce
                          ? { x: [0, (i % 2 ? 1 : -1) * 6, ((i % 3) - 1) * 4, 0], y: [0, -10 - (i % 4) * 5, 3, 0] }
                          : { x: 0, y: 0 }
                      }
                      transition={{ duration: 0.85, ease: "easeInOut", delay: (i % 5) * 0.02 }}
                    >
                      <g transform={`translate(${b.x} ${b.y}) rotate(${b.r})`} filter={`url(#${uid}-soft)`}>
                        <circle r={14} fill={b.c} stroke={COZY.ink} strokeWidth={1.8} />
                        <circle cx={-4.5} cy={-1} r={1.7} fill={COZY.ink} />
                        <circle cx={4.5} cy={-1} r={1.7} fill={COZY.ink} />
                        <path d="M-4,4 Q0,8 4,4" stroke={COZY.ink} strokeWidth={1.5} fill="none" strokeLinecap="round" />
                      </g>
                    </motion.g>
                  ),
                )}
              </g>

              {/* the face on the glass */}
              <motion.g
                filter={`url(#${uid}-soft)`}
                animate={phase === "cranking" && !reduce ? { y: [0, -4, 2, -3, 0] } : { y: 0 }}
                transition={{ duration: 0.85 }}
              >
                <Face phase={phase} soldOut={soldOut} eyeX={eyeX} eyeY={eyeY} />
              </motion.g>

              {/* glass shine */}
              <path d="M74,128 C82,94 104,70 132,56" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.75} />
              <circle cx={70} cy={150} r={4.5} fill="#fff" opacity={0.75} />

              {/* counter */}
              <text x={170} y={502} textAnchor="middle" fontSize={12} letterSpacing="2" fill={COZY.cream} style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {phase === "ready" ? "TAP THE BALL" : soldOut ? "ALL GONE · REFILL" : `${String(inDome.length).padStart(2, "0")} SKILLS LEFT`}
              </text>
            </svg>

            {/* the knob */}
            <motion.button
              type="button"
              onClick={crank}
              disabled={busy}
              aria-label={soldOut ? "Refill the gumball machine" : "Turn the knob to get a skill"}
              className="absolute grid cursor-pointer place-items-center rounded-full disabled:cursor-wait"
              style={{ left: pct(KNOB.x - KNOB.r, VB_W), top: pct(KNOB.y - KNOB.r, VB_H), width: pct(KNOB.r * 2, VB_W), aspectRatio: "1" }}
              animate={{ rotate: turns * 360 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 12 }}
              whileHover={reduce || busy ? undefined : { scale: 1.08 }}
              whileTap={reduce ? undefined : { scale: 0.92 }}
            >
              <svg viewBox="-30 -30 60 60" className="h-full w-full overflow-visible" aria-hidden>
                <circle r={27} fill={COZY.orange} stroke={COZY.ink} strokeWidth={2.5} />
                <rect x={-24} y={-6} width={48} height={12} rx={6} fill="#fff" stroke={COZY.ink} strokeWidth={2} />
                <circle r={5} fill={COZY.ink} />
              </svg>
            </motion.button>

            <AnimatePresence>
              {turns === 0 && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute whitespace-nowrap"
                  style={{ left: pct(214, VB_W), top: pct(352, VB_H), fontFamily: "var(--font-mansalva)", color: COZY.ink, fontSize: 19 }}
                  initial={{ opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, rotate: [-5, 3, -5] }}
                  exit={{ opacity: 0 }}
                  transition={{ rotate: { repeat: Infinity, duration: 1.6, ease: "easeInOut" } }}
                >
                  ← turn me!
                </motion.div>
              )}
            </AnimatePresence>

            {/* the ball that rolls out */}
            <AnimatePresence>
              {ballShown && current !== null && (
                <motion.button
                  key={`ball-${turns}`}
                  type="button"
                  onClick={open}
                  disabled={phase !== "ready"}
                  aria-label={`Open the ${CAPSULES[current].skill} gumball`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ left: pct(LAND.x, VB_W), top: pct(LAND.y, VB_H), width: pct(46, VB_W) }}
                  initial={reduce ? { opacity: 0 } : { x: -70, y: -24, opacity: 0, rotate: -200 }}
                  animate={phase === "ready" && !reduce ? { x: 0, y: [0, -5, 0], opacity: 1, rotate: [0, -8, 8, 0] } : { x: 0, y: 0, opacity: 1, rotate: 0 }}
                  exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.18 } }}
                  transition={phase === "ready" ? { duration: 1.1, repeat: Infinity, repeatDelay: 0.5 } : { type: "spring", stiffness: 200, damping: 12 }}
                >
                  <Gumball color={CAPSULES[current].color} size={46} mood={phase === "ready" ? "smile" : "wow"} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* pop */}
            <AnimatePresence>
              {phase === "open" && pops > 0 && !reduce && (
                <motion.div key={`pop-${pops}`} aria-hidden className="pointer-events-none absolute" style={{ left: pct(LAND.x, VB_W), top: pct(LAND.y, VB_H) }} exit={{ opacity: 0 }}>
                  {Array.from({ length: 8 }, (_, i) => {
                    const a = (i / 8) * Math.PI * 2;
                    return (
                      <motion.span
                        key={i}
                        className="absolute size-2 rounded-full"
                        style={{ background: BALL_COLORS[i % BALL_COLORS.length] }}
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{ x: Math.cos(a) * 44, y: Math.sin(a) * 44, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* collection tray */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="text-[12px] tracking-[0.08em] uppercase" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: COZY.inkSoft }}>
              Collected {collected.length}/{CAPSULES.length}
            </span>
            <ul className="flex flex-wrap justify-center gap-1.5">
              {CAPSULES.map((c, i) => (
                <li key={c.skill}>
                  {collected.includes(i) ? (
                    <button type="button" onClick={() => reopen(i)} aria-label={`Open ${c.skill} again`} className="block transition-transform hover:-translate-y-0.5">
                      <Gumball color={c.color} size={26} />
                    </button>
                  ) : (
                    <span aria-hidden className="block size-[26px] rounded-full border-[1.5px] border-dashed" style={{ borderColor: "rgba(78,64,58,0.3)" }} />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Heading ── */}
        <div className="order-1 flex w-full max-w-[440px] flex-col gap-3 text-center tablet:order-none tablet:col-start-2 tablet:row-start-1 tablet:pt-6 tablet:text-left">
          <h2 id="capsule-title" className="ts-heading-2 text-deep-blue">
            What I bring to the table
          </h2>
          <p className="text-[18px] leading-[1.4]" style={{ fontFamily: "var(--font-dm-sans)", color: COZY.ink }}>
            Turn the knob. Each gumball holds one skill and the project where I used it.
          </p>
        </div>

        {/* ── The opened ticket ── */}
        <div className="order-3 flex w-full max-w-[440px] flex-col items-center gap-6 tablet:order-none tablet:col-start-2 tablet:row-start-2 tablet:items-start">
          <div className="relative w-full tablet:min-h-[300px]" aria-live="polite">
            <AnimatePresence mode="wait">
              {phase === "open" && current !== null ? (
                <motion.div
                  key={`ticket-${current}`}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, transition: { duration: 0.16 } }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                >
                  <Ticket capsule={CAPSULES[current]} number={current + 1} onAgain={crank} soldOut={soldOut} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid min-h-[220px] w-full max-w-[420px] place-items-center rounded-2xl border-[1.5px] border-dashed p-6"
                  style={{ borderColor: "rgba(42,49,50,0.2)" }}
                >
                  <span className="text-[16px] text-light-grey" style={{ fontFamily: "var(--font-dm-sans)" }}>
                    {phase === "ready" ? "tap the gumball!" : "your gumball opens here"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full max-w-[420px]">
            <button
              type="button"
              onClick={() => setShowList((s) => !s)}
              aria-expanded={showList}
              className="text-[14px] underline underline-offset-4 hover:opacity-70"
              style={{ fontFamily: "var(--font-dm-sans)", color: COZY.inkSoft }}
            >
              {showList ? "Hide the list" : "No time to play? See all skills as a list"}
            </button>
            {showList && (
              <ul className="mt-3 flex flex-col gap-2 text-left" style={{ fontFamily: "var(--font-dm-sans)" }}>
                {CAPSULES.map((c) => (
                  <li key={c.skill} className="flex items-baseline gap-2 text-[15px] leading-[1.4]" style={{ color: COZY.ink }}>
                    <span aria-hidden className="inline-block size-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                    <span>
                      <strong className="font-medium">{c.skill}</strong>
                      {" · "}
                      {c.href ? (
                        <Link href={c.href} className="underline underline-offset-2">
                          {c.where}
                        </Link>
                      ) : (
                        c.where
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
