import Image from "next/image";

import { PhoneMockup } from "@/components/case/PhoneMockup";

/**
 * The BudgetCart project card's picture.
 *
 * This is the card only. The case study's own hero is the collage Anne designed
 * on the page itself and is not this: a card is 480px wide at most, where a
 * hero has a column to fill, and the two want different compositions. They were
 * briefly the same thing — the previews used to be screenshots of the hero — and
 * that is what pulled the card's shape back onto the page. Nothing here is
 * rendered by the case study, and the capture script no longer visits these two
 * projects at all.
 *
 * It draws straight into the card, like `IbmControlPlaneArt`, rather than being
 * photographed: there is no still, no manifest entry and no overlay to line up.
 * The handset plays the re-encoded animation in `public/case/`, which is half
 * the weight of the source GIF the page uses.
 *
 * Framer drew this as a 700.5x628.4 canvas — the hero's image column extended
 * 225px to the left, which is where it pins the shopper — carrying the shopper,
 * the handset, a doodle and a money bag. This is a rebuild on the 1.4:1 canvas
 * the cards are cut to and the IBM and Metro heroes already use, so the picture
 * fills a card instead of leaving a fifth of the frame empty.
 *
 * It also retires the overhang. That canvas was wider than its own column and a
 * negative margin pushed it back over the words, which is what `CLAUDE.md`
 * records; this one is self-contained, so the column simply holds it.
 *
 * Why the handset runs off the bottom: a card draws the picture 480px wide at
 * most, which is 343px tall, and a handset is twice as tall as it is wide, so a
 * handset that fits inside the canvas lands at the same size whatever shape the
 * canvas takes. Widening alone cannot enlarge the demo. The handset is 40% of
 * the canvas and its last fifth runs past the bottom edge, which the canvas
 * clips — see MetroHeroArt, where the same arithmetic is set out in full.
 *
 * The background is white and nothing is stacked behind the handset. The IBM
 * hero layers translucent panels because it is about one surface standing for
 * many; this is a single app, and the panels only crowded the screen they sat
 * behind. On white the two floating interface fragments carry a thin edge of
 * their own instead of relying on a tint to separate them.
 *
 * Built the way `CLAUDE.md` asks: one canvas with a fixed aspect ratio, every
 * piece placed as a percentage of it.
 */

/** The shape everything below is a percentage of; the card frame matches it. */
const CANVAS = { w: 760, h: 543 };

/** Sampled off the recording itself rather than guessed: the app's own green,
 *  the gold it marks money in, and the mint behind its cards. */
const GREEN = "#007830";
const GOLD = "#F0D860";
const MINT = "#A8D8C0";

/** Depth, back to front. */
const Z = { wash: "z-0", scenery: "z-[1]", phone: "z-[2]", front: "z-[3]" };

export function BudgetCartCardArt({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute inset-0 isolate overflow-hidden ${className}`}
      role="img"
      aria-label={title}
    >
      {/* White, flat. The tinted wash and its two glows are gone: the card
          frame behind this is white too, so the picture reads as the
          composition itself rather than as a coloured panel in a card. */}
      <span className={`absolute inset-0 bg-white ${Z.wash}`} aria-hidden />

      <svg
        aria-hidden
        viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
        className={`absolute inset-0 h-full w-full ${Z.scenery}`}
      >
        {/*
          The budget, as a widget lifted out of the app.

          This project is about checkout anxiety — knowing where the total
          stands before the till tells you — so a track with a fill and a marker
          short of the end is the one device that says what it is about. It is
          abstract on purpose: a figure printed here would be unreadable at card
          size and would read as a claim.
        */}
        <g>
          <rect
            x="24"
            y="142"
            width="236"
            height="92"
            rx="16"
            fill="#FFFFFF"
            stroke="#E6EFE9"
            strokeWidth="2"
          />
          <rect x="44" y="164" width="86" height="10" rx="5" fill={MINT} />
          <rect x="44" y="192" width="196" height="14" rx="7" fill="#E4EFE8" />
          {/* Flat, not a gradient: the only <defs> in this file lived in the
              tinted wash, and that is gone. */}
          <rect x="44" y="192" width="132" height="14" rx="7" fill={GREEN} />
          <circle
            cx="176"
            cy="199"
            r="11"
            fill="#FFFFFF"
            stroke={GREEN}
            strokeWidth="5"
          />
          <circle cx="228" cy="169" r="9" fill={GOLD} />
        </g>

        {/* A second fragment, right of the handset, so the interface reads as
            more than one surface. */}
        <g>
          <rect
            x="608"
            y="238"
            width="130"
            height="50"
            rx="12"
            fill="#FFFFFF"
            stroke="#E6EFE9"
            strokeWidth="2"
          />
          <circle cx="632" cy="263" r="9" fill={GREEN} />
          <rect x="650" y="252" width="70" height="9" rx="4.5" fill="#E4EFE8" />
          <rect x="650" y="267" width="46" height="8" rx="4" fill="#E4EFE8" />
        </g>
      </svg>

      {/* The demo. Its last fifth is below the canvas and clipped away. */}
      <div
        className={`absolute ${Z.phone}`}
        style={{ left: "38%", top: "7%", width: "40%" }}
      >
        <PhoneMockup
          screen="/case/budgetcart-demo.f173aa49.webp"
          alt="The BudgetCart shopping flow"
          unoptimized
          fluid
        />
      </div>

      {/* The shopper, in the foreground and half again the size Framer gave
          her, with the trolley reading against the budget widget above. */}
      <Image
        src="/case/CzIpIqrBNYg6Mptyt3oTzVDzm8c.png"
        alt=""
        width={1400}
        height={1400}
        sizes="(width < 810px) 34vw, 270px"
        className={`absolute h-auto ${Z.front}`}
        style={{ left: "1%", top: "48%", width: "35%" }}
      />

      {/* The money, in front of the handset, where Framer puts it. Its own
          file is 2800x1797; the old markup declared 400x715 and let
          `object-contain` letterbox the difference. */}
      <Image
        src="/case/5resnnnMK0AZd5cIOtw7aPC0eng.png"
        alt=""
        width={2800}
        height={1797}
        sizes="(width < 810px) 26vw, 200px"
        className={`absolute h-auto ${Z.front}`}
        style={{ left: "72%", top: "68%", width: "26%" }}
      />

      {/* Framer's doodle, kept. */}
      <Image
        src="/vectors/squiggle.png"
        alt=""
        width={228}
        height={228}
        sizes="60px"
        className={`absolute h-auto ${Z.scenery}`}
        style={{ left: "85%", top: "7%", width: "8%" }}
      />
    </div>
  );
}
