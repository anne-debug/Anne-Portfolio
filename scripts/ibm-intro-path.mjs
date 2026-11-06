import sharp from "sharp";

/**
 * Measures the Eye-Bee-M animation and prints the bee's flight as CSS.
 *
 * The IBM case study's opening is the official animation's choreography,
 * drawn with the vector artwork instead of the raster frames. This is where
 * the motion came from: it reads the source animation frame by frame, finds
 * the bee in each one, and writes out the keyframes `globals.css` carries.
 * Nothing of the source ships — the output is a list of numbers.
 *
 *   node scripts/ibm-intro-path.mjs <source.gif>
 *
 * ── Finding the bee ───────────────────────────────────────────────────────
 * The source is a colour illustration on white, which makes the bee easy to
 * separate: it is the only ink left once the blue M and the grey shadows are
 * dropped, and it is the only thing moving. Its position is the ink's
 * centroid, weighted by how far each pixel is from white so that the motion
 * blur pulls the centre the way the eye does rather than smearing it.
 *
 * Which way it is pointing comes from the antennae, the one part of the
 * drawing that is pink: the vector from the body's centre to the antennae's
 * is the bee's own up, and that is what `rotate()` reproduces.
 *
 * ── Turning pixels into CSS ───────────────────────────────────────────────
 * Every distance is divided by the width of the resting composition, the
 * eye's left edge to the M's right, so the flight is expressed as a share of
 * the mark rather than in pixels of a 1600-wide frame. `globals.css`
 * multiplies those shares by `--ibm-fly`, which is the mark's own width. The
 * flight is therefore the same drawing at 120px as at 160px, and it keeps the
 * proportion to the logo that the source gives it.
 *
 * Centroids wobble by a pixel or two as the wings beat and the blur comes and
 * goes, so both tracks are smoothed — lightly for the path, a little harder
 * for the heading, which is the noisier of the two because the antennae are
 * small. The passes leave the endpoints alone and are far too short to round
 * off a real corner: the sharpest turn in the flight survives at full angle.
 */

/** The last frame before the bee moves, and the last before it leaves frame. */
const REST = 83;
const LAST = 155;

/** 40ms a frame, as the source holds them. */
const DELAY = 40;

/** How long the bee takes to carry on out of the viewport, after the path. */
const EXIT_MS = 300;

/** The bee at rest, and the resting composition's width, both in source px. */
const HOME = { x: 805.5, y: 612.5 };
const WIDTH = 449;

const source = process.argv[2];
if (!source) {
  console.error("usage: node scripts/ibm-intro-path.mjs <source.gif>");
  process.exit(1);
}

/** The bee's centre and its antennae's, in source pixels. */
async function read(page) {
  const { data, info } = await sharp(source, {
    animated: true,
    limitInputPixels: false,
    page,
    pages: 1,
  })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let w = 0,
    x = 0,
    y = 0,
    an = 0,
    ax = 0,
    ay = 0;
  for (let row = 0; row < info.height; row++) {
    for (let col = 0; col < info.width; col++) {
      const i = (row * info.width + col) * info.channels;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const ink = 255 - Math.min(r, g, b);
      if (ink < 24) continue;
      if (b > r + 25 && b > g + 15) continue; // the M, and the capture's handles
      if (Math.abs(r - g) < 12 && Math.abs(g - b) < 12) continue; // shadow
      w += ink;
      x += col * ink;
      y += row * ink;
      if (r > 215 && b > 130 && b > g + 8 && g > 95 && g < 220) {
        an++;
        ax += col;
        ay += row;
      }
    }
  }
  return { x: x / w, y: y / w, ax: ax / an, ay: ay / an };
}

const frames = [];
for (let p = REST; p <= LAST; p++) frames.push(await read(p));

/** Shares of the composition's width, measured from where the bee sits. */
const path = frames.map((f) => ({
  x: (f.x - HOME.x) / WIDTH,
  y: (f.y - HOME.y) / WIDTH,
  ax: (f.ax - HOME.x) / WIDTH,
  ay: (f.ay - HOME.y) / WIDTH,
}));
// The bee has not moved yet in the first frame, whatever the centroid says.
path[0].x = 0;
path[0].y = 0;

/** A three-tap pass, endpoints held. See the note above on why. */
function smooth(key, passes) {
  for (let k = 0; k < passes; k++) {
    const was = path.map((p) => p[key]);
    for (let i = 1; i < path.length - 1; i++) {
      path[i][key] = 0.25 * was[i - 1] + 0.5 * was[i] + 0.25 * was[i + 1];
    }
  }
}
smooth("x", 2);
smooth("y", 2);
smooth("ax", 3);
smooth("ay", 3);

/** Heading, unwrapped, so the loops accumulate instead of jumping at 180. */
let turn = 0;
let prev = 0;
const deg = path.map((p, i) => {
  if (i === 0) return 0;
  const a = (Math.atan2(p.ax - p.x, -(p.ay - p.y)) * 180) / Math.PI;
  let d = a + turn;
  while (d - prev > 180) {
    turn -= 360;
    d -= 360;
  }
  while (d - prev < -180) {
    turn += 360;
    d += 360;
  }
  prev = d;
  return d;
});

/**
 * The exit. The source's frame runs out long before a browser window does,
 * so the last heading is carried on in `vmax` — far enough to leave any
 * viewport — rather than in a distance guessed for one of them.
 */
const n = path.length;
const tail = {
  x: path[n - 1].x - path[n - 4].x,
  y: path[n - 1].y - path[n - 4].y,
};
const len = Math.hypot(tail.x, tail.y);
const EXIT_VMAX = 90;
const exit = { x: (tail.x / len) * EXIT_VMAX, y: (tail.y / len) * EXIT_VMAX };

const total = (n - 1) * DELAY + EXIT_MS;
const at = (ms) => `${((ms / total) * 100).toFixed(3).replace(/\.?0+$/, "")}%`;
const d = (v) => v.toFixed(3).replace(/\.?0+$/, "") || "0";

const lines = [];
lines.push(
  `/* ${n} stops, ${DELAY}ms apart, straight off the reference, then the exit. */`,
);
lines.push(`@keyframes ibm-ebm-fly {`);
for (let i = 0; i < n; i++) {
  const ease =
    i === n - 1
      ? "\n    animation-timing-function: cubic-bezier(0.5, 0.11, 0.85, 1);"
      : "";
  lines.push(
    `  ${at(i * DELAY)} {\n    transform: translate(calc(var(--ibm-fly) * ${d(path[i].x)}), calc(var(--ibm-fly) * ${d(path[i].y)}))\n      rotate(${deg[i].toFixed(1)}deg);${ease}\n  }`,
  );
}
lines.push(
  `  100% {\n    transform: translate(calc(var(--ibm-fly) * ${d(path[n - 1].x)} + ${exit.x.toFixed(1)}vmax), calc(var(--ibm-fly) * ${d(path[n - 1].y)} + ${exit.y.toFixed(1)}vmax))\n      rotate(${deg[n - 1].toFixed(1)}deg);\n  }`,
);
lines.push(`}`);

console.log(lines.join("\n"));
console.error(
  `\n${n} samples, ${(n - 1) * DELAY}ms of path + ${EXIT_MS}ms exit = ${total}ms` +
    `\nturn ${(deg[n - 1] - deg[0]).toFixed(0)}deg` +
    `\nx ${Math.min(...path.map((p) => p.x)).toFixed(2)} to ${Math.max(...path.map((p) => p.x)).toFixed(2)}` +
    ` widths, y ${Math.min(...path.map((p) => p.y)).toFixed(2)} to ${Math.max(...path.map((p) => p.y)).toFixed(2)}`,
);
