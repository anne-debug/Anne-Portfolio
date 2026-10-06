import Image from "next/image";

import { PhoneMockup } from "@/components/case/PhoneMockup";

/**
 * The Taipei Metro project card's picture.
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
 * Framer drew this as a 550x594 stage — taller than it is wide — holding the
 * handset, the green triangles, a blue disc, the Metro Taipei mark and the
 * mascot. This is a rebuild of that collage on a 1.4:1 canvas, the shape the
 * project cards are cut to and the shape the IBM hero already uses, so the
 * picture fills a card instead of sitting in a column of white with a third of
 * the frame empty either side.
 *
 * Built the way `CLAUDE.md` asks: one canvas with a fixed aspect ratio, every
 * piece placed as a percentage of it, so the group keeps its proportions and
 * its overlaps at any width. This departs from the Framer frame deliberately;
 * see README-port.md.
 *
 * There is nothing stacked behind the handset. The IBM hero layers panels there
 * because it is about one surface standing for many; this one is a single app,
 * and the panels only crowded the screen they sat behind.
 *
 * The sizes are ordered on purpose, because the first pass had five things all
 * asking for attention at once: the handset at 40% of the canvas leads, the
 * mascot and the triangles sit a long way below it, the mark is smaller again,
 * and the map is the quietest thing in the picture. The blue disc is a halo
 * behind the handset now rather than a field of colour beside it, and the fifth
 * line came out — four is a network, five was a thicket.
 *
 * Why the handset runs off the bottom
 * -----------------------------------
 * A card draws the picture 480px wide at most, which is 343px tall, and a
 * handset is twice as tall as it is wide. Whatever shape the canvas takes, a
 * handset that fits inside it ends up about 152px wide in the card — which is
 * exactly what the old 550x594 stage already gave. Widening the canvas alone
 * cannot make the demo bigger; it only trades empty side margin for a smaller
 * handset.
 *
 * So the handset is 40% of the canvas and its last fifth runs past the bottom
 * edge, which the canvas clips. With the capture's white band switched off for
 * this project too — the art is already a panel — the handset draws about
 * 160px in a 402px card against 115px before, and it reads as the phone
 * standing up out of the frame rather than floating in the middle of it.
 */

/** The shape everything below is a percentage of; the card frame matches it. */
const CANVAS = { w: 760, h: 543 };

/** Metro Taipei's own green, which the triangles are drawn in. The line
 *  colours are the operator's own and live with the lines, below. */
const GREEN = "#44AE3A";

/** Depth, back to front. */
const Z = { wash: "z-0", scenery: "z-[1]", phone: "z-[2]", front: "z-[3]" };

/**
 * The network.
 *
 * Taipei's map is read by colour before it is read at all — Tamsui–Xinyi is
 * red, Bannan is blue, Songshan–Xindian is green, Zhonghe–Xinlu is orange,
 * Wenhu is brown — so one green line said "a line" where five say "the Metro".
 * These are the operator's own line colours, not a palette invented to match
 * the page.
 *
 * Drawn the way a transit map is drawn: right angles and 45s, rounded joins,
 * a plain dot where a line ends and a larger ringed one where two meet. The
 * lines run behind the handset and out the other side, which is what ties the
 * two halves of the picture together rather than leaving the phone parked on a
 * background.
 *
 * They are placed around what is already there — the mark sits top left, the
 * mascot bottom left, the triangles top right — so the map fills the bands
 * those leave: a crossing on the left, a junction on the lower right.
 */
const LINES: { d: string; color: string }[] = [
  // Tamsui–Xinyi, falling left to right across the upper band.
  { d: "M8 196 H104 L174 266 H302", color: "#E3002C" },
  // Songshan–Xindian, rising to cross it.
  { d: "M8 320 H104 L174 250 H302", color: "#008659" },
  // Zhonghe–Xinlu, out of the handset and down to the corner.
  { d: "M536 330 H626 L696 400 H754", color: "#F8B61C" },
  // Bannan, meeting it at the same junction.
  { d: "M536 486 H626 L696 400", color: "#0070BD" },
];

/** Where a line ends: a small dot in that line's own colour. */
const STOPS: { x: number; y: number; color: string }[] = [
  { x: 104, y: 196, color: "#E3002C" },
  { x: 104, y: 320, color: "#008659" },
  { x: 626, y: 330, color: "#F8B61C" },
  { x: 626, y: 486, color: "#0070BD" },
];

/**
 * Where lines meet: the larger ringed dot a map uses for an interchange.
 *
 * The first is the crossing of the red and the green on the left. It is solved
 * rather than eyeballed: red runs y = 196 + (x - 104) and green y = 320 -
 * (x - 104), which meet at (166, 258). Placed by eye it sat 27px to the left of
 * the join, which on a transit map reads as a mistake.
 */
const INTERCHANGES: [number, number][] = [
  [166, 258],
  [696, 400],
];

export function MetroCardArt({
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
          composition rather than as a coloured panel sitting in a card. */}
      <span className={`absolute inset-0 bg-white ${Z.wash}`} aria-hidden />

      <svg
        aria-hidden
        viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
        className={`absolute inset-0 h-full w-full ${Z.scenery}`}
      >
        {/* Framer's triangles, half again as large and pushed into the corner
            so the crop is deliberate rather than a fit problem. */}
        <g fill={GREEN} transform="translate(596 22) scale(0.6)">
          <polygon points="5,8 125,8 125,128" />
          <polygon points="141,8 253,8 253,120" />
          <polygon points="5,136 125,136 125,256" />
          <polygon points="141,136 253,136 253,248" />
        </g>

        {LINES.map((line) => (
          <path
            key={line.color}
            d={line.d}
            fill="none"
            stroke={line.color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {STOPS.map((stop) => (
          <circle
            key={`${stop.x}-${stop.y}`}
            cx={stop.x}
            cy={stop.y}
            r="9"
            fill="#FFFFFF"
            stroke={stop.color}
            strokeWidth="5"
          />
        ))}
        {INTERCHANGES.map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="11"
            fill="#FFFFFF"
            stroke="#2A3132"
            strokeWidth="4.5"
          />
        ))}
      </svg>

      {/* The demo. Its last sixth is below the canvas and clipped away; see the
          note at the top of this file for why that is the point. */}
      <div
        className={`absolute ${Z.phone}`}
        style={{ left: "35%", top: "7%", width: "40%" }}
      >
        <PhoneMockup
          screen="/case/metro-demo.9fd259d4.webp"
          alt="The redesigned Metro Points page"
          unoptimized
          fluid
        />
      </div>

      {/* The mark, top left, where the IBM hero puts watsonx. */}
      <Image
        src="/case/1MeOVEBvOGnOx8hi8SWSqyAG1lU.png"
        alt="Metro Taipei"
        width={1083}
        height={820}
        sizes="(width < 810px) 22vw, 170px"
        className={`absolute h-auto ${Z.front}`}
        style={{ left: "4%", top: "8%", width: "17%" }}
      />

      {/* The mascot, in the foreground with the line running out from behind
          it. Half again the size Framer gave it. */}
      <Image
        src="/case/GSjPc6ucjUjRwG2ne6R89XIuY.png"
        alt=""
        width={2000}
        height={1680}
        sizes="(width < 810px) 26vw, 200px"
        className={`absolute h-auto ${Z.front}`}
        style={{ left: "5%", top: "66%", width: "22%" }}
      />
    </div>
  );
}
