import { IbmHeroField } from "./IbmHeroField";
import { IbmHeroWireframes } from "./wireframe/hero";

/**
 * The hero artwork for the IBM Builder Control Plane case study.
 *
 * Built the way `CLAUDE.md` asks a hero composition to be built: one canvas
 * with a fixed aspect ratio, every piece placed as a percentage of it, so the
 * group keeps its overlap and its spacing at any width instead of each piece
 * answering the viewport on its own. Nothing inside is rearranged at a
 * breakpoint; the canvas is the only thing that resizes.
 *
 * ── The product ───────────────────────────────────────────────────────────
 * Three drawn panels — Home as the main plate, Issues overlapping in front of
 * it, Metrics behind and above — which is the move a builder makes through the
 * three surfaces. They used to be two screenshots of the team's own prototype;
 * that is unreleased IBM UI, so the hero now carries wireframes of the same
 * ideas instead. Nothing in them was traced from a capture and every label is
 * fictional. Their geometry lives in `wireframe/hero.tsx` beside the drawings.
 *
 * ── The background ────────────────────────────────────────────────────────
 * `IbmHeroField`, which is a grid of artifacts with signals running between
 * them. It is a client component and this is not, which is the whole reason
 * the two are separate files: the panels, the canvas and its aspect ratio are
 * server-rendered markup that has never needed a browser, and the field is
 * the only part of the hero that does.
 *
 * This file keeps the canvas because both of them measure against it — the
 * field reads the panels' boxes out of `wireframe/hero.tsx` in the same units
 * to know which cells a window covers.
 */

/** The stage. Taller than the windows need, which is what gives the field its
    margin to live in. */
const CANVAS = { w: 1200, h: 780 };

export function IbmHeroArt() {
  return (
    /*
      One stage with a fixed shape, and everything inside it placed as a share
      of that shape — the rule `CLAUDE.md` sets for a hero composition. The
      canvas is the only thing a breakpoint touches.

      `isolate` so the field, the panels and their shadows sort against each
      other and not against the page; `overflow-hidden` so the field stops at
      the canvas rather than running under the facts above it.

      The canvas is also a container, which is what lets the panels' corner
      radius and elevation be written in `cqw` — a share of the canvas's own
      width. A fixed 12px radius is right at full size and a heavy collar at a
      phone's third of it; 1cqw is 12px at 1200 and shrinks with everything
      else, so the composition scales as one piece.
    */
    <div
      className="relative isolate w-full overflow-hidden"
      style={{
        aspectRatio: `${CANVAS.w} / ${CANVAS.h}`,
        containerType: "inline-size",
      }}
    >
      <IbmHeroField canvas={CANVAS} />

      {/* The three panels, over the field they are the point of. */}
      <IbmHeroWireframes />
    </div>
  );
}
