"use client";

import { useSiteDark } from "@/components/site/theme";

import { FigmaPinboard } from "./FigmaPinboard";

/**
 * The About me pinboard. It follows the site's light/dark mode, which the pull
 * cord in the page's top right corner switches (SiteLamp). The board used to
 * carry a cord of its own; Anne asked for it to go (2026-11-16).
 *
 * The board carries `data-theme="dark"` or `"light"`; the colours are in the
 * v2 block at the end of globals.css and apply to whatever carries the
 * attribute. The fairy lights glow when it is dark.
 */
export function LampBoard() {
  const dark = useSiteDark();

  return (
    <div className="relative h-full w-full" data-theme={dark ? "dark" : "light"}>
      <FigmaPinboard />
    </div>
  );
}
