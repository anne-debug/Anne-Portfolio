"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Candle } from "@/components/cozy/Candle";
import { StickerPile } from "./StickerPile";
import { V2 } from "./palette";

/**
 * Bento blocks for the v2 home page: sections sit side by side in cards of
 * different sizes instead of one full-width row each.
 *
 * Grid: 12 columns from tablet up, a single column on phones.
 */

const card = "rounded-[24px] p-6 tablet:p-7";
const sans = { fontFamily: "var(--font-dm-sans)" };

/** "My toolkit": the skill stickers in a photo pile (StickerPile). The old peel board is PeelBoard.tsx. */
export function IntroBento() {
  return (
    <section aria-labelledby="skills-title" className="w-full">
      {/* more room between the heading and the stickers so the section reads less flat (Anne, 2026-11-20) */}
      <div className="flex flex-col gap-10 tablet:gap-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="skills-title" className="ts-heading-2 text-deep-blue">
              My toolkit
            </h2>
            <p className="mt-2 text-[16px] text-dark-charcoal" style={sans}>
              The tools I reach for.
            </p>
          </div>
        </div>
        <StickerPile />
      </div>

    </section>
  );
}

const LINKS = [
  { label: "Email me", href: "mailto:annelin.yuen@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/annelin0513/" },
  { label: "Send a postcard", href: "/playground" },
];

/** The closing card: blow out the candle to reveal the ways to reach Anne. */
export function WishCard() {
  const [lit, setLit] = useState(true);
  return (
    <section aria-labelledby="wish-title" className={`${card} flex h-full flex-col items-center gap-4 bg-light-grey-super text-center`}>
      <div className="w-[200px]">
        <Candle onLitChange={setLit} />
      </div>
      <h2 id="wish-title" className="ts-heading-3 text-deep-blue">
        {lit ? "Make a wish before you go" : "Wish made. Let’s talk!"}
      </h2>
      <AnimatePresence mode="wait">
        {lit ? (
          <motion.p key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[15px] text-dark-charcoal" style={sans}>
            Blow out the candle and I&apos;ll leave you a way to say hi.
          </motion.p>
        ) : (
          <motion.ul key="links" className="flex flex-wrap justify-center gap-2" initial="h" animate="s" exit={{ opacity: 0 }}>
            {LINKS.map((l, i) => (
              <motion.li key={l.label} variants={{ h: { opacity: 0, y: 12 }, s: { opacity: 1, y: 0 } }} transition={{ delay: 0.3 + i * 0.1 }}>
                <a
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="inline-block rounded-full px-4 py-2 text-[14px] font-medium"
                  style={{ ...sans, background: i === 0 ? V2.orange : i === 1 ? V2.ink : "#fff", color: i === 2 ? V2.ink : "#fff" }}
                >
                  {l.label}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      {lit && (
        <ul className="sr-only">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
