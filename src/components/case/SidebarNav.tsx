"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

/**
 * Framer component "FloatingSidebarMenu": the table of contents for the longer
 * case studies. One component, two layouts, switching at Framer's own desktop
 * breakpoint of 1200 where its Desktop frame takes over from its Tablet frame.
 *
 * From 1200 up the list is simply open, in a column of its own beside the
 * article. There is room for it there, so nothing is behind a button. The
 * column is sticky inside the row, so it follows the reader down the case study
 * and stops where the row ends, above the More Projects strip.
 *
 * Below 1200 there is no gutter for it, so it floats: a small button pinned to
 * the left of the screen, and a panel that opens under it sharing the same left
 * anchor, so the two read as one control. Both are laid over the page, which
 * means opening the list leaves the article exactly where it is: no reflow, no
 * shift, no change to the column's width. The page is never dimmed or locked;
 * the reader can keep scrolling with the list open, and a tap on the button, on
 * the page, or on an entry puts it away.
 *
 * The entry for the section on screen is highlighted in orange.
 */

export interface SidebarEntry {
  id: string;
  label: string;
}

/** Framer's own feel for this: short, and eased out. */
const SLIDE = { duration: 0.24, ease: [0.22, 1, 0.36, 1] } as const;

/** Room left above a section so the pinned page nav does not cover its heading. */
const ANCHOR_OFFSET = 110;
/** A little past the transition, so the last reflow is caught too. */
const SETTLE_MS = 340;

export function SidebarNav({ entries }: { entries: SidebarEntry[] }) {
  /** The portal needs a document, so it waits for hydration. */
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
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

  const sectionLink = (entry: SidebarEntry, floating = false) => (
    <a
      href={`#${entry.id}`}
      onClick={(e) => {
        e.preventDefault();
        // The desktop rail stays open, as Framer leaves it. The floating panel
        // closes, so the reader gets the page back.
        if (floating) toggle(false);
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

  const list = (floating = false) => (
    <ul className="flex flex-col gap-2.5">
      {entries.map((entry) => (
        <li key={entry.id}>{sectionLink(entry, floating)}</li>
      ))}
    </ul>
  );

  return (
    <>
      {/* 1200 and up: the list, open, in its own column.

          The column is sticky rather than fixed to the window, so the row it
          sits in bounds it: it travels with the reader through the case study
          and comes to rest where that row ends, which is above the More
          Projects strip rather than over it. It keeps the 119px the article's
          position is measured from, and the list inside is free to be wider. */}
      <div className="hidden w-[119px] shrink-0 desktop:sticky desktop:top-[150px] desktop:block">
        <nav aria-label="Sections" className="w-[150px]">
          {list()}
        </nav>
      </div>

      {/* Below 1200 the rail floats over the page instead of holding a
          column in it: the button and the panel share one left anchor, so the
          two read as a single control pinned to the side of the screen, and
          opening it neither widens the article nor moves it. Portalled to the
          body, because the article sits in a stacking context of its own and
          the site's own nav pill is outside it. */}
      {mounted
        ? createPortal(
            <div className="desktop:hidden">
              <button
                type="button"
                onClick={() => toggle(!open)}
                aria-expanded={open}
                aria-controls="case-sections"
                aria-label={open ? "Close section menu" : "Open section menu"}
                className="fixed top-[88px] left-4 z-[60] flex size-10 items-center justify-center rounded-full border border-orange/60 bg-chestnut-bg text-orange shadow-[0_2px_10px_rgba(0,0,0,0.06)] tablet:left-6"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path
                    d="M4 6h12M4 10h12M4 14h12"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <AnimatePresence>
                {open ? (
                  <>
                    {/* A tap anywhere else puts it away. It carries no tint of
                        its own: the panel is the only thing that should read as
                        laid over the page. */}
                    <div
                      className="fixed inset-0 z-[55]"
                      onClick={() => toggle(false)}
                      aria-hidden
                    />
                    <motion.nav
                      id="case-sections"
                      aria-label="Sections"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={SLIDE}
                      className="fixed top-[136px] left-4 z-[58] w-[190px] rounded-2xl border border-grey-100 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.10)] tablet:left-6 tablet:w-[210px]"
                    >
                      {list(true)}
                    </motion.nav>
                  </>
                ) : null}
              </AnimatePresence>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
