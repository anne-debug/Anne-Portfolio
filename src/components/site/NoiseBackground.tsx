/**
 * Framer layer "Noise BG" from the Main layout template: an animated grain GIF
 * pinned to the viewport, blended with color-dodge at 12% opacity.
 */
export function NoiseBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-0 h-screen w-full overflow-hidden"
      style={{
        backgroundImage: "url(/images/noise.gif)",
        mixBlendMode: "color-dodge",
        opacity: 0.12,
      }}
    />
  );
}
