"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Framer's "Carousel" component as used inside each About window: one image
 * centred and full size, its neighbours scaled back and dimmed, on a light
 * tray.
 *
 * The deck can be moved four ways: drag or swipe it sideways, scroll sideways
 * with a trackpad or a shift-wheel, press the arrow buttons, or use the arrow
 * keys. Dragging follows the pointer and settles on whichever slide it was
 * nearest when released, and a flick carries on to the next one. Vertical
 * scrolling is left alone so the window still scrolls past the deck.
 *
 * Framer's slide is 385x380 on a 460px tray with 430px between slides, which is
 * only right while the tray is wide enough to hold it. The window is a share of
 * the desktop, so on a phone the tray is narrower than the slide and the deck
 * used to hang over both edges. The tray is measured instead, and the slide and
 * the step are taken from Framer's proportions of it, so the deck fits at any
 * size. The measurement happens before paint, and the component only ever
 * mounts after a click, so nothing is ever drawn at the wrong size.
 */

/** Framer's design: a 385x380 slide, stepping 430px, on a 460px tray. */
const SLIDE_W = 385;
const SLIDE_H = 380;
const STEP = 430;
const TRAY_H = 460;
/** How much of a narrow tray the active slide is allowed to take. */
const FILL = 0.88;
export function Carousel({
  images,
  alt,
  height = TRAY_H,
}: {
  images: string[];
  alt: string;
  height?: number;
}) {
  const [index, setIndex] = useState(0);
  const tray = useRef<HTMLDivElement>(null);
  const [trayWidth, setTrayWidth] = useState(SLIDE_W / FILL);
  const count = images.length;

  useLayoutEffect(() => {
    const node = tray.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setTrayWidth(entry.contentRect.width);
    });
    observer.observe(node);
    setTrayWidth(node.clientWidth);
    return () => observer.disconnect();
  }, []);

  const slideW = Math.min(SLIDE_W, trayWidth * FILL);
  const slideH = slideW * (SLIDE_H / SLIDE_W);
  const step = slideW * (STEP / SLIDE_W);
  // The tray keeps Framer's 80px of chrome around the slide for the dots.
  const trayH = Math.min(height, Math.round(slideH + (TRAY_H - SLIDE_H)));

  const go = useCallback(
    (by: number) => setIndex((i) => (i + (by % count) + count) % count),
    [count],
  );

  // A drag has to be able to suppress the click it ends on, or letting go over
  // a neighbour would also select it.
  const dragged = useRef(false);

  /**
   * Sideways scrolling. The listener is attached by hand because it has to be
   * non-passive: the gesture is consumed here, and letting it through as well
   * would scroll the window behind the deck. A cooldown keeps one flick of a
   * trackpad from running through the whole set.
   */
  const scrolling = useRef(false);
  useEffect(() => {
    const node = tray.current;
    if (!node || count < 2) return;
    const onWheel = (e: WheelEvent) => {
      const sideways = e.shiftKey ? e.deltaY : e.deltaX;
      if (Math.abs(sideways) < 12 || Math.abs(sideways) < Math.abs(e.deltaY) * 0.8) return;
      e.preventDefault();
      if (scrolling.current) return;
      scrolling.current = true;
      go(Math.sign(sideways));
      window.setTimeout(() => {
        scrolling.current = false;
      }, 320);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [count, go]);

  return (
    <div
      ref={tray}
      className="relative w-full overflow-hidden rounded-lg bg-grey-50"
      style={{ height: trayH }}
      role="group"
      aria-roledescription="carousel"
      aria-label={alt}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        /* drag="x" leaves touch-action as pan-y, so a vertical swipe still
           scrolls the window while a sideways one moves the deck. */
        drag={count > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        dragMomentum={false}
        style={{ cursor: count > 1 ? "grab" : "default" }}
        whileDrag={{ cursor: "grabbing" }}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={(_, info) => {
          // Settle on whichever slide the deck was nearest when released, with
          // a flick carrying one further.
          const moved = -info.offset.x / step;
          const flick =
            Math.abs(info.velocity.x) > 320 ? Math.sign(-info.velocity.x) : 0;
          const by = Math.round(moved) || flick;
          if (by) go(by);
        }}
      >
        {images.map((src, i) => {
          // Signed distance from the active slide, wrapped so the deck loops.
          let offset = i - index;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          if (Math.abs(offset) > 2) return null;

          const active = offset === 0;
          return (
            <motion.button
              key={src}
              type="button"
              onClick={() => {
                if (dragged.current) {
                  dragged.current = false;
                  return;
                }
                setIndex(i);
              }}
              aria-label={`${alt}, image ${i + 1} of ${count}`}
              aria-current={active}
              className="absolute overflow-hidden rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
              initial={false}
              animate={{
                x: offset * step,
                scale: active ? 1 : 0.78,
                opacity: active ? 1 : 0.55,
                zIndex: 10 - Math.abs(offset),
              }}
              transition={{ type: "spring", stiffness: 200, damping: 30, mass: 0.8 }}
              style={{ width: slideW, height: slideH }}
            >
              {/* Without this the browser starts its own image drag and the
                  deck never sees the pointer move. */}
              <Image
                src={src}
                alt=""
                fill
                sizes="(width < 810px) 90vw, 385px"
                draggable={false}
                className="pointer-events-none object-cover select-none"
              />
            </motion.button>
          );
        })}
      </motion.div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous image"
            className="absolute top-1/2 left-3 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-dark-charcoal shadow-sm backdrop-blur transition hover:bg-white"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next image"
            className="absolute top-1/2 right-3 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-dark-charcoal shadow-sm backdrop-blur transition hover:bg-white"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-1.5">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-dark-charcoal" : "w-1.5 bg-grey-150/60"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
