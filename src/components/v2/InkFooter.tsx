"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { InkLamp } from "./InkLamp";
import { LIN, YU_CLIP, YU_JIN, YU_JIN_TRANSFORM, YU_RIGHT, YU_RIGHT_TRANSFORM } from "./yuGlyph";

/**
 * Site footer, v2: a dark band with Anne's name 鈺 (traditional) in red
 * brush calligraphy (Zhi Mang Xing), signed with a small 林 seal.
 *
 * Left: the character. Middle: the main links. Right: the ink-wash floor lamp (tap it to switch it on
 * or off), which throws a warm halo across the footer while it is lit, with a few
 * fireflies drifting around it (they stay when the lamp is off).
 *
 * The make-a-wish candle that used to stand here is kept, untouched, in
 * `src/components/cozy/Candle.tsx` (with its `bare` prop and blow-out
 * interaction) for the playground.
 *
 * The character brushes itself in (top to bottom, like the strokes would be
 * written) the first time the footer scrolls into view, then a drop of ink
 * runs off the last stroke. Phones stack the three groups.
 */

const INK_RED = "#C8102E";
const BG = "#1B1A19";
/** where the drop leaves the last stroke of 玉 (svg units) */
const DROP = { x: 684, y: -190 };
/** the site's paragraph font */
const sans = { fontFamily: "var(--font-dm-sans)" };

const LINKS = [
  { href: "/my-projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
];

function Yu({ className }: { className?: string }) {
  const reduce = useReducedMotion() ?? false;
  return (
    <svg viewBox="-10 -850 1040 900" className={className} role="img" aria-label="鈺 (Anne's name in calligraphy)">
      <defs>
        {/* rough, bled edges so the outline reads as ink on paper */}
        <filter id="yu-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.6" numOctaves={2} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={14} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <clipPath id="yu-clip">
          <rect x={YU_CLIP} y={-100} width={800} height={1000} />
        </clipPath>
        <linearGradient id="yu-wipe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.85" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <mask id="yu-mask" maskUnits="userSpaceOnUse" x={-20} y={-840} width={1040} height={920}>
          <motion.rect
            x={-20}
            y={-840}
            width={1040}
            fill="url(#yu-wipe)"
            initial={reduce ? { height: 920 } : { height: 0 }}
            whileInView={{ height: 920 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.6, ease: [0.5, 0, 0.3, 1] }}
          />
        </mask>
      </defs>
      <g mask="url(#yu-mask)" fill={INK_RED} filter="url(#yu-ink)">
        <g transform="scale(1,-1)">
          <g transform={YU_JIN_TRANSFORM}>
            <path d={YU_JIN} />
          </g>
          <g transform={YU_RIGHT_TRANSFORM}>
            <g clipPath="url(#yu-clip)">
              <path d={YU_RIGHT} />
            </g>
          </g>
        </g>
      </g>
      {/* name seal, stamped once the character is written */}
      <motion.g
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ delay: 1.5, duration: 0.25, ease: "easeOut" }}
      >
        <g transform="rotate(-4 950 -110)">
          <rect x={890} y={-170} width={120} height={120} rx={9} fill={INK_RED} />
          <path d={LIN} fill={BG} transform="translate(901,-73) scale(0.098,-0.098)" />
        </g>
      </motion.g>
      {/* a drop of ink running off the last stroke */}
      {!reduce && (
        <motion.ellipse
          cx={DROP.x}
          cy={DROP.y}
          rx={12}
          ry={18}
          fill={INK_RED}
          initial={{ opacity: 0, cy: DROP.y }}
          whileInView={{ opacity: [0, 1, 1, 0], cy: [DROP.y, DROP.y + 12, DROP.y + 150, DROP.y + 190] }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.4, delay: 1.7, times: [0, 0.2, 0.8, 1], ease: "easeIn" }}
        />
      )}
    </svg>
  );
}

/**
 * Fireflies drifting around the lamp. Each one wanders a closed loop (so the
 * repeat has no jump) and blinks on its own rhythm. x/y are px offsets from
 * its starting point; only transform and opacity animate.
 */
const FIREFLIES = [
  { left: "12%", top: "22%", x: [0, 34, 58, 22, -14, 0], y: [0, -18, 10, 34, 12, 0], fly: 13, blink: 3.1, delay: 0 },
  { left: "38%", top: "8%", x: [0, -26, -44, -10, 20, 0], y: [0, 16, 40, 52, 22, 0], fly: 16, blink: 2.4, delay: 0.8 },
  { left: "68%", top: "14%", x: [0, 22, 6, -30, -12, 0], y: [0, 20, 44, 30, 6, 0], fly: 11, blink: 3.7, delay: 1.5 },
  { left: "22%", top: "62%", x: [0, 30, 62, 40, 10, 0], y: [0, -24, -8, 18, 14, 0], fly: 15, blink: 2.8, delay: 0.4 },
  { left: "56%", top: "74%", x: [0, -34, -58, -24, 8, 0], y: [0, -14, -40, -52, -20, 0], fly: 18, blink: 3.4, delay: 2.1 },
  { left: "84%", top: "48%", x: [0, -18, -40, -22, 6, 0], y: [0, -28, -6, 24, 16, 0], fly: 12, blink: 2.2, delay: 1.1 },
  { left: "4%", top: "44%", x: [0, 20, 44, 26, 4, 0], y: [0, 22, 8, -20, -12, 0], fly: 17, blink: 4, delay: 2.6 },
];

function Fireflies({ still }: { still: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute -bottom-3 -top-5 left-1/2 w-[230px] -translate-x-1/2 tablet:-right-6 tablet:left-auto tablet:translate-x-0">
      {FIREFLIES.map((f, i) => (
        <motion.span
          key={i}
          className="absolute block"
          style={{ left: f.left, top: f.top }}
          animate={still ? undefined : { x: f.x, y: f.y }}
          transition={{ duration: f.fly, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
        >
          <motion.span
            className="block size-[4px] rounded-full"
            style={{ background: "#F3F7A6", boxShadow: "0 0 6px 2px rgba(226,242,120,0.75), 0 0 14px 5px rgba(200,230,90,0.25)" }}
            animate={still ? { opacity: 0.8 } : { opacity: [0.1, 1, 0.35, 1, 0.1] }}
            transition={still ? undefined : { duration: f.blink, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
          />
        </motion.span>
      ))}
    </div>
  );
}

export function InkFooter() {
  const [lit, setLit] = useState(true);
  const reduce = useReducedMotion() ?? false;
  return (
    <footer
      className="relative w-full overflow-hidden"
      /* rendered by the root layout on every page (site/Footer.tsx), where it
         is already the page's full width; 100vw would overshoot it wherever
         scrollbars take up room */
      style={{ background: BG }}
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center justify-items-center gap-7 px-10 py-8 tablet:grid-cols-3 tablet:gap-6 tablet:py-7">
        <Yu className="h-[92px] w-auto tablet:h-[104px] tablet:justify-self-start" />

        {/* page links (the LinkedIn and email icons went on 2026-11-20; the
            About page dock carries both) */}
        <div className="flex items-center gap-8">
          <nav aria-label="Footer" className="flex flex-col items-start gap-2.5">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-[15px] text-white transition-colors hover:text-orange" style={sans}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* the floor lamp; while it is on, a warm halo spills over the dark footer */}
        <div className="relative w-[70px] tablet:w-[78px] tablet:justify-self-end">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[40%] aspect-square w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,170,80,0.32) 0%, rgba(255,150,60,0.12) 30%, rgba(255,140,50,0) 62%)" }}
            animate={lit ? (reduce ? { opacity: 1 } : { opacity: [0.85, 1, 0.9, 1], scale: [1, 1.04, 0.98, 1] }) : { opacity: 0, scale: 0.85 }}
            transition={lit && !reduce ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.8 }}
          />
          <Fireflies still={reduce} />
          <div className="relative">
            <InkLamp tone="pale" on={lit} onToggle={() => setLit((v) => !v)} className="w-full" />
          </div>
        </div>
      </div>
    </footer>
  );
}
