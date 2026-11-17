"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { ProjectCover } from "@/components/project/ProjectCover";
import { PROJECTS } from "@/lib/projects";
import { V2 } from "./palette";

/**
 * Selected work, v2: one big image-led card with tabs.
 *
 * A row of tabs (one per project) sits on a deep blue panel. The active
 * project's cover fills the left side and a white card overlaps it with the
 * category, title, description and a link to the case study. Switching tabs
 * cross-fades the cover with a slow settle from a slight zoom and slides the
 * copy; the tab pill glides between tabs. Arrow buttons and the left/right
 * keys step through, and the counter shows where you are.
 *
 * Projects, order and copy come straight from lib/projects.ts, the same list
 * My Projects uses, so nothing here can drift from the case studies.
 */

const SHORT: Record<string, string> = {
  "ibm-watsonx-builder-control-plane": "watsonx Control Plane",
  "ibm-watsonx-orchestrate-notification-experience": "watsonx Notifications",
  "taipei-metro-app": "Taipei Metro",
  budgetcart: "BudgetCart",
  "ryze-coffee": "Ryze Coffee",
  "jubo-healthcare": "Jubo Healthcare",
};

function Arrow({ dir }: { dir: 1 | -1 }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden style={{ transform: dir < 0 ? "scaleX(-1)" : undefined }}>
      <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProjectTabs() {
  const reduce = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const n = PROJECTS.length;
  const p = PROJECTS[index];

  function go(next: number) {
    setDir(next > index ? 1 : -1);
    setIndex((next + n) % n);
  }

  return (
    <section aria-labelledby="work-title" className="w-full">
      <div className="mb-6">
        <h2 id="work-title" className="ts-heading-2 text-deep-blue">
          Selected work
        </h2>
        <p className="mt-2 text-[16px] text-dark-charcoal" style={{ fontFamily: "var(--font-dm-sans)" }}>
          Designing thoughtful, user-centered products from idea to execution
        </p>
      </div>

      <div
        className="w-full rounded-3xl p-4 tablet:p-8"
        style={{ background: V2.blue }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(index + 1);
          if (e.key === "ArrowLeft") go(index - 1);
        }}
      >
        {/* tabs */}
        <div className="-mx-4 mb-5 overflow-x-auto px-4 tablet:mx-0 tablet:px-0" style={{ scrollbarWidth: "none" }}>
          <div role="tablist" aria-label="Projects" className="flex w-max gap-1.5">
            {PROJECTS.map((proj, i) => (
              <button
                key={proj.slug}
                role="tab"
                id={`tab-${proj.slug}`}
                aria-selected={i === index}
                aria-controls="work-panel"
                tabIndex={i === index ? 0 : -1}
                onClick={() => go(i)}
                className="relative whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-medium transition-colors"
                style={{ fontFamily: "var(--font-dm-sans)", color: i === index ? V2.blue : "rgba(255,255,255,0.75)" }}
              >
                {i === index && (
                  <motion.span layoutId="work-tab-pill" className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                )}
                <span className="relative">{SHORT[proj.slug] ?? proj.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* stage */}
        <div id="work-panel" role="tabpanel" aria-labelledby={`tab-${p.slug}`} className="relative grid grid-cols-1 tablet:grid-cols-[1.45fr_1fr] tablet:items-center">
          <div className="relative aspect-[1.4/1] w-full overflow-hidden rounded-2xl bg-white/10">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={p.slug}
                className="absolute inset-0"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 0.35 }, scale: { duration: 1.1, ease: [0.2, 0.7, 0.2, 1] } }}
              >
                <ProjectCover slug={p.slug} title={p.title} sizes="(min-width: 810px) 640px, 100vw" className="h-full w-full object-cover" />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative z-[1] -mt-10 mx-3 rounded-2xl bg-[var(--v2-card)] p-5 tablet:-ml-16 tablet:mr-0 tablet:mt-0 tablet:p-8" style={{ boxShadow: "0 20px 40px rgba(0,10,50,0.25)" }}>
            <div className="mb-3 flex items-center justify-between text-[12px] uppercase tracking-[0.08em]" style={{ fontFamily: "ui-monospace, Menlo, monospace", color: V2.inkSoft }}>
              <span>{p.category}</span>
              <span>
                {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
              </span>
            </div>
            <div className="relative min-h-[150px] overflow-hidden tablet:min-h-[170px]">
              <AnimatePresence mode="wait" initial={false} custom={dir}>
                <motion.div
                  key={p.slug}
                  custom={dir}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 * dir }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 * dir }}
                  transition={{ duration: 0.28, ease: [0.3, 0.7, 0.4, 1] }}
                >
                  <h3 className="text-[24px] font-semibold leading-[1.15] tracking-[-0.4px] text-deep-blue tablet:text-[30px]" style={{ fontFamily: "var(--font-dm-sans)" }}>
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.5] tablet:text-[16px]" style={{ fontFamily: "var(--font-dm-sans)", color: V2.ink }}>
                    {p.description}
                  </p>
                  {p.status && (
                    <span className="v2-paper mt-3 inline-block rounded-full px-2.5 py-0.5 text-[12px]" style={{ fontFamily: "var(--font-dm-sans)", background: V2.butter }}>
                      {p.status}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <Link
                href={p.href}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-orange px-5 py-2.5 text-[15px] font-medium text-white transition-transform hover:scale-105"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {p.locked ? "View (password)" : "View case study"}
                <Arrow dir={1} />
              </Link>
              <div className="flex gap-2">
                {([-1, 1] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => go(index + d)}
                    aria-label={d < 0 ? "Previous project" : "Next project"}
                    className="grid size-10 place-items-center rounded-full transition-colors hover:bg-light-grey-super"
                    style={{ color: V2.ink, boxShadow: "0 0 0 1px var(--v2-line)" }}
                  >
                    <Arrow dir={d} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
