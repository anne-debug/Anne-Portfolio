"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Hero } from "@/components/home/Hero";
import { SEAL_GLYPHS } from "./sealGlyphs";

/**
 * The original home hero, untouched, with one ink-wash flower painted behind
 * it, just below the pencil sketch of little Anne.
 *
 * (This file used to draw a brush stroke across the hero. Anne asked for the
 * stroke to go, so the flower is the only addition now. The name is kept so
 * the page import does not change.)
 *
 * The flower is an original drawing in black and grey ink: pale wash petals
 * at the back, darker ones in front, each a single tapered brush shape with a
 * dry dark edge, then stamens, a stem with one long leaf, and a few flicked
 * ink dots. A displacement filter roughens the edges like ink on paper.
 * After the artwork lands, the stem is drawn, then each petal is painted as
 * its own brush stroke from base to tip, one after another (Anne asked for
 * strokes painted one by one, not petals that pop in); then the whole flower
 * sways a little.
 *
 * Its position and size are measured from the sketch itself, so it stays
 * under it at every screen size. It sits behind the hero content.
 *
 * Mirroring the flower on the left, a red name seal 林鈺恩 in small seal
 * script is stamped under the rooster painting once the flower is finished.
 */

type Petal = {
  a: number;
  l: number;
  w: number;
  bend: number;
  fill: string;
  o: number;
};

/** back row: pale wash */
const BACK: Petal[] = [
  { a: -158, l: 118, w: 30, bend: -10, fill: "#A3A19D", o: 0.5 },
  { a: -118, l: 138, w: 36, bend: 8, fill: "#8E8C88", o: 0.5 },
  { a: -84, l: 146, w: 38, bend: -6, fill: "#9A9894", o: 0.55 },
  { a: -48, l: 136, w: 36, bend: 10, fill: "#8A8884", o: 0.5 },
  { a: -14, l: 122, w: 32, bend: -8, fill: "#A09E9A", o: 0.5 },
  { a: 24, l: 104, w: 28, bend: 10, fill: "#ABA9A5", o: 0.45 },
  { a: 168, l: 100, w: 26, bend: 8, fill: "#ABA9A5", o: 0.45 },
];
/** front row: dark ink */
const FRONT: Petal[] = [
  { a: -138, l: 92, w: 28, bend: 8, fill: "#3E3C39", o: 0.85 },
  { a: -100, l: 104, w: 30, bend: -6, fill: "#262422", o: 0.9 },
  { a: -66, l: 108, w: 30, bend: 6, fill: "#34322F", o: 0.88 },
  { a: -30, l: 98, w: 28, bend: -8, fill: "#2A2826", o: 0.88 },
  { a: 6, l: 84, w: 24, bend: 8, fill: "#4A4845", o: 0.8 },
  { a: 148, l: 78, w: 22, bend: -6, fill: "#55524F", o: 0.75 },
  { a: 58, l: 66, w: 20, bend: 6, fill: "#6A6865", o: 0.65 },
  { a: 112, l: 60, w: 18, bend: -4, fill: "#77746F", o: 0.6 },
];

/** one tapered brush shape, base at the origin, pointing along +x */
function petalShape(l: number, w: number, bend: number) {
  return `M0,0 C${l * 0.22},${-w * 0.95} ${l * 0.68},${-w * 0.7} ${l},${bend} C${l * 0.76},${w * 0.42} ${l * 0.3},${w * 0.55} 0,0 Z`;
}
/** the dry, darker edge the brush leaves along one side */
function petalEdge(l: number, w: number, bend: number) {
  return `M${l * 0.06},${-w * 0.25} C${l * 0.26},${-w * 0.92} ${l * 0.68},${-w * 0.68} ${l},${bend}`;
}

const DOTS: [number, number, number][] = [
  [-128, 44, 4.5],
  [-112, 62, 2.2],
  [-142, 70, 1.6],
  [96, 58, 3.6],
  [118, 40, 1.8],
  [84, 92, 2.4],
  [-70, 128, 2],
  [40, 150, 3],
  [56, 172, 1.6],
];

function Flower({
  x,
  y,
  size,
  reduce,
}: {
  x: number;
  y: number;
  size: number;
  reduce: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const s = size / 300;
  const start = 1.3;
  /** the flower draws in half the time it first did; everything after `start` is scaled by this */
  const T = 0.5;
  /**
   * One brush stroke: the petal is revealed by a wide line travelling from its
   * base to its tip, the way the brush is pressed down and then lifted. The
   * ink is darkest where the brush lands and thins toward the tip, and a few
   * paper-coloured streaks leave the dry gaps bristles make.
   */
  const stroke = (
    id: string,
    l: number,
    w: number,
    bend: number,
    delay: number,
    dur: number,
    body: React.ReactNode,
  ) => (
    <>
      <mask
        id={id}
        maskUnits="userSpaceOnUse"
        x={-20}
        y={-w * 2}
        width={l + 40}
        height={w * 4}
      >
        <motion.path
          d={`M-6,0 Q${l * 0.5},${-w * 0.25 + bend * 0.3} ${l + 6},${bend}`}
          fill="none"
          stroke="#fff"
          strokeWidth={w * 2.4}
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay, duration: dur, ease: [0.3, 0.1, 0.3, 1] }}
        />
      </mask>
      <g mask={`url(#${id})`}>{body}</g>
    </>
  );
  const bristles = (l: number, w: number, bend: number) =>
    [-0.42, -0.2, 0.08].map((k, j) => (
      <path
        key={j}
        d={`M${l * (0.3 + j * 0.08)},${w * k} Q${l * 0.65},${w * k * 0.9 + bend * 0.4} ${l * 0.97},${bend + w * k * 0.12}`}
        fill="none"
        stroke="#F8F6F3"
        strokeWidth={1.1 + j * 0.3}
        strokeLinecap="round"
        opacity={0.5}
        strokeDasharray={`${l * (0.14 + j * 0.05)} ${5 + j * 3} ${l * 0.2} ${4 + j * 2} ${l}`}
      />
    ));
  const petal = (p: Petal, i: number, front: boolean) => {
    const id = `${uid}-${front ? "f" : "b"}${i}`;
    const delay =
      start + T * (0.75 + (front ? BACK.length * 0.17 + 0.15 : 0) + i * 0.17);
    return (
      <g key={id} transform={`rotate(${p.a})`}>
        <defs>
          <linearGradient
            id={`${id}-g`}
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={0}
            x2={p.l}
            y2={0}
          >
            <stop
              offset="0"
              stopColor={p.fill}
              stopOpacity={Math.min(1, p.o + 0.12)}
            />
            <stop offset="0.55" stopColor={p.fill} stopOpacity={p.o} />
            <stop offset="1" stopColor={p.fill} stopOpacity={p.o * 0.45} />
          </linearGradient>
        </defs>
        {stroke(
          id,
          p.l,
          p.w,
          p.bend,
          delay,
          T * 0.34,
          <>
            <path d={petalShape(p.l, p.w, p.bend)} fill={`url(#${id}-g)`} />
            <path
              d={petalEdge(p.l, p.w, p.bend)}
              fill="none"
              stroke={front ? "#161412" : "#5A5855"}
              strokeWidth={front ? 2.6 : 1.8}
              strokeLinecap="round"
              opacity={front ? 0.85 : 0.6}
              strokeDasharray={`${p.l * 0.5} 5 ${p.l * 0.22} 4 ${p.l}`}
            />
            {bristles(p.l, p.w, p.bend)}
          </>,
        )}
      </g>
    );
  };

  return (
    <svg
      aria-hidden
      className="v2-ink-art absolute overflow-visible"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size * 1.5,
      }}
      viewBox="-150 -150 300 450"
    >
      <defs>
        <filter id={`${uid}-ink`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035"
            numOctaves={2}
            seed={5}
            result="slow"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="slow"
            scale={7}
            xChannelSelector="R"
            yChannelSelector="G"
            result="wob"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={1}
            seed={8}
            result="fine"
          />
          <feDisplacementMap
            in="wob"
            in2="fine"
            scale={3.5 / Math.max(0.5, s)}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <motion.g
        animate={reduce ? undefined : { rotate: [-1.4, 1.4, -1.4] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        style={{ transformOrigin: "-46px 270px", transformBox: "view-box" }}
      >
        <g filter={`url(#${uid}-ink)`}>
          {/* stem, drawn first */}
          <motion.path
            d="M4,10 C22,86 0,170 -46,270"
            fill="none"
            stroke="#2E2C2A"
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.85}
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: start, duration: T * 0.8, ease: "easeOut" }}
          />
          {/* one long leaf off the stem */}
          <g transform="translate(6,128) rotate(28)">
            {stroke(
              `${uid}-leaf`,
              132,
              17,
              -14,
              start + T * 0.45,
              T * 0.4,
              <>
                <path
                  d={petalShape(132, 17, -14)}
                  fill="#7C7A76"
                  opacity={0.6}
                />
                <path
                  d="M6,-2 C40,-12 90,-14 132,-14"
                  fill="none"
                  stroke="#34322F"
                  strokeWidth={2}
                  strokeLinecap="round"
                  opacity={0.7}
                  strokeDasharray="60 6 30 5 200"
                />
                {bristles(132, 17, -14)}
              </>,
            )}
          </g>
          {BACK.map((p, i) => petal(p, i, false))}
          {FRONT.map((p, i) => petal(p, i, true))}
          {/* heart: stamens and dark dabs */}
          <motion.g
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: start + T * 3.5, duration: T * 0.4 }}
          >
            <g
              fill="none"
              stroke="#161412"
              strokeWidth={1.6}
              strokeLinecap="round"
            >
              <path d="M-2,-4 C-10,-22 -18,-30 -24,-40" />
              <path d="M0,-6 C-2,-26 -4,-36 -6,-48" />
              <path d="M3,-5 C10,-22 14,-32 20,-42" />
              <path d="M5,-2 C18,-14 26,-20 36,-26" />
            </g>
            <g fill="#161412">
              <ellipse
                cx={-25}
                cy={-42}
                rx={3.4}
                ry={4.6}
                transform="rotate(-30 -25 -42)"
              />
              <ellipse cx={-6} cy={-50} rx={3.2} ry={4.8} />
              <ellipse
                cx={21}
                cy={-44}
                rx={3.2}
                ry={4.4}
                transform="rotate(25 21 -44)"
              />
              <ellipse
                cx={38}
                cy={-27}
                rx={3}
                ry={4}
                transform="rotate(55 38 -27)"
              />
              <ellipse cx={0} cy={2} rx={9} ry={7} opacity={0.9} />
            </g>
          </motion.g>
          {/* flicked ink */}
          {DOTS.map(([dx, dy, rad], i) => (
            <motion.circle
              key={i}
              cx={dx}
              cy={dy}
              r={rad}
              fill="#2A2826"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{
                delay: start + T * (3.7 + i * 0.05),
                duration: T * 0.2,
              }}
            />
          ))}
        </g>
      </motion.g>
    </svg>
  );
}

type Spot = { x: number; y: number; size: number };

const SEAL_RED = "#C8102E";
/** when the seal is stamped: just after the flower's ink dots land */
const SEAL_AT = 1.3 + 0.5 * 3.9;

/** Anne's name seal, 白文 style: the characters are cut out of the red block. */
function Seal({ x, y, size, reduce }: Spot & { reduce: boolean }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div
      className="absolute"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        
      }}
    >
      <motion.svg
        viewBox="-30 -30 1060 1060"
        className="h-full w-full"
        role="img"
        aria-label="Seal reading 林鈺恩 (Anne's name)"
        initial={reduce ? false : { opacity: 0, scale: 1.25 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: SEAL_AT, duration: 0.28, ease: [0.3, 0, 0.2, 1] }}
      >
        <defs>
          {/* uneven, slightly bled edges like cinnabar paste pressed on paper */}
          <filter
            id={`${uid}-paste`}
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05"
              numOctaves={2}
              seed={3}
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale={10}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <mask
            id={`${uid}-cut`}
            maskUnits="userSpaceOnUse"
            x={-30}
            y={-30}
            width={1060}
            height={1060}
          >
            <rect x={-30} y={-30} width={1060} height={1060} fill="#fff" />
            {SEAL_GLYPHS.map((g) => (
              <path
                key={g.ch}
                d={g.d}
                transform={g.transform}
                fill="#000"
                stroke="#000"
                strokeWidth={g.stroke}
                strokeLinejoin="round"
              />
            ))}
          </mask>
        </defs>
        <g filter={`url(#${uid}-paste)`}>
          <rect
            x={0}
            y={0}
            width={1000}
            height={1000}
            rx={60}
            fill={SEAL_RED}
            mask={`url(#${uid}-cut)`}
            opacity={0.92}
          />
        </g>
      </motion.svg>
    </div>
  );
}

/**
 * Where a hero painting comes to rest, read from its fixed outer box and its
 * resting angle rather than from the picture itself. The picture flies in,
 * breathes and drifts with scroll, so measuring it mid-entrance put the
 * flower in one spot and then jumped it to another once the art landed.
 * Returns the axis-aligned bounds of the box turned to that angle, which is
 * what the landed picture measures; null while that breakpoint's copy is hidden.
 */
function resting(hero: HTMLElement, alt: string) {
  const slot = Array.from(hero.querySelectorAll<HTMLElement>(`[data-art-slot="${alt}"]`)).find(
    (e) => e.getBoundingClientRect().width > 0,
  );
  if (!slot) return null;
  const b = slot.getBoundingClientRect();
  const a = (Number(slot.dataset.artRotation) || 0) * (Math.PI / 180);
  const cos = Math.abs(Math.cos(a));
  const sin = Math.abs(Math.sin(a));
  const width = b.width * cos + b.height * sin;
  const height = b.width * sin + b.height * cos;
  const cx = b.left + b.width / 2;
  const cy = b.top + b.height / 2;
  return { left: cx - width / 2, top: cy - height / 2, bottom: cy + height / 2, width, height };
}

/**
 * Places the seal under the rooster, mirroring where the flower sits under
 * the sketch on the other side. On phones it mirrors the flower's phone spot
 * instead: in the gap just above the pastel portrait.
 */
function measureSeal(overlay: HTMLElement, hero: HTMLElement): Spot | null {
  const o = overlay.getBoundingClientRect();
  const r = resting(hero, "Ink painting of a rooster");
  if (!r || !o.width) return null;
  if (o.width < 600) {
    const p = resting(hero, "Pastel portrait painting");
    if (!p) return null;
    const size = Math.round(r.width * 0.32);
    return {
      x: Math.round(p.left - o.left + p.width * 0.72),
      y: Math.round(p.top - o.top - size * 0.75),
      size,
    };
  }
  const size = Math.round(r.width * 0.3);
  return {
    x: Math.round(Math.max(size * 0.6, r.left - o.left + r.width * 0.42)),
    y: Math.round(r.bottom - o.top + size * 0.95),
    size,
  };
}

/**
 * Finds the pencil sketch inside the hero and places the flower under it.
 * On phones the heading sits right under the sketch, so the flower moves
 * further down the same side, into the gap above the framed piece.
 */
function measure(overlay: HTMLElement, hero: HTMLElement): Spot | null {
  const o = overlay.getBoundingClientRect();
  const r = resting(hero, "Sculpture of a child");
  if (!r || !o.width) return null;
  if (o.width < 600) {
    const f = resting(hero, "Framed textile artwork");
    if (!f) return null;
    const size = Math.round(r.width * 0.6);
    return {
      x: Math.round(f.left - o.left + f.width * 0.62),
      y: Math.round(f.top - o.top - size * 0.72),
      size,
    };
  }
  const size = Math.round(r.width * 0.78);
  return {
    x: Math.round(
      Math.min(o.width - size * 0.3, r.left - o.left + r.width * 0.62),
    ),
    y: Math.round(r.bottom - o.top + size * 0.42),
    size,
  };
}

export function HeroRibbon() {
  const reduce = useReducedMotion() ?? false;
  const overlay = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [seal, setSeal] = useState<Spot | null>(null);

  useEffect(() => {
    const run = () => {
      if (!overlay.current || !hero.current) return;
      const g = measure(overlay.current, hero.current);
      if (!g) return;
      // ignore sub-pixel noise; only move the flower for real layout changes
      setSpot((old) =>
        old &&
        Math.abs(old.x - g.x) < 12 &&
        Math.abs(old.y - g.y) < 12 &&
        Math.abs(old.size - g.size) < 6
          ? old
          : g,
      );
      const s = measureSeal(overlay.current, hero.current);
      if (s)
        setSeal((old) =>
          old &&
          Math.abs(old.x - s.x) < 12 &&
          Math.abs(old.y - s.y) < 12 &&
          Math.abs(old.size - s.size) < 6
            ? old
            : s,
        );
    };
    // the resting boxes are known before the artwork lands, so place the
    // flower and seal straight away; after that only real layout changes move them
    run();
    const frame = window.requestAnimationFrame(run);
    const ro = new ResizeObserver(run);
    if (hero.current) ro.observe(hero.current);
    window.addEventListener("resize", run);
    return () => {
      window.cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", run);
    };
  }, []);

  return (
    <div className="relative w-full">
      <div ref={overlay} className="pointer-events-none absolute inset-0">
        {spot && <Flower {...spot} reduce={reduce} />}
        {seal && <Seal {...seal} reduce={reduce} />}
      </div>
      <div ref={hero} className="relative">
        <Hero
          tagline="I’m a Product designer with tech BG, passionate about turning complex workflows into clear, useful experiences"
          arcNote="prev. @IBM"
        />
      </div>
    </div>
  );
}
