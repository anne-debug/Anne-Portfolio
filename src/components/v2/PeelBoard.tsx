"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

import { DESIGNS, type Material } from "./peelArt";

/**
 * A board of real-feeling stickers you can peel off and stick back down,
 * matched to the sticker set Anne placed in her Framer project: same nine
 * designs, colours, materials, sizes, positions and tilts, on a warm
 * #F1EFE7 board with 24px corners.
 *
 * Built from scratch in SVG (no WebGL):
 * - Press a sticker and drag: the corner nearest your finger lifts and folds
 *   back along a line that follows the pointer, showing the paper backing.
 * - Pull far enough and it comes off. It then rides on the pointer with a
 *   deeper shadow; let go and it sticks down where you dropped it.
 * - Let go early and it lays itself back flat.
 * - Materials: vinyl has a crisp moving highlight, paper is matte with
 *   grain, foil shifts through a rainbow as the light moves. "Wear" adds
 *   faint scuffs and whitened edges.
 * - Sound is synthesised (a short peel rasp and a soft thud on landing) and
 *   can be switched off.
 */

interface Item {
  design: keyof typeof DESIGNS;
  label: string;
  material: Material;
  width: number;
  at: [number, number];
  atPhone: [number, number];
  rot: number;
  wear: number;
}

const ITEMS: Item[] = [
  { design: "framer", label: "Framer", material: "vinyl", width: 246, at: [19, 25], atPhone: [26, 16], rot: -18, wear: 0.06 },
  { design: "figma", label: "Figma", material: "vinyl", width: 180, at: [47, 18], atPhone: [72, 17], rot: 17, wear: 0.03 },
  { design: "notion", label: "Notion", material: "paper", width: 184, at: [78, 27], atPhone: [25, 36], rot: 9, wear: 0.13 },
  { design: "react", label: "React", material: "vinyl", width: 230, at: [65, 51], atPhone: [72, 37], rot: -22, wear: 0.04 },
  { design: "claude", label: "Claude", material: "paper", width: 226, at: [39, 48], atPhone: [30, 55], rot: -10, wear: 0.08 },
  { design: "cursor", label: "Cursor", material: "vinyl", width: 194, at: [16, 64], atPhone: [23, 76], rot: -27, wear: 0.1 },
  { design: "asterisk", label: "Asterisk", material: "foil", width: 230, at: [44, 80], atPhone: [53, 87], rot: 12, wear: 0.08 },
  { design: "save", label: "Save", material: "vinyl", width: 202, at: [76, 81], atPhone: [81, 75], rot: -12, wear: 0.17 },
  { design: "chatgpt", label: "ChatGPT", material: "vinyl", width: 184, at: [87, 54], atPhone: [76, 56], rot: 15, wear: 0.035 },
];

const SHADOW = "43,36,26";
const BACKING: Record<Material, string> = { paper: "#EDE9DE", vinyl: "#EDE9DE", foil: "#D4D9D6" };

type Pt = { x: number; y: number };

function r2(n: number) {
  return Math.round(n * 100) / 100;
}

/* ---------- sound ---------- */

let ctx: AudioContext | null = null;
function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function rasp(volume: number, material: Material) {
  const a = audio();
  if (!a) return;
  const len = 0.16;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * len), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    const t = i / d.length;
    const grain = Math.random() < 0.08 ? 2.2 : 1;
    d[i] = (Math.random() * 2 - 1) * grain * Math.pow(1 - t, 1.6);
  }
  const src = a.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = material === "foil" ? 1.03 : material === "paper" ? 0.98 : 0.92;
  const hp = a.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 2900;
  const lp = a.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = material === "foil" ? 9600 : material === "paper" ? 8500 : 7400;
  const g = a.createGain();
  g.gain.value = 0.18 * volume;
  src.connect(hp).connect(lp).connect(g).connect(a.destination);
  src.start();
}

function thud(volume: number) {
  const a = audio();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  const t = a.currentTime;
  o.type = "sine";
  o.frequency.setValueAtTime(270, t);
  o.frequency.exponentialRampToValueAtTime(180, t + 0.06);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.5 * volume, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + 0.12);
}

/* ---------- fold geometry ---------- */

function fold(c: Pt, p: Pt) {
  const dx = c.x - p.x;
  const dy = c.y - p.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return null;
  const nx = dx / len;
  const ny = dy / len;
  const mx = (c.x + p.x) / 2;
  const my = (c.y + p.y) / 2;
  const tx = -ny;
  const ty = nx;
  const B = 900;
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
  const m = [1 - 2 * nx * nx, -2 * nx * ny, -2 * nx * ny, 1 - 2 * ny * ny, k * nx, k * ny].map(r2).join(" ");
  return { front: quad(-1), back: quad(1), matrix: `matrix(${m})`, mid: { x: r2(mx), y: r2(my) }, len };
}

/* ---------- one sticker ---------- */

function Sticker({
  item,
  scale,
  phone,
  sound,
  z,
  onFront,
}: {
  item: Item;
  scale: number;
  phone: boolean;
  sound: boolean;
  z: number;
  onFront: () => void;
}) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion() ?? false;
  const design = DESIGNS[item.design];
  const width = item.width * scale;
  const [corner, setCorner] = useState<Pt>({ x: design.box[2], y: design.box[1] });
  const [p, setP] = useState<Pt>({ x: design.box[2], y: design.box[1] });
  const [held, setHeld] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState<Pt>({ x: 0, y: 0 });
  const [light, setLight] = useState<Pt>({ x: 0.3, y: 0.2 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number; c: Pt; mode: "peel" | "held" } | null>(null);
  const anim = useRef<ReturnType<typeof animate> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const rad = (item.rot * Math.PI) / 180;
  /** Screen px delta -> sticker art units (undo rotation and scale). */
  function toArt(dx: number, dy: number): Pt {
    const k = 300 / width;
    return { x: (dx * Math.cos(-rad) - dy * Math.sin(-rad)) * k, y: (dx * Math.sin(-rad) + dy * Math.cos(-rad)) * k };
  }

  function settle(from: Pt, to: Pt) {
    anim.current?.stop();
    anim.current = animate(0, 1, {
      duration: reduce ? 0 : 0.3,
      ease: [0.3, 0.7, 0.4, 1],
      onUpdate: (t) => setP({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }),
    });
  }

  function onDown(e: React.PointerEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    anim.current?.stop();
    onFront();
    const box = ref.current!.getBoundingClientRect();
    // Grab point in art units, from the sticker's centre.
    const g = toArt(e.clientX - (box.left + box.width / 2), e.clientY - (box.top + box.height / 2));
    const gx = 150 + g.x;
    const gy = 150 + g.y;
    const [x0, y0, x1, y1] = design.box;
    const c = { x: gx < 150 ? x0 : x1, y: gy < 150 ? y0 : y1 };
    setCorner(c);
    setP(c);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y, c, mode: "peel" };
    setDragging(true);
  }

  function onMove(e: React.PointerEvent) {
    const box = ref.current?.getBoundingClientRect();
    if (box) setLight({ x: (e.clientX - box.left) / box.width, y: (e.clientY - box.top) / box.height });
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.mode === "held") {
      setOffset({ x: d.ox + dx, y: d.oy + dy });
      return;
    }
    const v = toArt(dx, dy);
    // The corner travels with the pointer, a touch faster, so it feels light.
    const next = { x: d.c.x + v.x * 0.95 * 1.15, y: d.c.y + v.y * 0.95 * 1.15 };
    setP(next);
    const span = Math.hypot(design.box[2] - design.box[0], design.box[3] - design.box[1]);
    if (Math.hypot(next.x - d.c.x, next.y - d.c.y) > span * 0.8) {
      d.mode = "held";
      d.x = e.clientX;
      d.y = e.clientY;
      d.ox = offset.x;
      d.oy = offset.y;
      setHeld(true);
      setP(d.c);
      if (sound) rasp(0.8, item.material);
    }
  }

  function onUp() {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d) return;
    if (d.mode === "held") {
      setHeld(false);
      if (sound) thud(0.8);
      return;
    }
    settle(p, d.c);
  }

  useEffect(() => () => anim.current?.stop(), []);

  const f = held ? null : fold(corner, p);
  const lift = held ? 1 : Math.min(1, (f?.len ?? 0) / 160);
  const shadowX = width * (0.009 + lift * 0.06);
  const shadowY = width * (0.015 + lift * 0.11);
  const blur = width * (0.009 + lift * 0.06);
  const shadowA = r2(0.34 / (1 + lift * 1.2));
  const at = phone ? item.atPhone : item.at;

  const sil = design.shape({ fill: "#000" });
  const glossX = r2(light.x * 300);
  const glossY = r2(light.y * 300);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${item.label} sticker`}
      className="absolute touch-none select-none"
      style={{
        left: `${at[0]}%`,
        top: `${at[1]}%`,
        width,
        height: width,
        zIndex: z,
        transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${item.rot}deg) scale(${held ? 1.06 : 1})`,
        transition: dragging ? "none" : "transform 0.25s cubic-bezier(.3,.7,.4,1)",
        cursor: held ? "grabbing" : "grab",
        filter: `drop-shadow(${r2(shadowX)}px ${r2(shadowY)}px ${r2(blur)}px rgba(${SHADOW},${shadowA}))`,
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerLeave={() => setLight({ x: 0.3, y: 0.2 })}
    >
      <svg viewBox="0 0 300 300" className="h-full w-full overflow-visible" aria-hidden>
        <defs>
          {f && (
            <>
              <clipPath id={`${uid}-front`}>
                <polygon points={f.front} />
              </clipPath>
              <clipPath id={`${uid}-back`}>
                <polygon points={f.back} />
              </clipPath>
              <linearGradient id={`${uid}-backing`} gradientUnits="userSpaceOnUse" x1={f.mid.x} y1={f.mid.y} x2={corner.x} y2={corner.y}>
                <stop offset="0" stopColor="#B9B3A6" />
                <stop offset="0.25" stopColor={BACKING[item.material]} />
                <stop offset="1" stopColor="#FBFAF6" />
              </linearGradient>
            </>
          )}
          <clipPath id={`${uid}-sil`}>{sil}</clipPath>
          <radialGradient id={`${uid}-gloss`} gradientUnits="userSpaceOnUse" cx={glossX} cy={glossY} r={item.material === "vinyl" ? 60 : 140}>
            <stop offset="0" stopColor="#fff" stopOpacity={item.material === "vinyl" ? 0.55 : item.material === "foil" ? 0.5 : 0.08} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
          <linearGradient id={`${uid}-rainbow`} gradientUnits="userSpaceOnUse" x1={r2(glossX - 220)} y1={0} x2={r2(glossX + 220)} y2={300}>
            {["#FF9AA2", "#FFE29A", "#9AFFC8", "#9AD7FF", "#C39AFF", "#FF9AA2"].map((c, i) => (
              <stop key={i} offset={i / 5} stopColor={c} />
            ))}
          </linearGradient>
          <filter id={`${uid}-grain`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} />
            <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0.55 0" />
          </filter>
          <filter id={`${uid}-wear`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.06 1.6" numOctaves={1} seed={9} />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 9 -6.2" />
          </filter>
        </defs>

        <g clipPath={f ? `url(#${uid}-front)` : undefined}>
          {design.shape({ fill: design.cutColor, stroke: design.cutColor, strokeWidth: design.cut })}
          {design.art}
          <g clipPath={`url(#${uid}-sil)`} style={{ pointerEvents: "none" }}>
            {item.material === "paper" && <rect width={300} height={300} filter={`url(#${uid}-grain)`} opacity={0.22} />}
            {item.material === "foil" && <rect width={300} height={300} fill={`url(#${uid}-rainbow)`} opacity={0.42} style={{ mixBlendMode: "color" }} />}
            <rect width={300} height={300} fill={`url(#${uid}-gloss)`} />
            {item.wear > 0 && <rect width={300} height={300} filter={`url(#${uid}-wear)`} opacity={r2(Math.min(1, item.wear * 1.3))} />}
          </g>
          {item.wear > 0 && (
            <g opacity={r2(item.wear * 2.2)} strokeDasharray="2 7 1 5">
              {design.shape({ fill: "none", stroke: "#F0EDE3", strokeWidth: 3 })}
            </g>
          )}
        </g>

        {f && (
          <g transform={f.matrix}>
            <g clipPath={`url(#${uid}-back)`}>{design.shape({ fill: `url(#${uid}-backing)`, stroke: `url(#${uid}-backing)`, strokeWidth: design.cut })}</g>
          </g>
        )}
      </svg>
    </div>
  );
}

/* ---------- board ---------- */

export function PeelBoard({ className = "" }: { className?: string }) {
  const board = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 960, h: 760 });
  const [order, setOrder] = useState(ITEMS.map((_, i) => i));
  const [sound, setSound] = useState(true);
  const [reset, setReset] = useState(0);

  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const phone = size.w < 520 && size.h > 1.35 * size.w;
  const scale = phone ? 0.55 * Math.min(size.w / 390, size.h / 900) : Math.min(1, size.w / 1000, size.h / 760);

  return (
    <div
      ref={board}
      className={`relative w-full overflow-hidden rounded-[24px] ${className}`}
      style={{ background: "var(--v2-sticker-board)" }}
    >
      <div key={reset} className="absolute inset-0">
        {ITEMS.map((item, i) => (
          <Sticker
            key={item.design}
            item={item}
            scale={scale}
            phone={phone}
            sound={sound}
            z={order.indexOf(i) + 1}
            onFront={() => setOrder((o) => [...o.filter((x) => x !== i), i])}
          />
        ))}
      </div>
      <div className="absolute bottom-3 right-3 z-[60] flex gap-2">
        <button
          type="button"
          onClick={() => setReset((n) => n + 1)}
          className="v2-paper rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-medium text-dark-charcoal backdrop-blur transition-colors hover:bg-white"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => setSound((s) => !s)}
          aria-pressed={sound}
          className="v2-paper rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-medium text-dark-charcoal backdrop-blur transition-colors hover:bg-white"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Sound {sound ? "on" : "off"}
        </button>
      </div>
    </div>
  );
}
