/**
 * What comes next, as three columns rather than three paragraphs.
 *
 * These are parallel: each is one thing to do, none follows from the one
 * before, and read as a stack of prose they lose that — a reader works down
 * them looking for an argument that is not there. Side by side they are
 * obviously a list of three, and the eye can take all three in before reading
 * any of them.
 *
 * ── Why there are no cards ───────────────────────────────────────────────
 * A card is a surface you can act on, and these are sentences. The columns are
 * separated by a hairline and nothing else: no fill, no border around them, no
 * icon, no number. The page already has enough drawn boxes in it, and a rule
 * between two columns is the quietest thing that says "and also".
 *
 * The heading takes the project's accent and the copy does not, which is the
 * same pairing `ResearchInsights` uses for its theme labels — the accent marks
 * what kind of thing you are looking at, never the prose itself.
 */
export function NextSteps({
  items,
  accent,
  className,
}: {
  /** Three of them, or two, or four: the grid takes whatever it is given. */
  items: { title: string; body: string }[];
  /** Any CSS colour; the headings take it. */
  accent: string;
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    /*
      `items-stretch` is what makes the rules run the full height of the row
      rather than stopping at the shortest column. Stacked on a phone the rules
      go: a vertical hairline between blocks that are no longer side by side
      would be drawing a relationship that is not on screen, and the 40px gap
      already separates them.
    */
    <div
      className={`grid w-full grid-cols-1 items-stretch gap-10 tablet:grid-cols-3 tablet:gap-0 ${className ?? ""}`}
    >
      {items.map((item, i) => (
        <div
          key={item.title}
          className={`flex w-full flex-col gap-4 ${
            i === 0
              ? "tablet:pr-8"
              : "tablet:border-l tablet:border-grey-100 tablet:px-8"
          } ${i === items.length - 1 ? "tablet:pr-0" : ""}`}
        >
          {/*
            `h3`: the page runs `h2` for the section, and these are the blocks
            inside this one. `ts-body-large-fluid` is the size the case study
            gives a block heading that sits under a section title, and
            `normal-case` because every Body Large class carries Framer's
            `text-transform: capitalize`.
          */}
          <h3
            className="ts-body-large-fluid m-0 w-full font-medium normal-case"
            style={{ color: accent }}
          >
            {item.title}
          </h3>
          <p className="ts-body m-0 w-full">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
