/**
 * Shared look for the playful pieces (gumball machine, Didi, candle, tool box,
 * postcards), matched to the home hero: an off-white page, white and light
 * grey surfaces, the site's deep blue, charcoal and orange, and hand-drawn
 * marks kept to clean single-weight lines like the hero's doodles.
 *
 * `crayon` (name kept so callers need not change) draws a uniform charcoal
 * outline around everything inside it: the shapes' alpha is dilated, flooded
 * with ink, and laid under the original. Flat fills therefore read as tidy line
 * illustrations without every path needing its own stroke. `soft` is a no-op
 * pass-through for small details such as faces.
 *
 * Each SVG renders its own copy with an id from `useId`, since filter ids are
 * global to the document.
 */

export const COZY = {
  cream: "#F8F6F3",
  paper: "#FFFFFF",
  surface: "#EBE9E4",
  ink: "#2A3132",
  inkSoft: "rgba(42, 49, 50, 0.55)",
  pink: "#FFD9E3",
  pinkDeep: "#FF8FA8",
  butter: "#FFE2A6",
  sage: "#CDEBD6",
  sky: "#CADCFC",
  lilac: "#E0D8FF",
  peach: "#FFC7A6",
  orange: "#FF5900",
  navy: "#001666",
  blush: "rgba(255, 120, 140, 0.3)",
} as const;

export function CozyFilters({ id }: { id: string }) {
  return (
    <defs>
      <filter id={`${id}-crayon`} x="-10%" y="-10%" width="120%" height="120%">
        <feMorphology in="SourceAlpha" operator="dilate" radius={1.6} result="grown" />
        <feFlood floodColor={COZY.ink} result="ink" />
        <feComposite in="ink" in2="grown" operator="in" result="outline" />
        <feMerge>
          <feMergeNode in="outline" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id={`${id}-soft`}>
        <feOffset dx={0} dy={0} />
      </filter>
    </defs>
  );
}

/** Kept for callers that layer it under a colour; the clean style has no grain. */
export const PAPER_GRAIN = "none";
