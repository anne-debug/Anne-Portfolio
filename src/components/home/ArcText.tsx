"use client";

import type { CSSProperties } from "react";

/**
 * Framer's "Arc text" instance in the hero, carrying "M.S. in UX @UMICH '27".
 *
 * The component itself is not readable through the agent API, so its geometry
 * was measured off Framer's own renders instead. In both the Desktop and the
 * Tablet frame the string is 173px wide, its end baselines are level with each
 * other, and the middle of the line rides about 11px higher than those ends.
 * A circle of radius 337 reproduces exactly that rise, which is also the
 * curvature at the top of the 623x581 ellipse the Framer instance is drawn on.
 *
 * The text is centred on the path, so the two ends stay level whatever the
 * string is, and the arc is symmetric about the middle the way Framer draws it.
 */

const TEXT = "M.S. in UX @UMICH ’27";

/** Radius that gives an 11px rise across the 173px-wide string. */
const RADIUS = 337;
const BOX_WIDTH = 260;
const BOX_HEIGHT = 40;
/** Chord ends of the drawn path, wider than the text so it can sit centred. */
const PATH = "M 5 40 A 337 337 0 0 1 255 40";

export function ArcText({
  /** Unique per instance: the two breakpoint stages both live in the DOM. */
  id,
  fontSize = 16.5,
  className,
  style,
}: {
  id: string;
  fontSize?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={BOX_WIDTH}
      height={BOX_HEIGHT}
      viewBox={`0 0 ${BOX_WIDTH} ${BOX_HEIGHT}`}
      className={className}
      style={style}
      role="img"
      aria-label={TEXT}
      data-radius={RADIUS}
    >
      <path id={id} d={PATH} fill="none" />
      <text
        fill="var(--color-dark-charcoal)"
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontWeight: 400,
          fontSize: `${fontSize}px`,
          letterSpacing: 0,
        }}
      >
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
          {TEXT}
        </textPath>
      </text>
    </svg>
  );
}
