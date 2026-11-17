"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { CAPSULES } from "@/components/gacha/skills";
import { V2 } from "./palette";

/**
 * "What I bring to the table", as a grid of vinyl stickers.
 *
 * Each skill is printed like a real die-cut sticker: its own artwork and
 * typography, a thick white cut border, a soft contact shadow, and a glossy
 * sheen. Hovering tilts the sticker in 3D toward the pointer and slides the
 * sheen across it; stickers can be dragged anywhere on the board, and tapping
 * one opens the story of where Anne used that skill.
 *
 * The board is a grid (4 x 2 on desktop, 2 x 4 on phones); each sticker sits
 * in its own cell with a slight tilt, so the first paint is tidy and the
 * same on server and client. "Tidy up" puts every sticker back.
 *
 * Copy comes from gacha/skills.ts (DRAFT).
 */

const F = {
  sans: "var(--font-dm-sans)",
  condensed: "var(--font-antonio), 'Arial Narrow', sans-serif",
  serif: "var(--font-instrument), Georgia, serif",
  hand: "var(--font-mansalva)",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

interface Art {
  /** viewBox width and height. */
  w: number;
  h: number;
  rot: number;
  /** The sticker's silhouette, used for the sheen clip. */
  shape: ReactNode;
  /** Everything printed on it. */
  art: ReactNode;
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

function burst(cx: number, cy: number, points: number, outer: number, inner: number) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI * i) / points - Math.PI / 2;
    const rr = i % 2 ? inner : outer;
    pts.push(`${round(cx + Math.cos(a) * rr)},${round(cy + Math.sin(a) * rr)}`);
  }
  return `M${pts.join(" L")} Z`;
}

const A11Y = burst(100, 100, 16, 96, 82);

function circlePath(cx: number, cy: number, rr: number) {
  return `M ${cx - rr},${cy} a ${rr},${rr} 0 1,1 ${rr * 2},0 a ${rr},${rr} 0 1,1 -${rr * 2},0`;
}

function arts(uid: string): Art[] {
  return [
    // Information architecture: a printed label, stacked condensed type.
    {
      w: 260,
      h: 150,
      rot: -5,
      shape: <rect x={0} y={0} width={260} height={150} rx={14} />,
      art: (
        <>
          <rect x={0} y={0} width={260} height={150} rx={14} fill={V2.blue} />
          <text x={20} y={30} fontSize={12} fill="#9FB3FF" style={{ fontFamily: F.mono }}>
            01 / SITEMAP
          </text>
          <text x={20} y={86} fontSize={44} fontWeight={700} fill="#fff" style={{ fontFamily: F.condensed, letterSpacing: "-0.5px" }}>
            INFORMATION
          </text>
          <text x={20} y={128} fontSize={44} fontWeight={700} fill={V2.green} style={{ fontFamily: F.condensed, letterSpacing: "-0.5px" }}>
            ARCHITECTURE
          </text>
          <g fill="#fff" opacity={0.9}>
            <rect x={206} y={18} width={34} height={8} rx={2} />
            <rect x={206} y={30} width={14} height={6} rx={2} />
            <rect x={224} y={30} width={16} height={6} rx={2} />
          </g>
        </>
      ),
    },
    // User research: round badge with text running around it.
    {
      w: 190,
      h: 190,
      rot: 8,
      shape: <circle cx={95} cy={95} r={95} />,
      art: (
        <>
          <circle cx={95} cy={95} r={95} fill={V2.red} />
          <path id={`${uid}-ring`} d={circlePath(95, 95, 72)} fill="none" />
          <text fontSize={19} fontWeight={700} fill="#fff" style={{ fontFamily: F.sans, letterSpacing: "3px" }}>
            <textPath href={`#${uid}-ring`}>USER RESEARCH • USER RESEARCH •</textPath>
          </text>
          <circle cx={95} cy={95} r={44} fill="#fff" />
          <circle cx={90} cy={90} r={17} fill="none" stroke={V2.red} strokeWidth={6} />
          <path d="M102,102 L116,116" stroke={V2.red} strokeWidth={7} strokeLinecap="round" />
        </>
      ),
    },
    // Interaction design: butter pill, serif italic, a cursor.
    {
      w: 270,
      h: 104,
      rot: -3,
      shape: <rect x={0} y={0} width={270} height={104} rx={52} />,
      art: (
        <>
          <rect x={0} y={0} width={270} height={104} rx={52} fill={V2.butter} />
          <text x={34} y={50} fontSize={38} fill={V2.ink} style={{ fontFamily: F.serif, fontStyle: "italic" }}>
            Interaction
          </text>
          <text x={34} y={84} fontSize={38} fill={V2.ink} style={{ fontFamily: F.serif, fontStyle: "italic" }}>
            design
          </text>
          <path d="M196,52 L196,86 L205,78 L212,93 L218,90 L211,75 L223,75 Z" fill={V2.ink} />
          <circle cx={196} cy={42} r={6} fill={V2.orange} />
        </>
      ),
    },
    // Mobile UX: a little phone.
    {
      w: 130,
      h: 210,
      rot: 6,
      shape: <rect x={0} y={0} width={130} height={210} rx={26} />,
      art: (
        <>
          <rect x={0} y={0} width={130} height={210} rx={26} fill={V2.ink} />
          <rect x={10} y={12} width={110} height={186} rx={18} fill={V2.sky} />
          <rect x={45} y={20} width={40} height={10} rx={5} fill={V2.ink} />
          <text x={65} y={88} textAnchor="middle" fontSize={34} fontWeight={700} fill={V2.blue} style={{ fontFamily: F.condensed }}>
            MOBILE
          </text>
          <text x={65} y={124} textAnchor="middle" fontSize={34} fontWeight={700} fill={V2.blue} style={{ fontFamily: F.condensed }}>
            UX
          </text>
          <rect x={30} y={150} width={70} height={22} rx={11} fill={V2.orange} />
          <rect x={48} y={184} width={34} height={4} rx={2} fill={V2.ink} opacity={0.5} />
        </>
      ),
    },
    // Frontend development: a code tag.
    {
      w: 240,
      h: 120,
      rot: -7,
      shape: <rect x={0} y={0} width={240} height={120} rx={18} />,
      art: (
        <>
          <rect x={0} y={0} width={240} height={120} rx={18} fill={V2.green} />
          <rect x={0} y={0} width={240} height={30} rx={18} fill={V2.ink} />
          <rect x={0} y={16} width={240} height={14} fill={V2.ink} />
          {[18, 34, 50].map((x, i) => (
            <circle key={x} cx={x} cy={15} r={5} fill={[V2.red, V2.butter, V2.green][i]} />
          ))}
          <text x={22} y={70} fontSize={26} fontWeight={700} fill={V2.ink} style={{ fontFamily: F.mono }}>
            &lt;Frontend /&gt;
          </text>
          <text x={22} y={100} fontSize={17} fill={V2.ink} style={{ fontFamily: F.mono }}>
            development
          </text>
        </>
      ),
    },
    // Design to code: a file-name tag.
    {
      w: 280,
      h: 86,
      rot: 4,
      shape: <rect x={0} y={0} width={280} height={86} rx={12} />,
      art: (
        <>
          <rect x={0} y={0} width={280} height={86} rx={12} fill="#fff" />
          <rect x={14} y={18} width={50} height={50} rx={10} fill={V2.pink} />
          <circle cx={32} cy={36} r={8} fill={V2.orange} />
          <circle cx={48} cy={36} r={8} fill={V2.red} />
          <circle cx={32} cy={52} r={8} fill={V2.blue} />
          <circle cx={48} cy={52} r={8} fill={V2.green} />
          <text x={78} y={40} fontSize={20} fontWeight={700} fill={V2.ink} style={{ fontFamily: F.sans }}>
            Design → code
          </text>
          <text x={78} y={64} fontSize={13} fill={V2.inkSoft} style={{ fontFamily: F.mono }}>
            v12_final_FINAL.tsx
          </text>
        </>
      ),
    },
    // Accessibility: starburst with big A11Y.
    {
      w: 200,
      h: 200,
      rot: -10,
      shape: <path d={A11Y} />,
      art: (
        <>
          <path d={A11Y} fill={V2.orange} />
          <text x={100} y={112} textAnchor="middle" fontSize={56} fontWeight={700} fill="#fff" style={{ fontFamily: F.condensed }}>
            A11Y
          </text>
          <text x={100} y={138} textAnchor="middle" fontSize={13} fontWeight={600} fill="#fff" style={{ fontFamily: F.sans, letterSpacing: "1.5px" }}>
            ACCESSIBILITY
          </text>
        </>
      ),
    },
    // Talking to engineers: a speech bubble in her handwriting.
    {
      w: 250,
      h: 150,
      rot: 5,
      shape: <path d="M24,0 H226 A24,24 0 0 1 250,24 V96 A24,24 0 0 1 226,120 H92 L58,150 L62,120 H24 A24,24 0 0 1 0,96 V24 A24,24 0 0 1 24,0 Z" />,
      art: (
        <>
          <path d="M24,0 H226 A24,24 0 0 1 250,24 V96 A24,24 0 0 1 226,120 H92 L58,150 L62,120 H24 A24,24 0 0 1 0,96 V24 A24,24 0 0 1 24,0 Z" fill={V2.sky} />
          <text x={125} y={56} textAnchor="middle" fontSize={30} fill={V2.blue} style={{ fontFamily: F.hand }}>
            talking to
          </text>
          <text x={125} y={94} textAnchor="middle" fontSize={30} fill={V2.blue} style={{ fontFamily: F.hand }}>
            engineers
          </text>
        </>
      ),
    },
  ];
}

/** Display width in px on desktop; phones scale it by --k. */
const WIDTH = [250, 180, 260, 124, 230, 270, 190, 240];

function Sticker({
  art,
  index,
  width,
  board,
  selected,
  onTap,
  onFront,
  z,
}: {
  art: Art;
  index: number;
  width: number;
  board: React.RefObject<HTMLDivElement | null>;
  selected: boolean;
  onTap: () => void;
  onFront: () => void;
  z: number;
}) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion() ?? false;
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 220, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-12, 12]), { stiffness: 220, damping: 18 });
  const sheenX = useTransform(mx, [0, 1], [-60, 160]);
  const sheen = useMotionTemplate`${sheenX}%`;
  const dragged = useRef(false);
  const [hover, setHover] = useState(false);

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: `calc(${width}px * var(--k))`, zIndex: z }}>
    <motion.div
      className="touch-none select-none"
      style={{ perspective: 700 }}
      drag={!reduce}
      dragConstraints={board}
      dragElastic={0.12}
      dragMomentum={false}
      onPointerDown={() => {
        dragged.current = false;
        onFront();
      }}
      onDragStart={() => (dragged.current = true)}
      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileDrag={{ scale: 1.08 }}
      transition={{ type: "spring", stiffness: 240, damping: 18, delay: reduce ? 0 : index * 0.06 }}
    >
      <motion.button
        type="button"
        aria-pressed={selected}
        aria-label={`${CAPSULES[index].skill}: where I used it`}
        className="relative block w-full cursor-grab active:cursor-grabbing"
        style={{ rotate: art.rot, rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          const b = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - b.left) / b.width);
          my.set((e.clientY - b.top) / b.height);
        }}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => {
          setHover(false);
          mx.set(0.5);
          my.set(0.5);
        }}
        onClick={() => {
          if (!dragged.current) onTap();
        }}
        animate={{ y: hover && !reduce ? -6 : 0 }}
      >
        <svg viewBox={`-14 -14 ${art.w + 28} ${art.h + 28}`} className="h-auto w-full overflow-visible" aria-hidden>
          <defs>
            <filter id={`${uid}-cut`} x="-20%" y="-20%" width="140%" height="150%">
              <feMorphology in="SourceAlpha" operator="dilate" radius={9} result="grown" />
              <feGaussianBlur in="grown" stdDeviation={hover || selected ? 7 : 3.5} result="blur" />
              <feOffset in="blur" dy={hover || selected ? 10 : 4} result="shadowOff" />
              <feFlood floodColor="#2A3132" floodOpacity={hover || selected ? 0.28 : 0.2} />
              <feComposite in2="shadowOff" operator="in" result="shadow" />
              <feFlood floodColor="#fff" />
              <feComposite in2="grown" operator="in" result="border" />
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="border" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id={`${uid}-clip`}>{art.shape}</clipPath>
            <motion.linearGradient id={`${uid}-sheen`} gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity={0} />
              <motion.stop offset={sheen} stopColor="#fff" stopOpacity={0.55} />
              <stop offset="1" stopColor="#fff" stopOpacity={0} />
            </motion.linearGradient>
          </defs>
          <g filter={`url(#${uid}-cut)`}>{art.art}</g>
          <g clipPath={`url(#${uid}-clip)`} style={{ mixBlendMode: "soft-light", pointerEvents: "none" }}>
            <rect x={-20} y={-20} width={art.w + 40} height={art.h + 40} fill={`url(#${uid}-sheen)`} opacity={hover ? 1 : 0.55} />
          </g>
        </svg>
      </motion.button>
    </motion.div>
    </div>
  );
}

export function StickerWall() {
  const uid = useId().replace(/:/g, "");
  const board = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<number[]>(CAPSULES.map((_, i) => i));
  const [picked, setPicked] = useState<number | null>(null);
  const [tidy, setTidy] = useState(0);
  const ART = arts(uid);
  const skill = picked === null ? null : CAPSULES[picked];

  return (
    <section aria-labelledby="skills-title" className="w-full">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="skills-title" className="ts-heading-2 text-deep-blue">
            What I bring to the table
          </h2>
          <p className="mt-1 text-[16px] text-dark-charcoal" style={{ fontFamily: F.sans }}>
            Drag them around the board. Tap one to see where I used it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setTidy((n) => n + 1);
            setPicked(null);
          }}
          className="rounded-full bg-white px-4 py-2 text-[14px] font-medium transition-transform hover:scale-105"
          style={{ fontFamily: F.sans, color: V2.ink, boxShadow: "0 0 0 1px rgba(42,49,50,0.15)" }}
        >
          Tidy up
        </button>
      </div>

      <div
        ref={board}
        className="relative w-full overflow-hidden rounded-3xl p-3 [--k:0.62] tablet:p-6 tablet:[--k:0.92] desktop:[--k:1]"
        style={{
          background: V2.surface,
          backgroundImage: "radial-gradient(rgba(42,49,50,0.13) 1.2px, transparent 1.2px)",
          backgroundSize: "22px 22px",
        }}
      >
        <div key={tidy} className="grid grid-cols-2 tablet:grid-cols-4">
          {ART.map((art, i) => (
            <div key={i} className="relative h-[190px] tablet:h-[250px]">
              <Sticker
                art={art}
                index={i}
                width={WIDTH[i]}
                board={board}
                selected={picked === i}
                z={order.indexOf(i) + 1}
                onFront={() => setOrder((o) => [...o.filter((x) => x !== i), i])}
                onTap={() => setPicked((p) => (p === i ? null : i))}
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[50] tablet:inset-x-auto tablet:bottom-6 tablet:left-1/2 tablet:w-[420px] tablet:-translate-x-1/2" aria-live="polite">
          <AnimatePresence mode="wait">
            {skill ? (
              <motion.div
                key={skill.skill}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="pointer-events-auto rounded-2xl bg-white p-5"
                style={{ boxShadow: "0 20px 50px rgba(42,49,50,0.25)" }}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-[0.08em]" style={{ fontFamily: F.mono, background: V2.surface, color: V2.ink }}>
                    {skill.where}
                  </span>
                  <button type="button" onClick={() => setPicked(null)} className="text-[22px] leading-none text-dark-charcoal opacity-60 hover:opacity-100" aria-label="Close">
                    ×
                  </button>
                </div>
                <h3 className="text-[20px] font-semibold text-deep-blue" style={{ fontFamily: F.sans }}>
                  {skill.skill}
                </h3>
                <p className="mt-1 text-[14px] leading-[1.5] text-dark-charcoal" style={{ fontFamily: F.sans }}>
                  {skill.story}
                </p>
                {skill.href && (
                  <Link href={skill.href} className="mt-3 inline-block text-[14px] font-medium text-orange underline underline-offset-4" style={{ fontFamily: F.sans }}>
                    See the project
                  </Link>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
