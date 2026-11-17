"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

import { COZY } from "./texture";

/**
 * "My latest moves": recent news as a row of cards in the same shape as the
 * Selected Work cards (light grey surface, white image well, charcoal tag).
 *
 * Each card has a photo with a date chip, a line or two of text and a tag.
 * Cards lift on hover and link out to the LinkedIn post when there is one. The row scrolls sideways (snap,
 * wheel, trackpad, touch, or the arrow buttons) and ends with a card that
 * invites the visitor to send Anne a postcard from the playground.
 *
 * DRAFT entries, drawn from Anne's experience notes. Photos are placeholders
 * until she sends real ones: set `photo` to a file in /public to replace one.
 */

interface Move {
  date: string;
  text: string;
  tag: string;
  tint: string;
  photo?: string;
  href?: string;
}

const MOVES: Move[] = [
  {
    date: "FALL 2026",
    text: "Joined Michigan Open UX as an associate designer on Learn to Hunt, with Michigan DNR and the National Wild Turkey Federation.",
    tag: "Michigan Open UX",
    tint: COZY.sage,
  },
  {
    date: "SEP 2026",
    text: "Wrapped up my design internship on IBM watsonx Orchestrate, where I designed the Issues and Metrics views and the notification experience.",
    tag: "IBM internship",
    tint: COZY.sky,
  },
  {
    date: "MAR 2026",
    text: "Started as a part-time web designer on the U-M Student Life web team, fixing tickets and accessibility issues across WordPress sites.",
    tag: "U-M Student Life",
    tint: COZY.butter,
  },
];

function DateTag({ date }: { date: string }) {
  return (
    <span
      className="rounded-full bg-white px-2.5 py-0.5 text-[11px] tracking-[0.08em] text-dark-charcoal"
      style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", boxShadow: "0 1px 4px rgba(42,49,50,0.12)" }}
    >
      {date}
    </span>
  );
}

function PhotoPlaceholder({ tint }: { tint: string }) {
  return (
    <div className="grid h-full w-full place-items-center" style={{ background: tint }}>
      <div className="flex flex-col items-center gap-1.5 text-dark-charcoal" style={{ opacity: 0.6 }}>
        <svg viewBox="0 0 48 40" width={34} aria-hidden>
          <rect x={3} y={8} width={42} height={29} rx={6} fill="none" stroke="currentColor" strokeWidth={2.5} />
          <path d="M16,8 L19,3 L29,3 L32,8" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" />
          <circle cx={24} cy={22} r={8} fill="none" stroke="currentColor" strokeWidth={2.5} />
        </svg>
        <span className="text-[13px]" style={{ fontFamily: "var(--font-dm-sans)" }}>
          Photo coming soon
        </span>
      </div>
    </div>
  );
}

function Card({ move }: { move: Move }) {
  const reduce = useReducedMotion() ?? false;
  const inner = (
    <motion.article
      className="flex h-full flex-col gap-4 rounded-2xl bg-light-grey-super p-4"
      whileHover={reduce ? undefined : { y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-white">
        {move.photo ? <Image src={move.photo} alt="" fill sizes="280px" className="object-cover" /> : <PhotoPlaceholder tint={move.tint} />}
        <div className="absolute left-3 top-3">
          <DateTag date={move.date} />
        </div>
      </div>
      <p className="text-[15px] leading-[1.45] text-dark-charcoal" style={{ fontFamily: "var(--font-dm-sans)" }}>
        {move.text}
      </p>
      <span className="ts-button mt-auto self-start rounded-[30px] bg-dark-charcoal px-3 py-1 text-[13px] text-off-white">{move.tag}</span>
    </motion.article>
  );
  return move.href ? (
    <a href={move.href} target="_blank" rel="noreferrer" className="block h-full">
      {inner}
    </a>
  ) : (
    inner
  );
}

export function LatestMoves() {
  const rowRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const scrollBy = (dir: number) => rowRef.current?.scrollBy({ left: dir * 300, behavior: reduce ? "auto" : "smooth" });

  return (
    <section aria-labelledby="moves-title" className="w-full">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 id="moves-title" className="ts-heading-2 text-deep-blue">
            My latest moves
          </h2>
          <p className="mt-1 text-[16px] text-dark-charcoal" style={{ fontFamily: "var(--font-dm-sans)" }}>
            What I&apos;ve been up to lately.
          </p>
        </div>
        <div className="hidden gap-2 tablet:flex">
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => scrollBy(d)}
              aria-label={d < 0 ? "Previous postcards" : "Next postcards"}
              className="grid size-10 place-items-center rounded-full border bg-white text-[18px] text-dark-charcoal transition-transform hover:scale-105 active:scale-95"
              style={{ borderColor: "rgba(42,49,50,0.15)" }}
            >
              {d < 0 ? "←" : "→"}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={rowRef}
        className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-6 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {MOVES.map((m) => (
          <div key={m.date + m.tag} className="w-[260px] shrink-0 snap-start tablet:w-[280px]">
            <Card move={m} />
          </div>
        ))}

        {/* invitation to the playground */}
        <div className="w-[260px] shrink-0 snap-start tablet:w-[280px]">
          <Link href="/playground" className="block h-full">
            <motion.div
              className="flex h-full min-h-[340px] flex-col items-center justify-center gap-3 rounded-2xl border-[1.5px] border-dashed p-6 text-center"
              style={{ borderColor: "rgba(42,49,50,0.2)" }}
              whileHover={reduce ? undefined : { y: -6 }}
            >
              <svg viewBox="0 0 48 36" width={44} aria-hidden fill="none" stroke={COZY.ink} strokeWidth={2.5} strokeLinejoin="round">
                <rect x={3} y={3} width={42} height={30} rx={4} />
                <path d="M4,5 L24,20 L44,5" />
              </svg>
              <span className="text-[20px] font-semibold text-deep-blue" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Send me a postcard
              </span>
              <span className="text-[14px] text-light-grey" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Make one in the playground →
              </span>
            </motion.div>
          </Link>
        </div>
      </div>
    </section>
  );
}
