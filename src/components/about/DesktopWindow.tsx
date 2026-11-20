"use client";

import { motion, useDragControls } from "motion/react";
import { useEffect, type ReactNode } from "react";

/**
 * Framer component "Window": the macOS-style panel each desktop folder opens
 * into. A light title bar carries the traffic lights and the page name, and the
 * body scrolls. The window is draggable by its title bar, and Escape closes it.
 *
 * Centring is done by an outer wrapper rather than a transform on the animated
 * element, because motion owns the transform and would otherwise overwrite it.
 */
export function DesktopWindow({
  pageName,
  onClose,
  children,
  widthPercent = 90,
  heightPercent = 80,
  zIndex = 40,
}: {
  pageName: string;
  onClose: () => void;
  children: ReactNode;
  widthPercent?: number;
  heightPercent?: number;
  zIndex?: number;
}) {
  const dragControls = useDragControls();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center p-4"
      style={{ zIndex }}
    >
      <motion.div
        role="dialog"
        aria-modal="false"
        aria-label={pageName}
        drag
        dragMomentum={false}
        dragElastic={0}
        dragListener={false}
        dragControls={dragControls}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", duration: 0.45, bounce: 0.12 }}
        className="pointer-events-auto flex flex-col overflow-hidden rounded-xl bg-[var(--v2-card)] shadow-[0_30px_80px_rgba(0,0,0,0.32)]"
        /* The desktop keeps a floor under it on short screens, so the window is
           also held inside the viewport rather than following that floor. */
        style={{
          width: `${widthPercent}%`,
          height: `${heightPercent}%`,
          maxHeight: "calc(100svh - 2rem)",
        }}
      >
        {/* The title bar is the drag handle, so clicks inside the body still work */}
        <header
          onPointerDown={(e) => dragControls.start(e)}
          className="flex shrink-0 cursor-grab items-center gap-3 border-b border-grey-100 bg-grey-50 p-4 active:cursor-grabbing"
        >
          {/* macOS traffic lights, 18px with their glyphs always showing so the
              close button reads as one (Anne, 2026-11-20). Only red does anything. */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${pageName}`}
              className="flex size-[18px] items-center justify-center rounded-full border border-black/10 bg-[#ff5f57] transition hover:brightness-95"
            >
              <svg viewBox="0 0 10 10" className="size-[10px]" aria-hidden>
                <path d="M2 2L8 8M8 2L2 8" stroke="#4d0000" strokeWidth={1.6} strokeLinecap="round" />
              </svg>
            </button>
            <span className="flex size-[18px] items-center justify-center rounded-full border border-black/10 bg-[#febc2e]" aria-hidden>
              <svg viewBox="0 0 10 10" className="size-[10px]">
                <path d="M1.5 5H8.5" stroke="#995700" strokeWidth={1.6} strokeLinecap="round" />
              </svg>
            </span>
            <span className="flex size-[18px] items-center justify-center rounded-full border border-black/10 bg-[#28c840]" aria-hidden>
              <svg viewBox="0 0 10 10" className="size-[10px]">
                <path d="M1.6 8.4V2.9L7.1 8.4Z M8.4 1.6V7.1L2.9 1.6Z" fill="#006500" />
              </svg>
            </span>
          </div>
          <span
            className="text-dark-charcoal"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "15px",
              letterSpacing: "-0.01em",
            }}
          >
            {pageName}
          </span>
        </header>

        <div data-window-body className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
