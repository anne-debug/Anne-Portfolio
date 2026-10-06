"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";

import { WorkCard, type WorkCardProps } from "./WorkCard";

/**
 * Framer section "Selected Work" on the home page: a centred heading flanked by
 * two doodles, a large card, a two-up row, then the Load More button.
 */

const TITLE = "Selected Work";
const DESCRIPTION =
  "Designing thoughtful, user-centered products from idea to execution";

const WORK: WorkCardProps[] = [
  {
    variant: "large",
    name: "Taipei Metro Point Redesign",
    summary:
      "Reimagining Metro Points to make rewards visible, understandable, and part of everyday commuting",
    slug: "taipei-metro-app",
    category: "UI/UX Design",
    href: "/projects/taipei-metro-app",
  },
  {
    variant: "standard",
    name: "BudgetCart",
    summary:
      "An online grocery app that eliminates checkout anxiety for budget-constrained shoppers",
    slug: "budgetcart",
    category: "UI/UX Design",
    href: "/projects/budgetcart",
  },
  {
    variant: "standard",
    name: "Ryze Coffee Redesign",
    summary: "Redesigning with user trust and autonomy for long-term retention",
    slug: "ryze-coffee",
    category: "UI/UX Design",
    href: "/projects/ryze-coffee",
  },
];

/** Framer component "Load more button". */
function LoadMoreButton({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      animate={{ scale: hovered ? 1.04 : 1 }}
      transition={{ type: "spring", duration: 0.4, bounce: 0 }}
      className="inline-block"
    >
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="flex items-center justify-center gap-2 rounded-full bg-orange px-6 py-3"
      >
        <span className="ts-button text-off-white select-none">{label}</span>
      </Link>
    </motion.div>
  );
}

export function SelectedWork() {
  const [large, ...rest] = WORK;

  return (
    /* The extra top padding is not Framer's. Framer leaves 119px between the
       last ability tag and this heading, and the port measured 105px, but
       against the tall gap the 100vh hero leaves above the Skills section
       that still read as lopsided, so this section is pushed down a little. */
    <section
      id="works"
      className="relative flex w-full flex-col items-center gap-10 pt-10 tablet:pt-[70px]"
    >
      <div className="relative flex w-full items-center justify-center gap-2.5 overflow-clip">
        <Image
          src="/vectors/star.png"
          alt=""
          width={57}
          height={57}
          className="absolute left-[76px] top-[57px] hidden size-[57px] object-contain desktop:block"
        />
        <Image
          src="/vectors/squiggle.png"
          alt=""
          width={57}
          height={57}
          className="absolute right-[13px] top-[66px] hidden size-[57px] object-contain desktop:block"
        />
        <div className="flex w-full flex-col items-center gap-4 overflow-hidden">
          <h2 className="ts-heading-2 max-w-[720px] text-center text-deep-blue">
            {TITLE}
          </h2>
          <p
            className="max-w-[720px] text-center text-light-grey"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "16px",
              letterSpacing: "-0.1px",
              lineHeight: "1.3em",
            }}
          >
            {DESCRIPTION}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-[60px]">
        {/* Framer insets the card block to 1038px, which is exactly
            504 + 30 + 504, so the two-up row sets the width. */}
        <div className="flex w-full max-w-[1038px] flex-col items-center">
          <div className="flex w-full flex-col items-center gap-10">
            <WorkCard {...large} />
            <div className="flex w-full flex-col items-center gap-[30px] tablet:flex-row tablet:items-stretch tablet:justify-center">
              {rest.map((card) => (
                <WorkCard key={card.href} {...card} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex h-12 w-full items-center justify-center">
          <LoadMoreButton href="/my-projects" label="Load More" />
        </div>
      </div>
    </section>
  );
}
