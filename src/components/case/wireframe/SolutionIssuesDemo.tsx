"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { MiniGraph } from "./issues";
import {
  WireButton,
  WireCard,
  WireDot,
  WireFigure,
  WireIcon,
  WireLines,
  WirePanel,
  WireRow,
  WireScreen,
  WireSelect,
  WireSplit,
  WireTable,
  WireText,
  WireTitle,
} from "./Wire";

/**
 * The Issues step of Solution Overview, playing itself.
 *
 * The other drawings are still pictures of a screen. This one is a path
 * through it, because what the Issues work is actually about is a sequence:
 * read the failure, follow it down the execution trace, then ask what else it
 * touches. A still frame can show one of those three; a loop shows the move
 * between them, which is the design decision.
 *
 * The loop runs: the execution flow at the top of the panel, the panel
 * scrolling down through the trace to the recommended steps, a pointer moving
 * to the `Impacted dependencies` tab and pressing it, then the dependency
 * table. Four seconds of it, then round again.
 *
 * ── Why it is not a GIF ──────────────────────────────────────────────────
 * A recording of this would be a megabyte or two of fixed-size frames whose
 * text goes to mush when a phone scales it down, and it would have to be
 * re-exported every time a label changed. The same loop as elements is a few
 * kB, stays crisp at any zoom, and can simply stop: it holds still for a
 * visitor who asked for reduced motion, and it does not run at all while the
 * section is off screen.
 *
 * ── What is animated, and what is not ────────────────────────────────────
 * Two things move: the panel's content and the pointer. The tab underline
 * changes without a transition, because a tab in a real interface does not
 * glide — it is one state and then the other. Nothing fades, nothing scales,
 * and the frame holds one height throughout, so the page below it never
 * shifts.
 */

/** The beats of the loop, and how long each is held, in milliseconds. */
const BEATS = [
  { id: "top", ms: 1900 }, // execution flow, at the top of the panel
  { id: "scroll", ms: 2100 }, // the panel runs down through the trace
  { id: "reach", ms: 1100 }, // the pointer goes to the other tab
  { id: "deps", ms: 2800 }, // impacted dependencies
] as const;

/** Where the pointer rests, as a share of the panel, per beat. */
const POINTER = {
  top: { left: "62%", top: "74%", opacity: 0 },
  scroll: { left: "58%", top: "66%", opacity: 1 },
  reach: { left: "25.5%", top: "20%", opacity: 1 },
  deps: { left: "25.5%", top: "20%", opacity: 0 },
} as const;

/**
 * The panel's header, and one step of its trace.
 *
 * These live here rather than in `issues.tsx` because Solution Overview and
 * Design Process are answering different questions. The drawings next door are
 * about how the design changed and are drawn at the fidelity that needs; this
 * one is showing a builder moving through the finished thing, so it keeps the
 * ID, the timings and the actions that make the movement legible.
 */
function DetailHead({ compact }: { compact?: boolean }) {
  return (
    <div className="flex shrink-0 flex-wrap items-start gap-x-3 gap-y-1.5">
      <div className="flex min-w-0 flex-col gap-1">
        <WireTitle>Agent execution failures</WireTitle>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span
            className="text-[9px] leading-none tablet:text-[10px]"
            style={{ color: "var(--wf-accent)" }}
          >
            Order triage
          </span>
          <WireText tone="faint" className="!inline">
            ISS-4821 · opened 24h ago
          </WireText>
        </span>
      </div>
      <span className="flex-1" />
      <span className="flex shrink-0 items-center gap-1.5">
        {compact ? null : <WireSelect>Open</WireSelect>}
        <WireButton icon="user">Assign</WireButton>
        <WireButton variant="solid" icon="open">
          Inspect
        </WireButton>
      </span>
    </div>
  );
}

function TraceStep({
  title,
  meta,
  failed,
  last,
  className,
}: {
  title: string;
  meta: string;
  failed?: boolean;
  last?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 gap-2 ${className ?? ""}`}>
      <span className="flex flex-col items-center">
        <span
          className="mt-0.5 block size-[6px] shrink-0 rounded-full"
          style={{
            background: failed ? "var(--wf-ink)" : "var(--wf-line-strong)",
          }}
        />
        {last ? null : (
          <span
            className="block w-px flex-1"
            style={{ background: "var(--wf-line)" }}
          />
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5 pb-1.5">
        <span
          className="truncate text-[9px] leading-tight font-medium tablet:text-[10px]"
          style={{ color: "var(--wf-ink)" }}
        >
          {title}
        </span>
        <span
          className="truncate text-[8px] leading-tight tablet:text-[9px]"
          style={{ color: "var(--wf-ink-faint)" }}
        >
          {meta}
        </span>
      </span>
    </div>
  );
}

export function SolutionIssuesDemo() {
  const reduceMotion = useReducedMotion();
  const root = useRef<HTMLDivElement | null>(null);
  /* `amount` rather than `once`: the loop should stop again when the section
     is scrolled past, not run on forever in a tab nobody is looking at. */
  const inView = useInView(root, { amount: 0.35 });
  const [beat, setBeat] = useState(0);

  /* The scroll distance is measured, not guessed: the panel's content is a
     different height at each breakpoint, and running it up by a fixed number
     of pixels would either leave the trace half-shown or scroll past the end
     into blank space. */
  const viewport = useRef<HTMLDivElement | null>(null);
  const content = useRef<HTMLDivElement | null>(null);
  const [runway, setRunway] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const box = viewport.current?.clientHeight ?? 0;
      const tall = content.current?.scrollHeight ?? 0;
      setRunway(Math.max(0, tall - box));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (viewport.current) ro.observe(viewport.current);
    if (content.current) ro.observe(content.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion || !inView) return;
    const t = setTimeout(
      () => setBeat((b) => (b + 1) % BEATS.length),
      BEATS[beat].ms,
    );
    return () => clearTimeout(t);
  }, [beat, inView, reduceMotion]);

  /* Held at the first beat when the loop is not running, which is a complete
     drawing on its own — the execution flow, at the top, with no pointer. */
  const live = !reduceMotion && inView;
  const stage = live ? BEATS[beat].id : "top";
  const onDeps = stage === "deps";
  const offset = stage === "scroll" || stage === "reach" ? -runway : 0;

  return (
    <WireFigure
      size="compact"
      alt="Wireframe of the Issues experience, playing itself: the issue list beside the selected issue's investigation panel. The panel runs down through the execution trace, then switches to the Impacted dependencies tab to show the artifacts the failure reaches."
    >
      <div ref={root} className="h-full w-full">
        <WireScreen railActive={1}>
          <div className="flex shrink-0 items-center gap-2">
            <WireTitle>Issues</WireTitle>
            <WireText tone="faint">· 6 to resolve</WireText>
            <span className="flex-1" />
            <WireSelect>Sort by urgency</WireSelect>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-2.5 tablet:grid-cols-[0.78fr_1fr] tablet:grid-rows-1 tablet:gap-3">
            <WirePanel className="min-h-0 flex-1">
              <WireRow
                selected
                level="critical"
                title="Agent execution failures"
                meta="Order triage · 80% failure"
              />
              <WireRow
                level="critical"
                title="Connection failure"
                meta="Invoice intake · 45% success"
              />
              <WireRow
                level="warning"
                title="Tool latency above target"
                meta="Catalog lookup · p95 4.2s"
                className="hidden tablet:flex"
              />
              <WireRow
                level="info"
                title="Credentials expiring"
                meta="Billing MCP · in 2 days"
                className="hidden tablet:flex"
              />
            </WirePanel>

            {/* `relative`, because the pointer is placed against this panel —
                the thing it is pretending to touch. */}
            <WireCard className="relative min-h-0 flex-1">
              <DetailHead />

              {/* The tab row is drawn here rather than taken from `WireTabs`
                  so the underline can follow the loop. */}
              <div
                className="flex shrink-0 items-end gap-3 border-b tablet:gap-4"
                style={{ borderColor: "var(--wf-line)" }}
              >
                {["Execution flow", "Impacted dependencies"].map((label, i) => {
                  const on = (i === 1) === onDeps;
                  return (
                    <span
                      key={label}
                      className="relative block pb-1.5 text-[10px] leading-none tablet:text-[11px]"
                      style={{
                        color: on ? "var(--wf-ink)" : "var(--wf-ink-faint)",
                        fontWeight: on ? 600 : 400,
                      }}
                    >
                      {label}
                      {on ? (
                        <span
                          className="absolute inset-x-0 -bottom-px block h-[1.5px]"
                          style={{ background: "var(--wf-accent)" }}
                        />
                      ) : null}
                    </span>
                  );
                })}
              </div>

              <div
                ref={viewport}
                className="relative min-h-0 flex-1 overflow-hidden"
              >
                {onDeps ? (
                  <div className="flex h-full flex-col gap-2">
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className="text-[19px] leading-[1.15] font-semibold tablet:text-[23px]"
                        style={{ color: "var(--wf-ink)" }}
                      >
                        17
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                          <span className="flex items-center gap-1">
                            <WireDot level="critical" />
                            <WireText tone="faint" className="!inline">
                              Critical 5
                            </WireText>
                          </span>
                          <span className="flex items-center gap-1">
                            <WireDot level="warning" />
                            <WireText tone="faint" className="!inline">
                              At risk 8
                            </WireText>
                          </span>
                          <span className="hidden items-center gap-1 tablet:flex">
                            <WireDot level="info" />
                            <WireText tone="faint" className="!inline">
                              Informational 4
                            </WireText>
                          </span>
                        </span>
                        <WireSplit parts={[5, 8, 4]} />
                      </span>
                    </div>
                    <WirePanel className="min-h-0 flex-1">
                      <WireTable
                        head={["Asset", "Type", "Alerts", "Success"]}
                        rows={[
                          ["Refund classifier", "Agent", "2", "72%"],
                          ["Invoice intake", "Workflow", "5", "84%"],
                        ]}
                        more={[["Billing MCP", "Server", "5", "96%"]]}
                      />
                    </WirePanel>
                  </div>
                ) : (
                  <motion.div
                    ref={content}
                    className="flex flex-col gap-2"
                    animate={{ y: offset }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 1.1, ease: [0.4, 0, 0.2, 1] }
                    }
                  >
                    <WireLines n={2} />
                    <WireText tone="faint">Artifact relationships</WireText>
                    <div className="h-[56px] shrink-0 tablet:h-[64px]">
                      <MiniGraph />
                    </div>
                    <WireText tone="faint">
                      Execution trace · ID 0485013852
                    </WireText>
                    <div className="flex flex-col">
                      <TraceStep
                        title="Workflow trigger"
                        meta="12:04:01 · 1ms"
                      />
                      <TraceStep
                        title="Reasoning step"
                        meta="12:04:01 · 820ms"
                      />
                      <TraceStep
                        title="Knowledge retrieval"
                        meta="12:04:02 · 34ms"
                      />
                      <TraceStep
                        title="Catalog lookup · failed"
                        meta="12:04:03 · credential rejected"
                        failed
                        last
                      />
                    </div>
                    <WireCard tone="filled" title="Recommended next steps">
                      <WireLines n={2} />
                    </WireCard>
                    <span className="flex items-center gap-1.5">
                      <WireIcon name="link" />
                      <WireText tone="faint" className="!inline">
                        4 affected artifacts
                      </WireText>
                    </span>
                  </motion.div>
                )}

                {/* The edge of the panel, so a reader can see there is more of
                    it below rather than wondering why it moved. */}
                {!onDeps && runway > 0 ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 block h-4"
                    style={{
                      background:
                        "linear-gradient(to top, var(--wf-screen), transparent)",
                    }}
                  />
                ) : null}
              </div>

              {live ? <Pointer stage={stage} /> : null}
            </WireCard>
          </div>
        </WireScreen>
      </div>
    </WireFigure>
  );
}

/**
 * The pointer, and the ring it leaves when it presses.
 *
 * A plain arrow rather than a hand or a tap circle: it is standing in for a
 * cursor on a desktop, which is what the panel it is moving across is drawn
 * at. It carries a white outline so it stays readable over a dark trace dot as
 * well as over white.
 */
function Pointer({ stage }: { stage: keyof typeof POINTER }) {
  const at = POINTER[stage];
  const pressing = stage === "reach";

  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute z-10 block"
      initial={false}
      animate={at}
      transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
    >
      {pressing ? (
        <motion.span
          className="absolute -top-1.5 -left-1.5 block size-6 rounded-full border"
          style={{ borderColor: "var(--wf-accent)" }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.55, 0], scale: [0.4, 1.25, 1.4] }}
          transition={{ duration: 0.75, delay: 0.55, ease: "easeOut" }}
        />
      ) : null}
      <svg width="13" height="17" viewBox="0 0 13 17" fill="none">
        <path
          d="M1.5 1.2 11 9.1l-4.3.5 2 4.6-2 .9-2-4.6-3.2 3z"
          fill="var(--wf-ink)"
          stroke="#fff"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
    </motion.span>
  );
}
