import type { ReactNode } from "react";

import { StarGlyph } from "./CaseExtras";

/**
 * The "How might we" card that closes a case study's Problem section.
 *
 * One component for every project, so the padding, the corner, the gradient and
 * the way the card is sized are the same wherever it appears. See
 * CASE_STUDY_NAV_RULES.md for the sibling rule about the section rail; this is
 * the same idea applied to a block: shared component, per-project content.
 *
 * The card is sized by what is in it — statement plus padding, nothing else.
 * Framer draws it at a fixed 229px, which is right for a statement of three
 * lines and wrong for any other: a short one left a band of empty gradient and
 * a long one had to be allowed to grow anyway. The padding below is Framer's
 * 229 less the three lines it was drawn around, so a three-line statement comes
 * out at the height it always did and the others now follow their own text.
 *
 * The stars belong to the statement, not to the card. They are laid out beside
 * the paragraph rather than pinned to the card's corners, and the paragraph is
 * as wide as its own text up to its 900px measure, so they sit against the
 * block of type and move with it when it rewraps. Holding the card at a fixed
 * height is what used to push them apart: the row was 229px tall whatever the
 * text did, so `self-start` and `self-end` sent them to the card's corners
 * instead of the statement's.
 */
export function ProblemStatement({
  children,
  stars = false,
}: {
  /** The statement itself. */
  children: ReactNode;
  /** Framer flanks some of these with sparkles and leaves others plain. */
  stars?: boolean;
}) {
  return (
    <div
      className="flex w-full items-center justify-center gap-4 rounded-[20px] px-6 py-10 tablet:gap-6 tablet:px-10 tablet:py-[54px] desktop:px-12 desktop:py-[66px]"
      style={{
        background:
          "linear-gradient(117deg, rgba(240,253,244,1) 0%, rgba(238,245,254,1) 50%, rgba(255,255,255,1) 100%)",
      }}
    >
      {stars ? (
        <span aria-hidden className="shrink-0 self-start text-dark-charcoal">
          <StarGlyph size={20} />
        </span>
      ) : null}

      <p className="ts-heading-6 max-w-[900px] text-center">{children}</p>

      {stars ? (
        <span
          aria-hidden
          className="flex shrink-0 flex-col items-start gap-1 self-end text-dark-charcoal"
        >
          <StarGlyph size={18} />
          <StarGlyph size={12} />
        </span>
      ) : null}
    </div>
  );
}
