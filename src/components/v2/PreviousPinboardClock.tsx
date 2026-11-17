"use client";
import { useEffect, useState } from "react";
// segments: a top, b top-right, c bottom-right, d bottom, e bottom-left, f top-left, g middle
const SEG: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgecd",
  "7": "abc",
  "8": "abcdefg",
  "9": "abfgcd",
};
const SEG_PATH: Record<string, string> = {
  a: "M5,2 H25 L21,6 H9 Z",
  b: "M27,4 V24 L23,21 V8 Z",
  c: "M27,28 V48 L23,44 V31 Z",
  d: "M5,50 H25 L21,46 H9 Z",
  e: "M3,28 V48 L7,44 V31 Z",
  f: "M3,4 V24 L7,21 V8 Z",
  g: "M6,26 L9,23.5 H21 L24,26 L21,28.5 H9 Z",
};

function Digit({ ch, x }: { ch: string; x: number }) {
  const on = SEG[ch] ?? "";
  return (
    <g transform={`translate(${x},0)`}>
      {Object.entries(SEG_PATH).map(([k, d]) => (
        <path key={k} d={d} style={{ fill: on.includes(k) ? "var(--clock-on)" : "var(--clock-off)", stroke: on.includes(k) ? "var(--clock-on-edge)" : "var(--clock-off-edge)" }} strokeWidth={on.includes(k) ? 1.3 : 0.6} strokeLinejoin="round" />
      ))}
    </g>
  );
}

export function PreviousPinboardClock() {
  // "88:88" until mounted, so the server and the first client render match
  const [time, setTime] = useState("8888");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(String(d.getHours()).padStart(2, "0") + String(d.getMinutes()).padStart(2, "0"));
    };
    tick();
    const id = window.setInterval(tick, 5000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      role="img"
      aria-label="Clock showing your local time"
    >
      <svg viewBox="0 0 160 52" className="h-[78%] w-[92%]" style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.12))" }}>
        <Digit ch={time[0]} x={0} />
        <Digit ch={time[1]} x={36} />
        <g style={{ fill: "var(--clock-on)", stroke: "var(--clock-on-edge)" }} strokeWidth={1.3} className="about-clock-colon">
          <rect x={77} y={15} width={6} height={6} rx={1.5} />
          <rect x={77} y={31} width={6} height={6} rx={1.5} />
        </g>
        <Digit ch={time[2]} x={94} />
        <Digit ch={time[3]} x={130} />
      </svg>
      <style>{`@keyframes about-blink{0%,49%{opacity:1}50%,100%{opacity:.25}}.about-clock-colon{animation:about-blink 1s steps(1) infinite}@media (prefers-reduced-motion: reduce){.about-clock-colon{animation:none}}`}</style>
    </div>
  );
}

