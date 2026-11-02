import {
  WireBlankStat,
  WireDot,
  WireIcon,
  WireLineChart,
  WirePanel,
  WireRow,
  WireSearch,
  WireSlot,
  WireTabs,
  WireText,
  WireTile,
  WireTitle,
} from "./Wire";

/**
 * The hero composition: the three experiences, and how they sit together.
 *
 * Home is the main plate because it is the starting point the project
 * proposes. Issues overlaps it at the front, which is the move a builder makes
 * from the landing page into a failure. Metrics sits behind and above, where a
 * builder goes from an issue to the artifact's own numbers. The overlap is the
 * argument: these are one surface, not three pages.
 *
 * Each panel is placed as a fraction of the canvas, per the hero composition
 * rule in `CLAUDE.md` — the group keeps its overlap and spacing at every width
 * and nothing inside is rearranged at a breakpoint. The panels' boxes are
 * exported because the mark field behind them clears whatever space they take;
 * change a number here and the field re-flows around it with nothing else to
 * edit.
 *
 * Everything written inside is fictional.
 */

const TOKENS = {
  "--wf-screen": "#ffffff",
  "--wf-surface": "#f5f5f5",
  "--wf-surface-2": "#fafafa",
  "--wf-line": "#e3e3e3",
  "--wf-line-strong": "#cdcdcd",
  "--wf-ink": "#3d3d3d",
  "--wf-ink-soft": "#6f6f6f",
  "--wf-ink-faint": "#9b9b9b",
  "--wf-fill": "#e6e6e6",
  "--wf-fill-soft": "#efefef",
  "--wf-accent": "#0f62fe",
} as React.CSSProperties;

/**
 * Each panel as a fraction of the canvas. `ratio` is width over height, so a
 * panel is never given a height directly and cannot be squashed.
 */
export const HERO_PANELS = {
  home: { x: 0.045, y: 0.155, w: 0.6, ratio: 1.42 },
  issues: { x: 0.52, y: 0.43, w: 0.43, ratio: 1.62 },
  metrics: { x: 0.605, y: 0.055, w: 0.35, ratio: 1.75 },
} as const;

type Panel = (typeof HERO_PANELS)[keyof typeof HERO_PANELS];

/** The panels' boxes in canvas units, which is what a collision test needs. */
export function heroBoxes(canvas: { w: number; h: number }) {
  return Object.values(HERO_PANELS).map((p: Panel) => {
    const w = p.w * canvas.w;
    return { x: p.x * canvas.w, y: p.y * canvas.h, w, h: w / p.ratio };
  });
}

function place(p: Panel) {
  return {
    left: `${p.x * 100}%`,
    top: `${p.y * 100}%`,
    width: `${p.w * 100}%`,
    aspectRatio: `${p.ratio}`,
  };
}

/** A panel: a sheet with a name on it, so the three can be told apart. */
function Sheet({
  panel,
  label,
  z,
  children,
}: {
  panel: Panel;
  label: string;
  z: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute flex flex-col overflow-hidden rounded-[0.7cqw] border bg-[var(--wf-screen)] ${z}`}
      style={{
        ...place(panel),
        borderColor: "var(--wf-line)",
        boxShadow: "0 1.2cqw 3.5cqw rgba(16, 22, 26, 0.10)",
      }}
    >
      <div
        className="flex shrink-0 items-center gap-1.5 border-b px-2 py-1"
        style={{ borderColor: "var(--wf-line)" }}
      >
        <span
          className="block size-1.5 rounded-full"
          style={{ background: "var(--wf-accent)" }}
        />
        <span
          className="text-[9px] leading-none font-semibold tablet:text-[10px]"
          style={{ color: "var(--wf-ink)" }}
        >
          {label}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 p-2">{children}</div>
    </div>
  );
}

/**
 * A relationship map at the size a hero panel can hold one.
 *
 * Drawn here rather than imported from the Issues drawings: that module is a
 * client component and the hero has no reason to become one, and at 180px wide
 * the five-node version would be a smudge. Three feeding one, and the link out
 * of it broken — which is the whole of what the panel is saying.
 */
function TinyGraph() {
  return (
    <svg
      viewBox="0 0 160 48"
      preserveAspectRatio="xMidYMid meet"
      className="block h-full w-full"
      aria-hidden
    >
      <g
        stroke="var(--wf-line-strong)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        fill="none"
      >
        <path d="M30 9h18v15h10" />
        <path d="M30 24h28" />
        <path d="M30 39h18V24h10" />
      </g>
      <path
        d="M104 24h16"
        stroke="var(--wf-ink)"
        strokeWidth="1.3"
        strokeDasharray="3 3"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      {[4, 19, 34].map((y) => (
        <rect
          key={y}
          x="8"
          y={y}
          width="22"
          height="11"
          rx="2"
          fill="var(--wf-surface)"
          stroke="var(--wf-line-strong)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <rect
        x="58"
        y="14"
        width="46"
        height="20"
        rx="2"
        fill="var(--wf-surface)"
        stroke="var(--wf-line-strong)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x="120"
        y="18"
        width="32"
        height="12"
        rx="2"
        fill="var(--wf-surface)"
        stroke="var(--wf-line-strong)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** A row of the tree in the Metrics panel. */
function TwigRow({
  label,
  icon,
  depth = 0,
  selected,
}: {
  label: string;
  icon: "agent" | "flow" | "tool";
  depth?: number;
  selected?: boolean;
}) {
  return (
    <span
      className="flex min-w-0 items-center gap-1 rounded-[2px] py-[2px]"
      style={{
        paddingLeft: `${4 + depth * 9}px`,
        background: selected ? "var(--wf-surface)" : "transparent",
        boxShadow: selected ? "inset 2px 0 0 var(--wf-accent)" : undefined,
      }}
    >
      <WireIcon name={icon} tone={selected ? "ink" : "faint"} />
      <span
        className="truncate text-[8px] leading-tight tablet:text-[9px]"
        style={{
          color: selected ? "var(--wf-ink)" : "var(--wf-ink-soft)",
          fontWeight: selected ? 600 : 400,
        }}
      >
        {label}
      </span>
    </span>
  );
}

export function IbmHeroWireframes() {
  return (
    <div
      className="absolute inset-0"
      style={{ ...TOKENS, fontFamily: "var(--font-dm-sans)" }}
      aria-hidden
    >
      {/* ---- Home: the plate the other two are reached from -------------
          The final Home, shortened: the welcome message carrying the count
          that decides what a builder does next, their pins beside the issues
          waiting for them, and recent work along the foot. */}
      <Sheet panel={HERO_PANELS.home} label="Home" z="z-[2]">
        <div className="flex shrink-0 flex-col gap-0.5">
          <WireTitle>Good morning, Alex</WireTitle>
          <span
            className="text-[9px] leading-tight font-semibold tablet:text-[10px]"
            style={{ color: "var(--wf-ink)" }}
          >
            2 critical issues requiring attention
          </span>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[0.8fr_1fr] gap-1.5">
          <div className="flex min-h-0 flex-col gap-1">
            <WireText tone="faint">Pinned shortcuts</WireText>
            <div className="grid auto-rows-min grid-cols-2 gap-1">
              <WireTile icon="flow" label="Order triage" />
              <WireTile icon="chart" label="Trace explorer" />
              <WireSlot className="!min-h-0 hidden py-2 tablet:flex" />
              <WireSlot className="!min-h-0 hidden py-2 tablet:flex" />
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-1">
            <WireText tone="faint">Latest issues</WireText>
            <WirePanel className="min-h-0 flex-1">
              <WireRow
                level="critical"
                title="Execution failures"
                meta="Order triage · Agent"
              />
              <WireRow
                level="critical"
                title="Connection failure"
                meta="Invoice intake · Workflow"
              />
              <WireRow
                level="warning"
                title="Latency above target"
                meta="Catalog lookup · Tool"
                className="hidden tablet:flex"
              />
              <WireRow
                level="warning"
                title="Indexing incomplete"
                meta="Policy index · Knowledge"
                className="hidden tablet:flex"
              />
            </WirePanel>
          </div>
        </div>

        <div className="hidden shrink-0 flex-col gap-1 tablet:flex">
          <WireText tone="faint">Your most recent</WireText>
          <div className="grid grid-cols-2 gap-1 tablet:grid-cols-3">
            <WireTile icon="agent" label="Support agent" meta="5h ago" />
            <WireTile icon="flow" label="Invoice intake" meta="7h ago" />
            <WireTile
              icon="agent"
              label="Lead gen bot"
              meta="8h ago"
              className="hidden tablet:flex"
            />
          </div>
        </div>
      </Sheet>

      {/* ---- Metrics: behind and above ---------------------------------
          The hierarchy on the left and the selected artifact on the right,
          with Overview over Dependencies as two stacked sections. */}
      <Sheet panel={HERO_PANELS.metrics} label="Metrics" z="z-[3]">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-1.5 tablet:grid-cols-[0.78fr_1fr]">
          <div className="flex min-h-0 flex-col gap-1">
            <WireSearch placeholder="Search" />
            <WirePanel className="min-h-0 flex-1 p-1">
              <TwigRow icon="agent" label="Agents" />
              <TwigRow
                icon="agent"
                label="Order assistant"
                depth={1}
                selected
              />
              <TwigRow icon="flow" label="Workflows" depth={2} />
              <TwigRow icon="flow" label="Invoice workflow" depth={1} />
              <TwigRow icon="tool" label="Search tool" depth={1} />
            </WirePanel>
          </div>

          <div className="hidden min-h-0 flex-col gap-[3px] tablet:flex">
            <span className="flex min-w-0 items-center gap-1">
              <WireIcon name="agent" tone="ink" />
              <WireTitle className="truncate">Order assistant</WireTitle>
            </span>

            <WireText tone="faint">Overview</WireText>
            <div className="grid shrink-0 grid-cols-2 gap-1">
              <WireBlankStat />
              <WireBlankStat />
            </div>
            <div className="hidden h-[20px] shrink-0 desktop:block">
              <WireLineChart points={[16, 22, 18, 28, 24, 32, 26, 30]} />
            </div>

            <WireText tone="faint">Dependencies</WireText>
            <div className="hidden shrink-0 grid-cols-2 gap-1 desktop:grid">
              <WireBlankStat />
              <WireBlankStat />
            </div>
          </div>
        </div>
      </Sheet>

      {/* ---- Issues: in front, the move out of Home --------------------
          The list beside one issue's investigation: the two tabs, the
          relationship map and the trace. One panel, as the final version
          has it. */}
      <Sheet panel={HERO_PANELS.issues} label="Issues" z="z-[4]">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-1.5 tablet:grid-cols-[0.72fr_1fr]">
          <WirePanel className="min-h-0">
            <WireRow
              selected
              level="critical"
              title="Execution failures"
              meta="Order triage"
            />
            <WireRow
              level="critical"
              title="Connection failure"
              meta="Invoice intake"
            />
            <WireRow
              level="warning"
              title="Latency above target"
              meta="Catalog lookup"
              className="hidden tablet:flex"
            />
          </WirePanel>

          <div className="hidden min-h-0 flex-col gap-1 tablet:flex">
            <span className="flex min-w-0 flex-col">
              <WireTitle className="truncate">Execution failures</WireTitle>
              <WireText tone="faint">ISS-204 · opened today</WireText>
            </span>
            <WireTabs
              items={["Execution flow", "Impacted dependencies"]}
              active={0}
            />
            <div className="min-h-[26px] flex-1">
              <TinyGraph />
            </div>
            <span className="hidden shrink-0 items-center gap-1 tablet:flex">
              <WireDot level="critical" />
              <WireText tone="faint" className="!inline truncate">
                Trace · 4 affected artifacts
              </WireText>
            </span>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
