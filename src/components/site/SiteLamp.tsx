"use client";

import { PullCord } from "./PullCord";
import { setSiteDark, useSiteDark } from "./theme";

/**
 * The pull cord hanging from the top right corner of every page. It stays
 * put while the page scrolls and switches the whole site between light and
 * dark. Same cord as the one over the About me board. On phones the nav pill
 * fills the top row, so the cord is longer there and the pull hangs below it.
 */
export function SiteLamp() {
  const dark = useSiteDark();
  return (
    <div className="pointer-events-none fixed right-1 top-0 z-[70] flex flex-col items-center [--site-cord:88px] tablet:right-7 tablet:[--site-cord:96px]">
      <PullCord
        cord="var(--site-cord)"
        pressed={dark}
        label={dark ? "Pull the cord to switch the site to light mode" : "Pull the cord to switch the site to dark mode"}
        onToggle={() => setSiteDark(!dark)}
      />
    </div>
  );
}
