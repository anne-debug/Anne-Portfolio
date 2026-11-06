"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { heroBoxes } from "./wireframe/hero";

/**
 * The field behind the IBM hero's three panels: a grid of artifacts, with
 * work moving between them.
 *
 * ── Why a grid ────────────────────────────────────────────────────────────
 * The case study is about a builder's estate — agents, workflows, tools,
 * databases, servers and the figures they throw off — and about losing sight
 * of how execution moves through it. A field of evenly spaced artifacts with
 * signals running between a few of them is that sentence as a picture, and it
 * is the one thing a hero background can say while staying a background.
 *
 * Even spacing is the point. An arrangement would be a composition competing
 * with the panels in front of it; a grid is a texture, and the eye reads it
 * once as "a lot of things, all alike" and then goes to the product.
 *
 * ── What moves, and what does not ─────────────────────────────────────────
 * Almost everything is held at one muted grey and never changes. Three things
 * move, all of them small:
 *
 * 1. A signal, every second or so: a thin line is drawn between two or three
 *    neighbours, a dash runs along it, and those artifacts come up blue as it
 *    reaches them and go out behind it. Never more than `MAX_LIVE` at once,
 *    and they are routed around the panels, because a signal drawn under an
 *    opaque window is work nobody sees.
 * 2. The artifacts near the pointer lift a little out of the grey. This is a
 *    second copy of the same grid in a brighter ink, with a soft round mask
 *    following the pointer, so the lift costs two custom properties a frame
 *    and no React render at all.
 * 3. Nothing else. No flashing, no field-wide pulse, nothing lit all at once.
 *
 * All of it stops when the hero leaves the screen, and none of it starts for
 * a reader who asked for reduced motion — they get the grid, still, which is
 * the same picture without the sentence.
 */

/* -------------------------------------------------------------------------- */
/* The grid                                                                    */
/* -------------------------------------------------------------------------- */

/** Carbon Blue 50 — the hero's accent, and the only colour in here. */
const BLUE = "#4589ff";
/** The grid at rest, and the same grid under the pointer. */
const MUTED = "rgba(255, 255, 255, 0.2)";
const HOT = "rgba(255, 255, 255, 0.5)";
/** The line a signal runs along, which is only there while it runs. */
const WIRE = "rgba(255, 255, 255, 0.14)";

/**
 * The grid at each breakpoint.
 *
 * `cols` is what the brief asks for at the top end and what legibility allows
 * below it: the canvas is drawn at 1200 units wide however wide the column
 * is, so at 390 a pictogram of 34 units would land on screen at ten pixels
 * and read as lint. Fewer columns, bigger marks, same density of ink.
 */
const GRIDS = {
  phone: { cols: 6, rows: 4, mark: 56, dot: 4.5 },
  tablet: { cols: 10, rows: 7, mark: 38, dot: 3 },
  desktop: { cols: 14, rows: 9, mark: 32, dot: 2.4 },
} as const;

type Grid = (typeof GRIDS)[keyof typeof GRIDS];

/**
 * The artifacts in the field, in the order the hash picks between them.
 *
 * Twelve of them, which is what makes this a wall of artifacts rather than
 * one icon repeating. Six come from the kinds of thing watsonx Orchestrate's
 * own design system names — agent, workflow, tool, knowledge, connection and
 * model — and the rest are the infrastructure a builder's work sits on. They
 * are drawn here rather than imported: the design system's own files are
 * IBM's, and a background does not need them when their shape language is
 * Carbon's published 32-unit icon grid, which this follows.
 */
const MARKS = [
  "workflow",
  "agent",
  "knowledge",
  "connection",
  "model",
  "tool",
  "automation",
  "database",
  "terminal",
  "server",
  "metric",
  "signature",
] as const;

/**
 * How much of the grid is an artifact rather than a plain node.
 *
 * Nearly half. Below a third the artifacts read as occasional incidents in a
 * field of dots; at this share the dots are the spacing between artifacts,
 * which is the way round the hero wants it.
 */
const MARK_SHARE = 0.46;

/**
 * A stable number in [0,1) for a cell.
 *
 * Integer arithmetic throughout, so the server and every browser agree on it
 * and the markup hydrates. `Math.random` would differ between the two and
 * `Math.sin` is not bit-identical across engines.
 *
 * The salt is multiplied in rather than XORed, and the result is mixed twice.
 * Salts 1 and 2 differ in one low bit, and one round of mixing left them
 * correlated: the roll that decided whether a cell was an artifact also
 * decided which artifact, so over a 14x9 grid the first third of `MARKS` was
 * never drawn at all. Two rounds carry that bit into the high end, where the
 * choice is read from.
 */
function hash(r: number, c: number, salt: number) {
  let h =
    Math.imul(r + 1, 73856093) ^
    Math.imul(c + 1, 19349663) ^
    Math.imul(salt + 1, 83492791);
  h = Math.imul(h ^ (h >>> 16), 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

interface Cell {
  i: number;
  x: number;
  y: number;
  /** The artifact drawn here, or null for a plain node. */
  mark: string | null;
  /** Whether a panel covers it. Signals are routed around these. */
  under: boolean;
}

/** The cells of one grid, with the panels' footprints marked. */
function cellsOf(grid: Grid, canvas: { w: number; h: number }): Cell[] {
  const boxes = heroBoxes(canvas);
  const cw = canvas.w / grid.cols;
  const ch = canvas.h / grid.rows;
  const cells: Cell[] = [];

  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const x = (c + 0.5) * cw;
      const y = (r + 0.5) * ch;
      const roll = hash(r, c, 1);
      cells.push({
        i: r * grid.cols + c,
        x,
        y,
        mark: roll < MARK_SHARE ? pick(r, c, cells, grid) : null,
        under: boxes.some(
          (b) => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h,
        ),
      });
    }
  }
  return cells;
}

/**
 * Which artifact a cell gets.
 *
 * The hash chooses, and then the choice steps on until it differs from the
 * neighbour to the left and the one above. Twelve symbols drawn at random
 * still land next to themselves often enough to be the thing the eye finds —
 * two of a kind touching reads as a pattern in a field whose whole job is to
 * look like an inventory. Stepping on is deterministic, so it hydrates.
 */
function pick(r: number, c: number, cells: Cell[], grid: Grid) {
  const left = c > 0 ? cells[r * grid.cols + c - 1]?.mark : null;
  const above = r > 0 ? cells[(r - 1) * grid.cols + c]?.mark : null;
  const i = Math.floor(hash(r, c, 2) * MARKS.length);
  for (let n = 0; n < MARKS.length; n++) {
    const mark = MARKS[(i + n) % MARKS.length];
    if (mark !== left && mark !== above) return mark;
  }
  return MARKS[i % MARKS.length];
}

/* -------------------------------------------------------------------------- */
/* The signals                                                                 */
/* -------------------------------------------------------------------------- */

/** How long a dash takes to run the whole line, and how long a cell is lit. */
const TRAVEL = 1500;
const LIT = 1100;
/** The gap between signals, and the most that may run at once. */
const EVERY = 1150;
const MAX_LIVE = 3;
/**
 * The dash that runs a line, and the line's own weight, both as a share of
 * one cell.
 *
 * A cell is about the same size on screen at every breakpoint — the canvas
 * shrinks as the column does, and the grid loses columns to match — so a
 * length written against the cell comes out the same thickness and the same
 * reach in the window, which a fixed number of canvas units would not. The
 * two are also the reason the signal paths take no `vectorEffect`: that would
 * move the dash into screen space while the path stayed in canvas units, and
 * the dash would travel the wrong distance.
 */
const DASH_OF_CELL = 0.3;
const LINE_OF_CELL = 0.022;
/** How far a corner is rounded, in canvas units. */
const BEND = 10;

interface Signal {
  id: number;
  d: string;
  len: number;
  /** The cells it lights, in the order it reaches them. */
  stops: { i: number; at: number }[];
}

/** A polyline through cell centres, with its corners rounded. */
function routePath(pts: { x: number; y: number }[]) {
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    const n = pts[i + 1];
    const inLen = Math.hypot(c.x - p.x, c.y - p.y);
    const outLen = Math.hypot(n.x - c.x, n.y - c.y);
    const r = Math.min(BEND, inLen / 2, outLen / 2);
    d += `L${c.x + ((p.x - c.x) / inLen) * r},${c.y + ((p.y - c.y) / inLen) * r}`;
    d += `Q${c.x},${c.y} ${c.x + ((n.x - c.x) / outLen) * r},${c.y + ((n.y - c.y) / outLen) * r}`;
  }
  const last = pts[pts.length - 1];
  return `${d}L${last.x},${last.y}`;
}

/**
 * One signal: a short walk between neighbouring artifacts that no panel
 * covers.
 *
 * Orthogonal steps only, no cell twice, and it gives up rather than wander
 * into a panel — a walk that runs out of room early is a two-stop signal,
 * which is a perfectly good one.
 */
function makeSignal(id: number, cells: Cell[], grid: Grid): Signal | null {
  const open = cells.filter((c) => !c.under);
  if (open.length < 2) return null;

  const path = [open[Math.floor(Math.random() * open.length)]];
  const steps = 2 + Math.floor(Math.random() * 2);

  for (let s = 0; s < steps; s++) {
    const here = path[path.length - 1];
    const r = Math.floor(here.i / grid.cols);
    const c = here.i % grid.cols;
    const next = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ]
      .filter(
        ([nr, nc]) => nr >= 0 && nr < grid.rows && nc >= 0 && nc < grid.cols,
      )
      .map(([nr, nc]) => cells[nr * grid.cols + nc])
      .filter((cell) => cell && !cell.under && !path.includes(cell));
    if (!next.length) break;
    path.push(next[Math.floor(Math.random() * next.length)]);
  }

  if (path.length < 2) return null;

  let len = 0;
  for (let i = 1; i < path.length; i++) {
    len += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
  }

  return {
    id,
    d: routePath(path),
    len: Math.ceil(len),
    // Lit as the dash arrives: the first at once, the last just before the
    // dash runs off the end.
    stops: path.map((cell, n) => ({
      i: cell.i,
      at: Math.round((n / (path.length - 1)) * TRAVEL * 0.86),
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export function IbmHeroField({ canvas }: { canvas: { w: number; h: number } }) {
  /*
    The server draws the desktop grid, and a phone or tablet swaps to its own
    on the first effect. A media query cannot change how many elements there
    are, and rendering all three grids to let CSS pick one would put three
    fields in the page to show one of them.
  */
  const [grid, setGrid] = useState<Grid>(GRIDS.desktop);
  const [signals, setSignals] = useState<Signal[]>([]);
  const root = useRef<HTMLDivElement | null>(null);
  const hot = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const tablet = window.matchMedia("(min-width: 810px)");
    const desktop = window.matchMedia("(min-width: 1200px)");
    const read = () =>
      setGrid(
        desktop.matches
          ? GRIDS.desktop
          : tablet.matches
            ? GRIDS.tablet
            : GRIDS.phone,
      );
    read();
    tablet.addEventListener("change", read);
    desktop.addEventListener("change", read);
    return () => {
      tablet.removeEventListener("change", read);
      desktop.removeEventListener("change", read);
    };
  }, []);

  /* Memoised because the signal effect depends on it: rebuilt every render,
     the effect would re-run on the state it had just set. */
  const cells = useMemo(() => cellsOf(grid, canvas), [grid, canvas]);

  /**
   * Signals, while the hero is on screen.
   *
   * The observer is the whole of "stop when it is offscreen": no interval, no
   * signals in state, nothing animating, and the grid left exactly as it is.
   * A reader who asked for reduced motion never starts one.
   */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let id = 0;
    let timer = 0;
    const live = new Map<number, number>();

    const spawn = () => {
      if (live.size >= MAX_LIVE) return;
      const signal = makeSignal(++id, cells, grid);
      if (!signal) return;
      setSignals((s) => [...s, signal]);
      live.set(
        signal.id,
        window.setTimeout(() => {
          live.delete(signal.id);
          setSignals((s) => s.filter((x) => x.id !== signal.id));
        }, TRAVEL + LIT),
      );
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !timer) {
          spawn();
          timer = window.setInterval(spawn, EVERY);
        } else if (!entry.isIntersecting && timer) {
          window.clearInterval(timer);
          timer = 0;
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer) window.clearInterval(timer);
      for (const t of live.values()) window.clearTimeout(t);
      setSignals([]);
    };
  }, [cells, grid]);

  /**
   * The pointer's own patch of the grid.
   *
   * Written straight to the element as two custom properties inside one
   * animation frame, so a pointer crossing the hero never renders React and
   * never touches the grid's markup. It is the mask that moves; the second
   * copy of the grid underneath it does not know anything is happening.
   */
  useEffect(() => {
    const el = root.current;
    const layer = hot.current;
    if (!el || !layer) return;

    let frame = 0;
    let last: PointerEvent | null = null;

    const draw = () => {
      frame = 0;
      if (!last) return;
      const box = el.getBoundingClientRect();
      layer.style.setProperty("--ibm-mx", `${last.clientX - box.left}px`);
      layer.style.setProperty("--ibm-my", `${last.clientY - box.top}px`);
      layer.style.opacity = "1";
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      last = e;
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const onLeave = () => {
      last = null;
      layer.style.opacity = "0";
    };

    const parent = el.parentElement ?? el;
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const lit = new Map<number, number>();
  for (const s of signals) for (const stop of s.stops) lit.set(stop.i, stop.at);

  const cell = canvas.w / grid.cols;
  const dash = Math.round(cell * DASH_OF_CELL);
  const line = cell * LINE_OF_CELL;
  const view = `0 0 ${canvas.w} ${canvas.h}`;
  const field: CSSProperties = {
    // The canvas is only as wide as the article's column while the hero's
    // charcoal runs to both edges of the window, so the grid is faded out at
    // the sides rather than cut off on a straight seam a long way inside the
    // field. The top fade is deeper because the facts sit directly above it.
    maskImage: [
      "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
      "linear-gradient(to bottom, transparent, #000 13%, #000 95%, transparent)",
    ].join(", "),
    maskComposite: "intersect",
  };

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={field}
    >
      {/* The grid at rest. This markup is written once and never changes. */}
      <svg
        viewBox={view}
        className="absolute inset-0 size-full"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
        style={{ color: MUTED }}
      >
        <MarkDefs />
        <GridCells cells={cells} grid={grid} />
      </svg>

      {/* The same grid in a brighter ink, shown only where the pointer is.
          `ibm-field-hot` holds the mask and hides the layer where there is no
          pointer to follow. */}
      <div ref={hot} className="ibm-field-hot absolute inset-0">
        <svg
          viewBox={view}
          className="absolute inset-0 size-full"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          style={{ color: HOT }}
        >
          <GridCells cells={cells} grid={grid} />
        </svg>
      </div>

      {/* The signals, and the artifacts they are reaching. */}
      <svg
        viewBox={view}
        className="absolute inset-0 size-full"
        fill="none"
        strokeWidth={1.4}
      >
        {signals.map((s) => (
          <g key={s.id}>
            <path
              className="ibm-wire"
              d={s.d}
              stroke={WIRE}
              strokeWidth={line * 0.7}
              strokeLinecap="round"
            />
            <path
              className="ibm-signal"
              d={s.d}
              stroke={BLUE}
              strokeWidth={line}
              strokeLinecap="round"
              style={
                {
                  "--ibm-dash": dash,
                  "--ibm-len": s.len,
                } as CSSProperties
              }
            />
          </g>
        ))}

        <g stroke={BLUE} strokeWidth={1.4} style={{ color: BLUE }}>
          {[...lit].map(([i, at]) => {
            const cell = cells[i];
            if (!cell) return null;
            return (
              <g
                key={i}
                className="ibm-lit"
                style={{ animationDelay: `${at}ms` }}
              >
                <Cell cell={cell} grid={grid} />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

/** Every cell of the grid, drawn in whatever ink its layer is set to. */
function GridCells({ cells, grid }: { cells: Cell[]; grid: Grid }) {
  return (
    <>
      {cells.map((cell) => (
        <Cell key={cell.i} cell={cell} grid={grid} />
      ))}
    </>
  );
}

/** One cell: an artifact, or the node that stands in for one. */
function Cell({ cell, grid }: { cell: Cell; grid: Grid }) {
  if (!cell.mark) {
    return (
      <circle
        cx={cell.x}
        cy={cell.y}
        r={grid.dot}
        fill="currentColor"
        stroke="none"
      />
    );
  }
  return (
    <use
      href={`#ibm-mark-${cell.mark}`}
      x={cell.x - grid.mark / 2}
      y={cell.y - grid.mark / 2}
      width={grid.mark}
      height={grid.mark}
    />
  );
}

/**
 * The artifacts themselves, drawn on Carbon's own 32-unit icon grid so they
 * share its weight and its corner language.
 *
 * Twelve, and each one a different silhouette at a glance: a ring, a box, a
 * cylinder, a fan, a page, an arrow, a graph. A wall of symbols is only read
 * as a wall if no two of them resolve to the same blur at this size, which is
 * what governs the shapes below more than any one of them being the most
 * literal drawing of its noun.
 *
 * The signature is a plain eight-bar square. IBM's identity is built on eight
 * horizontal bars, and the bars alone carry that without reproducing the
 * logotype, which is a trademark and not ours to redraw.
 */
function MarkDefs() {
  const bars = Array.from({ length: 8 }, (_, i) => 5 + i * (22 / 7));
  /* The cog's teeth: eight spokes between two radii, around (24, 24). */
  const teeth = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const [dx, dy] = [Math.cos(a), Math.sin(a)];
    return `M${(24 + dx * 3.4).toFixed(2)} ${(24 + dy * 3.4).toFixed(2)}L${(
      24 +
      dx * 5
    ).toFixed(2)} ${(24 + dy * 5).toFixed(2)}`;
  }).join("");
  return (
    <defs>
      <symbol id="ibm-mark-signature" viewBox="0 0 32 32">
        {bars.map((y) => (
          <path key={y} d={`M4 ${y}h24`} vectorEffect="non-scaling-stroke" />
        ))}
      </symbol>

      {/* An agent: a head with an antenna, Carbon's own bot shape. */}
      <symbol id="ibm-mark-agent" viewBox="0 0 32 32">
        <rect
          x="6"
          y="11"
          width="20"
          height="16"
          rx="2.5"
          vectorEffect="non-scaling-stroke"
        />
        <path d="M16 11V6.5" vectorEffect="non-scaling-stroke" />
        <circle cx="16" cy="4.5" r="2" vectorEffect="non-scaling-stroke" />
        <circle cx="12" cy="18" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="20" cy="18" r="1.4" fill="currentColor" stroke="none" />
      </symbol>

      {/* An agentic workflow: one step fanning out into two. */}
      <symbol id="ibm-mark-workflow" viewBox="0 0 32 32">
        <rect
          x="2"
          y="12.5"
          width="9"
          height="7"
          rx="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="21"
          y="4"
          width="9"
          height="7"
          rx="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="21"
          y="21"
          width="9"
          height="7"
          rx="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M11 16h5M16 16V7.5h5M16 16v8.5h5"
          vectorEffect="non-scaling-stroke"
        />
      </symbol>

      {/* A terminal: something a builder runs, so a console prompt. */}
      <symbol id="ibm-mark-terminal" viewBox="0 0 32 32">
        <rect
          x="3"
          y="6"
          width="26"
          height="20"
          rx="2.5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M9 13.5l4 3-4 3M17.5 19.5H23"
          vectorEffect="non-scaling-stroke"
        />
      </symbol>

      {/* A database. */}
      <symbol id="ibm-mark-database" viewBox="0 0 32 32">
        <ellipse
          cx="16"
          cy="8"
          rx="10"
          ry="3.8"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M6 8v16c0 2.1 4.5 3.8 10 3.8s10-1.7 10-3.8V8"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M6 16c0 2.1 4.5 3.8 10 3.8S26 18.1 26 16"
          vectorEffect="non-scaling-stroke"
        />
      </symbol>

      {/* An MCP server. */}
      <symbol id="ibm-mark-server" viewBox="0 0 32 32">
        <rect
          x="4"
          y="5"
          width="24"
          height="9"
          rx="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="4"
          y="18"
          width="24"
          height="9"
          rx="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="9.5" cy="9.5" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="9.5" cy="22.5" r="1.3" fill="currentColor" stroke="none" />
        <path d="M14 9.5h9M14 22.5h9" vectorEffect="non-scaling-stroke" />
      </symbol>

      {/* Analytics. */}
      <symbol id="ibm-mark-metric" viewBox="0 0 32 32">
        <path d="M4 27h24" vectorEffect="non-scaling-stroke" />
        <path
          d="M8 27V17M14.5 27V8M21 27V20M27 27V12"
          vectorEffect="non-scaling-stroke"
        />
      </symbol>

      {/* Knowledge: a document, as against the store it sits in. */}
      <symbol id="ibm-mark-knowledge" viewBox="0 0 32 32">
        <path
          d="M18 3H8a1.5 1.5 0 0 0-1.5 1.5v23A1.5 1.5 0 0 0 8 29h16a1.5 1.5 0 0 0 1.5-1.5V10.5z"
          vectorEffect="non-scaling-stroke"
        />
        <path d="M18 3v7.5h7.5" vectorEffect="non-scaling-stroke" />
        <path
          d="M11 17h10M11 21.5h10M11 26h6"
          vectorEffect="non-scaling-stroke"
        />
      </symbol>

      {/* A connection: one artifact's output turning into another's input. */}
      <symbol id="ibm-mark-connection" viewBox="0 0 32 32">
        <path d="M5 5v13a4 4 0 0 0 4 4h16" vectorEffect="non-scaling-stroke" />
        <path d="M20 17l5 5-5 5" vectorEffect="non-scaling-stroke" />
      </symbol>

      {/* A model: four things and everything they have to do with each other. */}
      <symbol id="ibm-mark-model" viewBox="0 0 32 32">
        <circle cx="7" cy="7" r="3" vectorEffect="non-scaling-stroke" />
        <circle cx="25" cy="7" r="3" vectorEffect="non-scaling-stroke" />
        <circle cx="7" cy="25" r="3" vectorEffect="non-scaling-stroke" />
        <circle cx="25" cy="25" r="3" vectorEffect="non-scaling-stroke" />
        <path
          d="M9.1 9.1l13.8 13.8M22.9 9.1L9.1 22.9M7 10v12M25 10v12"
          vectorEffect="non-scaling-stroke"
        />
      </symbol>

      {/* A tool: the kit, not one wrench, so it holds its shape at 32 units. */}
      <symbol id="ibm-mark-tool" viewBox="0 0 32 32">
        <path
          d="M12 9.5V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2.5"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="3"
          y="9.5"
          width="26"
          height="17"
          rx="2"
          vectorEffect="non-scaling-stroke"
        />
        <path d="M3 17h10M19 17h10" vectorEffect="non-scaling-stroke" />
        <rect
          x="13"
          y="14"
          width="6"
          height="6"
          rx="1"
          vectorEffect="non-scaling-stroke"
        />
      </symbol>

      {/* Automation: the loop that runs without being asked, and its settings. */}
      <symbol id="ibm-mark-automation" viewBox="0 0 32 32">
        <path d="M14 6A8 8 0 1 1 6 14" vectorEffect="non-scaling-stroke" />
        <path d="M10.6 2.6L14 6l-3.4 3.4" vectorEffect="non-scaling-stroke" />
        <circle cx="24" cy="24" r="3.4" vectorEffect="non-scaling-stroke" />
        <path d={teeth} vectorEffect="non-scaling-stroke" />
      </symbol>
    </defs>
  );
}
