"use client";

import type { ReactNode } from "react";

import { HomeV1Page, HomeV2Page } from "./home";
import {
  WireBadge,
  WireBar,
  WireBlankStat,
  WireButton,
  WireCard,
  WireChartBox,
  WireDonut,
  WireDot,
  WireFigure,
  WireIcon,
  WireLineChart,
  WirePanel,
  WireRow,
  WireScreen,
  WireSearch,
  WireSection,
  WireSegmented,
  WireShape,
  WireTabs,
  WireText,
  WireTitle,
  type IconName,
} from "./Wire";

/**
 * Metrics, in the four turns the case study takes it through.
 *
 * Drawn to the written iteration at the fidelity Home and Issues now use. The
 * captures settled the structure; the content is abstract, because what the
 * section argues about is where metrics lived and how a builder reached them,
 * never what any particular figure read.
 *
 * ── What each turn has to say ────────────────────────────────────────────
 * V1 is two pages side by side: operational health on Overview, usage and cost
 * on Metrics. V2 is the same Metrics page with pin slots left empty — the
 * capture shows no more than that, so the consolidation the narrative
 * describes is drawn as a small labelled inset rather than invented as a
 * dashboard. V2.5 is four compact cards, each built around a different kind of
 * information. The final version is a hierarchy on the left and one artifact's
 * views on the right, behind real tabs.
 *
 * The final concept was never usability tested. Nothing here presents it as
 * measured, and there are no measurements on it to mistake for results.
 */

/* -------------------------------------------------------------------------- */
/* Pieces the Metrics page shares across V1 and V2                            */
/* -------------------------------------------------------------------------- */

const PAGE_TABS = ["Overview", "Alerts", "Metrics"];

/** A pinned metric: a name, and a figure left deliberately unreadable. */
function PinnedCard({
  label,
  icon,
  className,
}: {
  label: string;
  icon: IconName;
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-1.5 rounded-[4px] border p-2 ${className ?? ""}`}
      style={{ borderColor: "var(--wf-line)", background: "var(--wf-screen)" }}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <WireIcon name={icon} />
        <span
          className="line-clamp-2 text-[9px] leading-tight tablet:text-[10px]"
          style={{ color: "var(--wf-ink-soft)" }}
        >
          {label}
        </span>
      </span>
      <WireBar w="46%" h={9} />
    </div>
  );
}

/**
 * The analytics pair, which both V1 and V2 carry unchanged.
 *
 * One panel about how much is being used, one about what it costs. The
 * original spells both out down to a daily burn rate against a monthly budget;
 * those are the business figures this branch does not publish, so they are a
 * trend and a proportion with nothing written on them.
 */
function Analytics() {
  return (
    <WireSection
      title="Analytics"
      action={
        <span className="flex items-center gap-1">
          <WireText tone="faint" className="!inline">
            Full analytics
          </WireText>
          <WireIcon name="open" tone="faint" />
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-1.5 tablet:grid-cols-2 tablet:gap-2">
        <WireCard title="Usage">
          <WireText tone="faint">Consumption by artifact</WireText>
          <span className="flex flex-col gap-1">
            {["58%", "34%", "20%"].map((w, i) => (
              <span key={i} className="flex items-center gap-2">
                <WireBar w="34%" h={4} tone="soft" />
                <span className="min-w-0 flex-1">
                  <WireBar w={w} h={5} />
                </span>
              </span>
            ))}
          </span>
          <WireChartBox>
            <WireLineChart points={[16, 22, 18, 28, 24, 34, 26, 30]} />
          </WireChartBox>
        </WireCard>

        <WireCard title="Cost">
          <WireText tone="faint">Spend against budget</WireText>
          <span className="flex items-center gap-3 py-1">
            <WireDonut pct={78} className="size-11 shrink-0" />
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <WireBar w="54%" h={5} tone="soft" />
              <WireBar w="38%" h={5} tone="soft" />
              <WireShape kind="split" />
            </span>
          </span>
        </WireCard>
      </div>
    </WireSection>
  );
}

/** The Metrics page itself: pinned figures over the analytics pair. */
function MetricsPage({ framed }: { framed?: boolean }) {
  return (
    <WireScreen height="natural" framed={framed} railActive={2}>
      <WireTabs items={PAGE_TABS} active={2} />

      <WireSection
        title="Pinned metrics"
        action={
          <span className="flex items-center gap-1">
            <WireText tone="faint" className="!inline">
              Edit pins
            </WireText>
            <WireIcon name="pin" tone="faint" />
          </span>
        }
      >
        <div className="grid grid-cols-2 gap-1.5 tablet:grid-cols-4 tablet:gap-2">
          <PinnedCard label="Total conversations" icon="agent" />
          <PinnedCard label="Usage" icon="chart" />
          <PinnedCard label="Active users" icon="user" />
          <PinnedCard label="Estimated cost" icon="book" />
        </div>
      </WireSection>

      <Analytics />
    </WireScreen>
  );
}

/* -------------------------------------------------------------------------- */
/* V1 — two pages, two purposes                                               */
/* -------------------------------------------------------------------------- */

/** A labelled miniature inside the V1 comparison. */
function Side({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <WireText tone="faint">{label}</WireText>
      <div
        className="min-w-0 overflow-hidden rounded-[5px] border"
        style={{ borderColor: "var(--wf-line)" }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * V1 — operational health on one page, usage and cost on another.
 *
 * The only drawing in the case study that shows two pages at once, because a
 * decision about where things live cannot be shown on one. The left half is
 * the Home V1 component itself rather than a second drawing of it, stopped
 * after the artifact table so the comparison stays readable.
 */
export function MetricsV1() {
  return (
    <WireFigure
      scroll
      alt="Wireframe of the first Metrics concept, drawn as two pages side by side: the Overview page carrying the welcome message, fleet overview and artifact table, and a separate Metrics page carrying pinned metrics over usage and cost analytics."
    >
      <div className="flex w-full flex-col gap-3 p-3 tablet:p-4">
        <div className="grid grid-cols-1 items-start gap-3 tablet:grid-cols-2">
          <Side label="Overview page · operational health">
            <HomeV1Page compact />
          </Side>
          <Side label="Metrics page · usage and cost">
            <MetricsPage />
          </Side>
        </div>
      </div>
    </WireFigure>
  );
}

/* -------------------------------------------------------------------------- */
/* V2 — the scattered metrics gathered into one tabbed block                  */
/* -------------------------------------------------------------------------- */

/**
 * The consolidated Fleet overview this round proposed.
 *
 * One block, a tab per artifact type, and health and performance grouped
 * under their own headings instead of scattered across two pages. The figures
 * are blank on purpose: what the round decided is where these live and how
 * they are grouped, not what any one of them read.
 */
function ConsolidatedFleet() {
  return (
    <WireScreen height="natural" railActive={2}>
      <WireTabs items={PAGE_TABS} active={2} />

      <WireSection
        title="Fleet overview"
        action={<WireSegmented items={["Personal", "Team"]} />}
      >
        <WirePanel>
          <div
            className="border-b px-2 pt-2"
            style={{ borderColor: "var(--wf-line)" }}
          >
            <WireTabs
              items={["All", "Agents", "Workflows", "Tools", "Knowledge"]}
              active={0}
              className="!border-b-0"
            />
          </div>

          <div className="flex flex-col gap-1.5 p-2">
            <WireText tone="faint">Health</WireText>
            <div className="grid grid-cols-2 gap-1.5 tablet:grid-cols-4 tablet:gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <WireBlankStat
                  key={i}
                  className={i > 1 ? "hidden tablet:flex" : ""}
                />
              ))}
            </div>
          </div>

          <div
            className="flex flex-col gap-1.5 border-t p-2"
            style={{ borderColor: "var(--wf-line)" }}
          >
            <WireText tone="faint">Performance</WireText>
            <div className="grid grid-cols-2 gap-1.5 tablet:grid-cols-4 tablet:gap-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <WireBlankStat key={i} />
              ))}
              <div className="col-span-2 flex min-w-0 items-end">
                <WireShape kind="bars" className="!h-9" />
              </div>
            </div>
          </div>

          {/* The third group is here because consolidating means this page
              now carries what Home used to and more besides: usage over time
              had nowhere to live while the figures were split across two
              pages. */}
          <div
            className="flex flex-col gap-1.5 border-t p-2"
            style={{ borderColor: "var(--wf-line)" }}
          >
            <WireText tone="faint">Usage over time</WireText>
            <WireChartBox className="!h-[52px] tablet:!h-[64px]">
              <WireLineChart points={[12, 18, 15, 24, 21, 30, 27, 34]} />
            </WireChartBox>
          </div>
        </WirePanel>
      </WireSection>
    </WireScreen>
  );
}

/**
 * V2 — the fleet metrics leave Home and arrive in one place.
 *
 * Drawn as a comparison like V1, because the decision is again about where
 * things live: Home's own fleet block on the left, and on the right the
 * single tabbed Fleet overview that replaced it and the Health section both.
 * The left half is the Home V2 component itself, stopped after its fleet
 * block, so the two sections cannot drift apart.
 *
 * Both halves are cut to the argument rather than drawn whole: a column that
 * runs twice the height of the one beside it is read as the more important
 * of the two, and leaves the shorter one sitting in a field of white.
 */
export function MetricsV2() {
  return (
    <WireFigure
      scroll
      alt="Wireframe of the second Metrics concept, drawn as two pages side by side: the Home page still carrying its own fleet block on the left, and on the right one consolidated Fleet overview with a tab per artifact type and health and performance grouped under their own headings."
    >
      <div className="flex w-full flex-col gap-3 p-3 tablet:p-4">
        <div className="grid grid-cols-1 items-start gap-3 tablet:grid-cols-2">
          <Side label="Home · fleet metrics scattered here">
            <HomeV2Page compact />
          </Side>
          <Side label="Metrics · one tabbed Fleet overview">
            <ConsolidatedFleet />
          </Side>
        </div>
      </div>
    </WireFigure>
  );
}

/* -------------------------------------------------------------------------- */
/* V2.5 — four cards, four kinds of information                               */
/* -------------------------------------------------------------------------- */

/** The shell the four studies share: a title, an action, one body. */
function Study({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: IconName;
  action: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex min-w-0 flex-col gap-2 rounded-[4px] border p-2 tablet:p-2.5"
      style={{ borderColor: "var(--wf-line)", background: "var(--wf-screen)" }}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <WireIcon name={icon} />
        <WireTitle className="truncate">{title}</WireTitle>
        <span className="flex-1" />
        <span
          className="shrink-0 text-[9px] leading-none tablet:text-[10px]"
          style={{ color: "var(--wf-accent)" }}
        >
          {action}
        </span>
      </span>
      {children}
    </div>
  );
}

/** A figure with its name, small enough for four to a card. */
function MiniFigure({ label }: { label: string }) {
  return (
    <span className="flex min-w-0 flex-col gap-1">
      <span
        className="truncate text-[8px] leading-none tablet:text-[9px]"
        style={{ color: "var(--wf-ink-faint)" }}
      >
        {label}
      </span>
      <WireBar w="62%" h={8} />
    </span>
  );
}

/**
 * V2.5 — the round that asked what a metric card should hold.
 *
 * Four cards, each built around a different kind of information rather than
 * four copies of one shape: a trend, a set of relationships, a health roll-up
 * and an inventory. Each carries one affordance, because what the round found
 * was that builders wanted to act from the card rather than read it.
 */
export function MetricsV25() {
  return (
    <WireFigure
      size="hug"
      alt="Wireframe of the Metrics V2.5 explorations: four compact artifact-specific metric cards in a two-by-two grid. Runtime is built around a trend, Network around related artifacts, Connections around a health roll-up and Tools around an inventory, each with one action and one contextual note."
    >
      {/* No window around these. They are four cards from an exploration,
          not a page, so the figure is as tall as they are. */}
      <div className="flex w-full flex-col gap-2">
        <WireText tone="faint">
          Artifact-specific metric cards · explored in this round
        </WireText>

        {/* Top-aligned at their own heights. Stretched to fill the preview
            they grow a hole inside each card, which is the thing this round of
            the drawing was meant to fix; space left under the grid reads as
            page margin instead. */}
        <div className="grid grid-cols-1 items-start gap-2 tablet:grid-cols-2">
          {/* Trend-led. */}
          <Study title="Runtime" icon="clock" action="View runs">
            <span className="grid grid-cols-3 gap-2">
              <MiniFigure label="Runs" />
              <MiniFigure label="Success" />
              <MiniFigure label="Response" />
            </span>
            <WireChartBox className="!h-[38px] tablet:!h-[44px]">
              <WireLineChart points={[14, 20, 16, 26, 22, 32, 24, 28]} />
            </WireChartBox>
            <span className="flex flex-wrap items-center gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                <WireDot level="warning" />
                <WireText tone="soft" className="!inline truncate">
                  Slower than usual this week
                </WireText>
              </span>
              <span className="flex-1" />
              <WireSegmented items={["Day", "Week", "Month"]} active={1} />
            </span>
          </Study>

          {/* Relationship-led. */}
          <Study title="Network" icon="chart" action="Explore">
            <span className="grid grid-cols-2 gap-2">
              <MiniFigure label="Subagents" />
              <MiniFigure label="Workflows" />
            </span>
            <span className="flex flex-col gap-1">
              <WireText tone="faint">Related artifacts</WireText>
              {["Intake step", "Routing step", "Resolution agent"].map((n) => (
                <span key={n} className="flex items-center gap-1.5">
                  <WireIcon name="link" />
                  <span
                    className="min-w-0 flex-1 truncate text-[9px] leading-tight tablet:text-[10px]"
                    style={{ color: "var(--wf-ink-soft)" }}
                  >
                    {n}
                  </span>
                  <WireBar w={22} h={4} tone="soft" />
                </span>
              ))}
            </span>
            {/* The relationship strip: the card's own small picture of what
                the artifact is wired to. */}
            <span
              className="flex items-center gap-1 border-t pt-2"
              style={{ borderColor: "var(--wf-line)" }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="flex min-w-0 flex-1 items-center gap-1"
                >
                  <WireBar w="100%" h={5} tone="soft" />
                  <WireIcon name="link" tone="faint" />
                </span>
              ))}
              <WireBar w={18} h={5} />
            </span>
          </Study>

          {/* Health-led. */}
          <Study title="Connections" icon="link" action="Manage">
            <span className="flex items-center gap-2">
              <WireDonut pct={72} className="size-9 shrink-0" />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <WireText tone="faint">Connection health</WireText>
                <WireShape kind="split" />
              </span>
            </span>
            <WirePanel>
              {(
                [
                  ["Connection A", "warning", "Needs attention"],
                  ["Connection B", "info", "Healthy"],
                ] as const
              ).map(([name, level, status]) => (
                <WireRow
                  key={name}
                  level={level}
                  title={name}
                  right={<WireBadge>{status}</WireBadge>}
                />
              ))}
            </WirePanel>
            <WireButton variant="outline" icon="link" className="self-start">
              Review connections
            </WireButton>
          </Study>

          {/* Inventory-led. */}
          <Study title="Tools" icon="tool" action="Inspect">
            <span className="grid grid-cols-3 gap-2">
              <MiniFigure label="In use" />
              <MiniFigure label="Shared" />
              <MiniFigure label="Idle" />
            </span>
            <WirePanel>
              {(
                [
                  ["Tool A", "info"],
                  ["Tool B", "warning"],
                  ["Tool C", "info"],
                ] as const
              ).map(([name, level]) => (
                <WireRow
                  key={name}
                  level={level}
                  title={name}
                  right={<WireBar w={30} h={4} tone="soft" />}
                />
              ))}
            </WirePanel>
            {/* A hint that a figure explains itself on hover, which is one of
                the things this round was testing. */}
            <span className="flex items-center gap-1.5">
              <span
                className="flex size-3.5 shrink-0 items-center justify-center rounded-full border text-[8px] leading-none"
                style={{
                  borderColor: "var(--wf-line-strong)",
                  color: "var(--wf-ink-faint)",
                }}
              >
                i
              </span>
              <WireText tone="faint" className="!inline truncate">
                Hover a figure for context
              </WireText>
            </span>
          </Study>
        </div>
      </div>
    </WireFigure>
  );
}

/* -------------------------------------------------------------------------- */
/* Final — one artifact at a time                                             */
/* -------------------------------------------------------------------------- */

/**
 * The artifacts the final concept is navigated by.
 *
 * Three of them, invented, and deliberately unalike: an agent, a workflow and
 * a tool. Solution Overview moves between them to show that choosing one
 * changes what the panel reads, so each carries its own bar widths, its own
 * curve and its own dependencies. None of those is a measurement of anything.
 */
export interface Artifact {
  id: string;
  name: string;
  type: string;
  icon: IconName;
  /** How full each of the four summary bars is drawn. */
  stats: [string, string, string, string];
  points: number[];
  deps: [string, string][];
  related: [
    string,
    string,
    IconName,
    "critical" | "warning" | "info",
    string,
  ][];
}

export const ARTIFACTS: Artifact[] = [
  {
    id: "order",
    name: "Order assistant",
    type: "Agent",
    icon: "agent",
    stats: ["44%", "62%", "38%", "54%"],
    points: [16, 22, 18, 28, 24, 34, 26, 30, 22, 28],
    deps: [
      ["Subagents", "40%"],
      ["Workflows", "55%"],
      ["Tools", "30%"],
      ["Knowledge", "25%"],
    ],
    related: [
      ["Intake step", "Workflow", "flow", "info", "Healthy"],
      ["Routing step", "Workflow", "flow", "warning", "Degraded"],
      ["Lookup tool", "Tool", "tool", "info", "Healthy"],
    ],
  },
  {
    id: "invoice",
    name: "Invoice workflow",
    type: "Workflow",
    icon: "flow",
    stats: ["68%", "35%", "58%", "30%"],
    points: [28, 20, 26, 16, 22, 14, 24, 18, 30, 22],
    deps: [
      ["Steps", "60%"],
      ["Tools", "35%"],
      ["Connections", "45%"],
      ["Knowledge", "20%"],
    ],
    related: [
      ["Approval step", "Workflow", "flow", "info", "Healthy"],
      ["Ledger tool", "Tool", "tool", "info", "Healthy"],
      ["Billing server", "Server", "server", "warning", "Degraded"],
    ],
  },
  {
    id: "search",
    name: "Search tool",
    type: "Tool",
    icon: "tool",
    stats: ["30%", "52%", "70%", "42%"],
    points: [12, 18, 24, 20, 30, 26, 34, 28, 20, 24],
    deps: [
      ["Callers", "50%"],
      ["Connections", "40%"],
      ["Knowledge", "65%"],
      ["Models", "28%"],
    ],
    related: [
      ["Policy index", "Knowledge", "book", "info", "Healthy"],
      ["Order assistant", "Agent", "agent", "info", "Healthy"],
      ["Catalog server", "Server", "server", "warning", "Degraded"],
    ],
  },
];

/** A row of the artifact tree: an indent, a glyph, a name. */
function TreeRow({
  label,
  icon,
  depth = 0,
  selected,
  className,
}: {
  label: string;
  icon: IconName;
  depth?: number;
  selected?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`flex min-w-0 items-center gap-1.5 rounded-[3px] py-1 ${className ?? ""}`}
      style={{
        paddingLeft: `${6 + depth * 12}px`,
        paddingRight: "6px",
        background: selected ? "var(--wf-surface)" : "transparent",
        boxShadow: selected ? "inset 2px 0 0 var(--wf-accent)" : undefined,
      }}
    >
      {depth > 0 ? <WireIcon name="chevron" tone="faint" /> : null}
      <WireIcon name={icon} tone={selected ? "ink" : "faint"} />
      <span
        className="truncate text-[9px] leading-tight tablet:text-[10px]"
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

/**
 * The hierarchy and the search the final concept navigates by.
 *
 * The three artifacts sit under their categories with a child apiece, which is
 * what makes it a tree rather than a list. `selected` is a prop so Solution
 * Overview can move the highlight through them while this file stays the only
 * place the tree is drawn.
 */
export function ArtifactTree({ selected = "order" }: { selected?: string }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-1.5">
      <WireSearch placeholder="Search artifacts" />
      <WirePanel className="min-h-0 flex-1 p-1">
        <TreeRow icon="agent" label="Agents" />
        <TreeRow
          icon="agent"
          label="Order assistant"
          depth={1}
          selected={selected === "order"}
        />
        <TreeRow icon="agent" label="Subagents" depth={2} />
        <TreeRow icon="flow" label="Workflows" depth={2} />
        <TreeRow icon="agent" label="Billing assistant" depth={1} />
        <TreeRow icon="agent" label="Support assistant" depth={1} />
        <TreeRow icon="flow" label="Workflows" />
        <TreeRow
          icon="flow"
          label="Invoice workflow"
          depth={1}
          selected={selected === "invoice"}
        />
        <TreeRow icon="flow" label="Approval workflow" depth={1} />
        <TreeRow icon="tool" label="Tools" />
        <TreeRow
          icon="tool"
          label="Search tool"
          depth={1}
          selected={selected === "search"}
        />
        <TreeRow
          icon="tool"
          label="Ledger tool"
          depth={1}
          className="hidden tablet:flex"
        />
        <TreeRow icon="book" label="Knowledge" className="hidden tablet:flex" />
        <TreeRow
          icon="book"
          label="Policy index"
          depth={1}
          className="hidden tablet:flex"
        />
      </WirePanel>
    </div>
  );
}

/**
 * The selected artifact's panel: Overview above, Dependencies below.
 *
 * Two stacked sections, not two tabs. The capture shows them one after the
 * other on the same page, and the point of the concept is that a builder sees
 * an artifact's own performance and what it is wired to without choosing
 * between them.
 */
export function ArtifactPanel({ artifact }: { artifact: Artifact }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <WireIcon name={artifact.icon} tone="ink" />
        <WireTitle className="truncate">{artifact.name}</WireTitle>
        <WireBadge>{artifact.type}</WireBadge>
        <span className="flex-1" />
        <span className="flex shrink-0 items-center gap-1">
          <WireText tone="faint" className="!inline">
            View in builder
          </WireText>
          <WireIcon name="open" tone="faint" />
        </span>
      </div>

      {/* ---- Overview ------------------------------------------------- */}
      <WireCard className="min-w-0">
        <div className="flex items-center gap-2">
          <WireTitle>Overview</WireTitle>
          <span className="flex-1" />
          <span className="flex items-center gap-1">
            <WireText tone="faint" className="!inline">
              View all
            </WireText>
            <WireIcon name="open" tone="faint" />
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 tablet:grid-cols-4 tablet:gap-2">
          {artifact.stats.map((w, i) => (
            <div
              key={i}
              className={`flex min-w-0 flex-col gap-1.5 rounded-[4px] border p-2 ${i > 1 ? "hidden tablet:flex" : ""}`}
              style={{
                borderColor: i === 0 ? "var(--wf-accent)" : "var(--wf-line)",
                background: "var(--wf-surface-2)",
              }}
            >
              <WireBar w="58%" h={4} tone="soft" />
              <WireBar w={w} h={9} />
            </div>
          ))}
        </div>
        <span className="flex items-center gap-2">
          <WireText tone="faint">Activity over time</WireText>
          <span className="flex-1" />
          <WireSegmented items={["Day", "Week", "Month"]} active={1} />
        </span>
        <WireChartBox className="!h-[48px] tablet:!h-[58px]">
          <WireLineChart points={artifact.points} />
        </WireChartBox>
      </WireCard>

      {/* ---- Dependencies --------------------------------------------- */}
      <WireCard className="min-w-0">
        <div className="flex items-center gap-2">
          <WireTitle>Dependencies</WireTitle>
          <span className="flex-1" />
          <span className="flex items-center gap-1">
            <WireText tone="faint" className="!inline">
              View all
            </WireText>
            <WireIcon name="open" tone="faint" />
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 tablet:grid-cols-4 tablet:gap-2">
          {artifact.deps.map(([label, w], i) => (
            <div
              key={label}
              className={`flex min-w-0 flex-col gap-1.5 rounded-[4px] border p-2 ${i > 1 ? "hidden tablet:flex" : ""}`}
              style={{
                borderColor: i === 1 ? "var(--wf-accent)" : "var(--wf-line)",
                background: "var(--wf-surface-2)",
              }}
            >
              <span
                className="truncate text-[8px] leading-none tablet:text-[9px]"
                style={{ color: "var(--wf-ink-faint)" }}
              >
                {label}
              </span>
              <WireBar w={w} h={8} />
            </div>
          ))}
        </div>
        <WirePanel>
          {artifact.related.map(([name, type, icon, level, status]) => (
            <WireRow
              key={name}
              level={level}
              title={name}
              meta={type}
              right={
                <span className="flex items-center gap-1.5">
                  <WireIcon name={icon} />
                  <WireBadge>{status}</WireBadge>
                </span>
              }
            />
          ))}
        </WirePanel>
      </WireCard>
    </div>
  );
}

/**
 * Final — a hierarchy on the left, one artifact's two sections on the right.
 *
 * No pinned metrics: the round removed them, and leaving one here would
 * contradict the copy beside it.
 */
export function MetricsFinal() {
  return (
    <WireFigure
      scroll
      alt="Wireframe of the final Metrics concept: a searchable artifact hierarchy on the left and, on the right, the selected artifact with an Overview section of abstract figures and a trend above a Dependencies section of categories and related artifacts. No pinned metrics."
    >
      <WireScreen height="natural" railActive={2}>
        <WireTabs items={["Home", "Issues", "Metrics"]} active={2} />
        <div className="grid grid-cols-1 gap-2 tablet:grid-cols-[0.62fr_1fr] tablet:gap-3">
          <ArtifactTree selected="order" />
          <ArtifactPanel artifact={ARTIFACTS[0]} />
        </div>
      </WireScreen>
    </WireFigure>
  );
}
