/**
 * A string of warm LED fairy lights on the About me pegboard, the way people
 * hang them on a wire photo grid. It is drawn on the board's surface, under
 * everything pinned to it, so photos and notes cover the bulbs they sit on.
 *
 * One wire runs across the board in four sagging rows, joined at the ends so
 * it reads as a single string. Each bulb is a small core plus a soft halo.
 * The halo's strength is `--fairy-glow` (globals.css): 1 on a dark board, 0 on
 * a light one, so the bulbs are lit when the board's lights are off and are
 * plain pale beads when they are on. One lit bulb in three twinkles on its own clock;
 * the twinkle is off under reduced motion (`.fairy-twinkle` in globals.css).
 *
 * Coordinates are the board's own 800x480 design units and the drawing
 * stretches with the board.
 */

const W = 800;
const H = 480;

/** each row: the wire's height at the ends, and how far it sags mid-span */
/* Rows two and three leave the band from about 190 to 235 clear on the right,
   which is where the weather line is typed out. */
const ROWS = [
  { y: 46, sag: 26 },
  { y: 126, sag: 22 },
  { y: 264, sag: 26 },
  { y: 398, sag: 28 },
];
const LEFT = 34;
const RIGHT = W - 34;
const BULBS_PER_ROW = 14;

/** a repeatable 0..1 number from an index, so server and browser draw the same string */
function noise(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function wireY(row: (typeof ROWS)[number], t: number) {
  return row.y + row.sag * Math.sin(Math.PI * t);
}

interface Bulb {
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

const BULBS: Bulb[] = ROWS.flatMap((row, r) =>
  Array.from({ length: BULBS_PER_ROW }, (_, i) => {
    const n = r * BULBS_PER_ROW + i;
    const t = (i + 0.5 + (noise(n) - 0.5) * 0.5) / BULBS_PER_ROW;
    return {
      x: LEFT + (RIGHT - LEFT) * t,
      // bulbs hang a little under the wire, each by its own amount
      y: wireY(row, t) + 3 + noise(n + 50) * 5,
      delay: -noise(n + 100) * 6,
      duration: 2.6 + noise(n + 200) * 3.4,
      size: 0.85 + noise(n + 300) * 0.4,
    };
  }),
);

/** the wire: left to right on one row, down the side, back along the next */
const WIRE = ROWS.map((row, r) => {
  const steps = 24;
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const x = LEFT + (RIGHT - LEFT) * t;
    return `${x.toFixed(1)} ${wireY(row, t).toFixed(1)}`;
  });
  // odd rows run right to left so the ends meet
  return (r % 2 === 0 ? pts : pts.reverse()).join(" L ");
}).join(" L ");

export function FairyLights() {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full overflow-hidden rounded-[22.4px]"
    >
      <defs>
        <radialGradient id="fairy-halo">
          <stop offset="0%" stopColor="#ffe2a3" stopOpacity="0.95" />
          <stop offset="28%" stopColor="#ffbe5c" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#ff9d3c" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d={`M ${WIRE}`} fill="none" stroke="var(--v2-line)" strokeWidth="1" strokeLinejoin="round" />

      {BULBS.map((b, i) => (
        <g key={i} transform={`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`}>
          {/* the bead you see with the board lights on */}
          <circle r={(2.6 * b.size).toFixed(2)} fill="#e4dac4" stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" />
          {/* halo and lit core, faded in by --fairy-glow */}
          <g className="transition-opacity duration-700" style={{ opacity: "var(--fairy-glow, 0)" }}>
            <g
              /* one bulb in three twinkles; the rest hold steady, which keeps the
                 repainting small and reads more like a real string */
              className={i % 3 === 0 ? "fairy-twinkle" : undefined}
              style={
                i % 3 === 0
                  ? { animationDelay: `${b.delay.toFixed(2)}s`, animationDuration: `${b.duration.toFixed(2)}s` }
                  : undefined
              }
            >
              <circle r={(30 * b.size).toFixed(1)} fill="url(#fairy-halo)" />
              <circle r={(2.8 * b.size).toFixed(2)} fill="#fff6d8" />
            </g>
          </g>
        </g>
      ))}
    </svg>
  );
}
