"use client";

import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";

import { AppearEffect, TextEffect } from "@/lib/framer-effects";
import { Butterfly, Smiley, Sparkle } from "@/components/site/Doodles";
import { CtaButton } from "@/components/site/CtaButton";
import { ArcText } from "./ArcText";
import { FloatingImage, type HeroImageVariant } from "./FloatingImage";
import FontPreview from "./FontPreview";
import type { BuildStyle } from "./paintBuild";

const TITLE = "Hi, this is Anne Lin";

/**
 * TRIAL: the home heading in Mansalva (loaded in layout.tsx as
 * --font-mansalva) instead of the shared Libre Baskerville Italic
 * `ts-heading-1`. Only this heading changes; the class itself and its other
 * uses are untouched.
 *
 * Each layout gets the largest size and spacing that keeps the line on one
 * row inside its existing max width (720px, 500px, 300px). Tablet and phone
 * are smaller than the old heading because their boxes used to wrap it onto
 * two lines.
 *
 * Other trials, to switch to instead (load the font in layout.tsx with the
 * variable named here first; ?font=KEY previews them without that):
 *   Gaegu: family "var(--font-gaegu)", desktop 86px / -1px,
 *     tablet 60px / -1px, phone 36px / -0.5px
 *   Zeyada: family "var(--font-zeyada)", desktop 96px / 0px,
 *     tablet 68px / 0px, phone 40px / 0px
 *
 * To go back to Libre Baskerville Italic, set this to `null`.
 */
const HEADING_FONT: {
  family: string;
  size: Record<string, { fontSize: number; letterSpacing: string }>;
} | null = {
  family: "var(--font-mansalva)",
  size: {
    desktop: { fontSize: 86, letterSpacing: "-1px" },
    tablet: { fontSize: 60, letterSpacing: "-1px" },
    phone: { fontSize: 36, letterSpacing: "-0.5px" },
  },
};

const TAGLINE =
  "I’m a Product designer with tech BG, passionate about transforming complexity into clear, useful products that spark moments of delight and connection";

/**
 * Framer section "Hero" on the home page.
 *
 * Framer holds three separate frames here, and they are not variations on one
 * layout: the Tablet frame swaps in a different rooster layer, sets the heading
 * larger than the Desktop frame does, and moves half the artwork outside the
 * stage, while the Phone frame drops the arc text, the appear effects and the
 * drag effect altogether. So all three are transcribed literally below, each
 * from its own Framer node values, rather than derived from one another.
 *
 * Framer's own container is a fixed stage centred inside a section that clips
 * at the page's 40px column: 1048x572 inside 100vh on desktop, 798x340 inside
 * 100vh on tablet, and 390x613 inside a fit-content section on phone. The stage
 * is wider than that column on tablet and phone, so artwork is deliberately cut
 * off at the column edge. `overflow: hidden` is what keeps the overhang from
 * ever reaching the page scrollbar.
 */

type Offsets = Pick<CSSProperties, "left" | "top" | "right" | "bottom">;

interface ArtLayer {
  key: string;
  variant: HeroImageVariant;
  alt: string;
  width: number;
  height: number;
  rotation: number;
  /** Framer's tap effect turns the layer by this much, on top of `rotation`. */
  tapRotate: number;
  parallaxSpeed: number;
  offsets: Offsets;
  appear?: string;
}

interface DoodleLayer {
  key: "sparkle" | "smiley" | "butterfly";
  width: number;
  height: number;
  offsets: Offsets;
}

interface TextBlock {
  fontSize: number;
  lineHeight: string;
  letterSpacing: string;
  maxWidth?: number;
  textAlign: "left" | "center";
}

interface Composition {
  name: string;
  stage: { width: number; height: number };
  content: {
    width: number;
    height?: number;
    gap: number;
    titleGap: number;
    offsets: Offsets;
    title: TextBlock;
    tagline: TextBlock;
  };
  /** Framer's Arc text instance, absent on phone. */
  arc?: { left: number; top: number; fontSize?: number };
  /** Text and button appear effects, which only the two wider frames carry. */
  animated: boolean;
  doodles: DoodleLayer[];
  art: ArtLayer[];
}

/* Shared across the two wider frames: only the geometry differs. */
const APPEAR = {
  rooster: "spring-duration 1.4s 0 0.8s",
  portrait: "spring-duration 1.3s 0 1s",
  framed: "spring-duration 1.4s 0 1.1s",
  sculpture: "spring-duration 1.2s 0 1s",
};

const ENTER: Record<string, { x: number; y: number }> = {
  rooster: { x: 251, y: 110 },
  portrait: { x: 200, y: -100 },
  framed: { x: -200, y: -100 },
  sculpture: { x: -200, y: 200 },
};

/** The medium each piece is redrawn in when tapped. */
const BUILD: Record<string, BuildStyle> = {
  rooster: "ink",
  portrait: "pastel",
  framed: "scribble",
  sculpture: "pencil",
};

const ALT = {
  rooster: "Ink painting of a rooster",
  portrait: "Pastel portrait painting",
  framed: "Framed textile artwork",
  sculpture: "Sculpture of a child",
};

const DESKTOP: Composition = {
  name: "desktop",
  stage: { width: 1048, height: 572 },
  animated: true,
  content: {
    width: 891,
    gap: 51,
    titleGap: 25,
    // Framer's own 111; Anne's reference layout, 2026-11-17
    offsets: { bottom: 111 },
    title: {
      fontSize: 80,
      lineHeight: "1.2em",
      letterSpacing: "-2px",
      maxWidth: 720,
      textAlign: "left",
    },
    tagline: {
      fontSize: 20,
      lineHeight: "1.3em",
      letterSpacing: "-0.2px",
      // Framer stores 720 but breaks after "transforming", which needs a box
      // under 718.1px in this build of DM Sans. 690 sits in the middle of the
      // window that reproduces Framer's three lines.
      maxWidth: 690,
      textAlign: "center",
    },
  },
  arc: { left: 386, top: 39 },
  doodles: [
    // up and left of Framer's 232,58, against the rooster (Anne's reference layout)
    // 70% of Framer's size, same centre (Anne, 2026-11-17)
    { key: "sparkle", width: 63, height: 64, offsets: { left: 200, top: 50 } },
    { key: "butterfly", width: 57, height: 57, offsets: { left: 28, bottom: 40 } },
    { key: "smiley", width: 57, height: 57, offsets: { left: 765, top: 78 } },
  ],
  art: [
    {
      key: "rooster",
      variant: "Variant 3",
      alt: ALT.rooster,
      width: 198,
      height: 252,
      rotation: -25,
      tapRotate: -17,
      parallaxSpeed: 85,
      offsets: { left: -21, top: -76 },
      appear: APPEAR.rooster,
    },
    {
      key: "portrait",
      variant: "Variant 5",
      alt: ALT.portrait,
      width: 208,
      height: 203,
      rotation: -19,
      tapRotate: -8,
      parallaxSpeed: 105,
      // 25px higher than Framer's -34 so the corner is not cropped (Anne, 2026-11-17)
      offsets: { left: 120, bottom: -9 },
      appear: APPEAR.portrait,
    },
    {
      key: "framed",
      variant: "Variant 4",
      alt: ALT.framed,
      width: 169,
      height: 181,
      rotation: 12,
      tapRotate: 20,
      parallaxSpeed: 100,
      offsets: { left: 778, bottom: 4 },
      appear: APPEAR.framed,
    },
    {
      key: "sculpture",
      variant: "Variant 6",
      alt: ALT.sculpture,
      width: 160,
      height: 216,
      rotation: 32,
      tapRotate: 15,
      parallaxSpeed: 80,
      offsets: { left: 884, top: -63 },
      appear: APPEAR.sculpture,
    },
  ],
};

const PHONE: Composition = {
  name: "phone",
  // 50px taller than Framer's 613: the arc text gets its own band above the
  // heading, and everything below it moves down with it (Anne, 2026-11-17)
  stage: { width: 390, height: 663 },
  // The Phone frame carries no appear effects on the text, the button or the
  // artwork, and no drag effect either.
  animated: false,
  content: {
    width: 287,
    height: 286,
    gap: 40,
    titleGap: 16,
    offsets: { left: 58.5, top: 222 },
    title: {
      fontSize: 48,
      lineHeight: "1.2em",
      letterSpacing: "-2px",
      maxWidth: 300,
      textAlign: "center",
    },
    tagline: {
      fontSize: 14,
      lineHeight: "1.3em",
      letterSpacing: "-0.2px",
      textAlign: "center",
    },
  },
  // Framer's Phone frame drops the arc; Anne wants it on phones too. Centred
  // between the rooster and the sketch, clear of both (2026-11-17).
  // the same 14px as the phone subtitle (Anne, 2026-11-17)
  arc: { left: 65, top: 136, fontSize: 14 },
  doodles: [
    // Framer has these at 59,168 and 311,249, on top of the greeting and the
    // tagline once the copy grew; moved clear of both.
    { key: "sparkle", width: 30, height: 30, offsets: { left: 32, top: 180 } },
    { key: "smiley", width: 30, height: 30, offsets: { left: 316, top: 350 } },
    { key: "butterfly", width: 30, height: 31, offsets: { left: 40, bottom: 166 } },
  ],
  art: [
    {
      key: "rooster",
      variant: "Variant 3",
      alt: ALT.rooster,
      width: 80,
      height: 101,
      rotation: -25,
      tapRotate: -17,
      parallaxSpeed: 85,
      offsets: { left: 45, top: 17 },
    },
    {
      key: "portrait",
      variant: "Variant 5",
      alt: ALT.portrait,
      width: 91,
      height: 81,
      rotation: -16,
      tapRotate: -8,
      parallaxSpeed: 105,
      offsets: { left: 39, bottom: 63 },
    },
    {
      key: "framed",
      variant: "Variant 4",
      alt: ALT.framed,
      width: 76,
      height: 68,
      rotation: 21,
      tapRotate: 16,
      parallaxSpeed: 100,
      offsets: { left: 266, bottom: 65 },
    },
    {
      key: "sculpture",
      variant: "Variant 6",
      alt: ALT.sculpture,
      width: 71,
      height: 90,
      rotation: 32,
      tapRotate: 15,
      parallaxSpeed: 80,
      offsets: { left: 283, top: 29 },
    },
  ],
};

function Doodle({ layer }: { layer: DoodleLayer }) {
  const size = { width: layer.width, height: layer.height };
  if (layer.key === "sparkle") return <Sparkle {...size} />;
  if (layer.key === "smiley") return <Smiley {...size} />;
  return <Butterfly {...size} />;
}

/** Wraps the button in Framer's appear effect only where Framer sets one. */
function Enter({
  when,
  enter,
  children,
}: {
  when: boolean;
  enter: Parameters<typeof AppearEffect>[0]["enter"];
  children: ReactNode;
}) {
  if (!when) return <>{children}</>;
  return (
    <AppearEffect enter={enter} trigger="onMount">
      {children}
    </AppearEffect>
  );
}

interface HeroCopy {
  tagline: string;
  /** a short line under the curved "M.S. in UX" text; stages without the arc leave it out */
  arcNote?: string;
  /** HeroRibbon places the smiley itself, off the heading's top-right corner. */
  hideSmiley?: boolean;
  /** the ribbon draws the butterfly itself from 810px up; keep this one for measuring only */
  swapButterfly?: boolean;
  /** extra scale on the About me button alone, see ctaBoost */
  ctaScale?: number;
}

function Stage({
  composition,
  className,
  priority,
  copy,
}: {
  composition: Composition;
  className: string;
  priority: boolean;
  copy: HeroCopy;
}) {
  const { stage, content, art, arc, animated, name } = composition;
  const doodles = copy.hideSmiley
    ? composition.doodles.filter((d) => d.key !== "smiley")
    : composition.doodles;
  const { title, tagline } = content;

  const headingFont = HEADING_FONT?.size[name];
  const titleStyle: CSSProperties = {
    fontSize: title.fontSize,
    lineHeight: title.lineHeight,
    letterSpacing: title.letterSpacing,
    maxWidth: title.maxWidth,
    textAlign: title.textAlign,
    width: "100%",
    ...(HEADING_FONT && headingFont
      ? { ...headingFont, fontFamily: HEADING_FONT.family, whiteSpace: "nowrap" }
      : {}),
  };
  const titleClass = `hero-title ts-heading-1 text-deep-blue ${HEADING_FONT ? "not-italic" : "italic"}`;
  const taglineStyle: CSSProperties = {
    fontSize: tagline.fontSize,
    lineHeight: tagline.lineHeight,
    letterSpacing: tagline.letterSpacing,
    maxWidth: tagline.maxWidth,
    textAlign: tagline.textAlign,
    width: "100%",
  };

  // Framer's "45% down the stage" pin, which has to subtract half the measured
  // height rather than a fixed number, because the block wraps differently.
  const centred = typeof content.offsets.top === "string" && content.offsets.top.endsWith("%");

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: stage.width, height: stage.height }}
    >
      {/* Framer's own child order: content, then doodles, then the arc, then
          the artwork, which is why the paintings paint over the heading. */}
      <div
        className="absolute flex flex-col items-center"
        style={{
          width: content.width,
          height: content.height,
          gap: content.gap,
          zIndex: 1,
          ...(centred
            ? {
                left: "50%",
                top: content.offsets.top,
                transform: "translate(-50%, -50%)",
              }
            : content.offsets.left != null
              ? content.offsets
              : { left: "50%", transform: "translateX(-50%)", ...content.offsets }),
        }}
      >
        <div
          className="flex w-full flex-col items-center"
          style={{ gap: content.titleGap }}
        >
          {animated ? (
            <TextEffect
              as="h1"
              text={TITLE}
              tokenization="word"
              delay="0.2s"
              style={{ opacity: 0, y: 10, transition: "spring-duration 0.8s 0 0.07s" }}
              className={titleClass}
              textStyle={titleStyle}
            />
          ) : (
            <h1 className={titleClass} style={titleStyle}>
              {TITLE}
            </h1>
          )}

          {animated ? (
            <TextEffect
              as="p"
              text={copy.tagline}
              tokenization="line"
              delay="0.8s"
              style={{ opacity: 0, y: -10, transition: "spring-duration 1.2s 0 0s" }}
              className="ts-hero-tagline text-dark-charcoal"
              textStyle={taglineStyle}
            />
          ) : (
            <p className="ts-hero-tagline text-dark-charcoal" style={taglineStyle}>
              {copy.tagline}
            </p>
          )}
        </div>

        <Enter
          when={animated}
          enter={{
            opacity: 0,
            y: -20,
            scale: 0.9,
            transition: "spring-duration 1.4s 0 1.2s",
          }}
        >
          <div style={copy.ctaScale && copy.ctaScale !== 1 ? { transform: `scale(${copy.ctaScale})` } : undefined}>
            <CtaButton href="/about" label="About me" />
          </div>
        </Enter>
      </div>

      {doodles.map((layer) => (
        <div
          key={layer.key}
          data-doodle={layer.key}
          className={`absolute text-[var(--v2-doodle,#555)]${copy.swapButterfly && layer.key === "butterfly" ? " hero-butterfly-swap" : ""}`}
          style={layer.offsets as CSSProperties}
        >
          <Doodle layer={layer} />
        </div>
      ))}

      {arc ? (
        <AppearEffect
          enter={{ opacity: 0, transition: "spring-duration 0.6s 0 0s" }}
          trigger="onMount"
          className="absolute"
          style={{ left: arc.left, top: arc.top }}
        >
          <ArcText id={`hero-arc-${name}`} fontSize={arc.fontSize} />
          {copy.arcNote ? (
            <p
              className="-mt-1 w-[260px] text-center leading-none text-dark-charcoal"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: arc.fontSize ?? 16.5 }}
            >
              {copy.arcNote}
            </p>
          ) : null}
        </AppearEffect>
      ) : null}

      {art.map((layer) => (
        <FloatingImage
          key={layer.key}
          variant={layer.variant}
          alt={layer.alt}
          position={{ ...layer.offsets, width: layer.width, height: layer.height }}
          rotation={layer.rotation}
          tapRotate={layer.tapRotate}
          parallaxSpeed={layer.parallaxSpeed}
          draggable={animated}
          buildStyle={BUILD[layer.key]}
          priority={priority}
          appear={
            layer.appear
              ? {
                  opacity: 0,
                  x: ENTER[layer.key].x,
                  y: ENTER[layer.key].y,
                  scale: 0.5,
                  rotate: 25,
                  transition: layer.appear,
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}

/**
 * The phone stage is 390 wide. Between 520 and 809 the screen is far wider
 * than that, so the whole stage is scaled up as one piece (CLAUDE.md hero
 * composition rule) instead of sitting small in the middle.
 */
function phoneScale() {
  if (typeof window === "undefined") return 1;
  const w = window.innerWidth;
  const fit = (w - 40) / PHONE.stage.width;
  // the hero starts 100px down and the lower paintings end about 607px into
  // the stage, so they stay in the window with 16px to spare (Anne, 2026-11-17:
  // they were cropped, and the subtitle and button read too large at 1.7)
  const tall = (window.innerHeight - 116) / 607;
  return Math.max(1, Math.min(1 + ((w - 520) / 280) * 0.7, 1.7, fit, tall));
}
function subscribeResize(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}
/**
 * From 810 to 1000 the desktop stage is scaled to about 0.57 to 0.77, which
 * leaves the About me button small; it gets up to 20% back on its own there,
 * tapering to none at 1000 (Anne, 2026-11-17).
 */
function ctaBoost() {
  if (typeof window === "undefined") return 1;
  const t = Math.min(1, Math.max(0, (1000 - window.innerWidth) / 190));
  return 1 + 0.2 * t;
}
function useCtaBoost() {
  const raw = useSyncExternalStore(subscribeResize, () => Math.round(ctaBoost() * 100), () => 100);
  return raw / 100;
}
function usePhoneScale() {
  const raw = useSyncExternalStore(subscribeResize, () => Math.round(phoneScale() * 100), () => 0);
  return raw / 100;
}

/**
 * From 810px the desktop composition is used at every width, scaled down as
 * one piece (CLAUDE.md hero rule; Anne's reference layout, 2026-11-17). The
 * hero is one window tall and starts about 100px down, under the nav, with the
 * stage centred in it and lifted LIFT px, so the lower left painting keeps
 * about 25px of air above the window's bottom edge. The lowest painting's box
 * hangs about 312px below the stage's centre; the scale keeps it on screen. The painted area is about 1180 wide,
 * and it must fit the 40px column on each side. It never scales up.
 */
const LIFT = 40;
function fitScale() {
  if (typeof window === "undefined") return 1;
  const byHeight = (window.innerHeight / 2 - 86) / 312;
  const byWidth = (window.innerWidth - 80) / 1200;
  return Math.max(0.5, Math.min(1, byHeight, byWidth));
}
function useFitScale() {
  const raw = useSyncExternalStore(subscribeResize, () => Math.round(fitScale() * 100), () => 0);
  return raw / 100;
}

/** `tagline` and `arcNote` let the v2 preview try new copy; `/` uses the defaults. */
export function Hero({
  tagline = TAGLINE,
  arcNote,
  hideSmiley = false,
  swapButterfly = false,
}: { tagline?: string; arcNote?: string; hideSmiley?: boolean; swapButterfly?: boolean } = {}) {
  // The server cannot know the window, so both scales read 0 there and the
  // stages stay hidden until the browser has its own numbers; otherwise the
  // page paints at full size first and then jumps (Anne's recording, 2026-11-17).
  const rawScale = usePhoneScale();
  const rawK = useFitScale();
  const ready = rawScale > 0 && rawK > 0;
  const scale = rawScale || 1;
  const k = rawK || 1;
  const cta = useCtaBoost();
  const copy: HeroCopy = { tagline, arcNote, hideSmiley, swapButterfly };
  return (
    <section
      id="hero"
      className="hero-clip relative flex items-center justify-center overflow-hidden tablet:h-screen"
      /* Framer's section spans the whole padded column of the frame, not the
         1200px reading column, and clips there. The margins pull it back out
         of `main`'s max width so the clip lands where Framer puts it. Phones
         clip at the page's own 20px gutter instead, so the one-line greeting
         is not cut on a 360px screen. Both live in `.hero-clip`. */
    >
      {/* TEMPORARY font comparison: active only with ?font= or ?accent=. */}
      <FontPreview />
      <div
        className="shrink-0 tablet:hidden"
        style={{
          width: PHONE.stage.width * scale,
          height: PHONE.stage.height * scale,
          visibility: ready ? undefined : "hidden",
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PHONE.stage.width, height: PHONE.stage.height }}>
          <Stage composition={PHONE} className="" priority copy={copy} />
        </div>
      </div>
      <div
        className="hidden shrink-0 tablet:block"
        style={{
          width: DESKTOP.stage.width,
          height: DESKTOP.stage.height,
          transform: `translateY(-${LIFT}px)${k !== 1 ? ` scale(${k})` : ""}`,
          visibility: ready ? undefined : "hidden",
        }}
      >
        <Stage composition={DESKTOP} className="block" priority={false} copy={{ ...copy, ctaScale: cta }} />
      </div>
    </section>
  );
}
