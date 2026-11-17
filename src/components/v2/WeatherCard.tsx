"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Today's weather where the visitor is, typed out on the About me pinboard
 * like Framer's LiveText component (node ZY4iX0Sgr) with its "Weather + temp"
 * data source: "It's 39°F and cloudy in Ann Arbor right now", in System UI,
 * blue #2563EB, typewriter speed 7 of 10.
 *
 * Data comes from /api/weather (approximate city from the request, Ann Arbor
 * as the fallback). Sized in the board's own 800px units.
 */

type Weather = { city: string; unit: "F" | "C"; now: number; code: number; isDay: boolean };

/** WMO weather codes, as Open-Meteo reports them, worded to follow "and" */
function describe(code: number): string {
  if (code === 0) return "clear";
  if (code <= 2) return "partly cloudy";
  if (code === 3) return "cloudy";
  if (code <= 48) return "foggy";
  if (code <= 57) return "drizzly";
  if (code <= 67 || (code >= 80 && code <= 82)) return "rainy";
  if (code <= 77 || code === 85 || code === 86) return "snowy";
  return "stormy";
}

const PREFIX = "It's ";
const SUFFIX = " right now";
/** Framer's 1-10 speed scale; 7 is what the component is set to */
const SPEED = 7;
const MS_PER_CHAR = Math.round(120 - SPEED * 11);

export function WeatherCard() {
  const reduce = useReducedMotion() ?? false;
  const [text, setText] = useState<string | null>(null);
  const [shown, setShown] = useState(0);
  const box = useRef<HTMLParagraphElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/api/weather")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((w: Weather) => live && setText(`${PREFIX}${w.now}°${w.unit} and ${describe(w.code)} in ${w.city}${SUFFIX}`))
      .catch(() => live && setText(`${PREFIX}a nice day somewhere${SUFFIX}`));
    return () => {
      live = false;
    };
  }, []);

  // start typing once the board is on screen
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!text || !visible || reduce) return;
    const id = window.setInterval(() => {
      setShown((n) => {
        if (n >= text.length) window.clearInterval(id);
        return Math.min(n + 1, text.length);
      });
    }, MS_PER_CHAR);
    return () => window.clearInterval(id);
  }, [text, visible, reduce]);

  // reduced motion: the whole line at once, no typing
  const count = text && reduce ? text.length : shown;
  const done = text !== null && count >= text.length;
  return (
    <p
      ref={box}
      className="text-right text-[17px] font-normal leading-[1.25] text-[var(--weather-ink)] transition-colors duration-500"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
      aria-label={text ?? undefined}
    >
      <span aria-hidden>{text ? text.slice(0, count) : ""}</span>
      <span
        aria-hidden
        className={`ml-px inline-block h-[1em] w-[1.5px] translate-y-[2px] bg-[var(--weather-ink)] ${done ? "animate-pulse" : ""}`}
      />
    </p>
  );
}
