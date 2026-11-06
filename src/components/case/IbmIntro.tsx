"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import { EyeBeeMBee, EyeBeeMStill } from "./EyeBeeM";

/**
 * The opening of the IBM case study: Eye-Bee-M, the bee leaves, the page.
 *
 * ── The artwork ───────────────────────────────────────────────────────────
 * `EyeBeeM` is the supplied vector, inline and unredrawn, so there is
 * nothing to upscale at any zoom or on any screen. It replaced a recoloured
 * copy of the original animation, which was soft for a reason no amount of
 * re-encoding would have fixed: an encoder writes an animation as one tall
 * image, GIF's height limit is 65535px, so the tallest 158 frames could be
 * was 414 — and a composition filling most of a 552x414 frame was being
 * drawn at 880.
 *
 * ── What moves ────────────────────────────────────────────────────────────
 * The reference animation's own choreography, measured off it frame by frame
 * and replayed with the vector. The bee wakes up — wings unfolding, then
 * beating — while the eye blinks and looks across at it; the eye closes and
 * goes, the M goes after it, and the bee flies the reference's flight: two
 * counter-clockwise loops, the second inside the first, and out of frame.
 *
 * Every stop of that flight is a frame of the reference, so the path, the
 * banking into the turns and the speed around them are the original's rather
 * than a shape invented to resemble it. `scripts/ibm-intro-path.mjs` is what
 * measured them and what would measure them again.
 *
 * The one liberty is the waiting. The reference hovers for 3.4 seconds,
 * blinking four times over, before it goes; that is a loop to sit through on
 * a page the reader asked to see, so it is played once and tightened to 1.3.
 * The flight itself is 1:1 with the reference, which is the part being
 * matched.
 *
 * The flight is one animation on one box rather than a stack of them. Its
 * `transform-origin` is the bee's own centre, so `translate()` carries it
 * along the path and `rotate()` turns it on the spot, and because the two
 * compose in that order neither has to know about the other.
 *
 * The timings are in `globals.css`, which owns the keyframes, and they have
 * to agree with `EXIT_AT` here: the eye goes at 1040, the M at 1120, the
 * flight runs 1260 to 4440, and the bee is off every screen it was measured
 * on well before the overlay starts to lift.
 *
 * ── The ways out ──────────────────────────────────────────────────────────
 * A skip control, Escape, and `prefers-reduced-motion`. The first two fade
 * in half the time, since a reader who asked to leave should not then wait.
 *
 * The control is not given focus on mount, deliberately. Focus moved by code
 * counts as keyboard focus, so every visitor would get a focus ring around
 * it for the whole sequence — on a control whose whole brief is to be
 * discreet. Escape is bound to the document instead, so it works without the
 * ring, and Tab still reaches the button for anyone who wants it.
 *
 * Reduced motion is answered twice over: a media rule in `globals.css` takes
 * the overlay off screen with no JavaScript at all, and `useReducedMotion` —
 * the same hook the wireframe demos use — takes it out of the tree the moment
 * the page hydrates. Either alone would leave a gap. The rule cannot unlock
 * scrolling or stop the timers; the hook reports `false` on the server, where
 * there is no one to ask, so the markup it returns is the overlay and the
 * rule is what keeps that off the screen until React arrives.
 *
 * ── Holding the page still ────────────────────────────────────────────────
 * The overlay is fixed, so a scroll behind it would be invisible and would
 * still have happened: the reader would land halfway down the case study when
 * it lifted. Lenis is asked to stop, and `overflow: hidden` on the document
 * covers the case where it is not running.
 */

/** When the overlay starts to lift: the bee is off the screen before this. */
const EXIT_AT = 4400;
/** How long it takes to lift, played out and skipped. */
const FADE = 350;
const SKIP_FADE = 220;

type Phase = "playing" | "leaving" | "gone";

export function IbmIntro() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("playing");
  const [fade, setFade] = useState(FADE);

  const leave = useCallback((ms: number) => {
    setFade(ms);
    setPhase((p) => (p === "playing" ? "leaving" : p));
  }, []);

  /** Gone for good: played out, skipped, or never wanted. */
  const gone = phase === "gone" || Boolean(reduced);

  useEffect(() => {
    if (gone) return;
    const t = window.setTimeout(() => leave(FADE), EXIT_AT);
    return () => window.clearTimeout(t);
  }, [gone, leave]);

  useEffect(() => {
    if (gone) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") leave(SKIP_FADE);
    };
    document.addEventListener("keydown", onKey);

    const lenis = window.__lenis;
    lenis?.stop();
    const html = document.documentElement;
    const had = html.style.overflow;
    html.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      lenis?.start();
      html.style.overflow = had;
    };
  }, [gone, leave]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const t = window.setTimeout(() => setPhase("gone"), fade);
    return () => window.clearTimeout(t);
  }, [phase, fade]);

  if (gone) return null;

  return (
    <div
      className="ibm-intro fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#161616]"
      style={{
        opacity: phase === "leaving" ? 0 : 1,
        transition: `opacity ${fade}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      {/*
        The stage: the artwork's own proportions, at the width the mark is
        asked to be, with both drawings stretched over all of it. The bee's
        box is laid on the same rectangle, so the bee begins exactly where
        the export drew it and the flight is the only thing that moves it.
        It is allowed out of the stage — the overlay is what clips it, which
        is the screen, which is where the bee is going.

        It is a container as well, which is how the flight is written as a
        share of the mark rather than in pixels: `cqw` in `globals.css` is a
        hundredth of this box, so the same stylesheet draws the same flight
        at 120 as at 160.
      */}
      <div
        className="ibm-ebm relative w-[120px] shrink-0 tablet:w-[160px]"
        style={{ aspectRatio: "633.8 / 182.6", containerType: "inline-size" }}
      >
        <EyeBeeMStill className="absolute inset-0 h-full w-full" />

        <div className="ibm-ebm-fly absolute inset-0">
          <EyeBeeMBee className="absolute inset-0 h-full w-full" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => leave(SKIP_FADE)}
        aria-label="Skip the opening animation"
        className="ts-body-small absolute right-6 bottom-6 rounded-full px-3 py-1.5 !text-[#8d8d8d] transition-colors hover:!text-[#f4f4f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4589ff] tablet:right-10 tablet:bottom-10"
      >
        Skip intro
      </button>
    </div>
  );
}
