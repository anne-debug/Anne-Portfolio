"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useReducedMotion, useSpring } from "motion/react";

import { COZY } from "./texture";
import { DidiPeek, TOOLS, type Tool } from "./ToolBox";

/**
 * "Tools I reach for", as a sticker book.
 *
 * Each tool is a die-cut sticker on a sheet. Hovering lifts its bottom-right
 * corner; dragging peels it back with a fold that follows the pointer, and
 * peeling far enough pulls it off and drops it into the "My toolkit" page,
 * where its note says how Anne uses the tool. A click or Enter peels it
 * automatically, so the effect never depends on dragging.
 *
 * The peel is plain SVG. The fold line is the perpendicular bisector of the
 * sticker's corner C and the peel point P: the part on C's side is clipped
 * away from the front and drawn again, reflected across that line, as the
 * sticker's paper back. Written from scratch for this site.
 *
 * Tool list and notes come from ToolBox.tsx (DRAFT, for Anne to confirm).
 */

const ink = COZY.ink;
const VB_W = 112;
const VB_H = 124;
const C = { x: 110, y: 122 };
/** How far (viewBox units) the corner must travel before the sticker comes off. */
const DETACH = 120;
const SHAPE = "M20,2 H92 A18,18 0 0 1 110,20 V104 A18,18 0 0 1 92,122 H20 A18,18 0 0 1 2,104 V20 A18,18 0 0 1 20,2 Z";
const TILT = [-3, 2, -1.5, 3, 2.5, -2, 1.5, -2.5];

type Pt = { x: number; y: number };

function r2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Fold geometry for peel point `p`, or null when the sticker lies flat. */
function fold(p: Pt) {
  const dx = C.x - p.x;
  const dy = C.y - p.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return null;
  const nx = dx / len;
  const ny = dy / len;
  const mx = (C.x + p.x) / 2;
  const my = (C.y + p.y) / 2;
  const tx = -ny;
  const ty = nx;
  const B = 600;
  const quad = (s: number) =>
    [
      [mx + tx * B, my + ty * B],
      [mx + tx * B + s * nx * B, my + ty * B + s * ny * B],
      [mx - tx * B + s * nx * B, my - ty * B + s * ny * B],
      [mx - tx * B, my - ty * B],
    ]
      .map(([x, y]) => `${r2(x)},${r2(y)}`)
      .join(" ");
  const k = 2 * (mx * nx + my * ny);
  const matrix = [1 - 2 * nx * nx, -2 * nx * ny, -2 * nx * ny, 1 - 2 * ny * ny, k * nx, k * ny].map(r2).join(" ");
  return { front: quad(-1), back: quad(1), matrix: `matrix(${matrix})`, m: { x: r2(mx), y: r2(my) }, len };
}

/** The sticker's printed face: tint panel, glyph and name. */
function Face({ tool }: { tool: Tool }) {
  return (
    <>
      <path d={SHAPE} fill="#fff" stroke={ink} strokeWidth={2} />
      <rect x={12} y={12} width={88} height={72} rx={12} fill={tool.tint} />
      <g transform="translate(32,24)">{tool.glyph}</g>
      <text x={56} y={106} textAnchor="middle" fontSize={tool.name.length > 8 ? 12 : 13.5} fontWeight={600} fill={ink} style={{ fontFamily: "var(--font-dm-sans)" }}>
        {tool.name}
      </text>
    </>
  );
}

function FlatSticker({ tool, className }: { tool: Tool; className?: string }) {
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className={className} aria-hidden>
      <Face tool={tool} />
    </svg>
  );
}

function PeelSticker({ tool, index, onPeeled }: { tool: Tool; index: number; onPeeled: () => void }) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion() ?? false;
  const svgRef = useRef<SVGSVGElement>(null);
  const [p, setP] = useState<Pt>(C);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const anim = useRef<ReturnType<typeof animate> | null>(null);
  const done = useRef(false);

  function tween(to: Pt, opts: { duration?: number; onComplete?: () => void } = {}) {
    anim.current?.stop();
    const from = p;
    anim.current = animate(0, 1, {
      duration: opts.duration ?? 0.25,
      ease: [0.3, 0.7, 0.4, 1],
      onUpdate: (t) => setP({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }),
      onComplete: opts.onComplete,
    });
  }

  function peelOff() {
    if (done.current) return;
    done.current = true;
    if (reduce) return onPeeled();
    tween({ x: 38, y: 44 }, { duration: 0.45, onComplete: onPeeled });
  }

  function toViewBox(dxPx: number, dyPx: number) {
    const w = svgRef.current?.getBoundingClientRect().width || VB_W;
    const s = VB_W / w;
    return { x: dxPx * s, y: dyPx * s };
  }

  function onDown(e: React.PointerEvent) {
    if (done.current) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    anim.current?.stop();
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
  }

  function onMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || done.current) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) d.moved = true;
    if (!d.moved) return;
    const v = toViewBox(e.clientX - d.x, e.clientY - d.y);
    // Peel from the corner toward the pointer; the corner never moves outward.
    const next = { x: Math.min(C.x, C.x - 16 + v.x), y: Math.min(C.y, C.y - 16 + v.y) };
    setP(next);
    if (Math.hypot(C.x - next.x, C.y - next.y) > DETACH) {
      drag.current = null;
      peelOff();
    }
  }

  function onUp() {
    const d = drag.current;
    drag.current = null;
    if (!d || done.current) return;
    if (!d.moved) return peelOff();
    tween(C, { duration: 0.35 });
  }

  const f = fold(p);
  const lift = Math.min(1, (f?.len ?? 0) / 60);

  return (
    <motion.button
      type="button"
      layoutId={`tool-sticker-${tool.name}`}
      aria-label={`Peel off the ${tool.name} sticker`}
      className="relative block w-full touch-none select-none rounded-[18px] outline-offset-4"
      style={{ rotate: TILT[index % TILT.length] }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerEnter={() => !drag.current && !done.current && !reduce && tween({ x: C.x - 16, y: C.y - 16 })}
      onPointerLeave={() => !drag.current && !done.current && tween(C)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          peelOff();
        }
      }}
    >
      <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} className="h-auto w-full overflow-visible" aria-hidden>
        <defs>
          {f && (
            <>
              <clipPath id={`${uid}-front`}>
                <polygon points={f.front} />
              </clipPath>
              <clipPath id={`${uid}-back`}>
                <polygon points={f.back} />
              </clipPath>
              <linearGradient id={`${uid}-paper`} gradientUnits="userSpaceOnUse" x1={f.m.x} y1={f.m.y} x2={C.x} y2={C.y}>
                <stop offset="0" stopColor="#D9D6D0" />
                <stop offset="0.35" stopColor="#F4F2EE" />
                <stop offset="1" stopColor="#FFFFFF" />
              </linearGradient>
            </>
          )}
          <filter id={`${uid}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx={-1.5} dy={2} stdDeviation={2.4} floodColor={ink} floodOpacity={0.28} />
          </filter>
        </defs>

        <g style={{ filter: `drop-shadow(0 ${r2(1 + lift * 2)}px ${r2(1 + lift * 3)}px rgba(42,49,50,${r2(0.08 + lift * 0.06)}))` }}>
          <g clipPath={f ? `url(#${uid}-front)` : undefined}>
            <Face tool={tool} />
          </g>
        </g>
        {f && (
          <g transform={f.matrix} filter={`url(#${uid}-shadow)`}>
            <path d={SHAPE} clipPath={`url(#${uid}-back)`} fill={`url(#${uid}-paper)`} stroke={ink} strokeWidth={2} />
          </g>
        )}
      </svg>
    </motion.button>
  );
}

export function StickerBook() {
  const reduce = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const didiRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<string[]>([]);
  const [shown, setShown] = useState<string | null>(null);
  const [swat, setSwat] = useState(0);
  const eyeX = useSpring(0, { stiffness: 260, damping: 22 });
  const eyeY = useSpring(0, { stiffness: 260, damping: 22 });

  function onMove(e: React.PointerEvent) {
    const r = didiRef.current?.getBoundingClientRect();
    if (!r) return;
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height * 0.5);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 200) * 5;
    eyeX.set((dx / d) * k);
    eyeY.set((dy / d) * k);
  }

  function place(name: string) {
    setPlaced((list) => (list.includes(name) ? list : [...list, name]));
    setShown(name);
    setSwat((s) => s + 1);
  }

  const tool = TOOLS.find((t) => t.name === shown) ?? null;
  const placedTools = placed.map((n) => TOOLS.find((t) => t.name === n)!).filter(Boolean);
  const left = TOOLS.length - placed.length;

  return (
    <section ref={sectionRef} aria-labelledby="tools-title" className="w-full" onPointerMove={onMove}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="tools-title" className="ts-heading-2 whitespace-nowrap text-deep-blue max-tablet:!text-[34px]">
            Tools I reach for
          </h2>
          <p className="mt-1 text-[16px] text-dark-charcoal" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Peel a sticker to see how I use it.
          </p>
        </div>
        <AnimatePresence>
          {placed.length > 0 && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setPlaced([]);
                setShown(null);
              }}
              className="shrink-0 rounded-full border-[1.5px] bg-white px-4 py-2 text-[14px] font-medium transition-transform hover:scale-105"
              style={{ fontFamily: "var(--font-dm-sans)", borderColor: ink, color: ink }}
            >
              Put them back
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 rounded-2xl bg-light-grey-super p-4 tablet:grid-cols-[1.25fr_1fr] tablet:gap-6 tablet:p-6">
        {/* the sheet */}
        <div className="relative rounded-xl bg-white p-5 tablet:p-7" style={{ boxShadow: "0 0 0 1px rgba(42,49,50,0.1)" }}>
          <div className="mb-4 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: "ui-monospace, Menlo, monospace", color: COZY.inkSoft }}>
            <span>Tool stickers<span className="max-tablet:hidden"> · sheet 01</span></span>
            <span>{left} left</span>
          </div>
          <ul className="grid grid-cols-3 gap-x-4 gap-y-5 tablet:grid-cols-4 tablet:gap-x-5 tablet:gap-y-6">
            {TOOLS.map((t, i) => (
              <li key={t.name} className="relative">
                {/* the die-cut outline left behind on the backing paper */}
                <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-auto w-full" style={{ rotate: `${TILT[i % TILT.length]}deg` }} aria-hidden>
                  <path d={SHAPE} fill="#F4F2EE" stroke="rgba(42,49,50,0.3)" strokeWidth={1.5} strokeDasharray="5 5" />
                </svg>
                {placed.includes(t.name) ? (
                  <div className="aspect-[112/124] w-full" />
                ) : (
                  <PeelSticker tool={t} index={i} onPeeled={() => place(t.name)} />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* the notebook page */}
        <div
          className="relative flex min-h-[380px] flex-col overflow-hidden rounded-xl bg-white p-5 tablet:p-7"
          style={{
            boxShadow: "0 0 0 1px rgba(42,49,50,0.1)",
            backgroundImage: "radial-gradient(rgba(42,49,50,0.12) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          <div className="mb-4 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: "ui-monospace, Menlo, monospace", color: COZY.inkSoft }}>
            <span>My toolkit</span>
            <span>
              {placed.length}/{TOOLS.length}
            </span>
          </div>

          <ul className="grid grid-cols-4 gap-3">
            {TOOLS.map((_, slot) => {
              const t = placedTools[slot];
              return (
                <li key={slot} className="relative aspect-[112/124] rounded-[14px] border-[1.5px] border-dashed" style={{ borderColor: "rgba(42,49,50,0.2)" }}>
                  {t && (
                    <motion.button
                      type="button"
                      layoutId={`tool-sticker-${t.name}`}
                      onClick={() => setShown(t.name)}
                      aria-label={`${t.name}: how I use it`}
                      aria-pressed={shown === t.name}
                      className="absolute inset-0 rounded-[14px]"
                      style={{ rotate: TILT[slot % TILT.length] * -1 }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 22 }}
                      whileHover={reduce ? undefined : { scale: 1.06 }}
                    >
                      <FlatSticker tool={t} className="h-full w-full" />
                      {shown === t.name && <span className="absolute -bottom-2 left-1/2 size-1.5 -translate-x-1/2 rounded-full" style={{ background: COZY.orange }} />}
                    </motion.button>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex-1 pr-[28%] tablet:pr-[30%]" aria-live="polite">
            <AnimatePresence mode="wait">
              {tool ? (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-start gap-2"
                >
                  <span className="rounded-full px-3 py-0.5 text-[11px] uppercase tracking-[0.06em]" style={{ fontFamily: "ui-monospace, Menlo, monospace", background: tool.tint, color: ink }}>
                    {tool.where}
                  </span>
                  <h3 className="text-[24px] font-semibold tracking-[-0.4px] text-deep-blue" style={{ fontFamily: "var(--font-dm-sans)", lineHeight: 1.15 }}>
                    {tool.name}
                  </h3>
                  <p className="text-[15px] leading-[1.5]" style={{ fontFamily: "var(--font-dm-sans)", color: ink }}>
                    {tool.note}
                  </p>
                </motion.div>
              ) : (
                <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[15px] leading-[1.5]" style={{ fontFamily: "var(--font-dm-sans)", color: COZY.inkSoft }}>
                  Stickers you peel land here. Drag one off the sheet, or click it.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div ref={didiRef} className="pointer-events-none absolute -bottom-1 right-2 w-[34%] max-w-[170px]">
            <DidiPeek eyeX={eyeX} eyeY={eyeY} swat={swat} />
          </div>
        </div>
      </div>
    </section>
  );
}
