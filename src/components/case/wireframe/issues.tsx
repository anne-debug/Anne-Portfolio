"use client";

import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  WireBadge,
  WireButton,
  WireCard,
  WireDot,
  WireFigure,
  WireIcon,
  WireLines,
  WirePanel,
  WireScreen,
  WireSection,
  WireSegmented,
  WireSelect,
  WireShape,
  WireTabs,
  WireText,
  WireTitle,
  type IconName,
} from "./Wire";

/**
 * Issues, in the three shapes the case study takes it through.
 *
 * Drawn to the written iteration, like Home. The captures settled what sits
 * where; everything inside a section is abstracted, because the argument is
 * about how many places a builder has to look, not about what any particular
 * figure measured. There are no failure rates, no latencies, no run counts and
 * no real diagnostics on these pages — the one number is the issue ID the
 * final version introduced, and that is fictional.
 *
 * ── What each version has to say ─────────────────────────────────────────
 * V1 runs three stacked sections: a row of ticket cards, a ticket list with an
 * investigation panel beside it, and impacted assets underneath. That is the
 * density the next version is reacting to. V2 deletes the ticket row and the
 * separate ticket section, folds assignment into the issue rows and renames
 * Alerts to Issues — but keeps the two-column investigation, and still keeps
 * impacted assets apart at the foot. The final version brings those together:
 * the panel grows tabs, and the separate section at the bottom is gone.
 */

/* -------------------------------------------------------------------------- */
/* Pieces the three versions share                                            */
/* -------------------------------------------------------------------------- */

/** The page's tab row. `Alerts` in V1, `Issues` from V2: the rename is a decision. */
function PageNav({ items }: { items: string[] }) {
  return <WireTabs items={items} active={1} />;
}

/** `Sort`, `View all` — the one control a section actually needs. */
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
 * The relationship diagram, drawn rather than plotted.
 *
 * Three things feeding one, and one of the links broken. That shape is the
 * whole of what the panel is for; a faithful node graph would be reproducing
 * an architecture, which is not the point and not ours to publish.
 */
export function MiniGraph({ className }: { className?: string }) {
  const node = (x: number, y: number, w = 30, h = 16) => (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx="2"
      fill="var(--wf-surface)"
      stroke="var(--wf-line-strong)"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
    />
  );
  return (
    <svg
      viewBox="0 0 240 74"
      preserveAspectRatio="xMidYMid meet"
      className={`block h-full w-full ${className ?? ""}`}
      aria-hidden
    >
      <g
        stroke="var(--wf-line-strong)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        fill="none"
      >
        <path d="M44 14h28v23h14" />
        <path d="M44 37h42" />
        <path d="M44 60h28V37h14" />
      </g>
      {/* The broken link: the only mark in the drawing saying something is
          wrong rather than how things connect. */}
      <path
        d="M150 37h22"
        stroke="var(--wf-ink)"
        strokeWidth="1.4"
        strokeDasharray="3 3"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      {node(14, 6)}
      {node(14, 29)}
      {node(14, 52)}
      {node(86, 22, 64, 30)}
      {node(172, 29, 54, 16)}
    </svg>
  );
}

/** A row in the list: how bad, what it is, and what it belongs to. */
function IssueRow({
  level,
  title,
  artifact,
  selected,
  right,
  className,
}: {
  level: "critical" | "warning" | "info";
  title: string;
  artifact: string;
  selected?: boolean;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 border-b px-2 py-2 last:border-b-0 ${className ?? ""}`}
      style={{
        borderColor: "var(--wf-line)",
        background: selected ? "var(--wf-surface)" : "transparent",
        boxShadow: selected ? "inset 2px 0 0 var(--wf-accent)" : undefined,
      }}
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
      <span className="flex-1" />
      {right}
    </div>
  );
}

/** The four issues every version lists, in the same order. */
const ISSUES: ["critical" | "warning" | "info", string, string][] = [
  ["critical", "Connection failure", "Invoice intake · Workflow"],
  ["critical", "Execution failures", "Order triage · Agent"],
  ["warning", "Latency above target", "Catalog lookup · Tool"],
  ["warning", "Indexing incomplete", "Policy index · Knowledge"],
  ["warning", "Retries above threshold", "Refund classifier · Agent"],
  ["info", "Credentials expiring", "Billing server · Server"],
  ["info", "Version deprecated", "Catalog server · Server"],
];

/**
 * The final version shows the whole list; the two before it show the first
 * four. Those two are making a point about how many *places* a builder has to
 * look, and a longer list in them would be arguing about the wrong thing.
 */
const EARLY_ISSUES = ISSUES.slice(0, 4);

/**
 * The investigation panel, which survives all three versions.
 *
 * V1 and V2 show the same thing: what failed, what it belongs to, what to do
 * with it, the relationship diagram and a line about the run. The final
 * version adds the ID, the timestamp and the tabs, which is why they are
 * options here rather than a second component.
 */
function InvestigationPanel({
  id,
  tabs,
  children,
  className,
}: {
  /** The fictional issue ID the final version introduced. */
  id?: string;
  /** The final version's tab row, where there is one. */
  tabs?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <WireCard className={className}>
      <div className="flex min-w-0 flex-wrap items-start gap-x-2 gap-y-1">
        <span className="flex min-w-0 flex-col gap-0.5">
          <WireTitle className="truncate">Execution failures</WireTitle>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span
              className="text-[9px] leading-none tablet:text-[10px]"
              style={{ color: "var(--wf-accent)" }}
            >
              Order triage · Agent
            </span>
            {id ? (
              <WireText tone="faint" className="!inline">
                {id}
              </WireText>
            ) : null}
          </span>
        </span>
        <span className="flex-1" />
        <span className="flex shrink-0 items-center gap-1.5">
          <WireSelect>Open</WireSelect>
          <WireButton icon="user">Assign</WireButton>
        </span>
      </div>

      {tabs}

      {children ?? (
        <>
          <WireText tone="faint">Artifact relationships</WireText>
          <div className="h-[62px] shrink-0 tablet:h-[70px]">
            <MiniGraph />
          </div>
          <span
            className="border-t pt-1.5"
            style={{ borderColor: "var(--wf-line)" }}
          >
            <WireText tone="faint">Execution trace</WireText>
          </span>
          <WireLines n={2} />
        </>
      )}
    </WireCard>
  );
}

/**
 * Impacted assets, the section that stayed separate until it did not.
 *
 * Its own block under the main interface in V1 and V2; in the final version it
 * is a tab inside the panel instead. Four generic columns and three rows: the
 * original's users, tokens, success rate and latency are exactly the
 * artifact-specific measurements this branch does not publish.
 */
function ImpactedAssets({
  heading = "Impacted assets",
  columns = ["Asset", "Type", "Severity", "Status"],
  action,
}: {
  heading?: string;
  columns?: [string, string, string, string];
  action?: ReactNode;
}) {
  const cols =
    "grid grid-cols-[1.5fr_1fr_0.9fr] tablet:grid-cols-[1.6fr_1fr_0.9fr_0.9fr] gap-2";
  const rows: [
    string,
    string,
    IconName,
    "critical" | "warning" | "info",
    string,
  ][] = [
    ["Customer support", "Agent", "agent", "critical", "Degraded"],
    ["Invoice processor", "Workflow", "flow", "critical", "Degraded"],
    ["Notifier", "Tool", "tool", "warning", "Healthy"],
  ];
  return (
    <WireSection title={heading} action={action}>
      <WirePanel>
        <div
          className="flex flex-col gap-1.5 border-b px-2 py-2"
          style={{ borderColor: "var(--wf-line)" }}
        >
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {(
              [
                ["critical", "Critical"],
                ["warning", "At risk"],
                ["info", "Informational"],
              ] as const
            ).map(([level, label]) => (
              <span key={label} className="flex items-center gap-1">
                <WireDot level={level} />
                <WireText tone="faint" className="!inline">
                  {label}
                </WireText>
              </span>
            ))}
          </span>
          <WireShape kind="split" />
        </div>

        <div
          className={`${cols} border-b px-2 py-1.5`}
          style={{
            borderColor: "var(--wf-line)",
            background: "var(--wf-surface-2)",
          }}
        >
          {columns.map((h, i) => (
            <span
              key={h}
              className={`truncate text-[9px] leading-none font-semibold tablet:text-[10px] ${i === 3 ? "hidden tablet:block" : ""}`}
              style={{ color: "var(--wf-ink-soft)" }}
            >
              {h}
            </span>
          ))}
        </div>

        {rows.map(([name, type, icon, level, status]) => (
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
              <WireDot level={level} />
            </span>
            <span className="hidden min-w-0 tablet:flex">
              <WireBadge>{status}</WireBadge>
            </span>
          </div>
        ))}
      </WirePanel>
    </WireSection>
  );
}

/* -------------------------------------------------------------------------- */
/* V1 — ticket-oriented                                                       */
/* -------------------------------------------------------------------------- */

/** A ticket card: what it is, how bad, and who is taking it. */
function TicketCard({
  level,
  title,
  className,
}: {
  level: "critical" | "warning" | "info";
  title: string;
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-1.5 rounded-[4px] border p-2 tablet:p-2.5 ${className ?? ""}`}
      style={{ borderColor: "var(--wf-line)", background: "var(--wf-screen)" }}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <WireDot level={level} />
        <WireTitle className="truncate">{title}</WireTitle>
      </span>
      <WireLines n={2} />
      <span
        className="mt-0.5 flex items-center gap-1.5 border-t pt-1.5"
        style={{ borderColor: "var(--wf-line)" }}
      >
        <WireButton icon="user">Assign</WireButton>
      </span>
    </div>
  );
}

/**
 * V1 — three stacked places to look.
 *
 * A row of ticket cards, then a ticket list with the investigation beside it,
 * then impacted assets on their own below. Ticket work and issue monitoring
 * are the same page and neither is obviously the way in — which is the finding
 * the next version answers, so the drawing has to carry all three sections.
 */
export function IssuesV1() {
  return (
    <WireFigure
      scroll
      alt="Wireframe of the first Issues concept: a row of ticket cards with assignment actions, then Your tickets as a ticket list beside an investigation panel, then a separate Impacted assets section. Ticket management and issue monitoring share one page."
    >
      <WireScreen height="natural" railActive={1}>
        <PageNav items={["Home", "Alerts", "Metrics"]} />

        <WireSection
          title="Open tickets"
          action={<Action label="View all" icon="open" />}
        >
          <div className="grid grid-cols-1 gap-1.5 tablet:grid-cols-3 tablet:gap-2">
            <TicketCard level="critical" title="Connection failure" />
            <TicketCard level="critical" title="Execution failures" />
            <TicketCard level="warning" title="Latency above target" />
          </div>
        </WireSection>

        <WireSection title="Your tickets">
          <div className="grid grid-cols-1 gap-2 tablet:grid-cols-[0.85fr_1fr] tablet:gap-3">
            <WirePanel>
              <div
                className="flex items-center gap-2 border-b px-2 py-1.5"
                style={{ borderColor: "var(--wf-line)" }}
              >
                <WireText tone="faint">Top actions to take</WireText>
                <span className="flex-1" />
                <WireSelect>Most critical</WireSelect>
              </div>
              {EARLY_ISSUES.map(([level, title, artifact], i) => (
                <IssueRow
                  key={title}
                  level={level}
                  title={title}
                  artifact={artifact}
                  selected={i === 1}
                  right={<WireButton icon="user">Assign</WireButton>}
                />
              ))}
            </WirePanel>

            <InvestigationPanel />
          </div>
        </WireSection>

        <ImpactedAssets action={<Action label="View all" icon="open" />} />
      </WireScreen>
    </WireFigure>
  );
}

/* -------------------------------------------------------------------------- */
/* V2 — one issue experience                                                  */
/* -------------------------------------------------------------------------- */

/**
 * V2 — the ticket row and the ticket section are gone.
 *
 * One list, called Issues, with assignment on the row it belongs to, and the
 * investigation still beside it. Impacted assets is still its own block at the
 * foot: joining it up is the next version's job, and showing it apart here is
 * what makes that change legible.
 */
export function IssuesV2() {
  return (
    <WireFigure
      scroll
      alt="Wireframe of the second Issues concept: one Issues list with a severity summary, a sort control and assignment on each row, an investigation panel beside it, and Impacted assets still a separate section below. The ticket card row and the separate ticket section are gone."
    >
      <WireScreen height="natural" railActive={1}>
        <PageNav items={["Home", "Issues", "Metrics"]} />

        <WireSection title="Issues">
          <div className="grid grid-cols-1 gap-2 tablet:grid-cols-[0.85fr_1fr] tablet:gap-3">
            <WirePanel>
              <div
                className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b px-2 py-1.5"
                style={{ borderColor: "var(--wf-line)" }}
              >
                <WireSegmented items={["Personal", "All"]} />
                <span className="flex-1" />
                <WireSelect>Most critical</WireSelect>
              </div>
              <div
                className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-2 py-1.5"
                style={{ borderColor: "var(--wf-line)" }}
              >
                {(
                  [
                    ["critical", "Critical"],
                    ["warning", "Warning"],
                    ["info", "Info"],
                  ] as const
                ).map(([level, label]) => (
                  <span key={label} className="flex items-center gap-1">
                    <WireDot level={level} />
                    <WireText tone="faint" className="!inline">
                      {label}
                    </WireText>
                  </span>
                ))}
              </div>
              {EARLY_ISSUES.map(([level, title, artifact], i) => (
                <IssueRow
                  key={title}
                  level={level}
                  title={title}
                  artifact={artifact}
                  selected={i === 1}
                  right={<WireButton icon="user">Assign</WireButton>}
                />
              ))}
            </WirePanel>

            <InvestigationPanel />
          </div>
        </WireSection>

        <ImpactedAssets action={<Action label="View all" icon="open" />} />
      </WireScreen>
    </WireFigure>
  );
}

/* -------------------------------------------------------------------------- */
/* Final — the two halves joined                                              */
/* -------------------------------------------------------------------------- */

/** The execution trace: a short sequence, one step of it failed. */
function TraceSteps() {
  /* Six generic steps with a fictional clock beside them. The times are what
     make it read as a trace rather than a list: they say the steps happened
     in order and roughly how far apart. None of them measures anything. */
  const steps: [string, string, boolean][] = [
    ["Trigger", "14:02:11", false],
    ["Reasoning step", "14:02:11", false],
    ["Knowledge lookup", "14:02:12", false],
    ["Retrieval step", "14:02:13", false],
    ["Tool call", "14:02:15", true],
    ["Run ended", "14:02:15", true],
  ];
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <WireText tone="faint">Execution trace</WireText>
      {steps.map(([label, time, failed], i) => (
        <span key={label} className="flex min-w-0 gap-2">
          <span className="flex flex-col items-center">
            <span
              className="mt-[3px] block size-[6px] shrink-0 rounded-full"
              style={{
                background: failed ? "var(--wf-ink)" : "var(--wf-line-strong)",
              }}
            />
            {i === steps.length - 1 ? null : (
              <span
                className="block w-px flex-1"
                style={{ background: "var(--wf-line)" }}
              />
            )}
          </span>
          <span className="flex min-w-0 flex-1 items-baseline gap-2 pb-1.5">
            <span
              className="truncate text-[9px] leading-tight tablet:text-[10px]"
              style={{
                color: failed ? "var(--wf-ink)" : "var(--wf-ink-soft)",
                fontWeight: failed ? 600 : 400,
              }}
            >
              {label}
              {failed ? " · failed" : ""}
            </span>
            <span className="flex-1" />
            <span
              className="shrink-0 text-[8px] leading-tight tablet:text-[9px]"
              style={{ color: "var(--wf-ink-faint)" }}
            >
              {time}
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}

/** What to try next: the thing the final design added beside the trace. */
function NextSteps() {
  return (
    <WireCard tone="filled" title="Recommended next steps" className="min-w-0">
      <span className="flex flex-col gap-1">
        {[
          "Check the connection's credentials",
          "Review the deployment configuration",
          "Add a fallback for this step",
        ].map((t, i) => (
          <span key={t} className="flex min-w-0 items-start gap-1.5">
            <span
              className="mt-[1px] text-[9px] leading-tight tablet:text-[10px]"
              style={{ color: "var(--wf-ink-faint)" }}
            >
              {i + 1}.
            </span>
            <span
              className="min-w-0 text-[9px] leading-tight tablet:text-[10px]"
              style={{ color: "var(--wf-ink-soft)" }}
            >
              {t}
            </span>
          </span>
        ))}
      </span>
    </WireCard>
  );
}

/**
 * The tab row inside the panel, which is the final version's whole idea.
 *
 * Real buttons rather than the drawn row `WireTabs` gives: the decision being
 * shown is that one panel holds both, and a reader can only see that if
 * pressing one actually swaps the other out.
 */
function PanelTabs({
  uid,
  active,
  onSelect,
  refs,
}: {
  uid: string;
  active: 0 | 1;
  onSelect: (next: number, focus?: boolean) => void;
  refs: React.RefObject<(HTMLButtonElement | null)[]>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Supporting information"
      className="flex shrink-0 items-end gap-3 border-b tablet:gap-4"
      style={{ borderColor: "var(--wf-line)" }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          onSelect(active + 1, true);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          onSelect(active - 1, true);
        }
      }}
    >
      {["Execution flow", "Impacted dependencies"].map((label, i) => {
        const on = i === active;
        return (
          <button
            key={label}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${i}`}
            aria-selected={on}
            aria-controls={`${uid}-panel`}
            tabIndex={on ? 0 : -1}
            onClick={() => onSelect(i)}
            className="relative block cursor-pointer pb-1.5 text-[10px] leading-none focus-visible:outline-2 focus-visible:outline-offset-2 tablet:text-[11px]"
            style={{
              color: on ? "var(--wf-ink)" : "var(--wf-ink-faint)",
              fontWeight: on ? 600 : 400,
              outlineColor: "var(--wf-accent)",
            }}
          >
            {label}
            {on ? (
              <span
                className="absolute inset-x-0 -bottom-px block h-[1.5px]"
                style={{ background: "var(--wf-accent)" }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Final — the issue and what it touches, in one panel.
 *
 * The list keeps its place; the panel gains an ID, a timestamp and two tabs.
 * Under Execution flow the summary sits over the relationship diagram, and the
 * trace runs beside the recommended steps rather than under them, so a builder
 * reads what happened and what to do about it together. Impacted assets has
 * left the foot of the page: it is the second tab now, drawn below as the
 * panel in that state rather than as a second copy of the whole screen.
 */
export function IssuesFinal() {
  const uid = useId();
  const [tab, setTab] = useState<0 | 1>(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (next: number, focus = false) => {
    const i = ((next % 2) + 2) % 2;
    setTab(i as 0 | 1);
    if (focus) tabs.current[i]?.focus();
  };

  return (
    <WireFigure
      scroll
      interactive
      alt="Wireframe of the final Issues concept: the issue list beside a detail panel carrying a fictional issue ID, a timestamp and two working tabs. Under Execution flow a short summary sits over the relationship diagram, with the execution trace beside the recommended next steps; Impacted dependencies swaps the same panel for a severity summary and a list of affected artifacts. The separate Impacted assets section is gone."
    >
      <WireScreen height="natural" railActive={1}>
        <PageNav items={["Home", "Issues", "Metrics"]} />

        <WireSection
          title="Issues"
          action={<Action label="Most critical" icon="chevron" />}
        >
          <div className="grid grid-cols-1 gap-2 tablet:grid-cols-[0.8fr_1fr] tablet:gap-3">
            <WirePanel>
              {ISSUES.map(([level, title, artifact], i) => (
                <IssueRow
                  key={title}
                  level={level}
                  title={title}
                  artifact={artifact}
                  selected={i === 1}
                />
              ))}
            </WirePanel>

            <InvestigationPanel
              id="ISS-204 · opened today"
              tabs={
                <PanelTabs
                  uid={uid}
                  active={tab}
                  onSelect={select}
                  refs={tabs}
                />
              }
            >
              {/* One panel, two states. The tabs swap what is inside it;
                  nothing is ever drawn underneath as a second copy. */}
              <div
                id={`${uid}-panel`}
                role="tabpanel"
                aria-labelledby={`${uid}-tab-${tab}`}
                className="flex min-w-0 flex-col gap-2"
              >
                {tab === 0 ? (
                  <>
                    <WireLines n={2} />
                    <WireText tone="faint">Artifact relationships</WireText>
                    <div className="h-[62px] shrink-0 tablet:h-[70px]">
                      <MiniGraph />
                    </div>
                    {/* Side by side under the diagram, not stacked: reading
                        them together is the point. */}
                    <div
                      className="grid grid-cols-1 gap-2 border-t pt-2 tablet:grid-cols-2"
                      style={{ borderColor: "var(--wf-line)" }}
                    >
                      <TraceSteps />
                      <NextSteps />
                    </div>
                  </>
                ) : (
                  <>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {(
                        [
                          ["critical", "Critical"],
                          ["warning", "At risk"],
                          ["info", "Informational"],
                        ] as const
                      ).map(([level, label]) => (
                        <span key={label} className="flex items-center gap-1">
                          <WireDot level={level} />
                          <WireText tone="faint" className="!inline">
                            {label}
                          </WireText>
                        </span>
                      ))}
                    </span>
                    <WireShape kind="split" />
                    <ImpactedTable />
                  </>
                )}
              </div>
            </InvestigationPanel>
          </div>
        </WireSection>
      </WireScreen>
    </WireFigure>
  );
}

/** The dependency table inside the final version's second tab. */
function ImpactedTable() {
  const cols =
    "grid grid-cols-[1.5fr_1fr_0.9fr] tablet:grid-cols-[1.6fr_1fr_0.9fr_0.9fr] gap-2";
  const rows: [
    string,
    string,
    IconName,
    "critical" | "warning" | "info",
    string,
  ][] = [
    ["Customer support", "Agent", "agent", "critical", "Degraded"],
    ["Invoice processor", "Workflow", "flow", "critical", "Degraded"],
    ["Notifier", "Tool", "tool", "warning", "Healthy"],
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
        {["Artifact", "Type", "Impact", "Status"].map((h, i) => (
          <span
            key={h}
            className={`truncate text-[9px] leading-none font-semibold tablet:text-[10px] ${i === 3 ? "hidden tablet:block" : ""}`}
            style={{ color: "var(--wf-ink-soft)" }}
          >
            {h}
          </span>
        ))}
      </div>
      {rows.map(([name, type, icon, level, status]) => (
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
            <WireDot level={level} />
          </span>
          <span className="hidden min-w-0 tablet:flex">
            <WireBadge>{status}</WireBadge>
          </span>
        </div>
      ))}
    </WirePanel>
  );
}
