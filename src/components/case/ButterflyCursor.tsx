"use client";

import { useEffect, useRef } from "react";

/**
 * Stands in for the Framer community component "ButterflyCursor", mounted on
 * every page.
 *
 * The instance controls carry its settings verbatim: hideCursor false, size 2,
 * smoothing 0.6, colour #38BDF8. The component's own artwork is not readable
 * through the agent API, so the butterfly is drawn here and flown with the same
 * smoothing constant: each frame moves the sprite 40% of the remaining distance
 * to the pointer.
 *
 * It always sits upright rather than turning to face its direction of travel,
 * and the wings beat faster the quicker it moves.
 *
 * Both the flight and the wingbeat are driven off elapsed time rather than off
 * the frame counter, so a 120Hz display does not double the speed.
 */

const SMOOTHING = 0.6;
const COLOR = "#38BDF8";
/** Drawn width in px, matching the scale Framer's "size 2" renders at. */
const SIZE = 46;
/** Radians per second at rest: one unhurried open-and-close every ~1.1s. */
const FLAP_RATE = 5.7;
/** Extra radians per second at the sprite's top speed. */
const FLAP_SPEEDUP = 0.3;

export function ButterflyCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Pointer-driven only: skip touch devices and reduced-motion visitors.
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let frame = 0;
    let flap = 0;
    let revealed = false;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!revealed) {
        revealed = true;
        pos.x = e.clientX;
        pos.y = e.clientY;
        if (ref.current) ref.current.style.opacity = "1";
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let last = performance.now();

    const tick = (now: number) => {
      // Clamped so a backgrounded tab does not resume with one huge jump.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      // The per-frame constant is held at its 60fps value and rescaled by dt.
      const ease = 1 - Math.pow(SMOOTHING, dt * 60);
      pos.x += dx * ease;
      pos.y += dy * ease;

      const speed = Math.min(Math.hypot(dx, dy), 60);
      flap += (FLAP_RATE + speed * FLAP_SPEEDUP) * dt;
      // A raised cosine rather than |cos|: the beat has no cusp at the bottom,
      // so the wings ease through the turn instead of snapping back.
      const wing = 0.5 - 0.5 * Math.cos(flap);

      const node = ref.current;
      if (node) {
        // No rotation: the butterfly always faces up.
        node.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        const wings = node.querySelector<SVGGElement>("[data-wings]");
        // Squeezing on X reads as a flap without any 3D.
        if (wings) wings.style.transform = `scaleX(${0.45 + wing * 0.55})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[60] opacity-0"
      style={{ willChange: "transform" }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox="0 0 48 48"
        fill="none"
        style={{ transform: "translate(-50%, -50%)", overflow: "visible" }}
      >
        <g data-wings style={{ transformOrigin: "24px 26px" }}>
          {/* Upper wings, swept up and out */}
          <path
            d="M23 26C20 14 13 6 7.5 8.5 2 11 3 21 10 26c4 2.8 8.6 3 13 0Z"
            fill={COLOR}
          />
          <path
            d="M25 26c3-12 10-20 15.5-17.5C46 11 45 21 38 26c-4 2.8-8.6 3-13 0Z"
            fill={COLOR}
          />
          {/* Lower wings */}
          <path
            d="M23 27c-1.5 8-5.5 13.5-10.5 12.5S6 33 11.5 29c3-2.2 7-2.7 11.5-2Z"
            fill={COLOR}
            opacity={0.78}
          />
          <path
            d="M25 27c1.5 8 5.5 13.5 10.5 12.5S42 33 36.5 29c-3-2.2-7-2.7-11.5-2Z"
            fill={COLOR}
            opacity={0.78}
          />
        </g>
        {/* Body and antennae */}
        <ellipse cx="24" cy="27" rx="1.5" ry="7" fill={COLOR} />
        <path
          d="M23.2 20.5c-1.2-3-3-4.8-5.2-5.5M24.8 20.5c1.2-3 3-4.8 5.2-5.5"
          stroke={COLOR}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
