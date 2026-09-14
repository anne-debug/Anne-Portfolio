"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Stands in for the Framer community component "Smooth Scroll", which every
 * case study page mounts at the top of its Desktop frame.
 *
 * Framer's component wraps the same underlying library, so the feel matches:
 * inertial wheel scrolling that leaves touch devices alone. It is disabled when
 * the visitor asks for reduced motion.
 *
 * The instance is published on `window` while it lives, because anything that
 * wants to scroll the page itself has to go through it: a plain anchor jump or
 * `scrollIntoView` fights the loop below and lands in the wrong place.
 */

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    window.__lenis = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      delete window.__lenis;
      lenis.destroy();
    };
  }, []);

  return null;
}
