import { heroBoxes, IbmHeroWireframes } from "./wireframe/hero";

/**
 * The hero artwork for the IBM Builder Control Plane case study.
 *
 * Built the way `CLAUDE.md` asks a hero composition to be built: one canvas
 * with a fixed aspect ratio, every piece placed as a percentage of it, so the
 * group keeps its overlap and its spacing at any width instead of each piece
 * answering the viewport on its own. Nothing inside is rearranged at a
 * breakpoint; the canvas is the only thing that resizes.
 *
 * ── The product ───────────────────────────────────────────────────────────
 * Three drawn panels — Home as the main plate, Issues overlapping in front of
 * it, Metrics behind and above — which is the move a builder makes through the
 * three surfaces. They used to be two screenshots of the team's own prototype;
 * that is unreleased IBM UI, so the hero now carries wireframes of the same
 * ideas instead. Nothing in them was traced from a capture and every label is
 * fictional. Their geometry lives in `wireframe/hero.tsx` beside the drawings,
 * and this file reads it only to know where not to put marks.
 *
 * ── The background ────────────────────────────────────────────────────────
 * A field of IBM-flavoured marks in the space the two windows leave, over
 * Carbon's twelve-column grid.
 *
 * The vocabulary is this project's own, not generic tech iconography: the
 * eight-bar signature that IBM's identity is built on, and then the artifact
 * types a builder actually works with in watsonx Orchestrate — an agent, an
 * agentic workflow, a tool, a knowledge base, an MCP server — plus the two
 * things the Control Plane is for, an issue and a metric. Those are the same
 * nouns the Project Context section lists, so the hero is already saying what
 * the page is about before a word of it is read.
 *
 * Two decisions keep it from reading as wallpaper:
 *
 * 1. The marks sit only in negative space. Each candidate slot is tested
 *    against both windows plus a clearance margin and dropped if it collides,
 *    so the field frames the product rather than crowding it. Move a window
 *    and the field re-flows around it with no hand-tuning.
 * 2. Some neighbouring marks are joined by short connectors, which makes the
 *    field read as a sparse network rather than a wall of loose icons. That is
 *    the project's actual subject — interconnected artifacts — and it is what
 *    distinguishes this from a tiled icon background.
 *
 * Placement is derived, not random: the slot grid and the per-slot choices all
 * come from the row and column indices, so the server and the client draw the
 * same thing and the file has no coordinate list to maintain.
 */

/** The stage. Taller than the windows need, which is what gives the field its
    margin to live in. */
const CANVAS = { w: 1200, h: 780 };

/** IBM's interactive blue. The only saturated colour on the canvas. */
const IBM_BLUE = "#0F62FE";
/** The marks: warm enough not to read as cold grey against the cream page. */
const MARK = "#D7D3CB";

/**
 * Depth, back to front. Without these the pieces fall back on document order,
 * which would put the grid over the windows it is meant to sit behind.
 */
const Z = {
  grid: "z-0",
  field: "z-[1]",
  home: "z-[2]",
  panel: "z-[3]",
};

/* -------------------------------------------------------------------------- */
/* The windows                                                                 */
/* -------------------------------------------------------------------------- */

/* The panels' own geometry is in `wireframe/hero.tsx`; `heroBoxes` turns it
   into canvas units, which is all the field needs to clear a space for them. */

/* -------------------------------------------------------------------------- */
/* The field                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The pool a slot's seed picks its mark from.
 *
 * The eight-bar signature is in it three times out of ten, deliberately. It is
 * the one mark that is IBM rather than merely technical, and a field where it
 * recurs reads as IBM's; a field where it appears as often as a database icon
 * reads as a generic stack of product glyphs.
 */
const MARKS = [
  "signature",
  "agent",
  "workflow",
  "signature",
  "tool",
  "knowledge",
  "server",
  "signature",
  "metric",
  "issue",
] as const;

/** Slots across and down. */
const COLS = 15;
const ROWS = 10;
/** A mark's drawn size, and the room left between one and a window. */
const SIZE = 40;
const CLEARANCE = 14;

interface Slot {
  r: number;
  c: number;
  cx: number;
  cy: number;
  mark: (typeof MARKS)[number];
  accent: boolean;
  /** Depth. A field at one flat value reads as wallpaper. */
  fade: number;
}

/**
 * Every slot the windows leave free.
 *
 * The test is the mark's own box, grown by the clearance, against each
 * window's box — so a mark is dropped when it would touch a window, not only
 * when its centre lands inside one.
 */
const SLOTS: Slot[] = (() => {
  const windows = heroBoxes(CANVAS);
  const cellW = CANVAS.w / COLS;
  const cellH = CANVAS.h / ROWS;
  const reach = SIZE / 2 + CLEARANCE;
  const out: Slot[] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = (c + 0.5) * cellW;
      const cy = (r + 0.5) * cellH;

      const collides = windows.some(
        (w) =>
          cx + reach > w.x &&
          cx - reach < w.x + w.w &&
          cy + reach > w.y &&
          cy - reach < w.y + w.h,
      );
      if (collides) continue;

      /* One number per slot, from its own coordinates: which mark it takes and
         whether it is one of the few in blue both read off it, so the field is
         varied without being random. */
      const seed = (r * 31 + c * 17 + r * c * 7) % 97;
      const accent = seed % 13 === 0;
      out.push({
        r,
        c,
        cx,
        cy,
        mark: MARKS[seed % MARKS.length],
        accent,
        fade: accent ? 0.8 : 0.5 + (seed % 5) * 0.12,
      });
    }
  }
  return out;
})();

/**
 * The connectors: a quarter of the adjacent pairs, trimmed back so each line
 * stops short of the two marks it joins rather than running under them.
 */
const LINKS = (() => {
  const at = new Map(SLOTS.map((s) => [`${s.r}:${s.c}`, s]));
  const gap = SIZE / 2 + 7;
  const out: { key: string; x1: number; y1: number; x2: number; y2: number }[] =
    [];

  for (const s of SLOTS) {
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
    ]) {
      const n = at.get(`${s.r + dr}:${s.c + dc}`);
      if (!n) continue;
      if ((s.r * 13 + s.c * 29 + dr * 5 + dc * 11) % 4 !== 0) continue;

      const len = Math.hypot(n.cx - s.cx, n.cy - s.cy);
      if (len <= gap * 2) continue;
      const ux = (n.cx - s.cx) / len;
      const uy = (n.cy - s.cy) / len;
      out.push({
        key: `${s.r}:${s.c}:${dr}${dc}`,
        x1: s.cx + ux * gap,
        y1: s.cy + uy * gap,
        x2: n.cx - ux * gap,
        y2: n.cy - uy * gap,
      });
    }
  }
  return out;
})();

/**
 * The marks themselves, drawn on Carbon's own 32-unit icon grid so they share
 * its weight and its corner language.
 *
 * The signature is a plain eight-bar square. IBM's identity is built on eight
 * horizontal bars, and the bars alone carry that without reproducing the
 * logotype, which is a trademark and not ours to redraw.
 */
function MarkDefs() {
  const bars = Array.from({ length: 8 }, (_, i) => 5 + i * (22 / 7));
  return (
    <defs>
      <symbol id="ibm-mark-signature" viewBox="0 0 32 32">
        {bars.map((y) => (
          <path key={y} d={`M4 ${y}h24`} />
        ))}
      </symbol>

      {/* An agent: a head with an antenna, Carbon's own bot shape. */}
      <symbol id="ibm-mark-agent" viewBox="0 0 32 32">
        <rect x="6" y="11" width="20" height="16" rx="2.5" />
        <path d="M16 11V6.5" />
        <circle cx="16" cy="4.5" r="2" />
        <circle cx="12" cy="18" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="20" cy="18" r="1.4" fill="currentColor" stroke="none" />
      </symbol>

      {/* An agentic workflow: one step fanning out into two. */}
      <symbol id="ibm-mark-workflow" viewBox="0 0 32 32">
        <rect x="2" y="12.5" width="9" height="7" rx="1.5" />
        <rect x="21" y="4" width="9" height="7" rx="1.5" />
        <rect x="21" y="21" width="9" height="7" rx="1.5" />
        <path d="M11 16h5M16 16V7.5h5M16 16v8.5h5" />
      </symbol>

      {/* A tool: something a builder runs, so a console prompt. */}
      <symbol id="ibm-mark-tool" viewBox="0 0 32 32">
        <rect x="3" y="6" width="26" height="20" rx="2.5" />
        <path d="M9 13.5l4 3-4 3M17.5 19.5H23" />
      </symbol>

      {/* A knowledge base. */}
      <symbol id="ibm-mark-knowledge" viewBox="0 0 32 32">
        <ellipse cx="16" cy="8" rx="10" ry="3.8" />
        <path d="M6 8v16c0 2.1 4.5 3.8 10 3.8s10-1.7 10-3.8V8" />
        <path d="M6 16c0 2.1 4.5 3.8 10 3.8S26 18.1 26 16" />
      </symbol>

      {/* An MCP server. */}
      <symbol id="ibm-mark-server" viewBox="0 0 32 32">
        <rect x="4" y="5" width="24" height="9" rx="1.5" />
        <rect x="4" y="18" width="24" height="9" rx="1.5" />
        <circle cx="9.5" cy="9.5" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="9.5" cy="22.5" r="1.3" fill="currentColor" stroke="none" />
        <path d="M14 9.5h9M14 22.5h9" />
      </symbol>

      {/* A metric. */}
      <symbol id="ibm-mark-metric" viewBox="0 0 32 32">
        <path d="M4 27h24" />
        <path d="M8 27V17M14.5 27V8M21 27V20M27 27V12" />
      </symbol>

      {/* An issue. */}
      <symbol id="ibm-mark-issue" viewBox="0 0 32 32">
        <path d="M16 4.5 29 27H3z" strokeLinejoin="round" />
        <path d="M16 13v6.5" />
        <circle cx="16" cy="23.2" r="1.3" fill="currentColor" stroke="none" />
      </symbol>
    </defs>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export function IbmHeroArt() {
  return (
    /*
      `isolate` keeps the stacking below to this box, so the layers sort against
      each other and not against whatever else the page stacks.

      The canvas is also a container, which is what lets the corner radius and
      the elevation below be written in `cqw` — a share of the canvas's own
      width. A fixed 12px radius is right at full size and a heavy collar at a
      phone's third of it; 1cqw is 12px at 1200 and shrinks with everything
      else, so the composition scales as one piece.
    */
    <div
      className="relative isolate w-full overflow-hidden"
      style={{
        aspectRatio: `${CANVAS.w} / ${CANVAS.h}`,
        containerType: "inline-size",
      }}
    >
      {/* Carbon's twelve-column grid, drawn as hairlines rather than fills so
          it reads as structure behind the product and never as a pattern of
          its own. `vectorEffect` holds the lines at a hairline however far the
          canvas is scaled. */}
      <svg
        aria-hidden
        viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
        preserveAspectRatio="none"
        className={`absolute inset-0 size-full ${Z.grid}`}
      >
        {Array.from({ length: 13 }, (_, i) => (
          <line
            key={i}
            x1={i * 100}
            y1={0}
            x2={i * 100}
            y2={CANVAS.h}
            stroke={MARK}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* The artifact field. One `preserveAspectRatio` default — the viewBox
          matches the canvas, so the marks stay square at every width. */}
      <svg
        aria-hidden
        viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
        className={`absolute inset-0 size-full ${Z.field}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        vectorEffect="non-scaling-stroke"
      >
        <MarkDefs />

        <g stroke={MARK} strokeWidth={1} vectorEffect="non-scaling-stroke">
          {LINKS.map((l) => (
            <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
          ))}
        </g>

        {SLOTS.map((s) => (
          <use
            key={`${s.r}:${s.c}`}
            href={`#ibm-mark-${s.mark}`}
            x={s.cx - SIZE / 2}
            y={s.cy - SIZE / 2}
            width={SIZE}
            height={SIZE}
            style={{ color: s.accent ? IBM_BLUE : MARK }}
            opacity={s.fade}
          />
        ))}
      </svg>

      {/* The three panels, over the field that cleared a space for them. */}
      <IbmHeroWireframes />
    </div>
  );
}
