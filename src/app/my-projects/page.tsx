import type { Metadata } from "next";
import Link from "next/link";

import { AppearEffect } from "@/lib/framer-effects";
import {
  LockGlyph,
  ProjectCover,
  StatusOverlay,
} from "@/components/project/ProjectCover";
import { PROJECTS } from "@/lib/projects";
import { CARD_ASPECT } from "@/lib/thumbnails";

export const metadata: Metadata = {
  title: "My Projects — Anne Lin",
  description:
    "Product and UX work: Taipei Metro Point Redesign, BudgetCart, Ryze Coffee and the Jubo healthcare platform.",
};

/** Tools render up to the first blank slot, which is how Framer's card behaves. */
function visibleTools(tools: string[]): string[] {
  const out: string[] = [];
  for (const t of tools) {
    if (!t.trim()) break;
    out.push(t.trim());
  }
  return out;
}

/** Framer page "My Projects" (/my-projects). */
export default function MyProjectsPage() {
  return (
    <>
      <main className="flex w-full max-w-[1200px] flex-col gap-10 px-6 py-[160px] tablet:px-10">
        <h1 className="ts-heading-2 text-grey-200">My Projects</h1>

        {/* Capped, one card leaves half a wide window empty, so from 1000 the
            same stacked cards sit two to a row until the desktop row takes over. */}
        <div className="grid w-full grid-cols-1 gap-[60px] min-[1000px]:grid-cols-2 min-[1000px]:gap-x-10 desktop:grid-cols-1">
          {PROJECTS.map((project) => (
            <AppearEffect
              key={project.href}
              enter={{
                opacity: 0,
                y: 20,
                transition: "spring-physics 400 30 1 0s",
              }}
              trigger="onInView"
              threshold={0}
              className="w-full"
            >
              <Link
                href={project.href}
                /* Framer's Tablet frame stacks this card: the thumbnail runs the full
                   width with the copy underneath. Only the 1440px Desktop frame
                   sets them side by side, so the row starts at 1200.

                   Stacked, the card is capped at 520px, so the thumbnail tops out
                   at 460px rather than stretching across a 1000px column.

                   That cap is narrower than the column it sits in from about
                   510 up, and a block with a max-width keeps to the left of the
                   space it is given: at 999 the card had 40px to its left and
                   439 to its right. Auto inline margins centre it in whatever
                   column it lands in — the single one below 1000, either of the
                   two above it — and from 1200 the cap is lifted and they have
                   nothing left to do. */
                className="group mx-auto flex w-full max-w-[520px] flex-col items-center gap-6 rounded-[40px] p-[30px] transition-colors hover:bg-light-grey-super/50 desktop:max-w-none desktop:flex-row desktop:items-start"
              >
                <div
                  /* Framer's desktop thumbnail measures 402px wide in a 1120px
                     column, which is the same column this page has from 1200 up.
                     Every row uses the one card frame, so each preview sits in
                     its card the same way. */
                  className="relative w-full shrink-0 overflow-hidden rounded-3xl bg-white desktop:w-[402px]"
                  style={{ aspectRatio: CARD_ASPECT }}
                >
                  <ProjectCover
                    slug={project.slug}
                    title={project.title}
                    sizes="(width < 1200px) min(460px, 92vw), 402px"
                    className="transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {project.status ? (
                    <StatusOverlay label={project.status} />
                  ) : null}
                </div>

                {/* Stacked, the copy sits under the thumbnail with a little air
                    above it. Side by side, it starts level with the top of the
                    thumbnail, so the category pill and the picture share a top
                    edge. */}
                <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-4 pt-4 pb-6 desktop:pt-0">
                  <div className="flex w-full flex-col gap-2.5">
                    <span className="inline-flex items-center gap-2 self-start rounded-full bg-orange px-3 py-1">
                      <span
                        className="size-1.5 rounded-full bg-white"
                        aria-hidden
                      />
                      {/* The colour has to sit on the label itself: `.ts-body-small`
                          sets its own, so it never inherits the one above. */}
                      <span className="ts-body-small text-white">
                        {project.category}
                      </span>
                    </span>
                    <h2 className="ts-heading-5 w-full text-left text-[22px] tablet:text-[36px]">
                      {project.title}
                    </h2>
                    <p className="ts-body w-full text-left">
                      {project.description}
                    </p>

                    {/* A quiet line, not a badge: the card is the same card the
                        other projects use, and this says where the link goes
                        rather than competing with the title above it. */}
                    {project.locked ? (
                      <span className="ts-body-small inline-flex items-center gap-1.5 text-light-grey">
                        <LockGlyph size={14} />
                        Password protected
                      </span>
                    ) : null}
                  </div>

                  <ul className="flex flex-wrap items-end gap-2">
                    {visibleTools(project.tools).map((tool) => (
                      <li
                        key={tool}
                        className="ts-body-small rounded-3xl bg-light-grey px-4 py-1 text-off-white"
                      >
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            </AppearEffect>
          ))}
        </div>
      </main>
    </>
  );
}
