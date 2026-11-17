/**
 * Hand-drawn outlines for the capsule machine.
 *
 * Every shape is sampled into points, each point is nudged by a seeded random
 * offset, and the points are joined with a closed Catmull-Rom curve. The seed
 * keeps a shape identical between server and client renders, so React does not
 * see a hydration mismatch, while two passes with different seeds give the
 * slightly doubled line of a quick ink sketch.
 */

type Pt = [number, number];

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

function closedCurve(pts: Pt[]): string {
  const n = pts.length;
  let d = `M${r1(pts[0][0])},${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])},${r1(c1[1])} ${r1(c2[0])},${r1(c2[1])} ${r1(p2[0])},${r1(p2[1])}`;
  }
  return d + "Z";
}

/** A wobbly ellipse. `jitter` is a fraction of the radius. */
export function sketchEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  jitter = 0.025,
): string {
  const rand = rng(seed);
  const n = 14;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.08;
    const k = 1 + (rand() - 0.5) * 2 * jitter;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return closedCurve(pts);
}

/** A wobbly rounded rectangle. `jitter` is in user units. */
export function sketchRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  seed: number,
  jitter = 1.6,
): string {
  const rand = rng(seed);
  const pts: Pt[] = [];
  const corner = (cx: number, cy: number, start: number) => {
    for (let i = 0; i <= 2; i++) {
      const a = start + (i / 2) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  };
  const edge = (ax: number, ay: number, bx: number, by: number) => {
    const len = Math.hypot(bx - ax, by - ay);
    const steps = Math.max(1, Math.floor(len / 40));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      pts.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
    }
  };
  corner(x + w - r, y + r, -Math.PI / 2);
  edge(x + w, y + r, x + w, y + h - r);
  corner(x + w - r, y + h - r, 0);
  edge(x + w - r, y + h, x + r, y + h);
  corner(x + r, y + h - r, Math.PI / 2);
  edge(x, y + h - r, x, y + r);
  corner(x + r, y + r, Math.PI);
  edge(x + r, y, x + w - r, y);
  return closedCurve(
    pts.map(([px, py]) => [px + (rand() - 0.5) * 2 * jitter, py + (rand() - 0.5) * 2 * jitter]),
  );
}
