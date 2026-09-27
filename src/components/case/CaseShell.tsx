import type { ReactNode } from "react";

import { MoreProjects, type MoreProjectCard } from "./MoreProjects";
import { SmoothScroll } from "./SmoothScroll";

/**
 * Framer's "Project Page" frame, shared by all five case studies.
 *
 * The spacing is left explicit because the pages genuinely differ: Jubo nests a
 * 120px-padded "Project" inside a 120px-padded "Project Page", while the others
 * clear the nav with 60px and pad their own "Project Container". Framer gives
 * the body no horizontal padding on desktop and simply caps its width, so the
 * column sits flush inside the canvas; padding only appears on small screens.
 */
export function CaseShell({
  children,
  more,
  /** Optional table-of-contents rail rendered beside the body. */
  sidebar,
  moreVariant = "rule",
  bodyWidth = 1000,
  canvasWidth = 1200,
  bodyGap = 80,
  /** Top padding on the outer Project Page frame. */
  pageTop = 60,
  /** Bottom padding on the outer Project Page frame. */
  pageBottom = 0,
  /** Vertical padding on the body column itself. */
  bodyPad = 120,
  /** Horizontal padding on the body column, on desktop. */
  bodyPadX = 0,
  /** Space between the body and the More Projects strip. */
  gapToMore = 0,
  /** Bottom padding beneath the More Projects strip. */
  moreBottom = 120,
}: {
  children: ReactNode;
  more: MoreProjectCard[];
  sidebar?: ReactNode;
  moreVariant?: "rule" | "compact";
  bodyWidth?: number;
  canvasWidth?: number;
  bodyGap?: number;
  pageTop?: number;
  pageBottom?: number;
  bodyPad?: number;
  bodyPadX?: number;
  gapToMore?: number;
  moreBottom?: number;
}) {
  return (
    <>
      <SmoothScroll />
      <main
        className="flex w-full flex-col items-center"
        style={{
          maxWidth: canvasWidth,
          paddingTop: pageTop,
          paddingBottom: pageBottom,
          gap: gapToMore,
        }}
      >
        {/* The rail is a column beside the article at every width. Below
            Framer's desktop breakpoint it is narrow until it is opened, and
            widening it is what moves the article across. */}
        <div
          className="flex w-full items-start gap-4 px-6 desktop:justify-center desktop:gap-[50px] tablet:gap-6 tablet:px-[max(24px,var(--body-pad-x))] desktop:px-[var(--body-pad-x)]"
          style={
            {
              paddingTop: bodyPad,
              paddingBottom: bodyPad,
              "--body-pad-x": `${bodyPadX}px`,
            } as React.CSSProperties
          }
        >
          {sidebar}
          <article
            className="flex w-full min-w-0 flex-col items-start"
            style={{ maxWidth: bodyWidth, gap: bodyGap }}
          >
            {children}
          </article>
        </div>

        <div
          className="flex w-full flex-col px-6 tablet:px-[max(24px,var(--body-pad-x))] desktop:px-[var(--body-pad-x)]"
          style={
            {
              maxWidth: bodyWidth,
              paddingBottom: moreBottom,
              "--body-pad-x": `${bodyPadX}px`,
            } as React.CSSProperties
          }
        >
          <MoreProjects items={more} variant={moreVariant} />
        </div>
      </main>
    </>
  );
}
