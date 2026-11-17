import Link from "next/link";

import { SelectedWork } from "@/components/home/SelectedWork";
import type { WorkCardProps } from "@/components/home/WorkCard";
import { AboutMe } from "@/components/v2/AboutMe";
import { IntroBento } from "@/components/v2/Bento";
import { HeroRibbon } from "@/components/v2/HeroRibbon";
import { KindWords } from "@/components/v2/KindWords";
import { RecentMoves } from "@/components/v2/RecentMoves";
import { PROJECTS } from "@/lib/projects";

/**
 * The v2 home page, rendered at `/` (made the live home page on 2026-11-16;
 * `/v2-preview`, where it was drafted, now redirects here).
 *
 * Sections sit side by side in bento grids rather than one row each:
 * orange wordmark (top left) → original hero with an ink flower → about me
 * pegboard → Selected Work cards (the home page's own design: IBM large, then
 * Taipei Metro and BudgetCart side by side) → [lamp + testimonials bento] → peelable sticker
 * board → latest moves on a polaroid clothesline → dark footer with 鈺 in
 * red calligraphy and the make-a-wish candle. The footer is the site-wide ink footer from the root layout (site/Footer.tsx).
 */
/* Order Anne asked for on 2026-11-16. Names, summaries and links are read from
   lib/projects.ts so the cards cannot drift from the case studies. */
const WORK_SLUGS = [
  "ibm-watsonx-builder-control-plane",
  "taipei-metro-app",
  "budgetcart",
];

const WORK: WorkCardProps[] = WORK_SLUGS.flatMap((slug, i) => {
  const p = PROJECTS.find((project) => project.slug === slug);
  if (!p) return [];
  return [
    {
      variant: i === 0 ? "large" : "standard",
      name: p.title,
      summary: p.description,
      slug: p.slug,
      category: p.category,
      href: p.href,
    },
  ];
});

export function HomeV2() {
  return (
    <main className="v2-home flex w-full max-w-[1280px] flex-col gap-[80px] px-5 py-[100px] tablet:gap-[100px] tablet:px-10">
      {/* the site footer's orange Mansalva wordmark, pinned to the top-left corner of the page; hidden on phones, where the nav pill spans the width */}
      <Link
        href="/"
        className="absolute left-8 top-6 z-10 hidden text-orange tablet:block"
        style={{ fontFamily: "var(--font-mansalva)", fontSize: "24px", lineHeight: "110%" }}
      >
        Anne Lin
      </Link>
      <HeroRibbon />
      {/* the hero is one screen tall, so About me can sit closer to it and
          still stay below the first screen */}
      <div className="tablet:-mt-[70px]">
        <AboutMe />
      </div>
      <SelectedWork work={WORK} flush hideDescription moreLabel="View More" />
      {/* closer to Selected Work above (70px) and a little more room before My toolkit (84px) */}
      <div className="v2-words-gap">
        <KindWords />
      </div>
      <IntroBento />
      <RecentMoves />
    </main>
  );
}
