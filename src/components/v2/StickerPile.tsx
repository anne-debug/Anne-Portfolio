"use client";

import { motion, useReducedMotion } from "motion/react";

import { CURSOR, GITHUB, JAVASCRIPT, MONGODB, OPENAI, TYPESCRIPT } from "./brandIcons";
import { DESIGNS } from "./peelArt";

/**
 * "My toolkit": Anne's tool stickers tucked into a cabinet drawer, after the
 * Framer "Photo Pile" (Anne Profolio v4.0, node YgpHEnzvY).
 *
 * The stickers stand in a row behind a low drawer front, so only their tops
 * show. When the row scrolls into view they rise to that peeking height one
 * after another; under the pointer a sticker pops up out of the drawer and
 * straightens. No cards and no names: the logos are the content.
 *
 * Framer, Figma, Notion, Claude and React reuse the peel-board artwork
 * (peelArt.tsx). GPT and Cursor use the official marks from simple-icons
 * (brandIcons.ts), because the peel-board versions did not look like them.
 */

type Tool =
  | { name: string; peel: keyof typeof DESIGNS; tilt: number }
  | { name: string; path: string; color: string; tilt: number; under?: string };

const TOOLS: Tool[] = [
  { name: "Framer", peel: "framer", tilt: -8 },
  { name: "Figma", peel: "figma", tilt: 6 },
  { name: "Notion", peel: "notion", tilt: -4 },
  { name: "Claude", peel: "claude", tilt: 7 },
  { name: "React", peel: "react", tilt: -6 },
  { name: "Cursor", path: CURSOR, color: "#111111", tilt: 5 },
  { name: "ChatGPT", path: OPENAI, color: "#111111", tilt: -5 },
  { name: "TypeScript", path: TYPESCRIPT, color: "#3178C6", tilt: 6 },
  // the JS mark is a yellow square with the letters cut out; black shows through them
  { name: "JavaScript", path: JAVASCRIPT, color: "#F7DF1E", tilt: -7, under: "#111111" },
  { name: "MongoDB", path: MONGODB, color: "#47A248", tilt: 4 },
  { name: "GitHub", path: GITHUB, color: "#181717", tilt: -5 },
];

const shadow = { filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))" };

function Sticker({ tool }: { tool: Tool }) {
  if ("peel" in tool) {
    const d = DESIGNS[tool.peel];
    return (
      <svg viewBox="0 0 300 300" className="size-full" aria-hidden>
        <g style={shadow}>{d.shape({ fill: d.cutColor, stroke: d.cutColor, strokeWidth: d.cut })}</g>
        {d.art}
      </svg>
    );
  }
  // a single-path mark: a thick white outline of the same path is the die-cut edge
  return (
    <svg viewBox="-3 -3 30 30" className="size-full" aria-hidden>
      <path d={tool.path} fill="#fff" stroke="#fff" strokeWidth={3.2} strokeLinejoin="round" style={shadow} />
      {tool.under ? <rect x={1} y={1} width={22} height={22} fill={tool.under} /> : null}
      <path d={tool.path} fill={tool.color} />
    </svg>
  );
}

export function StickerPile() {
  const reduce = useReducedMotion() ?? false;

  return (
    <div className="relative mx-auto h-[76px] w-full max-w-[960px] tablet:h-[88px] desktop:h-[100px]">
      {/* the row watches the viewport as a whole; each sticker follows */}
      <motion.ul
        aria-label="Tools I use"
        className="absolute inset-x-0 bottom-[48px] flex items-end justify-center gap-1 px-1 tablet:gap-4 tablet:px-4 desktop:gap-6"
        /* the row stands on the drawer's top edge; anything that drops lower than the drawer's bottom is cut off */
        style={{ clipPath: "inset(-400px -400px -46px -400px)" }}
        initial={reduce ? false : "hidden"}
        whileInView="shown"
        viewport={{ once: true, amount: 0.5 }}
      >
        {TOOLS.map((t, i) => (
          <motion.li
            key={t.name}
            className="relative size-[26px] shrink-0 tablet:size-[50px] desktop:size-[64px]"
            title={t.name}
            variants={{
              // tucked: about a third of each sticker sits behind the drawer front; on the way in they rise from lower
              hidden: { y: "52%", rotate: t.tilt },
              shown: { y: "36%", rotate: t.tilt, transition: { type: "spring", stiffness: 200, damping: 22, delay: i * 0.05 } },
            }}
            initial={reduce ? { y: "36%", rotate: t.tilt } : undefined}
            whileHover={reduce ? undefined : { y: "-10%", rotate: 0, scale: 1.08, transition: { type: "spring", stiffness: 420, damping: 16 } }}
          >
            <span className="sr-only">{t.name}</span>
            <Sticker tool={t} />
          </motion.li>
        ))}
      </motion.ul>

      {/* the drawer front: stickers stand behind it, the pointer passes through it to them */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[48px] rounded-[14px]"
        style={{
          background: "var(--v2-board)",
          boxShadow: "0 -1px 0 var(--v2-line), 0 10px 24px -14px rgba(0,0,0,0.35)",
        }}
      >
        {/* drawer handle */}
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[6px] w-[64px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "var(--v2-line)" }}
        />
      </div>
    </div>
  );
}
