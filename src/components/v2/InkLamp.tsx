"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * A rice-paper floor lamp (egg-shaped shade on a thin tripod), drawn as an
 * ink-wash painting: grey washes with soft, bleeding edges, ribs in dry
 * brush, and legs in single tapered strokes. Original drawing.
 *
 * The ink texture comes from two SVG filters: `wash` roughens and blurs a
 * shape's edge like wet ink on paper, `brush` only roughens it, for line work.
 *
 * Switched on, the shade fills with warm light from inside, the ribs show
 * through as darker bands, and a glow spreads behind it. The whole lamp is
 * the switch (a real button), plus a little pull cord that tugs when pressed.
 */

const RIBS = Array.from({ length: 15 }, (_, i) => 70 + i * 13.2);

/** `tone="pale"` draws the line work in pale ink, for a dark background (the footer). */
export function InkLamp({ on, onToggle, className, tone = "ink" }: { on: boolean; onToggle: () => void; className?: string; tone?: "ink" | "pale" }) {
  const pale = tone === "pale";
  const LINE = pale ? "#E9E4DA" : "#1E1E1E";
  const LINE_2 = pale ? "#DDD8CE" : "#262626";
  const LEG = pale ? "#DDD8CE" : "#2B2B2B";
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion() ?? false;
  const t = reduce ? { duration: 0 } : { duration: 0.6, ease: [0.3, 0.7, 0.3, 1] as const };

  // Egg-shaped shade: narrow top, full rounded bottom with an opening.
  const SHADE = "M120,52 C78,52 50,110 46,170 C42,228 66,262 120,264 C174,262 198,228 194,170 C190,110 162,52 120,52 Z";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? "Turn the lamp off" : "Turn the lamp on"}
      className={`group relative block select-none ${className ?? ""}`}
    >
      <svg viewBox="0 0 240 420" className="h-auto w-full overflow-visible" aria-hidden>
        <defs>
          <filter id={`${uid}-wash`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={3} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" result="d" />
            <feGaussianBlur in="d" stdDeviation={1.6} />
          </filter>
          <filter id={`${uid}-brush`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={3.6} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#FFD58A" stopOpacity={0.75} />
            <stop offset="0.45" stopColor="#FFC870" stopOpacity={0.28} />
            <stop offset="1" stopColor="#FFC870" stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${uid}-lit`} cx="50%" cy="62%" r="60%">
            <stop offset="0" stopColor="#FFF8E2" />
            <stop offset="0.6" stopColor="#FFE7AE" />
            <stop offset="1" stopColor="#F2C677" />
          </radialGradient>
          <clipPath id={`${uid}-shade`}>
            <path d={SHADE} />
          </clipPath>
        </defs>

        {/* glow behind */}
        <motion.ellipse cx={120} cy={170} rx={190} ry={190} fill={`url(#${uid}-glow)`} initial={false} animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.7 }} transition={t} style={{ originX: "120px", originY: "170px" }} />

        {/* a pale wash of ink pooled on the floor */}
        <ellipse cx={122} cy={408} rx={84} ry={9} fill="#5A5852" opacity={0.18} filter={`url(#${uid}-wash)`} />

        {/* tripod: three tapered strokes and a tiny hub */}
        <g filter={`url(#${uid}-brush)`} fill={LEG}>
          <path d="M112,262 L58,404 L62,405 L118,264 Z" opacity={0.9} />
          <path d="M128,262 L184,404 L180,405 L122,264 Z" opacity={0.85} />
          <path d="M118,262 L121,414 L124,414 L123,262 Z" opacity={0.7} />
        </g>

        {/* shade, unlit wash */}
        <g filter={`url(#${uid}-wash)`} opacity={pale ? 0.5 : 1}>
          <path d={SHADE} fill="#ECEAE4" />
          <path d="M120,58 C86,62 62,120 58,176 C56,214 70,244 104,256 C80,232 74,190 80,150 C86,104 100,72 120,58 Z" fill="#8C8A82" opacity={0.6} />
          <path d="M150,70 C176,100 188,150 186,196 C184,226 172,248 150,258 C166,230 172,196 170,160 C168,118 160,90 150,70 Z" fill="#6E6C65" opacity={0.5} />
        </g>

        {/* lit fill */}
        <motion.g initial={false} animate={{ opacity: on ? 1 : 0 }} transition={t} filter={`url(#${uid}-wash)`}>
          <path d={SHADE} fill={`url(#${uid}-lit)`} />
        </motion.g>

        {/* ribs, in dry brush */}
        <g clipPath={`url(#${uid}-shade)`} filter={`url(#${uid}-brush)`}>
          {RIBS.map((y, i) => (
            <path
              key={y}
              d={`M30,${Math.round(y * 10) / 10} Q120,${Math.round((y + 9 + (i % 3)) * 10) / 10} 210,${Math.round((y - 1) * 10) / 10}`}
              fill="none"
              stroke={on ? "#B9894A" : pale ? "#D5D0C6" : "#3A3A3A"}
              strokeWidth={i % 4 === 0 ? 1.6 : 1}
              opacity={on ? 0.55 : 0.32 + (i % 3) * 0.08}
              style={{ transition: "stroke 0.6s, opacity 0.6s" }}
            />
          ))}
        </g>

        {/* outline, a single loaded stroke that runs dry */}
        <g filter={`url(#${uid}-brush)`} fill="none" strokeLinecap="round">
          <path d="M120,52 C78,52 50,110 46,170 C42,228 66,262 120,264" stroke={LINE} strokeWidth={5.5} opacity={0.88} />
          <path d="M120,264 C174,262 198,228 194,170 C190,110 162,52 120,52" stroke={LINE} strokeWidth={2.6} opacity={0.55} />
          <path d="M96,256 Q120,266 146,256" stroke={LINE_2} strokeWidth={1.6} opacity={0.5} />
          <path d="M113,52 Q120,40 127,52" stroke={LINE_2} strokeWidth={2.4} opacity={0.8} />
        </g>

        {/* pull cord */}
        <motion.g
          initial={false}
          animate={reduce ? undefined : { y: on ? [0, 10, 0] : [0, 10, 0] }}
          key={on ? "on" : "off"}
          transition={{ duration: 0.35 }}
          filter={`url(#${uid}-brush)`}
        >
          <path d="M156,248 L162,318" stroke={LEG} strokeWidth={1.2} fill="none" />
          <circle cx={162} cy={322} r={4.5} fill={on ? "#C8102E" : LEG} />
        </motion.g>

        {/* artist's seal */}
        <g transform="translate(196,372) rotate(-4)">
          <rect width={22} height={22} rx={2} fill="#C8102E" opacity={0.88} />
          <text x={11} y={16} textAnchor="middle" fontSize={13} fill="#fff" style={{ fontFamily: "serif" }}>
            燈
          </text>
        </g>
      </svg>
    </button>
  );
}
