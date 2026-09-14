"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Framer component "FloatingSidebarMenu": the table of contents for the longer
 * case studies. One component, two layouts, switching at Framer's own desktop
 * breakpoint of 1200 where its Desktop frame takes over from its Tablet frame.
 *
 * From 1200 up the list is simply open, floating in the left gutter 150px in
 * from the edge of the window. There is room for it there, so nothing is behind
 * a button. A spacer stays in the flow so the article keeps the width and
 * position measured off Framer.
 *
 * Below 1200 the list opens by pushing rather than covering. It is a column in
 * the flow beside the article, narrow enough for just the button while closed
 * and the full list while open, so opening it moves the article right and
 * closing it lets the article back. The article is never covered, never dimmed
 * and never locked: the reader can keep scrolling and clicking the case study
 * with the list open, which is how Framer behaves.
 *
 * The entry for the section on screen is highlighted in orange.
 */

export interface SidebarEntry {
  id: string;
  label: string;
  /** Framer nests a second level under some entries. */
  children?: string[];
}

/**
 * Width of the open column below 1200. Framer's own rail is 150px wide, and
 * measuring its tablet render against the site's nav pill puts the push at
 * about that same 150px, so the one value carries across the breakpoints. The
 * phone has no room for 150, so it tapers to 120 and holds there.
 */
const OPEN_W = "clamp(120px, 14vw + 65px, 150px)";
/** Closed, the column is just wide enough for the button and its gap. */
const SHUT_W = "44px";

/** Framer's own feel for this: short, and eased out. */
const SLIDE = { duration: 0.24, ease: [0.22, 1, 0.36, 1] } as const;

/** Room left above a section so the pinned page nav does not cover its heading. */
const ANCHOR_OFFSET = 110;
/** A little past the transition, so the last reflow is caught too. */
const SETTLE_MS = 340;

export function SidebarNav({
  entries,
  projectsHref = "/my-projects",
}: {
  entries: SidebarEntry[];
  /** Where "All Projects" goes. A real link, so an external arrival still lands
   *  inside the portfolio rather than wherever the browser came from. */
  projectsHref?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const article = useRef<HTMLElement | null>(null);

  /**
   * Hold the reader's place while the column moves.
   *
   * Making room narrows the article, so its text rewraps and everything above
   * the viewport grows taller, carrying the page down under the reader. It is
   * worth 1161px at 390. Nothing is being scrolled, so there is nothing to lock;
   * the fix is to keep one element pinned where it was and let the scroll
   * offset follow it.
   *
   * A heading already on screen is the anchor. Its distance from the top of the
   * window is recorded, and for as long as the column is moving the page is
   * nudged to keep it there, which leaves the reader looking at the same words
   * throughout. The nudge is a plain scroll write: the smooth-scroll library is
   * idle between gestures and picks the new position up, so it is neither
   * stopped nor restarted.
   */
  const keepPlace = useCallback(() => {
    const root = article.current;
    if (!root) return;
    const anchor = [...root.querySelectorAll<HTMLElement>("[id]")].find(
      (el) => el.getBoundingClientRect().bottom > 0,
    );
    if (!anchor) return;

    const want = anchor.getBoundingClientRect().top;
    const started = performance.now();
    let frame = 0;
    const hold = () => {
      const drift = anchor.getBoundingClientRect().top - want;
      if (Math.abs(drift) > 0.5) {
        const to = window.scrollY + drift;
        window.scrollTo(0, to);
        // Keep the smooth-scroll library's own idea of the position in step,
        // so its next gesture does not start from the stale offset.
        const lenis = window.__lenis;
        if (lenis) lenis.animatedScroll = lenis.targetScroll = to;
      }
      if (performance.now() - started < SETTLE_MS) frame = requestAnimationFrame(hold);
    };
    frame = requestAnimationFrame(hold);
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggle = useCallback(
    (next: boolean) => {
      keepPlace();
      setOpen(next);
    },
    [keepPlace],
  );

  useEffect(() => {
    article.current = document.querySelector("article");
  }, []);

  useEffect(() => {
    const targets = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [entries]);

  // Past 1200 the always-open rail takes over, so a window growing across that
  // line leaves the column closed behind it.
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia("(min-width: 1200px)");
    const onChange = () => {
      if (wide.matches) toggle(false);
    };
    onChange();
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, [open, toggle]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggle(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, toggle]);

  const goToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Worked out here rather than handed to the smooth-scroll library as an
    // offset, because the two disagree on which way that offset points.
    const scroll = () => {
      const top = el.getBoundingClientRect().top + window.scrollY - ANCHOR_OFFSET;
      const lenis = window.__lenis;
      if (lenis) lenis.scrollTo(top);
      else window.scrollTo({ top, behavior: "smooth" });
    };
    scroll();

    // Sections above can still settle while the page is travelling, which
    // leaves the heading short of where it was aimed. One correction pass once
    // the page has stopped puts it right.
    window.setTimeout(() => {
      if (Math.abs(el.getBoundingClientRect().top - ANCHOR_OFFSET) > 8) scroll();
    }, 800);

    window.history.pushState(null, "", `#${id}`);
  }, []);

  const allProjects = (
    <Link
      href={projectsHref}
      className="ts-body-small flex items-center gap-2 whitespace-nowrap text-dark-charcoal transition-colors hover:text-orange"
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M13 8H3m0 0 4.5-4.5M3 8l4.5 4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      All Projects
    </Link>
  );

  const sectionLink = (entry: SidebarEntry) => (
    <a
      href={`#${entry.id}`}
      onClick={(e) => {
        e.preventDefault();
        // Framer leaves the list open on a pick, so the reader can keep using
        // it to move around the page.
        goToSection(entry.id);
      }}
      aria-current={active === entry.id ? "true" : undefined}
      className={`ts-body-small block py-1.5 transition-colors ${
        active === entry.id
          ? "font-semibold text-orange"
          : "text-dark-charcoal hover:text-orange"
      }`}
    >
      {entry.label}
    </a>
  );

  const list = (
    <ul className="flex flex-col gap-2.5">
      {entries.map((entry) => (
        <li key={entry.id}>{sectionLink(entry)}</li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Holds the column open so the article does not shift when the rail
          leaves the flow at 1200. */}
      <div className="hidden w-[119px] shrink-0 desktop:block" aria-hidden />

      {/* 1200 and up: the list, open, in the gutter */}
      <nav
        aria-label="Sections"
        className="hidden desktop:fixed desktop:top-[150px] desktop:left-[150px] desktop:z-30 desktop:block desktop:w-[150px]"
      >
        {allProjects}
        <div className="mt-4">{list}</div>
      </nav>

      {/* Below 1200: a column in the flow. Widening it is what moves the
          article across; nothing is laid over the page. */}
      <motion.div
        animate={{ width: open ? OPEN_W : SHUT_W }}
        initial={false}
        transition={SLIDE}
        style={{ width: SHUT_W }}
        className="sticky top-24 z-20 shrink-0 self-start overflow-hidden desktop:hidden"
      >
        {/* Both states are laid over each other and cross-faded, so the
            column's contents never reflow while it is moving. The list is the
            one in the flow, because it is the taller of the two and the column
            has to be tall enough not to clip it. */}
        <div className="relative">
          <motion.button
            type="button"
            onClick={() => toggle(true)}
            animate={{ opacity: open ? 0 : 1 }}
            initial={false}
            transition={SLIDE}
            aria-expanded={open}
            aria-controls="case-sections"
            aria-label="Open section menu"
            tabIndex={open ? -1 : 0}
            className="absolute top-0 left-0 flex size-9 items-center justify-center text-orange"
            style={{ pointerEvents: open ? "none" : "auto" }}
          >
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M3 5.5h14M3 10h14M3 14.5h14"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          </motion.button>

          <motion.nav
            id="case-sections"
            aria-label="Sections"
            aria-hidden={!open}
            animate={{ x: open ? 0 : "-100%", opacity: open ? 1 : 0 }}
            initial={false}
            transition={SLIDE}
            style={{ width: OPEN_W, pointerEvents: open ? "auto" : "none" }}
            className="relative"
          >
            <div className="mb-3">{allProjects}</div>
            {list}
            {/* Framer puts the close on the first entry's line, at the far
                edge of the column, rather than over the article. */}
            <button
              type="button"
              onClick={() => toggle(false)}
              aria-label="Close section menu"
              tabIndex={open ? 0 : -1}
              className="absolute top-[34px] right-0 flex size-7 items-center justify-center text-orange"
            >
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path
                  d="m4 4 10 10M14 4 4 14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </motion.nav>
        </div>
      </motion.div>
    </>
  );
}
