"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Candle } from "./Candle";
import { COZY } from "./texture";

/**
 * The closing beat of the page: "make a wish before you go". Blowing out the
 * candle reveals the ways to reach Anne; relighting it puts the invitation
 * back. The links are also always available to screen readers and keyboard
 * users through the visually hidden list, so nothing depends on the candle.
 */

const LINKS = [
  { label: "Email me", href: "mailto:annelin.yuen@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/annelin0513/" },
  { label: "Send a postcard", href: "/playground" },
];

export function WishFooter() {
  const [lit, setLit] = useState(true);

  return (
    <section
      aria-labelledby="wish-title"
      className="grid w-full grid-cols-1 items-center justify-items-center gap-8 rounded-2xl bg-light-grey-super px-6 py-12 tablet:grid-cols-[280px_1fr] tablet:justify-items-start tablet:px-14"
    >
      <Candle onLitChange={setLit} />
      <div className="flex flex-col items-center gap-4 text-center tablet:items-start tablet:text-left">
        <h2 id="wish-title" className="ts-heading-2 text-deep-blue">
          {lit ? "Make a wish before you go" : "Wish made. Let\u2019s talk!"}
        </h2>
        <AnimatePresence mode="wait">
          {lit ? (
            <motion.p
              key="ask"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-[380px] text-[16px] text-dark-charcoal"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Blow out the candle and I&apos;ll leave you a way to say hi.
            </motion.p>
          ) : (
            <motion.ul key="links" className="flex flex-wrap justify-center gap-2 tablet:justify-start" initial="h" animate="s" exit={{ opacity: 0 }}>
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.label}
                  variants={{ h: { opacity: 0, y: 12 }, s: { opacity: 1, y: 0 } }}
                  transition={{ delay: 0.4 + i * 0.12, type: "spring", stiffness: 300, damping: 16 }}
                >
                  <a
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="inline-block rounded-full border-[1.5px] px-5 py-2.5 text-[15px] font-medium transition-transform hover:scale-105"
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      background: i === 0 ? COZY.orange : i === 1 ? COZY.ink : "#fff",
                      borderColor: i === 0 ? COZY.orange : COZY.ink,
                      color: i === 2 ? COZY.ink : "#fff",
                    }}
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
      </div>
    </section>
  );
}
