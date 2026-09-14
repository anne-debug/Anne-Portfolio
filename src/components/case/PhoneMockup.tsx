"use client";

import Image from "next/image";

/**
 * Framer community component "iPhone Sim Mockup", set to the iPhone 17 Pro
 * variant with side buttons showing.
 *
 * The component's own artwork is not readable through the agent API, so the
 * handset is drawn here in CSS at the same proportions: a rounded titanium
 * shell, a thin bezel, the Dynamic Island, and the side buttons. The screen
 * keeps the 19.5:9 ratio the real device uses.
 *
 * `fluid` swaps the fixed width for the container's own. Everything that used
 * to be derived from a pixel width is then written in `cqw`, one percent of
 * that container, so the handset scales with whatever box it is dropped into
 * and keeps its proportions exactly.
 */
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
  const height = Math.round((width * 19.5) / 9);
  const bezel = fluid ? "3.5cqw" : Math.max(6, Math.round(width * 0.035));
  const radius = fluid ? "16cqw" : Math.round(width * 0.16);
  const island = fluid
    ? { top: "5.6cqw", width: "30cqw", height: "8.5cqw" }
    : { top: (bezel as number) * 1.6, width: width * 0.3, height: width * 0.085 };
  const screenRadius = fluid ? "12.4cqw" : (radius as number) - (bezel as number) * 0.6;

  return (
    <div
      className="relative shrink-0"
      style={
        fluid
          ? { width: "100%", aspectRatio: "9 / 19.5", containerType: "inline-size" }
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

      {/* Shell */}
      <div
        className="relative size-full overflow-hidden bg-[#3f3f44] shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
        style={{ borderRadius: radius }}
      >
        <div
          className="absolute overflow-hidden bg-white"
          style={{ inset: bezel, borderRadius: screenRadius }}
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

        {/* Dynamic Island */}
        <span
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black"
          style={island}
        />
      </div>
    </div>
  );
}
