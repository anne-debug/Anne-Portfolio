"use client";

/**
 * TEMPORARY: a side-by-side comparison of handwritten fonts for the home hero.
 *
 * Nothing changes unless the URL asks for it:
 *
 *   ?font=KEY    restyles the hero heading ("Hi, this is Anne Lin")
 *   ?accent=KEY  restyles only the curved "M.S. in UX @UMICH '27" text
 *
 * Both can be combined, e.g. `/?font=covered&accent=gaegu`.
 *
 * Keys loaded with next/font: covered (Covered By Your Grace), reenie (Reenie
 * Beanie), nanum (Nanum Pen Script), gaegu (Gaegu), gochi (Gochi Hand),
 * rocksalt (Rock Salt), and mansalva (Mansalva, already loaded by the root
 * layout).
 *
 * Keys loaded on demand from the Google Fonts stylesheet, one family at a
 * time: caveat, caveatbrush, shadows (Shadows Into Light), indie (Indie
 * Flower), patrick (Patrick Hand), kalam, marker (Permanent Marker),
 * architects (Architects Daughter), homemade (Homemade Apple), nothing
 * (Nothing You Could Do), justanother (Just Another Hand), gloria (Gloria
 * Hallelujah), sueellen (Sue Ellen Francisco), girlnextdoor (The Girl Next
 * Door), schoolbell, sunrise (Waiting for the Sunrise), annie (Annie Use Your
 * Telescope), comingsoon (Coming Soon), amatic (Amatic SC), sedgwick (Sedgwick
 * Ave), zeyada, labelle (La Belle Aurore), dawning (Dawning of a New Day),
 * squarepeg (Square Peg).
 *
 * Nothing is preloaded: a visit without a param downloads none of these
 * fonts. With an unknown key or no param this renders nothing.
 *
 * The font table lives in fontPreviewTable.ts, shared with /font-preview,
 * which shows every candidate at once.
 *
 * To remove the experiment, delete this file, its one use in Hero.tsx,
 * fontPreviewTable.ts and src/app/font-preview.
 */

import { useEffect, useState } from "react";

import { FONTS, FONT_VARIABLES, loadRemote } from "./fontPreviewTable";

export default function FontPreview() {
  const [css, setCss] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const heading = FONTS[params.get("font") ?? ""];
    const accent = FONTS[params.get("accent") ?? ""];
    if (!heading && !accent) return;

    for (const f of [heading, accent]) if (f?.google) loadRemote(f.google);
    if ([heading, accent].some((f) => f && !f.google)) {
      document.documentElement.classList.add(...FONT_VARIABLES);
    }

    const rules: string[] = [];
    if (heading) {
      rules.push(
        `#hero h1, #hero h1 * { font-family: ${heading.family}, cursive !important; font-style: normal !important; letter-spacing: ${heading.spacing} !important; white-space: normal !important; }`,
        // The heading's font size is an inline px value, so it is zoomed. The
        // base sizes are the original Libre Baskerville ones per layout, so a
        // candidate compares the same way whatever the trial heading font is.
        `#hero h1 { zoom: ${heading.scale}; font-size: 48px !important; }`,
        `@media (min-width: 810px) { #hero h1 { font-size: 83px !important; } }`,
        `@media (min-width: 1200px) { #hero h1 { font-size: 80px !important; } }`,
      );
    }
    if (accent) {
      rules.push(
        `#hero svg text { font-family: ${accent.family}, cursive !important; font-size: ${(16.5 * accent.scale * 1.15).toFixed(2)}px !important; }`,
      );
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the URL once, on mount
    setCss(rules.join("\n"));
  }, []);

  if (!css) return null;
  return <style>{css}</style>;
}
