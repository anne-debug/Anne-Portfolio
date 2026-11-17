"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

import { COZY, CozyFilters } from "./texture";

/**
 * "Tools I reach for", as Didi's toy box.
 *
 * Tool stickers float on a sheet of paper and drift away from the pointer when
 * it comes close. Didi peeks over a cardboard box in the corner; her eyes
 * follow the pointer, and tapping a tool makes her bat at it while a note in
 * the middle says how Anne uses that tool and where.
 *
 * Stickers sit at fixed centres in percentages of the sheet, around a clear
 * middle where the note appears, so the layout holds from phone to desktop.
 * The glyphs are simple drawings with the tool's name, not the brands' logos.
 *
 * DRAFT tool list and notes, for Anne to confirm.
 */

export interface Tool {
  name: string;
  note: string;
  where: string;
  tint: string;
  glyph: React.ReactNode;
  /** Centre, in % of the sheet, on phones. */
  at: [number, number];
  /** Centre from the tablet breakpoint up, when it differs. */
  atDesk?: [number, number];
}

const ink = COZY.ink;
const sw = { stroke: ink, strokeWidth: 2.6, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const TOOLS: Tool[] = [
  {
    name: "Figma",
    note: "Where every project starts: flows, wireframes and final UI. At IBM I designed the Issues and Metrics views in it.",
    where: "IBM watsonx Orchestrate",
    tint: COZY.pink,
    at: [13, 13],
    glyph: <path d="M12,32 L26,8 L30,12 L16,36 Z M12,32 L10,40 L16,36" {...sw} />,
  },
  {
    name: "Figma Make",
    note: "For exploring ideas fast with AI before committing to one direction.",
    where: "IBM internship",
    tint: COZY.lilac,
    at: [50, 9],
    glyph: (
      <g {...sw}>
        <path d="M10,38 L30,18" />
        <path d="M32,6 L34,12 L40,14 L34,16 L32,22 L30,16 L24,14 L30,12 Z" fill={COZY.butter} />
      </g>
    ),
  },
  {
    name: "Framer",
    note: "I first built this portfolio in Framer, then moved it to code so I could add things like Didi.",
    where: "This site",
    tint: COZY.sky,
    at: [87, 13],
    glyph: <path d="M12,8 L36,8 L36,18 L24,18 L36,30 L24,30 L24,40 L12,28 Z" {...sw} />,
  },
  {
    name: "GitHub",
    note: "At IBM I opened pull requests to bring my designs into the team's interactive prototype.",
    where: "IBM watsonx Orchestrate",
    tint: COZY.sage,
    at: [15, 33],
    atDesk: [10, 46],
    glyph: (
      <g {...sw}>
        <circle cx={14} cy={10} r={4} />
        <circle cx={14} cy={38} r={4} />
        <circle cx={34} cy={18} r={4} />
        <path d="M14,14 L14,34 M34,22 C34,30 14,26 14,34" />
      </g>
    ),
  },
  {
    name: "React",
    note: "I built React and TypeScript screens for healthcare workflows, and this site runs on Next.js.",
    where: "JUBO Healthcare",
    tint: COZY.peach,
    at: [85, 31],
    atDesk: [90, 44],
    glyph: (
      <g {...sw}>
        <ellipse cx={24} cy={24} rx={18} ry={7} />
        <ellipse cx={24} cy={24} rx={18} ry={7} transform="rotate(60 24 24)" />
        <ellipse cx={24} cy={24} rx={18} ry={7} transform="rotate(-60 24 24)" />
        <circle cx={24} cy={24} r={2.5} fill={ink} />
      </g>
    ),
  },
  {
    name: "Tailwind",
    note: "For reusable components on the U-M Student Life WordPress sites, and for the styles on this site.",
    where: "U-M Student Life",
    tint: COZY.sky,
    at: [13, 79],
    glyph: <path d="M8,22 C14,12 22,12 26,20 C30,28 38,28 42,18 M6,34 C12,24 20,24 24,32 C28,40 36,40 40,30" {...sw} />,
  },
  {
    name: "WordPress",
    note: "I resolve tickets across the university's WordPress multisite, including contrast, alt text and iframe title fixes.",
    where: "U-M Student Life",
    tint: COZY.butter,
    at: [41, 88],
    glyph: (
      <g {...sw}>
        <circle cx={24} cy={24} r={16} />
        <path d="M14,18 L19,32 L24,20 L29,32 L34,18" />
      </g>
    ),
  },
  {
    name: "Claude",
    note: "My coding partner for vibe coding and turning designs into working prototypes, including this site.",
    where: "This site",
    tint: COZY.peach,
    at: [64, 87],
    glyph: (
      <g {...sw}>
        <path d="M8,12 Q8,6 14,6 L34,6 Q40,6 40,12 L40,26 Q40,32 34,32 L20,32 L12,40 L13,32 Q8,32 8,26 Z" />
        <path d="M24,12 L25.5,17 L30,19 L25.5,21 L24,26 L22.5,21 L18,19 L22.5,17 Z" fill={ink} stroke="none" />
      </g>
    ),
  },
];

function Sticker({
  tool,
  index,
  size,
  px,
  py,
  active,
  onPick,
}: {
  tool: Tool;
  index: number;
  size: { w: number; h: number };
  px: MotionValue<number>;
  py: MotionValue<number>;
  active: boolean;
  onPick: () => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const at = size.w >= 700 && tool.atDesk ? tool.atDesk : tool.at;
  const cx = (at[0] / 100) * size.w;
  const cy = (at[1] / 100) * size.h;
  // Push away from the pointer when it is within 110px.
  const pushX = useTransform([px, py], ([x, y]: number[]) => {
    const dx = cx - x;
    const d = Math.hypot(dx, cy - y);
    return d < 110 && d > 0 && !reduce ? (dx / d) * (110 - d) * 0.35 : 0;
  });
  const pushY = useTransform([px, py], ([x, y]: number[]) => {
    const dy = cy - y;
    const d = Math.hypot(cx - x, dy);
    return d < 110 && d > 0 && !reduce ? (dy / d) * (110 - d) * 0.35 : 0;
  });
  const x = useSpring(pushX, { stiffness: 150, damping: 14 });
  const y = useSpring(pushY, { stiffness: 150, damping: 14 });

  return (
    <div
      className="absolute left-[var(--l)] top-[var(--t)] -translate-x-1/2 -translate-y-1/2 tablet:left-[var(--ld)] tablet:top-[var(--td)]"
      style={
        {
          "--l": `${tool.at[0]}%`,
          "--t": `${tool.at[1]}%`,
          "--ld": `${(tool.atDesk ?? tool.at)[0]}%`,
          "--td": `${(tool.atDesk ?? tool.at)[1]}%`,
        } as React.CSSProperties
      }
    >
      <motion.div style={{ x, y }}>
      <motion.button
        type="button"
        onClick={onPick}
        aria-pressed={active}
        aria-label={`${tool.name}: how I use it`}
        className="flex flex-col items-center gap-1 rounded-2xl bg-white px-3 pb-2 pt-2.5"
        style={{ boxShadow: active ? `0 0 0 2px ${ink}` : "0 0 0 1px rgba(42,49,50,0.12), 0 6px 16px rgba(42,49,50,0.06)" }}
        animate={reduce ? undefined : { y: [0, -6, 0], rotate: [index % 2 ? -2 : 2, index % 2 ? 1 : -1, index % 2 ? -2 : 2] }}
        transition={{ duration: 3 + (index % 4) * 0.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
        whileHover={reduce ? undefined : { scale: 1.12 }}
        whileTap={reduce ? undefined : { scale: 0.92 }}
      >
        <span className="grid size-[40px] place-items-center rounded-xl tablet:size-[48px]" style={{ background: tool.tint }}>
          <svg viewBox="0 0 48 48" className="size-[28px] tablet:size-[34px]" aria-hidden>
            {tool.glyph}
          </svg>
        </span>
        <span className="whitespace-nowrap text-[12px] font-medium tablet:text-[13px]" style={{ fontFamily: "var(--font-dm-sans)", color: ink }}>
          {tool.name}
        </span>
      </motion.button>
      </motion.div>
    </div>
  );
}

/** Didi peeking over the edge of her toy box. */
export function DidiPeek({ eyeX, eyeY, swat }: { eyeX: MotionValue<number>; eyeY: MotionValue<number>; swat: number }) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion() ?? false;
  const FUR = "#C9CCD1";
  return (
    <svg viewBox="0 0 200 160" className="h-auto w-full overflow-visible" aria-hidden>
      <CozyFilters id={uid} />
      <g filter={`url(#${uid}-crayon)`}>
        <path d="M58,62 C54,34 62,22 72,20 C82,24 92,36 96,46 Z" fill={FUR} />
        <path d="M142,62 C146,34 138,22 128,20 C118,24 108,36 104,46 Z" fill={FUR} />
        <path d="M66,54 C66,38 70,32 74,31 C80,35 86,41 88,46 Z" fill="#E9B9BC" />
        <path d="M134,54 C134,38 130,32 126,31 C120,35 114,41 112,46 Z" fill="#E9B9BC" />
        <ellipse cx={100} cy={80} rx={62} ry={46} fill={FUR} />
        <ellipse cx={100} cy={98} rx={30} ry={16} fill="#BCC0C7" />
      </g>
      <g>
        <ellipse cx={64} cy={98} rx={11} ry={6} fill={COZY.blush} />
        <ellipse cx={136} cy={98} rx={11} ry={6} fill={COZY.blush} />
        <motion.g style={{ x: eyeX, y: eyeY }}>
          <circle cx={78} cy={80} r={6.5} fill={ink} />
          <circle cx={80} cy={78} r={2} fill="#fff" />
          <circle cx={122} cy={80} r={6.5} fill={ink} />
          <circle cx={124} cy={78} r={2} fill="#fff" />
        </motion.g>
        <path d="M95,90 Q100,87 105,90 Q102,95 100,96 Q98,95 95,90 Z" fill="#E7949F" />
        <path d="M92,99 Q96,103 100,99 Q104,103 108,99" stroke={ink} strokeWidth={2} fill="none" strokeLinecap="round" />
      </g>
      {/* box */}
      <g filter={`url(#${uid}-crayon)`}>
        <rect x={14} y={112} width={172} height={48} rx={4} fill="#fff" />
        <path d="M14,112 L0,96 L60,96 L72,112 Z" fill="#F4F2EE" />
        <path d="M186,112 L200,96 L140,96 L128,112 Z" fill="#F4F2EE" />
      </g>
      <text x={100} y={142} textAnchor="middle" fontSize={14} fill={ink} style={{ fontFamily: "var(--font-mansalva)" }}>
        Didi&apos;s toys
      </text>
      {/* paws on the box edge */}
      <g filter={`url(#${uid}-crayon)`}>
        <ellipse cx={72} cy={112} rx={15} ry={9} fill="#BCC0C7" />
        <motion.ellipse
          key={swat}
          cx={128}
          cy={112}
          rx={15}
          ry={9}
          fill="#BCC0C7"
          style={{ originX: "128px", originY: "112px" }}
          initial={false}
          animate={swat && !reduce ? { y: [0, -46, 0], x: [0, -8, 0], rotate: [0, -25, 0] } : { y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      </g>
    </svg>
  );
}

export function ToolBox() {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1000, h: 440 });
  const [picked, setPicked] = useState<number | null>(null);
  const [swat, setSwat] = useState(0);
  const px = useMotionValue(-999);
  const py = useMotionValue(-999);
  const eyeX = useSpring(0, { stiffness: 260, damping: 22 });
  const eyeY = useSpring(0, { stiffness: 260, damping: 22 });

  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function onMove(e: React.PointerEvent) {
    const r = sheetRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    px.set(x);
    py.set(y);
    // Didi sits in the bottom-right corner; aim her eyes at the pointer.
    const dx = x - r.width * 0.88;
    const dy = y - r.height * 0.78;
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 200) * 5;
    eyeX.set((dx / d) * k);
    eyeY.set((dy / d) * k);
  }

  function pick(i: number) {
    setPicked((p) => (p === i ? null : i));
    setSwat((s) => s + 1);
  }

  const tool = picked === null ? null : TOOLS[picked];

  return (
    <section aria-labelledby="tools-title" className="w-full">
      <div
        ref={sheetRef}
        onPointerMove={onMove}
        onPointerLeave={() => {
          px.set(-999);
          py.set(-999);
        }}
        className="relative h-[560px] w-full overflow-hidden rounded-2xl bg-light-grey-super tablet:h-[460px]"
      >
        {/* scattered sparkles */}
        {[
          [24, 30], [70, 24], [33, 64], [76, 66], [58, 40], [28, 48],
        ].map(([x, y], i) => (
          <span key={i} aria-hidden className="absolute text-[14px]" style={{ left: `${x}%`, top: `${y}%`, color: COZY.inkSoft }}>
            {i % 2 ? "✦" : "·"}
          </span>
        ))}

        {/* middle: title, or the picked tool's note */}
        <div className="absolute left-1/2 top-[52%] w-[58%] max-w-[420px] tablet:top-[48%] tablet:w-[64%] -translate-x-1/2 -translate-y-1/2 text-center" aria-live="polite">
          <AnimatePresence mode="wait">
            {tool ? (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="rounded-full px-3 py-0.5 text-[12px] tracking-[0.06em] uppercase" style={{ fontFamily: "ui-monospace, Menlo, monospace", background: tool.tint, color: ink }}>
                  {tool.where}
                </span>
                <h3 className="text-[26px] font-semibold tracking-[-0.5px] text-deep-blue tablet:text-[32px]" style={{ fontFamily: "var(--font-dm-sans)", lineHeight: 1.15 }}>
                  {tool.name}
                </h3>
                <p className="text-[15px] leading-[1.45] tablet:text-[17px]" style={{ fontFamily: "var(--font-dm-sans)", color: ink }}>
                  {tool.note}
                </p>
              </motion.div>
            ) : (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
                <h2 id="tools-title" className="ts-heading-2 whitespace-nowrap text-deep-blue max-tablet:!text-[34px]">
                  Tools I reach for
                </h2>
                <p className="text-[15px] leading-[1.45] tablet:text-[17px]" style={{ fontFamily: "var(--font-dm-sans)", color: ink }}>
                  Tap one to see how it fits into my work. Didi might try to grab it.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {TOOLS.map((t, i) => (
          <Sticker key={t.name} tool={t} index={i} size={size} px={px} py={py} active={picked === i} onPick={() => pick(i)} />
        ))}

        <div className="absolute bottom-0 right-[2%] w-[30%] max-w-[200px] tablet:w-[18%]">
          <DidiPeek eyeX={eyeX} eyeY={eyeY} swat={swat} />
        </div>
      </div>
    </section>
  );
}
