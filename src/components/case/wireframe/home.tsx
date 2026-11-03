import type { ReactNode } from "react";

import {
  WireBadge,
  WireBlankStat,
  WireButton,
  WireCard,
  WireDot,
  WireFigure,
  WireIcon,
  WirePanel,
  WireRecent,
  WireScreen,
  WireSection,
  WireShape,
  WireShortcut,
  WireSlot,
  WireTabs,
  WireText,
  type IconName,
} from "./Wire";

/**
 * Home, in the three shapes the case study takes it through.
 *
 * These are drawn to the written iteration, not to the captures. The captures
 * settled what sits where and in what order; everything inside a section is
 * abstracted, because the case study's argument is about the order and the
 * weight of the sections, never about what any particular figure measured.
 *
 * ── The test each element has to pass ────────────────────────────────────
 * Does it explain what changed between V1, V2 and the final version? Quick
 * actions does: it did not exist in V1. Recent artifacts does: it moved. The
 * monitoring blocks do: they led the page, then grew, then went. A success
 * rate, a token count, a latency percentile, a trend chip, a time-range
 * control — none of them does, so none of them is here. The monitoring cards
 * are drawn as a label and a figure with nothing written in either.
 *
 * Nothing is traced from a capture and every name is invented. There is no
 * real performance data on these pages because there are no numbers on them
 * at all.
 *
 * ── Why these three scroll ───────────────────────────────────────────────
 * V1 is four sections deep and V2 is four more. Squeezed into one frame they
 * would be a smudge; cropped to a frame they would lose the sections the
 * iteration is about. `WireFigure` gives them a preview window instead: a
 * fixed box with the page at its own size inside it, scrolled.
 */

/* -------------------------------------------------------------------------- */
/* Pieces the three versions share                                            */
/* -------------------------------------------------------------------------- */

/** The welcome area: a greeting, a line about the day, and the two actions. */
function Header({
  lead,
  note,
  strong,
  catalog = "Explore agent catalog",
}: {
  lead: string;
  note: ReactNode;
  strong?: boolean;
  catalog?: string;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-2">
      <div className="flex min-w-0 flex-col gap-1">
        <span
          className="text-[15px] leading-tight font-semibold tablet:text-[17px]"
          style={{ color: "var(--wf-ink)" }}
        >
          {lead}
        </span>
        <span
          className="text-[10px] leading-snug tablet:text-[11px]"
          style={{ color: strong ? "var(--wf-ink)" : "var(--wf-ink-soft)" }}
        >
          {note}
        </span>
      </div>
      <span className="flex flex-wrap items-center gap-1.5">
        <WireButton variant="solid" icon="plus">
          Create artifact
        </WireButton>
        <WireButton variant="outline" icon="open">
          {catalog}
        </WireButton>
      </span>
    </div>
  );
}

/** `Edit shortcuts`, `View all` — the one control a section actually needs. */
function Action({ label, icon }: { label: string; icon: IconName }) {
  return (
    <span className="flex items-center gap-1">
      <WireText tone="faint" className="!inline">
        {label}
      </WireText>
      <WireIcon name={icon} tone="faint" />
    </span>
  );
}

/**
 * A fleet card: a category, and an abstract sense of its state.
 *
 * No count and no percentage. What V1 is being criticised for is putting a
 * fleet-wide summary first, not the particular summary it chose.
 */
function FleetCard({ label, icon }: { label: string; icon: IconName }) {
  return (
    <div
      className="flex min-w-0 flex-col gap-2 rounded-[4px] border p-2"
      style={{ borderColor: "var(--wf-line)", background: "var(--wf-screen)" }}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <WireIcon name={icon} />
        <span
          className="truncate text-[9px] leading-none tablet:text-[10px]"
          style={{ color: "var(--wf-ink-soft)" }}
        >
          {label}
        </span>
      </span>
      <WireShape kind="split" />
    </div>
  );
}

/**
 * The artifact table, at the four columns a builder scans by.
 *
 * The original carries eight, half of them operational. Those columns are what
 * made the page dense, which the drawing shows through the table's size and
 * its place on the page rather than by reproducing the measurements.
 */
function ArtifactTable() {
  const cols =
    "grid grid-cols-[1.6fr_0.9fr_0.8fr] tablet:grid-cols-[1.8fr_1fr_0.8fr_1fr] gap-2";
  const rows: [string, string, IconName, string, string][] = [
    ["Order triage", "Workflow", "flow", "Live", "2h ago"],
    ["Refund classifier", "Agent", "agent", "Live", "Yesterday"],
    ["Catalog lookup", "Tool", "tool", "Draft", "3d ago"],
    ["Policy index", "Knowledge", "book", "Live", "5d ago"],
  ];
  return (
    <WirePanel>
      <div
        className={`${cols} border-b px-2 py-1.5`}
        style={{
          borderColor: "var(--wf-line)",
          background: "var(--wf-surface-2)",
        }}
      >
        {["Artifact", "Type", "Status", "Last updated"].map((h, i) => (
          <span
            key={h}
            className={`truncate text-[9px] leading-none font-semibold tablet:text-[10px] ${i === 3 ? "hidden tablet:block" : ""}`}
            style={{ color: "var(--wf-ink-soft)" }}
          >
            {h}
          </span>
        ))}
      </div>
      {rows.map(([name, type, icon, status, updated]) => (
        <div
          key={name}
          className={`${cols} items-center border-b px-2 py-2 last:border-b-0`}
          style={{ borderColor: "var(--wf-line)" }}
        >
          <span
            className="truncate text-[9px] leading-tight font-medium tablet:text-[10px]"
            style={{ color: "var(--wf-ink)" }}
          >
            {name}
          </span>
          <span className="flex min-w-0 items-center gap-1">
            <WireIcon name={icon} />
            <span
              className="truncate text-[9px] leading-tight tablet:text-[10px]"
              style={{ color: "var(--wf-ink-soft)" }}
            >
              {type}
            </span>
          </span>
          <span className="flex min-w-0">
            <WireBadge>{status}</WireBadge>
          </span>
          <span
            className="hidden truncate text-[9px] leading-tight tablet:block tablet:text-[10px]"
            style={{ color: "var(--wf-ink-faint)" }}
          >
            {updated}
          </span>
        </div>
      ))}
    </WirePanel>
  );
}

/** The three cards under `Your most recent`, which every version carries. */
function MostRecent() {
  return (
    <WireSection
      title="Your most recent"
      action={<Action label="View all" icon="open" />}
    >
      <div className="grid grid-cols-1 gap-1.5 tablet:grid-cols-3 tablet:gap-2">
        <WireRecent
          title="Customer support agent"
          type="Agent"
          modified="Modified 5h ago"
        />
        <WireRecent
          title="Invoice intake"
          type="Workflow"
          modified="Modified 7h ago"
        />
        <WireRecent
          title="Lead gen bot"
          type="Agent"
          modified="Modified 8h ago"
        />
      </div>
    </WireSection>
  );
}

/* -------------------------------------------------------------------------- */
/* V1 — the landing page as a monitoring console                              */
/* -------------------------------------------------------------------------- */

/**
 * V1 — four sections, and the builder's own work is the third of them.
 *
 * Fleet overview, an artifact table, the three things they touched last, then
 * a second monitoring block the same size again. Nothing on the page is a
 * shortcut, and a builder returning to work scrolls past two blocks of
 * fleet-wide summary to reach anything of their own. The drawing has to be
 * long enough for that to be felt rather than described.
 */
export function HomeV1() {
  return (
    <WireFigure
      scroll
      alt="Wireframe of the first Home concept: a welcome message, then a Fleet overview of five artifact-category cards, a simple artifact table, the builder's most recent work, and a second Health block of six monitoring cards. Monitoring fills the page and nothing on it is a shortcut."
    >
      <HomeV1Page />
    </WireFigure>
  );
}

/**
 * V1's page on its own, without the preview window around it.
 *
 * Metrics V1 shows this page beside the Metrics page, because the decision it
 * is about is that the two existed separately. It renders the same component
 * rather than a copy: a second drawing of Home would drift from this one the
 * first time either changed.
 *
 * `compact` stops after the artifact table. Metrics V1 is making a point about
 * where things lived, not re-telling Home's own iteration, and the two blocks
 * it leaves out would double the height of a column that is already beside
 * another page.
 */
export function HomeV1Page({
  compact,
  framed,
}: {
  compact?: boolean;
  /** Draw the window's edge: for a page that is not inside a preview box. */
  framed?: boolean;
}) {
  return (
    <WireScreen height="natural" framed={framed}>
      <Header
        lead="Good afternoon, Alex"
        note="Your agentic fleet needs attention."
      />
      <WireTabs items={["Overview", "Alerts", "Metrics"]} active={0} />

      <WireSection title="Fleet overview">
        <div className="grid grid-cols-2 gap-1.5 tablet:grid-cols-5 tablet:gap-2">
          <FleetCard label="Agents" icon="agent" />
          <FleetCard label="Agentic workflows" icon="flow" />
          <FleetCard label="Tools" icon="tool" />
          <FleetCard label="Knowledge" icon="book" />
          <FleetCard label="Connections" icon="link" />
        </div>
      </WireSection>

      <WireSection title="Artifacts">
        <ArtifactTable />
      </WireSection>

      {compact ? null : <MostRecent />}

      {compact ? null : (
        <WireSection title="Health">
          <div className="grid grid-cols-2 gap-1.5 tablet:grid-cols-2 tablet:gap-2">
            {(
              [
                ["Agents", "agent", "ring"],
                ["Agentic workflows", "flow", "bars"],
                ["Tools", "tool", "bars"],
                ["Connections", "link", "split"],
                ["Models", "chart", "ring"],
                ["Knowledge", "book", "split"],
              ] as const
            ).map(([label, icon, shape]) => (
              <WireCard key={label} title={label} icon={icon}>
                <div className="flex items-center gap-2 pt-1">
                  {shape === "ring" ? (
                    <WireShape kind="ring" />
                  ) : (
                    <span className="min-w-0 flex-1">
                      <WireShape kind={shape} />
                    </span>
                  )}
                  {shape === "ring" ? (
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <WireShape kind="split" />
                      <WireShape kind="split" />
                    </span>
                  ) : null}
                </div>
              </WireCard>
            ))}
          </div>
        </WireSection>
      )}
    </WireScreen>
  );
}

/* -------------------------------------------------------------------------- */
/* V2 — the builder's own work moves above the fleet                          */
/* -------------------------------------------------------------------------- */

/**
 * V2 — shortcuts arrive, and the order of the page changes.
 *
 * Quick actions is the first thing under the tab row, with three empty slots
 * saying plainly that it is the builder's to fill. Recent work follows. The
 * monitoring block survives and grows — a tab per artifact type and a panel
 * twice the size of V1's — but it has been moved below the two things a
 * builder came for, and the table below that. The decision is the order, so
 * all four sections have to be in the drawing.
 */
export function HomeV2() {
  return (
    <WireFigure
      scroll
      alt="Wireframe of the second Home concept: Quick actions with two shortcut cards and three empty slots, then the builder's most recent work, then an expanded Fleet overview with a tab per artifact type and a panel of unlabelled figures and charts, and a simple artifact table last."
    >
      <HomeV2Page />
    </WireFigure>
  );
}

/**
 * V2's page on its own, without the preview window around it.
 *
 * Metrics V2 puts it beside the Metrics page, because what that round did was
 * take the fleet metrics off this page and consolidate them over there. It
 * renders this component rather than a copy of it, and `compact` keeps only
 * what that argument needs — the greeting, one row of shortcuts and the fleet
 * block — because the recent work and the artifact table below would leave a
 * column standing twice the height of the page it is being compared with.
 */
export function HomeV2Page({
  compact,
  framed,
}: {
  compact?: boolean;
  /** Draw the window's edge: for a page that is not inside a preview box. */
  framed?: boolean;
}) {
  return (
    <WireScreen height="natural" framed={framed}>
      <Header
        lead="Good afternoon, Alex"
        note="Your agentic fleet needs attention."
      />
      <WireTabs items={["Overview", "Issues", "Metrics"]} active={0} />

      <WireSection
        title="Quick actions"
        action={<Action label="Edit shortcuts" icon="pin" />}
      >
        {/* Five across is right in a full column and wrong in half of one:
            beside the Metrics page the cards would be 70px wide and every
            label would break. Compact keeps two cards and one slot, which is
            as much as that argument needs. */}
        <div
          className={`grid gap-1.5 tablet:gap-2 ${compact ? "grid-cols-1 tablet:grid-cols-3" : "grid-cols-2 tablet:grid-cols-5"}`}
        >
          <WireShortcut
            title="Order triage"
            icon="flow"
            body="A workflow you pinned."
            action="View workflow"
          />
          <WireShortcut
            title="Trace explorer"
            icon="chart"
            body="A tool you pinned."
            action="View traces"
          />
          <WireSlot />
          {compact ? null : (
            <>
              <WireSlot className="hidden tablet:flex" />
              <WireSlot className="hidden tablet:flex" />
            </>
          )}
        </div>
      </WireSection>

      {/* Compact also drops this. Beside the Metrics page the argument is
          Home's fleet block and where it went; the builder's recent work is
          three more cards of height that take no part in it. */}
      {compact ? null : <MostRecent />}

      <WireSection title="Fleet overview">
        <WirePanel>
          <div
            className="border-b px-2 pt-2"
            style={{ borderColor: "var(--wf-line)" }}
          >
            <WireTabs
              items={[
                "Agents",
                "Workflows",
                "Tools",
                "Knowledge",
                "Connections",
                "Models",
              ]}
              active={0}
              className="!border-b-0"
            />
          </div>

          {/* Six figures and two charts, none of them saying what they
                measure: the point is that the block doubled in size. */}
          <div className="grid grid-cols-2 gap-1.5 p-2 tablet:grid-cols-3 tablet:gap-2 desktop:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <WireBlankStat
                key={i}
                className={i > 2 ? "hidden tablet:flex" : ""}
              />
            ))}
          </div>

          <div
            className="grid grid-cols-1 gap-2 border-t p-2 tablet:grid-cols-[0.7fr_1.3fr]"
            style={{ borderColor: "var(--wf-line)" }}
          >
            <div className="flex items-center justify-center py-1">
              <WireShape kind="ring" className="!size-12" />
            </div>
            <div className="flex min-w-0 items-end py-1">
              <WireShape kind="bars" className="!h-12" />
            </div>
          </div>
        </WirePanel>
      </WireSection>

      {compact ? null : (
        <WireSection title="Artifacts">
          <ArtifactTable />
        </WireSection>
      )}
    </WireScreen>
  );
}

/* -------------------------------------------------------------------------- */
/* Final — a starting point for the day                                       */
/* -------------------------------------------------------------------------- */

/**
 * Final — the fleet is gone and two things take its place.
 *
 * The welcome message carries the one count that decides what a builder does
 * next, and under it the page is their pins beside the issues waiting for
 * them. No fleet block and no monitoring panel: those moved to Metrics, which
 * is the change this version is making. Recent work keeps its place at the
 * foot, and `Overview` has become `Home`.
 */
export function HomeFinal() {
  return (
    <WireFigure
      scroll
      alt="Wireframe of the final Home concept: the welcome message states that critical issues need attention, pinned shortcuts with two empty slots sit beside a Latest issues list of four issues, and the builder's most recent work closes the page. No fleet-wide monitoring remains."
    >
      <HomeFinalPage />
    </WireFigure>
  );
}

/**
 * The final Home page on its own, without the preview window around it.
 *
 * Solution Overview shows the same page with the pinning interaction played
 * over it, and renders this rather than a second drawing of it: the two
 * sections are meant to be the same design, and a copy would drift the first
 * time either changed.
 *
 * `pinned` is how many of the four shortcut places are filled. The rest are
 * the empty slots the product offers, which is what the pointer presses.
 */
export function HomeFinalPage({
  pinned = 2,
  activeSlot,
  framed,
}: {
  pinned?: number;
  /** Marks the first empty slot, which is what Solution Overview presses. */
  activeSlot?: boolean;
  /** Draw the window's edge: for a page that is not inside a preview box. */
  framed?: boolean;
}) {
  const shortcuts = [
    {
      title: "Order triage",
      icon: "flow" as const,
      body: "A workflow you pinned.",
      action: "View workflow",
    },
    {
      title: "Trace explorer",
      icon: "chart" as const,
      body: "A tool you pinned.",
      action: "View traces",
    },
    {
      /* Only Solution Overview ever shows a third: it is the one its loop
         adds, chosen from the shortcut panel's suggestions rather than being
         one of the artifacts already pinned. */
      title: "Critical alerts",
      icon: "alert" as const,
      body: "Jump to the issues that need attention.",
      action: "Review alerts",
    },
  ].slice(0, Math.max(0, Math.min(pinned, 3)));

  return (
    <WireScreen height="natural" framed={framed}>
      <Header
        lead="Good morning, Alex"
        note={
          <>
            You have <strong>2 critical issues</strong> requiring attention.
          </>
        }
        strong
        catalog="Explore artifact catalog"
      />
      <WireTabs items={["Home", "Issues", "Metrics"]} active={0} />

      <div className="grid grid-cols-1 gap-3 tablet:grid-cols-[0.85fr_1fr]">
        <WireSection
          title="Pinned shortcuts"
          action={<Action label="Edit shortcuts" icon="pin" />}
        >
          <div className="grid grid-cols-2 gap-1.5 tablet:gap-2">
            {shortcuts.map((c) => (
              <WireShortcut key={c.title} {...c} />
            ))}
            {Array.from({ length: 4 - shortcuts.length }).map((_, i) => (
              <WireSlot key={i} active={i === 0 && activeSlot} />
            ))}
          </div>
        </WireSection>

        <WireSection
          title="Latest issues"
          action={<Action label="View all" icon="open" />}
        >
          <WirePanel>
            {(
              [
                ["critical", "Execution failures", "Order triage · Agent"],
                ["critical", "Connection failure", "Invoice intake · Workflow"],
                ["warning", "Latency above target", "Catalog lookup · Tool"],
                ["warning", "Indexing incomplete", "Policy index · Knowledge"],
              ] as const
            ).map(([level, title, artifact]) => (
              <div
                key={title}
                className="flex min-w-0 items-center gap-2 border-b px-2 py-2 last:border-b-0"
                style={{ borderColor: "var(--wf-line)" }}
              >
                <WireDot level={level} />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span
                    className="truncate text-[10px] leading-tight font-medium tablet:text-[11px]"
                    style={{ color: "var(--wf-ink)" }}
                  >
                    {title}
                  </span>
                  <span
                    className="truncate text-[9px] leading-tight tablet:text-[10px]"
                    style={{ color: "var(--wf-ink-faint)" }}
                  >
                    {artifact}
                  </span>
                </span>
              </div>
            ))}
          </WirePanel>
        </WireSection>
      </div>

      <MostRecent />
    </WireScreen>
  );
}
