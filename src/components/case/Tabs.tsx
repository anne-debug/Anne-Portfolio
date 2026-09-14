"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/**
 * Framer component "Tab Component" with its "Tab Btn" children.
 *
 * Two layouts, as Framer draws them:
 *
 * - Tablet and desktop keep the switcher. Three buttons, one panel visible,
 *   panels cross-fade on change.
 * - Mobile drops the switcher entirely. Framer's "Tab1 - Mobile" variant sets
 *   the button wrapper to `visible: false` and puts the panel's own heading
 *   above it, so the three panels read as stacked labelled cards instead.
 *
 * Both layouts are generated from the same panel data so they cannot drift.
 */

export interface TabStep {
  /** The phone screen artwork, or a still image shown at phone size. */
  screen: string;
  alt: string;
  /** Framer wraps some screens in its phone-frame PNG. */
  frame?: string;
  /** Numbered label above the explanation, e.g. "Live Cart estimator". */
  step: string;
  body: string;
  /** Animated GIFs must bypass the image optimiser. */
  unoptimized?: boolean;
  /** Width of the screen artwork on desktop. */
  width?: number;
}

export interface TabPanel {
  title: string;
  steps: TabStep[];
}

/** The dotted arrow Framer draws between a phone and its explanation. */
export function CurvedArrow({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      width="44"
      height="26"
      viewBox="0 0 93 40"
      fill="none"
      aria-hidden
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d="M2 30C22 8 56 2 88 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="4 5"
      />
      <path
        d="M88 12 78 9M88 12l-3 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A phone screen, optionally seated inside Framer's phone-frame image. */
function Screen({ step, width }: { step: TabStep; width: number }) {
  const height = Math.round(width * 2.05);

  if (!step.frame) {
    return (
      <Image
        src={step.screen}
        alt={step.alt}
        width={width}
        height={height}
        className="h-auto shrink-0 object-contain"
        style={{ width }}
        unoptimized={step.unoptimized}
      />
    );
  }

  return (
    <span className="relative block shrink-0" style={{ width, height }}>
      <Image
        src={step.frame}
        alt=""
        fill
        sizes={`${width}px`}
        className="object-contain"
      />
      <Image
        src={step.screen}
        alt={step.alt}
        width={Math.round(width * 0.915)}
        height={Math.round(height * 0.968)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover"
        style={{
          width: Math.round(width * 0.915),
          height: Math.round(height * 0.968),
          borderRadius: Math.round(width * 0.124),
        }}
        unoptimized={step.unoptimized}
      />
    </span>
  );
}

function Explanation({
  step,
  index,
  className,
}: {
  step: TabStep;
  index: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-[7px] ${className ?? ""}`}>
      <p className="ts-body-large font-semibold">
        {index + 1}. {step.step}
      </p>
      <p className="ts-body">{step.body}</p>
    </div>
  );
}

/**
 * Framer's "Tab1 - Mobile" variant: the switcher is hidden, the panel heading
 * sits above, and the content drops into a 350px card, 32px radius, holding a
 * 249.5px phone over a 261px caption. Framer hides the connector arrow here,
 * so there is none.
 */
function MobilePanel({ panel }: { panel: TabPanel }) {
  return (
    <section className="flex w-full flex-col items-center gap-4">
      <h4
        className="text-grey-200"
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontWeight: 600,
          fontSize: "23px",
          letterSpacing: "-0.02em",
          lineHeight: "1.3em",
        }}
      >
        {panel.title}
      </h4>

      <div className="flex w-full max-w-[350px] flex-col items-center gap-[30px] rounded-[32px] bg-light-grey-super py-[30px]">
        {panel.steps.map((step, i) => (
          <div key={step.step} className="flex flex-col items-center gap-[30px]">
            <Screen step={step} width={249.5} />
            <Explanation step={step} index={i} className="w-[261px]" />
          </div>
        ))}
      </div>
    </section>
  );
}

/** The switcher layout used from tablet up. */
function DesktopPanel({ panel }: { panel: TabPanel }) {
  const single = panel.steps.length === 1;

  return (
    <div
      className={`flex w-full items-start justify-center gap-10 ${
        single ? "tablet:pl-20" : "px-10"
      }`}
    >
      {panel.steps.map((step, i) => (
        <div
          key={step.step}
          className={`flex items-center gap-4 ${single ? "w-full" : "flex-1 flex-col"}`}
        >
          <Screen step={step} width={step.width ?? (single ? 265 : 209)} />
          {single ? (
            <div className="flex flex-1 items-center gap-4">
              <CurvedArrow className="hidden shrink-0 text-light-grey tablet:block" />
              <Explanation step={step} index={i} />
            </div>
          ) : (
            <Explanation step={step} index={i} className="w-[210px] text-center" />
          )}
        </div>
      ))}
    </div>
  );
}

export function Tabs({ panels }: { panels: TabPanel[] }) {
  const [index, setIndex] = useState(0);

  return (
    <>
      {/* Phone: Framer hides the switcher and stacks the panels */}
      <div className="flex w-full flex-col gap-10 tablet:hidden">
        {panels.map((panel) => (
          <MobilePanel key={panel.title} panel={panel} />
        ))}
      </div>

      {/* Tablet and desktop: the switcher */}
      <div className="hidden w-full flex-col items-center gap-2.5 tablet:flex">
        <div
          role="tablist"
          aria-label="Budget awareness system"
          className="flex flex-wrap items-center justify-center gap-10 px-[30px] py-5"
        >
          {panels.map((panel, i) => (
            <button
              key={panel.title}
              role="tab"
              type="button"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={`ts-body rounded-full px-5 py-2 transition-colors ${
                i === index
                  ? "bg-dark-charcoal text-off-white"
                  : "text-light-grey hover:text-dark-charcoal"
              }`}
            >
              {panel.title}
            </button>
          ))}
        </div>

        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              role="tabpanel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
              className="w-full"
            >
              <DesktopPanel panel={panels[index]} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
