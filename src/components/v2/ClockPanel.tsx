"use client";

import { useSiteDark } from "@/components/site/theme";

import { PreviousPinboardClock } from "./PreviousPinboardClock";

/**
 * The left column of About me on the timeline branch. Anne took the pinboard
 * out (2026-11-20) to make room for a new design and kept only its live clock.
 * The panel keeps the board's 800x480 shape and colour, and the clock sits
 * where the board had it, as percentages of the panel so it scales with it.
 */
export function ClockPanel() {
  const dark = useSiteDark();

  return (
    <div
      className="relative h-full w-full rounded-[22.4px] transition-colors duration-500"
      data-theme={dark ? "dark" : "light"}
      style={{ background: "var(--v2-board)", boxShadow: "1.6px 4px 8px rgba(153,153,153,0.25)" }}
    >
      {/* board position: left 262, top 26.4, 172.8 x 77.6 on the 800 x 480 board */}
      <div className="absolute left-[32.75%] top-[5.5%] h-[16.17%] w-[21.6%]">
        <PreviousPinboardClock />
      </div>
    </div>
  );
}
