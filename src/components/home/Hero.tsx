"use client";

import type { CSSProperties, ReactNode } from "react";

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
  arc?: { left: number; top: number };
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
    { key: "sparkle", width: 90, height: 91, offsets: { left: 188, top: 37 } },
    { key: "butterfly", width: 57, height: 57, offsets: { left: 37, bottom: 35 } },
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
      offsets: { left: 130, bottom: -5 },
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
      offsets: { left: 743, bottom: 16 },
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

const TABLET: Composition = {
  name: "tablet",
  stage: { width: 798, height: 340 },
  animated: true,
  content: {
    // Framer pins this one by its centre, 45% down the stage.
    width: 731,
    gap: 51,
    titleGap: 50,
    offsets: { top: "45%" },
    title: {
      fontSize: 83,
      lineHeight: "1.1em",
      letterSpacing: "-2px",
      maxWidth: 500,
      textAlign: "center",
    },
    tagline: {
      fontSize: 20,
      lineHeight: "1.3em",
      letterSpacing: "-0.2px",
      maxWidth: 500,
      textAlign: "center",
    },
  },
  arc: { left: 264, top: -193 },
  doodles: [
    { key: "sparkle", width: 50, height: 60, offsets: { left: 176, top: -103 } },
    { key: "butterfly", width: 57, height: 57, offsets: { left: 37, top: 187 } },
    { key: "smiley", width: 50, height: 50, offsets: { left: 600, top: 56 } },
  ],
  art: [
    {
      key: "rooster",
      variant: "Variant 3",
      alt: ALT.rooster,
      width: 141,
      height: 180,
      rotation: -25,
      tapRotate: -17,
      parallaxSpeed: 85,
      offsets: { left: 41, top: -141 },
      appear: APPEAR.rooster,
    },
    {
      key: "portrait",
      variant: "Variant 5",
      alt: ALT.portrait,
      width: 145,
      height: 188,
      rotation: -19,
      tapRotate: -8,
      parallaxSpeed: 105,
      offsets: { left: 66, bottom: -142 },
      appear: APPEAR.portrait,
    },
    {
      key: "framed",
      variant: "Variant 4",
      alt: ALT.framed,
      width: 139,
      height: 175,
      rotation: 12,
      tapRotate: 20,
      parallaxSpeed: 100,
      offsets: { left: 613, bottom: -95 },
      appear: APPEAR.framed,
    },
    {
      key: "sculpture",
      variant: "Variant 6",
      alt: ALT.sculpture,
      width: 112,
      height: 158,
      rotation: 32,
      tapRotate: 15,
      parallaxSpeed: 80,
      offsets: { left: 652, top: -131 },
      appear: APPEAR.sculpture,
    },
  ],
};

const PHONE: Composition = {
  name: "phone",
  stage: { width: 390, height: 613 },
  // The Phone frame carries no appear effects on the text, the button or the
  // artwork, and no drag effect either.
  animated: false,
  content: {
    width: 287,
    height: 286,
    gap: 40,
    titleGap: 16,
    offsets: { left: 58.5, top: 172 },
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
  doodles: [
    { key: "sparkle", width: 30, height: 30, offsets: { left: 59, top: 168 } },
    { key: "smiley", width: 30, height: 30, offsets: { left: 311, top: 249 } },
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
  const { stage, content, doodles, art, arc, animated, name } = composition;
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
  const centred = content.offsets.top === "45%";

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
                top: "45%",
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
          <CtaButton href="/about" label="About me" />
        </Enter>
      </div>

      {doodles.map((layer) => (
        <div
          key={layer.key}
          className="absolute text-[var(--v2-doodle,#555)]"
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
          <ArcText id={`hero-arc-${name}`} />
          {copy.arcNote ? (
            <p
              className="-mt-1 w-[260px] text-center text-[16.5px] leading-none text-dark-charcoal"
              style={{ fontFamily: "var(--font-dm-sans)" }}
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

/** `tagline` and `arcNote` let the v2 preview try new copy; `/` uses the defaults. */
export function Hero({ tagline = TAGLINE, arcNote }: { tagline?: string; arcNote?: string } = {}) {
  const copy: HeroCopy = { tagline, arcNote };
  return (
    <section
      id="hero"
      className="relative flex items-center justify-center overflow-hidden tablet:h-screen"
      /* Framer's section spans the whole padded column of the frame, not the
         1200px reading column, and clips there. The margins pull it back out
         of `main`'s max width so the clip lands where Framer puts it. */
      style={{
        width: "calc(100vw - 80px)",
        marginLeft: "calc(50% + 40px - 50vw)",
        marginRight: "calc(50% + 40px - 50vw)",
      }}
    >
      {/* TEMPORARY font comparison: active only with ?font= or ?accent=. */}
      <FontPreview />
      <Stage composition={PHONE} className="tablet:hidden" priority copy={copy} />
      <Stage
        composition={TABLET}
        className="hidden tablet:block desktop:hidden"
        priority={false}
        copy={copy}
      />
      <Stage
        composition={DESKTOP}
        className="hidden desktop:block"
        priority={false}
        copy={copy}
      />
    </section>
  );
}
