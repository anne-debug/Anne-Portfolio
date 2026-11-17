/**
 * Replays a hero artwork being made on a canvas laid over the picture.
 *
 * One hand, one mark at a time: a stroke finishes, the hand lifts, moves on,
 * and puts down the next. Nothing is laid over the picture in coats. Each
 * stroke uncovers the real artwork underneath along its own path, so what
 * appears is the actual graphite, ink or pastel, arriving where the hand goes.
 *
 * Each piece follows its own medium's process, with its own rhythm:
 *
 * - pencil    the child portrait: a few slower contour lines to find the
 *             shapes, then quick zigzag hatching, patch after patch, each one
 *             a single back-and-forth flick of the pencil
 * - ink       the rooster: loaded brush strokes, one at a time with a pause to
 *             reload, ink bleeding out a little after each; then the thin
 *             branch lines, the pale wash, and the red last
 * - pastel    the portrait: one stick at a time, so the piece is built colour
 *             by colour, short grainy strokes, with a pause to pick up the next
 * - scribble  the framed piece: the frame and mat stay put as objects; only
 *             the picture inside is scribbled in, row after row of loops
 *
 * Every mark's place, direction and order come from the finished picture.
 */

export type BuildStyle = "pencil" | "ink" | "pastel" | "scribble";

/** How long each piece takes to make, in ms. */
export const BUILD_MS: Record<BuildStyle, number> = {
  pencil: 2670,
  ink: 2800,
  pastel: 2670,
  scribble: 2330,
};

const PAPER = "#f3efe6";
/** Long side of the picture the marks are planned on, in analysis pixels. */
const PLAN = 170;

/** The finished picture lifts off over this long, at the start. */
const LIFT_MS = 100;
/** Whatever the strokes left uncovered settles in over this long, at the end. */
const SETTLE_MS = 150;

type Pt = [number, number];

interface Analysis {
  w: number;
  h: number;
  rgba: Uint8ClampedArray;
  lum: Float32Array;
  gx: Float32Array;
  gy: Float32Array;
  /** Traced edges, longest first. */
  chains: Pt[][];
}

type Kind = "solid" | "brush" | "grain";

/** A planned stroke, in analysis pixels. */
interface Draft {
  pts: Pt[];
  width: number;
  kind: Kind;
  /** How slowly the hand moves along it, in ms per analysis pixel. */
  pace: number;
  /** The pause before it: the hand lifting and travelling, in ms. */
  lift: number;
  /** Ink spreading into the paper once the stroke is down. */
  bloom?: boolean;
  /**
   * Thin lines laid down together by the one movement, each `o` analysis
   * pixels to the side of the path and `w` wide: the parallel lines of a
   * hatch, the hairs of a brush, the edges of a pastel stick. Without it the
   * stroke is a single line `width` wide.
   */
  bundle?: Line[];
}

interface Line {
  o: number;
  w: number;
}

interface Mark {
  pts: Pt[];
  /** Length along the stroke at each point. */
  at: number[];
  width: number;
  bundle: Line[];
  kind: Kind;
  alpha: number;
  start: number;
  dur: number;
  drawn: number;
  /** Where this stroke meets the paper's tooth, so overlaps fill the gaps. */
  tooth: DOMMatrix | null;
}

interface Cell {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  dark: number;
  sat: number;
  /** Direction along the local edge, in radians. */
  along: number;
}

const analyses = new WeakMap<HTMLImageElement, Analysis>();

function canvas(width: number, height: number) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  return c;
}

function context(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  return ctx;
}

function random(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Reading the finished picture                                         */
/* ------------------------------------------------------------------ */

function analyse(img: HTMLImageElement): Analysis {
  const hit = analyses.get(img);
  if (hit) return hit;

  const scale = PLAN / Math.max(img.naturalWidth, img.naturalHeight);
  const w = Math.max(8, Math.round(img.naturalWidth * scale));
  const h = Math.max(8, Math.round(img.naturalHeight * scale));
  const c = canvas(w, h);
  const ctx = context(c);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  const rgba = ctx.getImageData(0, 0, w, h).data;

  const n = w * h;
  const lum = new Float32Array(n);
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const a = rgba[p + 3] / 255;
    const l = 0.299 * rgba[p] + 0.587 * rgba[p + 1] + 0.114 * rgba[p + 2];
    lum[i] = l * a + 243 * (1 - a);
  }

  const gx = new Float32Array(n);
  const gy = new Float32Array(n);
  const mag = new Float32Array(n);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      gx[i] =
        lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1] -
        lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1];
      gy[i] =
        lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1] -
        lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1];
      mag[i] = Math.hypot(gx[i], gy[i]);
    }
  }

  // The edge threshold adapts to each picture: the strongest ~12%.
  const sample: number[] = [];
  for (let i = 0; i < n; i++) if (rgba[i * 4 + 3] > 128 || mag[i] > 0) sample.push(mag[i]);
  sample.sort((a, b) => a - b);
  const threshold = Math.max(40, sample[Math.floor(sample.length * 0.88)] ?? 80);

  // Thin to one-pixel lines: keep a pixel only where it peaks across the edge.
  const edge = new Uint8Array(n);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (mag[i] < threshold) continue;
      const ang = Math.atan2(gy[i], gx[i]);
      const dx = Math.round(Math.cos(ang));
      const dy = Math.round(Math.sin(ang));
      if (mag[i] >= mag[i + dy * w + dx] && mag[i] >= mag[i - dy * w - dx]) edge[i] = 1;
    }
  }

  const chains = trace(edge, w, h);
  const result = { w, h, rgba, lum, gx, gy, chains };
  analyses.set(img, result);
  return result;
}

/** Follows thinned edges into polylines, preferring to keep going straight. */
function trace(edge: Uint8Array, w: number, h: number): Pt[][] {
  const seen = new Uint8Array(w * h);
  const chains: Pt[][] = [];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i0 = y * w + x;
      if (!edge[i0] || seen[i0]) continue;
      const chain: Pt[] = [[x, y]];
      seen[i0] = 1;
      let cx = x;
      let cy = y;
      let pdx = 0;
      let pdy = 0;
      for (;;) {
        let best = -1;
        let bx = 0;
        let by = 0;
        let score = -Infinity;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 1 || ny < 1 || nx >= w - 1 || ny >= h - 1) continue;
            const j = ny * w + nx;
            if (!edge[j] || seen[j]) continue;
            const s = dx * pdx + dy * pdy - (dx && dy ? 0.2 : 0);
            if (s > score) {
              score = s;
              best = j;
              bx = dx;
              by = dy;
            }
          }
        }
        if (best < 0) break;
        seen[best] = 1;
        cx += bx;
        cy += by;
        pdx = bx;
        pdy = by;
        chain.push([cx, cy]);
      }
      if (chain.length >= 6) chains.push(smooth(chain));
    }
  }
  chains.sort((a, b) => b.length - a.length);
  return chains;
}

function smooth(pts: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (let k = 0; k < pts.length; k += 2) {
    let sx = 0;
    let sy = 0;
    let c = 0;
    for (let j = Math.max(0, k - 2); j <= Math.min(pts.length - 1, k + 2); j++) {
      sx += pts[j][0];
      sy += pts[j][1];
      c++;
    }
    out.push([sx / c, sy / c]);
  }
  const last = pts[pts.length - 1];
  out.push([last[0], last[1]]);
  return out;
}

/** Colour, darkness and edge direction averaged over a square of the picture. */
function cellsOf(a: Analysis, size: number, rand: () => number): Cell[] {
  const cells: Cell[] = [];
  for (let cy = 0; cy < a.h; cy += size) {
    for (let cx = 0; cx < a.w; cx += size) {
      let r = 0;
      let g = 0;
      let b = 0;
      let l = 0;
      let sgx = 0;
      let sgy = 0;
      let n = 0;
      let opaque = 0;
      for (let y = cy; y < Math.min(a.h, cy + size); y++) {
        for (let x = cx; x < Math.min(a.w, cx + size); x++) {
          const i = y * a.w + x;
          const p = i * 4;
          n++;
          if (a.rgba[p + 3] < 128) continue;
          opaque++;
          r += a.rgba[p];
          g += a.rgba[p + 1];
          b += a.rgba[p + 2];
          l += a.lum[i];
          // Double-angle average, so opposite gradients do not cancel.
          const ang = Math.atan2(a.gy[i], a.gx[i]);
          const m = Math.hypot(a.gx[i], a.gy[i]);
          sgx += Math.cos(2 * ang) * m;
          sgy += Math.sin(2 * ang) * m;
        }
      }
      if (opaque < n * 0.5) continue;
      r /= opaque;
      g /= opaque;
      b /= opaque;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      cells.push({
        x: Math.min(a.w - 1, cx + size / 2 + (rand() - 0.5) * size * 0.6),
        y: Math.min(a.h - 1, cy + size / 2 + (rand() - 0.5) * size * 0.6),
        r,
        g,
        b,
        dark: 1 - l / opaque / 255,
        sat: max > 0 ? (max - min) / max : 0,
        along: Math.atan2(sgy, sgx) / 2 + Math.PI / 2,
      });
    }
  }
  return cells;
}

/* ------------------------------------------------------------------ */
/* Planning the marks                                                   */
/* ------------------------------------------------------------------ */

const dist2 = (p: Pt, q: Pt) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;

/** Strokes in the order a hand reaches them: always the nearest next. */
function travel(strokes: Pt[][], from: Pt, flip = true): Pt[][] {
  const pool = strokes.map((s) => s.slice());
  const out: Pt[][] = [];
  let at = from;
  while (pool.length) {
    let best = 0;
    let reverse = false;
    let d = Infinity;
    pool.forEach((s, i) => {
      const ds = dist2(s[0], at);
      if (ds < d) {
        d = ds;
        best = i;
        reverse = false;
      }
      if (flip) {
        const de = dist2(s[s.length - 1], at);
        if (de < d) {
          d = de;
          best = i;
          reverse = true;
        }
      }
    });
    const s = pool.splice(best, 1)[0];
    if (reverse) s.reverse();
    out.push(s);
    at = s[s.length - 1];
  }
  return out;
}

const endOf = (strokes: Pt[][], fallback: Pt): Pt =>
  strokes.length ? strokes[strokes.length - 1][strokes[strokes.length - 1].length - 1] : fallback;

function rotate(cx: number, cy: number, angle: number, u: number, v: number): Pt {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [cx + u * c - v * s, cy + u * s + v * c];
}

/** A slightly bowed straight stroke centred on a point. */
function line(x: number, y: number, angle: number, length: number, bend = 0): Pt[] {
  const pts: Pt[] = [];
  for (let k = 0; k <= 6; k++) {
    const u = k / 6 - 0.5;
    pts.push(rotate(x, y, angle, u * length, bend * (0.25 - u * u)));
  }
  return pts;
}

/** One back-and-forth flick of hatching covering a square patch. */
function zigzag(x: number, y: number, angle: number, size: number, gap: number, rand: () => number): Pt[] {
  const pts: Pt[] = [];
  const rows = Math.ceil(size / gap);
  for (let r = 0; r <= rows; r++) {
    const side = r % 2 ? 0.5 : -0.5;
    const u = side * size * (0.85 + rand() * 0.3);
    const v = -size / 2 + r * gap + (rand() - 0.5) * gap * 0.4;
    pts.push(rotate(x, y, angle, u, v));
  }
  return pts;
}

/** A tangle of loops worked round and round over one spot. */
function tangle(x: number, y: number, radius: number, rand: () => number): Pt[] {
  const pts: Pt[] = [];
  const turns = 2.5 + rand() * 1.5;
  const steps = Math.round(turns * 9);
  const spin = rand() < 0.5 ? 1 : -1;
  const squash = 0.55 + rand() * 0.35;
  const tilt = rand() * Math.PI;
  let cx = (rand() - 0.5) * radius * 0.6;
  let cy = (rand() - 0.5) * radius * 0.6;
  for (let k = 0; k <= steps; k++) {
    const t = spin * (k / 9) * Math.PI * 2;
    cx += (rand() - 0.5) * radius * 0.35;
    cy += (rand() - 0.5) * radius * 0.35;
    cx *= 0.8;
    cy *= 0.8;
    const r = radius * (0.6 + 0.4 * rand());
    const [u, v] = [Math.cos(t) * r, Math.sin(t) * r * squash];
    pts.push([x + cx + u * Math.cos(tilt) - v * Math.sin(tilt), y + cy + u * Math.sin(tilt) + v * Math.cos(tilt)]);
  }
  return pts;
}

/** Groups cells into the few colours a pastel box would be reached into for. */
function sticks(cells: Cell[], k: number, rand: () => number): Cell[][] {
  if (!cells.length) return [];
  const centres = Array.from({ length: k }, () => cells[Math.floor(rand() * cells.length)]).map((c) => [c.r, c.g, c.b]);
  let groups: Cell[][] = [];
  for (let it = 0; it < 8; it++) {
    groups = centres.map(() => []);
    for (const c of cells) {
      let best = 0;
      let d = Infinity;
      centres.forEach((m, i) => {
        const e = (c.r - m[0]) ** 2 + (c.g - m[1]) ** 2 + (c.b - m[2]) ** 2;
        if (e < d) {
          d = e;
          best = i;
        }
      });
      groups[best].push(c);
    }
    groups.forEach((g, i) => {
      if (!g.length) return;
      centres[i] = [
        g.reduce((s, c) => s + c.r, 0) / g.length,
        g.reduce((s, c) => s + c.g, 0) / g.length,
        g.reduce((s, c) => s + c.b, 0) / g.length,
      ];
    });
  }
  return groups.filter((g) => g.length).sort((p, q) => q.length - p.length);
}

/**
 * The saturated picture inside a frame and mat, in analysis pixels: the rows
 * and columns that are mostly colour. Stray reflections in the frame or mat
 * do not count.
 */
function paintedBox(a: Analysis) {
  const rows = new Float32Array(a.h);
  const cols = new Float32Array(a.w);
  for (let y = 0; y < a.h; y++) {
    for (let x = 0; x < a.w; x++) {
      const p = (y * a.w + x) * 4;
      const max = Math.max(a.rgba[p], a.rgba[p + 1], a.rgba[p + 2]);
      const min = Math.min(a.rgba[p], a.rgba[p + 1], a.rgba[p + 2]);
      // Near-black edges read as saturated too; real colour has some light.
      if (a.rgba[p + 3] > 128 && max > 90 && (max - min) / max > 0.3) {
        rows[y]++;
        cols[x]++;
      }
    }
  }
  // The longest unbroken run of mostly-colour rows (or columns).
  const span = (v: Float32Array) => {
    const cut = Math.max(...v) * 0.35;
    let best = [0, v.length];
    let bestLen = 0;
    for (let i = 0; i < v.length; ) {
      if (v[i] < cut) {
        i++;
        continue;
      }
      let j = i;
      while (j < v.length && v[j] >= cut) j++;
      if (j - i > bestLen) {
        bestLen = j - i;
        best = [i, j];
      }
      i = j;
    }
    return best;
  };
  const [y0, y1] = span(rows);
  const [x0, x1] = span(cols);
  if (x1 - x0 < 8 || y1 - y0 < 8) return { x0: 0, y0: 0, x1: a.w, y1: a.h };
  return { x0, y0, x1, y1 };
}

const draft = (pts: Pt[], d: Omit<Draft, "pts">): Draft => ({ pts, ...d });

/** `n` thin lines of width `w`, spread evenly across `across`, a little uneven. */
function spread(n: number, across: number, w: number, rand: () => number): Line[] {
  return Array.from({ length: n }, (_, i) => ({
    o: (n > 1 ? (i / (n - 1) - 0.5) * across : 0) + (rand() - 0.5) * (across / n) * 0.3,
    w: w * (0.8 + rand() * 0.4),
  }));
}

/**
 * The finest grid of cells that gives no more than `target` cells passing
 * `keep`, so a fixed number of strokes still covers the picture: fewer
 * strokes means bigger ones.
 */
function fitCells(a: Analysis, target: number, rand: () => number, keep: (c: Cell) => boolean = () => true) {
  for (let size = 4; size < Math.max(a.w, a.h); size++) {
    const cells = cellsOf(a, size, rand).filter(keep);
    if (cells.length <= Math.max(1, target)) return { cells, size };
  }
  return { cells: [] as Cell[], size: Math.max(a.w, a.h) };
}

/** Time each stroke should get so it is seen being drawn, not popping in. */
const STROKE_MS = 105;

function plan(style: BuildStyle, a: Analysis, rand: () => number, span: number): Draft[] {
  const jitter = (r: number) => (rand() - 0.5) * r;
  const origin: Pt = [a.w * 0.3, 0];
  // How many strokes the time allows, each long enough to watch.
  const budget = Math.max(8, Math.floor(span / STROKE_MS));

  if (style === "pencil") {
    // Finding the shapes: a few of the longest edges, one after another.
    const nOutline = Math.max(3, Math.round(budget * 0.2));
    const outline = travel(a.chains.filter((c) => c.length >= 10).slice(0, nOutline), origin);
    // Then hatching, a quick zigzag flick per patch, over the whole sheet so
    // nothing is left to fade in. Dark patches follow the form; the rest go on
    // the hand's natural diagonal.
    const { cells, size } = fitCells(a, budget - outline.length, rand);
    const gap = Math.max(2.6, size / 6);
    const patches = cells.map((c) =>
      zigzag(c.x, c.y, c.dark > 0.45 ? c.along + jitter(0.3) : -0.95 + jitter(0.35), size * 1.3, gap, rand),
    );
    const hatch = travel(patches, endOf(outline, origin), false);
    return [
      ...outline.map((pts) => draft(pts, { width: 1, kind: "solid", pace: 5, lift: 90 })),
      // Each flick lays three fine parallel lines, a lead's width apart.
      ...hatch.map((pts) =>
        draft(pts, { width: gap * 0.55, kind: "solid", pace: 1.6, lift: 120, bundle: spread(3, gap * 1.0, gap * 0.55, rand) }),
      ),
    ];
  }

  if (style === "ink") {
    const red = (c: Cell) => c.sat > 0.3 && c.dark < 0.75;
    const nTwigs = Math.max(3, Math.round(budget * 0.2));
    const nWash = Math.max(2, Math.round(budget * 0.15));
    const nRed = 2;
    const nBody = Math.max(4, budget - nTwigs - nWash - nRed);
    const brush = (c: Cell, len: number) => line(c.x, c.y, c.along + jitter(0.5), len, jitter(len * 0.3));
    // A brush body less than half the old width, with a hair or two either
    // side that the bristles drag along.
    const hairs = (w: number): Line[] => [
      { o: 0, w: w * 0.45 },
      { o: w * 0.34, w: w * 0.14 },
      { o: -w * 0.32, w: w * 0.16 },
      { o: w * (0.5 + jitter(0.1)), w: w * 0.08 },
      { o: -w * (0.5 + jitter(0.1)), w: w * 0.08 },
    ];

    const masses = fitCells(a, nBody, rand, (c) => !red(c) && c.dark > 0.3);
    // Start where the ink is heaviest, then work outward from there.
    masses.cells.sort((p, q) => q.dark - p.dark);
    const start: Pt = masses.cells.length ? [masses.cells[0].x, masses.cells[0].y] : origin;
    const body = travel(masses.cells.map((c) => brush(c, masses.size * (2.1 + 1.0 * c.dark))), start, false);
    const twigs = travel(a.chains.filter((c) => c.length >= 8).slice(0, nTwigs), endOf(body, start));
    const pale = fitCells(a, nWash, rand, (c) => !red(c) && c.dark > 0.13 && c.dark <= 0.3);
    const wash = travel(pale.cells.map((c) => brush(c, pale.size * 2.4)), endOf(twigs, start), false);
    const comb = fitCells(a, nRed, rand, red);
    const accents = travel(comb.cells.map((c) => brush(c, comb.size * 1.2)), endOf(wash, start), false);
    return [
      ...body.map((pts) =>
        draft(pts, { width: masses.size * 0.95, kind: "brush", pace: 9, lift: 200, bloom: true, bundle: hairs(masses.size * 0.95) }),
      ),
      ...twigs.map((pts) => draft(pts, { width: 1.1, kind: "brush", pace: 5, lift: 110 })),
      ...wash.map((pts) =>
        draft(pts, { width: pale.size * 1.1, kind: "brush", pace: 5, lift: 120, bloom: true, bundle: hairs(pale.size * 1.1) }),
      ),
      ...accents.map((pts, i) =>
        draft(pts, { width: comb.size * 0.9, kind: "brush", pace: 14, lift: i ? 150 : 600, bloom: true, bundle: hairs(comb.size * 0.9) }),
      ),
    ];
  }

  if (style === "pastel") {
    const out: Draft[] = [];
    let at = origin;
    const { cells, size } = fitCells(a, budget, rand);
    for (const group of sticks(cells, 4, rand)) {
      const strokes = travel(
        group.map((c) => line(c.x, c.y, c.along + jitter(0.7), size * (2.3 + jitter(0.4)), jitter(size * 0.4))),
        at,
      );
      // Putting one stick down and picking up the next.
      // The edge of the stick: four thin, broken lines dragged side by side.
      strokes.forEach((pts, i) =>
        out.push(
          draft(pts, {
            width: size * 0.42,
            kind: "grain",
            pace: 2.2,
            lift: i ? 30 : 650,
            bundle: spread(4, size * 1.2, size * 0.42, rand),
          }),
        ),
      );
      at = endOf(strokes, at);
    }
    return out;
  }

  // scribble: only the picture inside the frame, tangle after tangle of
  // loops, spreading out from the middle the way the drawing grew.
  const box = paintedBox(a);
  const step = Math.max(8, Math.sqrt(((box.x1 - box.x0) * (box.y1 - box.y0)) / budget));
  const spots: Pt[][] = [];
  for (let y = box.y0 + step / 2; y < box.y1 + step / 3; y += step) {
    for (let x = box.x0 + step / 2; x < box.x1 + step / 3; x += step) {
      const r = step * 0.38;
      spots.push(tangle(Math.min(x + jitter(r), box.x1 - 3), Math.min(y + jitter(r), box.y1 - 3), step * 0.8, rand));
    }
  }
  const middle: Pt = [(box.x0 + box.x1) / 2, (box.y0 + box.y1) * 0.45];
  return travel(spots, middle, false).map((pts) =>
    draft(pts, { width: step * 0.18, kind: "grain", pace: 1.1, lift: 70, bundle: spread(2, step * 0.22, step * 0.18, rand) }),
  );
}

/**
 * Lays the strokes on one timeline, each starting when the hand is free, and
 * fits the whole thing into `span`. Every stroke gets close to an equal share,
 * nudged up for longer strokes, so even the shortest is still seen being drawn.
 * The pauses between strokes share what is left over.
 */
function sequence(drafts: Draft[], from: number, span: number, rand: () => number): Mark[] {
  const measured = drafts.map((d) => {
    const at = [0];
    for (let k = 1; k < d.pts.length; k++) {
      at.push(at[k - 1] + Math.hypot(d.pts[k][0] - d.pts[k - 1][0], d.pts[k][1] - d.pts[k - 1][1]));
    }
    return { d, at, len: at[at.length - 1] };
  });
  const effort = measured.map((m) => m.len * m.d.pace);
  const mean = effort.reduce((s, e) => s + e, 0) / Math.max(1, effort.length);
  const weight = effort.map((e) => 0.85 + 0.15 * Math.min(2.5, mean > 0 ? e / mean : 1));
  const totalWeight = weight.reduce((s, w) => s + w, 0) || 1;
  const totalLift = measured.reduce((s, m) => s + m.d.lift, 0) || 1;
  const drawing = span * 0.85;
  const pausing = span - drawing;
  const marks: Mark[] = [];
  let t = from;
  measured.forEach(({ d, at }, i) => {
    t += (d.lift / totalLift) * pausing;
    const dur = (weight[i] / totalWeight) * drawing;
    let tooth: DOMMatrix | null = null;
    if (d.kind === "grain") {
      const [x0, y0] = d.pts[0];
      const [x1, y1] = d.pts[d.pts.length - 1];
      const deg = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
      tooth = new DOMMatrix().translateSelf(rand() * 97, rand() * 97).rotateSelf(deg);
    }
    const bundle = d.bundle ?? [{ o: 0, w: d.width }];
    marks.push({ pts: d.pts, at, width: d.width, bundle, kind: d.kind, alpha: 1, start: t, dur, drawn: 0, tooth });
    if (d.bloom) {
      // Off the hand's clock: the wet stroke keeps spreading as the hand moves on.
      const wide = d.width * 1.2;
      marks.push({ pts: d.pts, at, width: wide, bundle: [{ o: 0, w: wide }], kind: "brush", alpha: 0.4, start: t + dur, dur: 95, drawn: 0, tooth: null });
    }
    t += dur;
  });
  return marks.sort((p, q) => p.start - q.start);
}

/* ------------------------------------------------------------------ */
/* Drawing                                                              */
/* ------------------------------------------------------------------ */

/** Speckle that a grainy stroke is drawn with, like pastel on toothy paper. */
function grainPattern(ctx: CanvasRenderingContext2D, scale: number, rand: () => number) {
  const size = 128;
  const tile = canvas(size, size);
  const t = context(tile);
  // Short dashes along the stroke: the stick catching the top of the tooth.
  const dot = Math.max(1, Math.round(scale * 0.7));
  for (let y = 0; y < size; y += dot) {
    let x = Math.floor(rand() * 4) * dot;
    while (x < size) {
      const run = (2 + Math.floor(rand() * 5)) * dot;
      t.fillStyle = `rgba(0,0,0,${0.8 + rand() * 0.2})`;
      t.fillRect(x, y, run, dot);
      x += run + (1 + Math.floor(rand() * 2)) * dot;
    }
  }
  return ctx.createPattern(tile, "repeat");
}

/** Draws the stretch of a stroke from length `from` to length `to`. */
function drawStretch(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  from: number,
  to: number,
  sx: number,
  sy: number,
  grain: CanvasPattern | null,
) {
  const total = m.at[m.at.length - 1] || 1;
  const scale = (sx + sy) / 2;
  ctx.globalAlpha = m.alpha;
  if (m.kind === "grain" && grain) {
    grain.setTransform(m.tooth ?? new DOMMatrix());
    ctx.strokeStyle = grain;
  } else {
    ctx.strokeStyle = "#000";
  }
  for (let k = 0; k < m.pts.length - 1; k++) {
    const a0 = m.at[k];
    const a1 = m.at[k + 1];
    if (a1 <= from || a0 >= to || a1 === a0) continue;
    const u0 = (Math.max(from, a0) - a0) / (a1 - a0);
    const u1 = (Math.min(to, a1) - a0) / (a1 - a0);
    const [x0, y0] = m.pts[k];
    const [x1, y1] = m.pts[k + 1];
    let taper = 1;
    if (m.kind === "brush") {
      // Pressed in the middle, lifting off at both ends; the hairs close in.
      const u = (a0 + (u0 + u1) * 0.5 * (a1 - a0)) / total;
      taper = 0.2 + 0.8 * Math.sin(Math.PI * u) ** 0.5;
    }
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    const nx = -(y1 - y0) / len;
    const ny = (x1 - x0) / len;
    const ax = x0 + (x1 - x0) * u0;
    const ay = y0 + (y1 - y0) * u0;
    const bx = x0 + (x1 - x0) * u1;
    const by = y0 + (y1 - y0) * u1;
    for (const line of m.bundle) {
      const o = line.o * taper;
      ctx.lineWidth = Math.max(0.6, line.w * taper * scale);
      ctx.beginPath();
      ctx.moveTo((ax + nx * o) * sx, (ay + ny * o) * sy);
      ctx.lineTo((bx + nx * o) * sx, (by + ny * o) * sy);
      ctx.stroke();
    }
  }
}

/**
 * The bare paper under the picture, with the marks taken off: the lightest
 * colours in each patch, with patches that are all ink filled in from their
 * neighbours. It keeps the photo's own paper tone and its falloff, so paper
 * the hand never touches already matches the finished piece.
 */
function paperPlate(a: Analysis, flat = false) {
  const size = 8;
  const gw = Math.ceil(a.w / size);
  const gh = Math.ceil(a.h / size);
  const col = new Float32Array(gw * gh * 3);
  const lum = new Float32Array(gw * gh).fill(-1);
  for (let cy = 0; cy < gh; cy++) {
    for (let cx = 0; cx < gw; cx++) {
      const pick: number[] = [];
      for (let y = cy * size; y < Math.min(a.h, cy * size + size); y++) {
        for (let x = cx * size; x < Math.min(a.w, cx * size + size); x++) {
          const i = y * a.w + x;
          const p = i * 4;
          const max = Math.max(a.rgba[p], a.rgba[p + 1], a.rgba[p + 2]);
          const min = Math.min(a.rgba[p], a.rgba[p + 1], a.rgba[p + 2]);
          // Coloured paint is a mark too, however light.
          if (a.rgba[p + 3] > 200 && (max === 0 || (max - min) / max < 0.25)) pick.push(i);
        }
      }
      if (pick.length < 4) continue;
      pick.sort((p, q) => a.lum[q] - a.lum[p]);
      const top = pick.slice(0, Math.max(1, Math.ceil(pick.length * 0.15)));
      const g = cy * gw + cx;
      for (let o = 0; o < 3; o++) col[g * 3 + o] = top.reduce((s, i) => s + a.rgba[i * 4 + o], 0) / top.length;
      lum[g] = top.reduce((s, i) => s + a.lum[i], 0) / top.length;
    }
  }
  const known = [...lum].filter((l) => l >= 0).sort((p, q) => q - p);
  const paper = known[Math.floor(known.length * 0.3)] ?? 240;
  // Patches well below the paper tone are solid marks: forget them.
  const ok = new Uint8Array(gw * gh);
  lum.forEach((l, g) => (ok[g] = l >= 0 && l > paper - 45 ? 1 : 0));
  if (flat) {
    // Graphite tones the whole sheet, so no patch is bare: use the paper's
    // own colour, evenly.
    const mean = [0, 0, 0];
    let n = 0;
    lum.forEach((l, g) => {
      if (l < paper) return;
      for (let o = 0; o < 3; o++) mean[o] += col[g * 3 + o];
      n++;
    });
    for (let g = 0; g < gw * gh; g++) {
      for (let o = 0; o < 3; o++) col[g * 3 + o] = n ? mean[o] / n : 243;
      ok[g] = 1;
    }
  }
  for (let pass = 0; pass < gw + gh; pass++) {
    let missing = 0;
    const next = ok.slice();
    for (let g = 0; g < gw * gh; g++) {
      if (ok[g]) continue;
      missing++;
      const cx = g % gw;
      const cy = Math.floor(g / gw);
      const sum = [0, 0, 0];
      let n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= gw || y >= gh || !ok[y * gw + x]) continue;
        for (let o = 0; o < 3; o++) sum[o] += col[(y * gw + x) * 3 + o];
        n++;
      }
      if (!n) continue;
      for (let o = 0; o < 3; o++) col[g * 3 + o] = sum[o] / n;
      next[g] = 1;
    }
    ok.set(next);
    if (!missing) break;
  }
  const plate = canvas(gw, gh);
  const pctx = context(plate);
  const img = pctx.createImageData(gw, gh);
  for (let g = 0; g < gw * gh; g++) {
    for (let o = 0; o < 3; o++) img.data[g * 4 + o] = ok[g] ? col[g * 3 + o] : 243;
    img.data[g * 4 + 3] = 255;
  }
  pctx.putImageData(img, 0, 0);
  return plate;
}

/** The lightest of the picture's own colours outside a box: the mat. */
function matColour(a: Analysis, box: { x0: number; y0: number; x1: number; y1: number }) {
  const pick: number[] = [];
  for (let y = 0; y < a.h; y++) {
    for (let x = 0; x < a.w; x++) {
      if (x >= box.x0 - 2 && x < box.x1 + 2 && y >= box.y0 - 2 && y < box.y1 + 2) continue;
      const i = y * a.w + x;
      if (a.rgba[i * 4 + 3] > 200) pick.push(i);
    }
  }
  if (!pick.length) return PAPER;
  pick.sort((p, q) => a.lum[q] - a.lum[p]);
  const top = pick.slice(0, Math.max(1, Math.floor(pick.length * 0.1)));
  const avg = (o: number) => Math.round(top.reduce((s, i) => s + a.rgba[i * 4 + o], 0) / top.length);
  return `rgb(${avg(0)},${avg(1)},${avg(2)})`;
}

const smoothstep = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export interface BuildHandle {
  cancel: () => void;
  done: Promise<void>;
}

/**
 * Plays the build on `target`, which must already be sized and placed over
 * the picture. Resolves when the last frame, the finished picture, is drawn.
 */
export function playPaintingBuild(
  target: HTMLCanvasElement,
  img: HTMLImageElement,
  style: BuildStyle,
  duration = BUILD_MS[style],
): BuildHandle {
  const { width, height } = target;
  const a = analyse(img);
  const rand = random(Math.floor(Math.random() * 1e9));
  const sx = width / a.w;
  const sy = height / a.h;

  const span = Math.max(1000, duration - LIFT_MS - SETTLE_MS);
  const marks = sequence(plan(style, a, rand, span), LIFT_MS, span, rand);

  const full = canvas(width, height);
  const fctx = context(full);
  fctx.imageSmoothingQuality = "high";
  fctx.drawImage(img, 0, 0, width, height);

  // What the hand starts on: blank paper in the artwork's own outline. A
  // framed piece keeps its frame and mat; only the picture inside is blank.
  const blank = canvas(width, height);
  const bctx = context(blank);
  if (style === "scribble") {
    const box = paintedBox(a);
    bctx.drawImage(full, 0, 0);
    bctx.fillStyle = matColour(a, box);
    bctx.fillRect(box.x0 * sx, box.y0 * sy, (box.x1 - box.x0) * sx, (box.y1 - box.y0) * sy);
  } else {
    bctx.drawImage(full, 0, 0);
    bctx.globalCompositeOperation = "source-in";
    if (style === "pastel") {
      // Pastel covers the whole sheet, so it starts on plain paper.
      bctx.fillStyle = PAPER;
      bctx.fillRect(0, 0, width, height);
    } else {
      bctx.imageSmoothingQuality = "high";
      bctx.drawImage(paperPlate(a, style === "pencil"), 0, 0, width, height);
    }
  }

  // Where the hand has been. Each stroke uncovers the real picture beneath.
  const mask = canvas(width, height);
  const mctx = context(mask);
  mctx.lineCap = "round";
  mctx.lineJoin = "round";
  const grain = grainPattern(mctx, (sx + sy) / 2, rand);
  const shown = canvas(width, height);
  const shctx = context(shown);
  const ctx = context(target);

  let first = 0;
  let frame = 0;
  let resolve!: () => void;
  const done = new Promise<void>((r) => (resolve = r));
  const t0 = performance.now();

  const draw = (now: number) => {
    const t = now - t0;

    while (first < marks.length && marks[first].drawn >= marks[first].at[marks[first].at.length - 1]) first++;
    for (let i = first; i < marks.length; i++) {
      const m = marks[i];
      if (m.start > t) break;
      const len = m.at[m.at.length - 1];
      if (m.drawn >= len) continue;
      // Quick off the mark, easing into the end of the stroke.
      const f = clamp01((t - m.start) / m.dur);
      const upto = len * (1 - (1 - f) ** 2);
      drawStretch(mctx, m, m.drawn, upto, sx, sy, grain);
      m.drawn = f >= 1 ? len : upto;
    }

    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(blank, 0, 0);
    const lift = clamp01(t / LIFT_MS);
    if (lift < 1) {
      ctx.globalAlpha = 1 - smoothstep(lift);
      ctx.drawImage(full, 0, 0);
      ctx.globalAlpha = 1;
    }

    shctx.globalCompositeOperation = "source-over";
    shctx.clearRect(0, 0, width, height);
    shctx.drawImage(mask, 0, 0);
    shctx.globalCompositeOperation = "source-in";
    shctx.drawImage(full, 0, 0);
    ctx.drawImage(shown, 0, 0);

    const settle = smoothstep(clamp01((t - (duration - SETTLE_MS)) / SETTLE_MS));
    if (settle > 0) {
      ctx.globalAlpha = settle;
      ctx.drawImage(full, 0, 0);
      ctx.globalAlpha = 1;
    }

    if (t < duration) {
      frame = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(full, 0, 0);
      resolve();
    }
  };
  // The first frame goes down now, so the canvas is never seen empty.
  draw(t0);

  return {
    cancel: () => {
      cancelAnimationFrame(frame);
      resolve();
    },
    done,
  };
}

/** Where an `object-contain` picture actually lands inside its box. */
export function containRect(boxW: number, boxH: number, imgW: number, imgH: number) {
  const scale = Math.min(boxW / imgW, boxH / imgH);
  const width = imgW * scale;
  const height = imgH * scale;
  return { left: (boxW - width) / 2, top: (boxH - height) / 2, width, height };
}
