import Image from "next/image";

import { LaptopMockup } from "./LaptopMockup";

/**
 * The Ryze hero: the redesigned site playing in a laptop, the product bag
 * standing against it, a heap of roasted beans on the floor where the two meet,
 * and the mushroom at the other end.
 *
 * Built the way `CLAUDE.md` asks a hero composition to be built — one canvas
 * with a fixed aspect ratio, every piece placed as a percentage of it — so the
 * whole group keeps its spacing and its overlap at any width rather than each
 * piece answering the viewport on its own.
 *
 * The canvas is exactly as tall as the laptop standing in it. Slack underneath
 * would put the artwork's own centre above the canvas's, and the header centres
 * the box, so the picture would sit high against the words beside it.
 *
 * The bag, the heap and the character are the client's own photography. The
 * character is the one that invites you into the prototype further down the
 * page, facing back toward the screen it presents.
 *
 * Nothing here moves except the character's breath, which is in `globals.css`
 * under "Ryze hero" and stops under `prefers-reduced-motion`.
 */

/** The canvas: as wide as the column, as tall as the laptop standing in it. */
const CANVAS = { w: 760, h: 387 };

/**
 * Depth, back to front.
 *
 * Without these the pieces fall back on document order, and the bag can only
 * ever stand in front of the screen it is meant to lean against. The heap is
 * the one thing in front of the laptop: it is on the floor, nearer the viewer
 * than the machine behind it.
 */
const Z = { bag: "z-0", laptop: "z-[2]", heap: "z-[3]", character: "z-[4]" };

export function RyzeHeroArt() {
  return (
    /* `isolate` keeps the depth below to this box. The canvas is positioned but
       carries no z-index of its own, so without it the layers would be sorted
       against whatever else the page stacks. */
    <div
      className="relative isolate w-full"
      style={{ aspectRatio: `${CANVAS.w} / ${CANVAS.h}` }}
    >
      {/*
        The product, leaning against the machine rather than standing beside it.
        Its right edge runs to 26.5% of the canvas and the laptop's own pixels
        begin at 23% — the frame is opaque from 8.3% of its box, not from its
        left edge — so the last sixth of the bag is behind the screen. The RYZE
        mark sits between 6% and 22%, well clear of that.
      */}
      <Image
        src="/images/ryze/bag.0b8f0fca.png"
        alt="A bag of Ryze mushroom coffee"
        width={458}
        height={717}
        sizes="(width < 810px) 27vw, 195px"
        className={`absolute h-auto ${Z.bag}`}
        style={{ left: "1.5%", top: "18%", width: "25%" }}
      />

      {/* The laptop, held off the left edge so the bag has a lane of its own
          rather than standing across the screen it is presenting. */}
      <div
        className={`absolute ${Z.laptop}`}
        style={{ left: "16%", top: "0%", width: "84%" }}
      >
        <LaptopMockup
          screen="/case/mqjuuhwCqzIUFccvoCN3Y9wm0eo.mp4"
          alt="The redesigned Ryze Coffee home page"
          sizes="(width < 810px) 82vw, 580px"
          priority
        />
      </div>

      {/*
        The heap, in the corner where the bag meets the laptop: it runs from 10%
        to 36% of the canvas, so its middle sits on the 23% seam between them.
        In front of both, since it is the nearest thing in the picture.

        Its foot is at 101.9%, a couple of points below the laptop's own at
        99.9% and well below the bag's at 94.9%. That is the point rather than
        an overhang: a thing nearer the viewer than the laptop meets the ground
        lower in the frame, and at 98.9% the heap read as floating against the
        machine's base. The canvas does not clip, and the two points come to
        5px at a desktop against the 30px of gap beneath.

        The file is trimmed to the heap itself, with no transparent margin, so
        these percentages are the heap and not its padding.
      */}
      <Image
        src="/images/ryze/coffee-beans.008c3884.png"
        alt=""
        width={796}
        height={384}
        sizes="(width < 810px) 25vw, 190px"
        className={`absolute h-auto ${Z.heap}`}
        style={{ left: "10%", top: "77.4%", width: "26%" }}
      />

      {/*
        The character, standing on the laptop rather than beside it. It runs
        from 77% to 90% of the canvas, inside the frame's own right edge at
        93.1%, and its feet are at 95% — below the screen, which ends at 89%,
        so it is planted on the base deck and leaning into the lower right of
        the page it is presenting. It used to sit at 84% to 97%, hanging off
        the machine's right side with nothing under it.

        It keeps its breath; `ryze-bob` lifts it 6px and back.
      */}
      <Image
        src="/images/ryze/mushroom.2a3dacb3.png"
        alt=""
        width={338}
        height={414}
        sizes="(width < 810px) 15vw, 105px"
        className={`ryze-bob absolute h-auto ${Z.character}`}
        style={{ left: "77%", top: "63.7%", width: "13%" }}
      />
    </div>
  );
}
