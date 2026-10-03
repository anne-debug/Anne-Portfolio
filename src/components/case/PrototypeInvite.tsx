import Image from "next/image";

/**
 * The little mushroom that invites you into the Ryze prototype.
 *
 * One link holding a character on the left and a speech bubble on the right,
 * laid out with flex rather than positioned against the page, so the pair moves
 * and scales as one thing. The wand and its sparkles are drawn in the
 * character's own box, which is what keeps the wand in the mushroom's hand at
 * any size: every offset below is a share of that box.
 *
 * It is a secondary invitation, under the four solution points and well clear of
 * the Skip button beneath it, so the two never read as one pair of buttons.
 *
 * The animation is CSS, in `globals.css` under "Prototype invite". It rests far
 * longer than it moves — one wave every seven seconds — and hovering plays the
 * wave on demand. `prefers-reduced-motion` stops all of it and leaves the
 * character, the wand, the bubble and the link exactly where they are.
 */

/**
 * The wand's box, placed so its lower left corner — where the stick starts —
 * lands on the hand the mushroom holds out toward the bubble.
 *
 * The artwork faces slightly left, so it is mirrored to turn the character
 * toward the speech bubble on its right. That swaps the arms: the hand nearest
 * the bubble is the one drawn at 9-21% in the file, which lands at 83-91% once
 * flipped, ending around 71% down. The box is 40% of the character's width and
 * square, which is 32.7% of its height, and the stick's base is 9% in and 91%
 * down inside it. The rest is arithmetic.
 */
const WAND = { left: "83.4%", top: "41.3%", width: "40%" };

export function PrototypeInvite({ href }: { href: string }) {
  return (
    <div className="flex w-full justify-center">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label="Explore the Ryze Coffee prototype"
        className="invite group flex max-w-full cursor-pointer items-center gap-3 rounded-[28px] p-2 transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-4 focus-visible:ring-offset-chestnut-bg focus-visible:outline-none tablet:gap-4"
      >
        {/* Character, wand and sparkles: one box, so the wand stays in hand. */}
        <span className="invite-character relative block w-[68px] shrink-0 tablet:w-[84px]">
          <Image
            src="/images/ryze/mushroom.2a3dacb3.png"
            alt=""
            width={338}
            height={414}
            sizes="84px"
            /* Turned to face the bubble. A flip, not a redraw: the pixels are
               the file's own. */
            className="block h-auto w-full"
            style={{ transform: "scaleX(-1)" }}
          />

          {/*
            The wand: a stick with a star on its end, angled up out of the hand
            the mushroom holds toward the bubble. It is one box that rotates
            about its lower left corner — the hand — so the stick, its star and
            the sparkles all swing together and the tip never parts company
            with them. The box is not mirrored with the character; only its
            position moves to the hand that ends up nearest the bubble.
          */}
          <span
            aria-hidden
            className="invite-wand absolute block"
            style={{ left: WAND.left, top: WAND.top, width: WAND.width }}
          >
            <svg
              viewBox="0 0 44 44"
              className="block h-auto w-full overflow-visible"
            >
              <line
                x1="4"
                y1="40"
                x2="18"
                y2="10"
                stroke="currentColor"
                strokeWidth="3.4"
                strokeLinecap="round"
                className="text-dark-charcoal/80"
              />
              <g className="text-orange" transform="translate(20 6)">
                <path
                  d="M0-8c.4 3.6 1.3 5.4 3 6.4 1 .6 2.3.9 5 1.6-3.6.4-5.4 1.3-6.4 3-.6 1-.9 2.3-1.6 5-.4-3.6-1.3-5.4-3-6.4C-4 1-5.3.7-8 0c3.6-.4 5.4-1.3 6.4-3C-1 4-.7 2.7 0-8Z"
                  fill="currentColor"
                  transform="scale(0.8)"
                />
              </g>
              {/* Three sparkles thrown off the tip. */}
              <g className="text-orange">
                <path
                  className="invite-spark invite-spark-1"
                  d="M0-4c.2 1.8.7 2.7 1.5 3.2.5.3 1.2.5 2.5.8-1.8.2-2.7.7-3.2 1.5-.3.5-.5 1.2-.8 2.5-.2-1.8-.7-2.7-1.5-3.2C-2 .5-2.7.3-4 0c1.8-.2 2.7-.7 3.2-1.5C-.5-2-.3-2.7 0-4Z"
                  fill="currentColor"
                  transform="translate(28 2)"
                />
                <path
                  className="invite-spark invite-spark-2"
                  d="M0-3c.15 1.35.5 2 1.1 2.4.4.2.9.35 1.9.6-1.35.15-2 .5-2.4 1.1-.2.4-.35.9-.6 1.9-.15-1.35-.5-2-1.1-2.4C-1.5.4-2 .25-3 0c1.35-.15 2-.5 2.4-1.1C-.4-1.5-.25-2 0-3Z"
                  fill="currentColor"
                  transform="translate(11 0)"
                />
                <path
                  className="invite-spark invite-spark-3 text-dark-charcoal"
                  d="M0-3c.15 1.35.5 2 1.1 2.4.4.2.9.35 1.9.6-1.35.15-2 .5-2.4 1.1-.2.4-.35.9-.6 1.9-.15-1.35-.5-2-1.1-2.4C-1.5.4-2 .25-3 0c1.35-.15 2-.5 2.4-1.1C-.4-1.5-.25-2 0-3Z"
                  fill="currentColor"
                  transform="translate(26 13)"
                />
              </g>
            </svg>
          </span>
        </span>

        {/* The bubble, level with the mushroom's face rather than its feet.
            Its border, fill and lift are set in `globals.css` so the tail can
            be carried with it — the two are separate boxes and would come
            apart if only one of them answered the pointer. */}
        <span className="invite-bubble relative -mt-4 block max-w-[210px] rounded-2xl rounded-bl-md border px-4 py-2.5 tablet:max-w-[260px] tablet:px-5 tablet:py-3">
          {/* The tail, pointing back at the character on the left. */}
          <span
            aria-hidden
            className="invite-tail absolute top-1/2 -left-[7px] block size-3 -translate-y-1/2 rotate-45 border-b border-l"
          />
          <span className="ts-body invite-bubble-text relative block font-semibold">
            Click me to see the prototype!
          </span>
        </span>
      </a>
    </div>
  );
}
