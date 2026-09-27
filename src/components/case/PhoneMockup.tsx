"use client";

import Image from "next/image";

/**
 * Framer community component "iPhone Sim Mockup", set to the iPhone 17 Pro
 * variant with side buttons showing.
 *
 * The component's own artwork is not readable through the agent API, so the
 * handset is drawn here in CSS, from the variant's own measurements: a shell of
 * 265.43x549.31 wrapping four nested rings, then the screen. Each ring's
 * padding, corner radius and fill below is Framer's, written as a share of the
 * shell's width so the handset holds its proportions at any size.
 *
 * | ring         | padding | radius | fill    |
 * | ------------ | ------- | ------ | ------- |
 * | Outer Stroke | 0.61    | 63.76  | #000    |
 * | Inner Stroke | 0.61    | 63.15  | #999    |
 * | Bezel        | 4.81    | 62.55  | #2c2c2c |
 * | Screen       | 6.02    | 57.74  | #000    |
 *
 * The rings are worth keeping separate. Collapsed into one grey band, which is
 * what this drew before, the edge reads soft and heavy; Framer's is a crisp
 * black outline with a hairline of grey inside it catching the light.
 *
 * The 12.05 of padding they add up to also decides the shape of the screen, and
 * that matters more than it looks. It leaves 2.176:1, and the recordings that
 * play in it are 2.175:1 and 2.168:1, so each one fills the screen with nothing
 * trimmed and no gap. Deriving the shell from 19.5:9 and insetting a single
 * bezel leaves 2.25:1 instead, and the recordings then lose their edges.
 *
 * `fluid` swaps the fixed width for the container's own. Every share is then
 * written in `cqw`, one percent of that container, rather than in pixels.
 */

/** Framer's iPhone 17 Pro variant, as shares of the shell's width. */
const W = 265.43;
const SHELL_HEIGHT = 549.31 / W;
/** Each ring: how much it insets what it holds, its corner radius, its fill. */
const RINGS = [
  { pad: 0.61 / W, radius: 63.76 / W, fill: "#000000" },
  { pad: 0.61 / W, radius: 63.15 / W, fill: "#999999" },
  { pad: 4.81 / W, radius: 62.55 / W, fill: "#2c2c2c" },
  { pad: 6.02 / W, radius: 57.74 / W, fill: "#000000" },
] as const;
/** The picture's own corner, inside the last ring's padding. */
const SCREEN_RADIUS = (57.74 - 6.02) / W;

export function PhoneMockup({
  screen,
  width = 265,
  alt = "",
  unoptimized = false,
  fluid = false,
}: {
  screen: string;
  width?: number;
  alt?: string;
  /** Animated GIFs must bypass the image optimiser to keep moving. */
  unoptimized?: boolean;
  /** Fill the container's width instead of taking a fixed one. */
  fluid?: boolean;
}) {
  const height = Math.round(width * SHELL_HEIGHT);
  /** A share of the shell's width, in whichever unit this instance is drawn in. */
  const unit = (share: number) =>
    fluid ? `${(share * 100).toFixed(2)}cqw` : `${share * width}px`;

  const island = {
    top: unit(0.056),
    width: unit(0.3),
    height: unit(0.085),
  };

  // Built from the inside out, so each ring wraps the one before it.
  let stack = (
    <div
      className="relative size-full overflow-hidden bg-white"
      style={{ borderRadius: unit(SCREEN_RADIUS) }}
    >
      <Image
        src={screen}
        alt={alt}
        fill
        sizes={fluid ? "(width < 810px) 60vw, 280px" : `${width}px`}
        className="object-cover"
        unoptimized={unoptimized}
      />
    </div>
  );

  for (let i = RINGS.length - 1; i >= 0; i--) {
    const ring = RINGS[i];
    stack = (
      <div
        className="relative size-full"
        style={{
          background: ring.fill,
          borderRadius: unit(ring.radius),
          padding: unit(ring.pad),
          // The outermost ring carries the handset's shadow.
          boxShadow: i === 0 ? "0 18px 40px rgba(0, 0, 0, 0.18)" : undefined,
        }}
      >
        {stack}
        {/* The island sits over the screen, inside the last ring. */}
        {i === RINGS.length - 1 ? (
          <span
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black"
            style={island}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="relative shrink-0"
      style={
        fluid
          ? {
              width: "100%",
              aspectRatio: `1 / ${SHELL_HEIGHT}`,
              containerType: "inline-size",
            }
          : { width, height }
      }
      aria-hidden={alt ? undefined : true}
    >
      {/* Side buttons */}
      <span
        className="absolute -left-[2px] rounded-l-sm bg-[#5b5b60]"
        style={{ top: height * 0.18, width: 3, height: height * 0.035 }}
      />
      <span
        className="absolute -left-[2px] rounded-l-sm bg-[#5b5b60]"
        style={{ top: height * 0.26, width: 3, height: height * 0.06 }}
      />
      <span
        className="absolute -left-[2px] rounded-l-sm bg-[#5b5b60]"
        style={{ top: height * 0.34, width: 3, height: height * 0.06 }}
      />
      <span
        className="absolute -right-[2px] rounded-r-sm bg-[#5b5b60]"
        style={{ top: height * 0.28, width: 3, height: height * 0.09 }}
      />

      {stack}
    </div>
  );
}
