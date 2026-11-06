"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { HomeFinalPage } from "./home";
import { DemoPointer, useBeats } from "./demo";
import {
  WireButton,
  WireFigure,
  WireIcon,
  WireLines,
  WireText,
  WireTitle,
  type IconName,
} from "./Wire";

/**
 * The Home step of Solution Overview, playing itself.
 *
 * The final Home is a starting point a builder shapes, and the empty shortcut
 * slots are the product saying so. A still frame shows the slots or shows them
 * filled; it cannot show that one becomes the other, which is the whole of
 * what the section claims about returning to your work quickly.
 *
 * ── The sequence is the recording's, not an invention ────────────────────
 * The first version of this loop pressed a slot and a shortcut simply
 * appeared, which skipped the part a visitor needs: the shortcut came from
 * somewhere, and the builder chose it. Read off the team's own recording the
 * order is — press an empty slot, a `Create shortcut` panel opens with
 * suggestions, pick one, save, and only then does the pinned area change.
 * That is what plays here.
 *
 * Pressing a shortcut that is already pinned opens it. It does not create
 * another one, and nothing in this loop touches the two that are already
 * there.
 *
 * The page itself is `HomeFinalPage`, the same component the Design Process
 * drawing renders, so the two sections cannot drift. Only `pinned` and the
 * slot's highlight change between beats; the greeting, the issue list and the
 * recent artifacts are the same markup throughout.
 */

/**
 * The loop.
 *
 * Two and a half seconds on the page before anything happens, then the four
 * steps of the recording, then three seconds with the shortcut in place.
 */
const BEATS = [
  { id: "idle", ms: 2500 }, // the page as it stands
  { id: "slot", ms: 1000 }, // pointer on an empty slot, pressing
  { id: "panel", ms: 1600 }, // the shortcut panel, pointer reaching a suggestion
  { id: "chosen", ms: 1300 }, // the suggestion taken, pointer pressing Save
  { id: "done", ms: 3000 }, // the panel gone, the shortcut pinned
] as const;

/**
 * Where the pointer rests, as a share of the drawing.
 *
 * `slot` is the first empty place in the pinned grid, measured off the
 * rendered page, and `panel` is the suggestion the loop takes.
 *
 * `chosen` and `done` are where Save is, and they are not measured by hand:
 * `SAVE_MARK` finds the button at run time and the pointer is put on its
 * centre. The hand-measured value that used to be here was 88%, and Cancel's
 * centre is 89.2% — the loop was pressing the wrong button, and saying so in
 * a comment did not make it press the right one. It could not have been
 * right at every width in any case: the panel is 62% of the page on a phone
 * and 42% from tablet up, and the page is taller on a phone, so Save sits at
 * 44.6% down there and 85.2% on a desktop. The values below are the desktop
 * ones, used until the measurement lands.
 */
const POINTER = {
  idle: { left: "24%", top: "66%", opacity: 0 },
  slot: { left: "14%", top: "64%", opacity: 1 },
  panel: { left: "76%", top: "42%", opacity: 1 },
  chosen: { left: "97.8%", top: "85.2%", opacity: 1 },
  done: { left: "97.8%", top: "85.2%", opacity: 0 },
} as const;

/** How the panel's Save button is found again once it is on the page. */
const SAVE_MARK = "wf-demo-save";

/**
 * How long to wait before measuring it.
 *
 * The panel slides 24px in over 300ms, and `getBoundingClientRect` reads the
 * transform, so measuring on the next frame would put the pointer about 19px
 * to the right of where the button comes to rest — off the end of it on a
 * phone. The `panel` beat is 1600ms and the pointer is still on its way to
 * the suggestion at this point, so there is nothing to disturb.
 */
const SETTLE = 400;

/** The suggestions the panel offers. All invented. */
const SUGGESTIONS: { title: string; body: string; icon: IconName }[] = [
  {
    title: "Open recent workflow",
    body: "Jump back to the workflow you last edited.",
    icon: "flow",
  },
  {
    title: "Critical alerts",
    body: "Jump to the issues that need attention.",
    icon: "alert",
  },
  {
    title: "Run a report",
    body: "Generate a summary from recent activity.",
    icon: "chart",
  },
];

export function SolutionHomeDemo() {
  const { root, beat, reduceMotion } = useBeats(BEATS);
  const panelOpen = beat === "panel" || beat === "chosen";
  const pressing = beat === "slot" || beat === "chosen";

  /** Save's centre, as a share of the drawing, once it has been found. */
  const [save, setSave] = useState<{ left: string; top: string } | null>(null);

  useEffect(() => {
    if (!panelOpen) return;
    const page = root.current;
    if (!page) return;

    const t = window.setTimeout(() => {
      const button = page.querySelector(`.${SAVE_MARK}`);
      if (!button) return;
      const p = page.getBoundingClientRect();
      const b = button.getBoundingClientRect();
      if (!p.width || !p.height) return;
      setSave({
        left: `${((b.x + b.width / 2 - p.x) / p.width) * 100}%`,
        top: `${((b.y + b.height / 2 - p.y) / p.height) * 100}%`,
      });
    }, SETTLE);
    return () => window.clearTimeout(t);
  }, [panelOpen, root]);

  const at = POINTER[beat as keyof typeof POINTER];
  const onSave = beat === "chosen" || beat === "done";

  return (
    <WireFigure
      size="compact"
      scroll
      alt="Wireframe of the Home experience, playing itself: pinned shortcuts beside the latest issues, with recent artifacts below. A pointer presses an empty shortcut slot, a Create shortcut panel opens with three suggestions, one is chosen and saved, and it appears in the pinned shortcuts."
    >
      <div ref={root} className="relative min-h-full w-full">
        {/* `pinned` and the slot highlight are the only things the loop
            changes on the page. Everything else is the same tree on every
            beat, so nothing but the shortcut area can be seen to move. */}
        <HomeFinalPage
          pinned={beat === "done" ? 3 : 2}
          activeSlot={beat === "slot"}
        />

        {panelOpen ? (
          <ShortcutPanel
            chosen={beat === "chosen"}
            reduceMotion={reduceMotion}
          />
        ) : null}

        {reduceMotion ? null : (
          <DemoPointer
            at={onSave && save ? { ...at, ...save } : at}
            pressing={pressing}
          />
        )}
      </div>
    </WireFigure>
  );
}

/**
 * The `Create shortcut` panel.
 *
 * A drawer over the right of the page, which is where the product puts it. It
 * holds what it has to for the sequence to make sense — a title, the
 * suggestions, and the two buttons that end it — and nothing more; the
 * recording's panel also offers a written description and a link field, and
 * neither is part of what this loop is showing.
 */
function ShortcutPanel({
  chosen,
  reduceMotion,
}: {
  /** The suggestion has been taken and Save is next. */
  chosen: boolean;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      aria-hidden
      /*
        Pinned to the top of the preview window and given that window's own
        height, not `inset-y-0`. The page behind it is a little taller than the
        window, so a drawer stretched to the page would put its Cancel and Save
        below the fold — and those two are the end of the sequence.
      */
      className="absolute top-0 right-0 z-[5] flex h-[380px] w-[62%] flex-col gap-2 border-l bg-[var(--wf-screen)] p-3 tablet:h-[430px] tablet:w-[42%] tablet:p-4 desktop:h-[450px]"
      style={{ borderColor: "var(--wf-line)" }}
      initial={reduceMotion ? false : { x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <span className="flex items-center gap-2">
        <WireTitle>Create shortcut</WireTitle>
        <span className="flex-1" />
        <WireIcon name="chevron" tone="faint" />
      </span>
      <WireLines n={1} />

      <WireText tone="faint">Recommended shortcuts</WireText>
      <div className="flex min-h-0 flex-col gap-1.5">
        {SUGGESTIONS.map((s, i) => {
          const on = chosen && i === 1;
          return (
            <div
              key={s.title}
              className="flex min-w-0 flex-col gap-1 rounded-[4px] border p-2"
              style={{
                borderColor: on ? "var(--wf-accent)" : "var(--wf-line)",
                background: on ? "var(--wf-surface-2)" : "var(--wf-screen)",
              }}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <WireIcon name={s.icon} tone={on ? "ink" : "faint"} />
                <WireTitle className="truncate">{s.title}</WireTitle>
              </span>
              <WireText className="line-clamp-2">{s.body}</WireText>
            </div>
          );
        })}
      </div>

      <span className="flex-1" />
      <span className="flex items-center justify-end gap-1.5">
        <WireButton variant="outline">Cancel</WireButton>
        <WireButton variant="solid" icon="plus" className={SAVE_MARK}>
          Save
        </WireButton>
      </span>
    </motion.div>
  );
}
