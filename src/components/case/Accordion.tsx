"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

/**
 * Framer component "Accordion", used on the Taipei page to hide the detail
 * behind each strategy iteration. Each instance opens independently.
 *
 * Closed, it is a filled bar with a dropdown chevron. Hovering a closed bar
 * turns it orange with white text, which is how the page marks the row you are
 * about to open. Open, it becomes a panel: the summary steps up a little, the
 * chevron becomes a close cross, and the hover tint is dropped so it never sits
 * behind the body copy.
 */
export function Accordion({
  summary,
  children,
}: {
  summary: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`w-full overflow-hidden rounded-2xl bg-light-grey-super transition-colors ${
        open ? "" : "group hover:bg-orange"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-3.5 text-left"
      >
        <span
          className={`transition-colors ${
            open
              ? "ts-heading-6"
              : "ts-body-medium-bold text-[14px] group-hover:text-white"
          }`}
        >
          {summary}
        </span>
        <span
          className={`shrink-0 transition-colors ${
            open ? "text-orange" : "text-dark-charcoal group-hover:text-white"
          }`}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="m5 5 10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="m5 8 5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.45, bounce: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2.5 px-6 pt-1 pb-6">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
