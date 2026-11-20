"use client";

import { PullCord } from "./PullCord";
import { setSiteDark, useSiteDark } from "./theme";

/**
 * The pull cord hanging from the top right corner of every page. It stays
 * put while the page scrolls and switches the whole site between light and
 * dark. On phones the nav pill fills the top row, so the cord is longer there
 * and the pull hangs below it, kept at the very edge so the cord does not
 * cross the pill's menu button. From 810 up it sits 48px in from the edge.
 */
export function SiteLamp() {
  const dark = useSiteDark();
  return (
    <div className="pointer-events-none fixed right-1 top-0 z-[70] flex flex-col items-center [--site-cord:88px] tablet:right-12 tablet:[--site-cord:96px]">
      {/* handwritten hint beside the pull, with a curled arrow pointing at it
          (Anne, 2026-11-20). Tablet and up only: on phones it would sit over
          the hero, under the nav pill. */}
      <span
        aria-hidden
        className="absolute right-[calc(100%+6px)] top-[calc(var(--site-cord)+2px)] hidden items-start gap-0.5 whitespace-nowrap text-orange tablet:flex"
      >
        <span className="-rotate-[5deg] text-[17px] leading-none" style={{ fontFamily: "var(--font-mansalva)" }}>
          Pull to switch the lights
        </span>
        <svg viewBox="0 0 34 26" width={30} height={23} fill="none" className="-mt-1.5 shrink-0">
          <path d="M3 21 C10 22 19 18 23 9 C24.5 6 25.5 4 26 2" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
          <path d="M21.5 5.5 L26 1.8 L29 7" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <PullCord
        cord="var(--site-cord)"
        pressed={dark}
        label={dark ? "Pull the cord to switch the site to light mode" : "Pull the cord to switch the site to dark mode"}
        onToggle={() => setSiteDark(!dark)}
      />
    </div>
  );
}
