"use client";

import { ARTIFACTS, ArtifactPanel, ArtifactTree } from "./metrics";
import { DemoPointer, DemoSwap, useBeats } from "./demo";
import { WireFigure, WireScreen, WireTabs } from "./Wire";

/**
 * The Metrics step of Solution Overview, playing itself.
 *
 * What the final Metrics concept is for is a relationship: choose an artifact
 * on the left and the right-hand page is about that artifact. A still frame
 * can show one artifact selected; it cannot show that selecting it is what
 * produced the reading. So the loop moves through three of them — an agent, a
 * workflow, a tool — and the panel changes with the pointer.
 *
 * Everything else holds still on purpose. The tree, the search field, the two
 * sections and their headings stay exactly where they are, because the only
 * thing a visitor should notice changing is the artifact and what it reads.
 *
 * It is the same `ArtifactTree` and `ArtifactPanel` the Design Process
 * drawing uses, with a different artifact passed in: Solution Overview is
 * meant to be the same concept with an interaction on it, not a second
 * drawing of it that can drift.
 */

/**
 * The loop. Two and a half seconds to take the first artifact in, a second
 * for the pointer to reach the next one, three to notice that the panel has
 * changed, then the same again for the third.
 */
const BEATS = [
  { id: "first", ms: 2500 },
  { id: "reach-second", ms: 1100 },
  { id: "second", ms: 3000 },
  { id: "reach-third", ms: 1100 },
  { id: "third", ms: 3000 },
] as const;

/** Which artifact the panel is reading, per beat. */
const SHOWS: Record<string, number> = {
  first: 0,
  "reach-second": 0,
  second: 1,
  "reach-third": 1,
  third: 2,
};

/**
 * Where the pointer rests, as a share of the drawing.
 *
 * The three resting points are the three artifact rows in the tree, which is
 * why they differ only in `top`. Between presses it sits out of the way at low
 * opacity rather than leaving and re-entering, so nothing flashes.
 */
const POINTER = {
  first: { left: "16%", top: "45%", opacity: 0 },
  "reach-second": { left: "14%", top: "59%", opacity: 1 },
  second: { left: "14%", top: "59%", opacity: 0 },
  "reach-third": { left: "14%", top: "73%", opacity: 1 },
  third: { left: "14%", top: "73%", opacity: 0 },
} as const;

export function SolutionMetricsDemo() {
  const { root, beat, reduceMotion } = useBeats(BEATS);
  const artifact = ARTIFACTS[SHOWS[beat] ?? 0];
  const pressing = beat.startsWith("reach");

  return (
    <WireFigure
      size="compact"
      scroll
      alt="Wireframe of the Metrics experience, playing itself: a searchable artifact hierarchy on the left and the selected artifact's Overview and Dependencies sections on the right. A pointer moves down the hierarchy and chooses a different artifact, and the figures, the trend and the related artifacts change with it."
    >
      <div ref={root} className="relative min-h-full w-full">
        <WireScreen height="natural" railActive={2}>
          <WireTabs items={["Home", "Issues", "Metrics"]} active={2} />

          <div className="grid grid-cols-1 gap-2 tablet:grid-cols-[0.62fr_1fr] tablet:gap-3">
            {/* The tree is not swapped, only re-rendered with a different
                row lit: a crossfade here would make the whole hierarchy
                blink when one row changed. */}
            <ArtifactTree selected={artifact.id} />

            <DemoSwap
              k={artifact.id}
              reduceMotion={reduceMotion}
              className="min-w-0"
            >
              <ArtifactPanel artifact={artifact} />
            </DemoSwap>
          </div>
        </WireScreen>

        {reduceMotion ? null : (
          <DemoPointer
            at={POINTER[beat as keyof typeof POINTER]}
            pressing={pressing}
          />
        )}
      </div>
    </WireFigure>
  );
}
