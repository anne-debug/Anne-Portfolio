/**
 * Hand-drawn marks that sit around the hero.
 *
 * In Framer these are icon instances from the "Doodles & Scribbles" set. The
 * agent API neither serialises them nor exports them as SVG, so they are
 * redrawn here from 4x captures at their recorded sizes: sparkle 90x90,
 * smiley 57x57, butterfly 57x57.
 */

const INK = "#555555";

/**
 * Framer sizes the same icon differently per breakpoint, and the tablet sparkle
 * is not square, so each mark takes an explicit box and lets the viewBox
 * stretch to fill it.
 */
export interface DoodleProps {
  size?: number;
  width?: number;
  height?: number;
}

const strokeProps = {
  fill: "none",
  stroke: INK,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function Sparkle({ size = 90, width, height }: DoodleProps) {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 90 90"
      preserveAspectRatio="none"
      aria-hidden
      {...strokeProps}
      strokeWidth={3.6}
    >
      {/* Large eight-point star, drawn with a slight wobble */}
      <path d="M31.5 11 Q33 47 33.5 83" />
      <path d="M5 46.5 Q32 44.8 59 47.5" />
      <path d="M17.5 32.5 Q32 46 46.5 61" />
      <path d="M46.5 32.5 Q32 46 17.5 61" />
      {/* Small companion star */}
      <path d="M72.5 6 Q71.8 19 71.2 33" />
      <path d="M60 20 Q72 18.8 84 19.6" />
      <path d="M64.5 11.5 Q72 19 79.5 27" />
      <path d="M79.5 11.5 Q72 19 64.5 27" />
    </svg>
  );
}

export function Smiley({ size = 57, width, height }: DoodleProps) {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 57 57"
      preserveAspectRatio="none"
      aria-hidden
      {...strokeProps}
      strokeWidth={2.2}
    >
      <circle cx="28.5" cy="28.5" r="19.5" />
      <path d="M20.5 23.5 v2.5" />
      <path d="M36.5 23.5 v2.5" />
      <path d="M21 34 Q28.5 40.5 36 34" />
    </svg>
  );
}

export function Butterfly({ size = 57, width, height }: DoodleProps) {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 57 57"
      preserveAspectRatio="none"
      aria-hidden
      {...strokeProps}
      strokeWidth={2.4}
    >
      {/* Antennae */}
      <path d="M28.5 14.5 L21.5 7" />
      <path d="M28.5 14.5 L35.5 6" />
      {/* Body */}
      <path d="M28.5 14.5 V38" />
      {/* Upper wings */}
      <path d="M28.5 17.5 A12.5 12.5 0 1 0 23.5 35.5" />
      <path d="M28.5 17.5 A12.5 12.5 0 1 1 33.5 35.5" />
      {/* Lower wings */}
      <path d="M23.5 35.5 A8 8 0 1 0 28.5 41.5" />
      <path d="M33.5 35.5 A8 8 0 1 1 28.5 41.5" />
    </svg>
  );
}
