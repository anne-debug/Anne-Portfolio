"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";

import { PreviewMedia } from "@/components/project/PreviewMedia";
import { AppearEffect } from "@/lib/framer-effects";
import { projectPreview, type ProjectSlug } from "@/lib/project-previews";
import { CARD_ASPECT } from "@/lib/thumbnails";
import { CategoryBadge } from "./CaseParts";

/**
 * Framer's closing "More Projects" strip.
 *
 * Each case study hand-picks which projects to show and even spells their
 * titles slightly differently, so the cards are passed in rather than derived.
 * Two designs are in use: the "rule" strip with a Chonburi heading and outlined
 * badges, and the "compact" strip on the Taipei page with a Heading 3 title and
 * a filled badge.
 */

/**
 * The card title.
 *
 * Two things bound it. The card's own width, because a card is 480px on desktop,
 * about 345px when two squeeze into a tablet, and up to its 480px cap when they
 * stack, so its width does not follow the window: it grows to 480 by 600px,
 * drops back to 345 at 810 where the row goes two-up, then climbs again. Keyed
 * to the card it stays 7.5% of it, which is Framer's 36px on the 480px card it
 * drew.
 *
 * And the window, because in the stacked range a full-width card would carry a
 * 36px title while "More Projects" above it is only 24 to 30px, so the card
 * outshouted the section it belongs to. The window ramp holds the title under
 * the heading at every width, between about two thirds and six sevenths of it.
 *
 * Whichever is smaller wins.
 */
const CARD_TITLE = {
  fontSize:
    "min(7.5cqw, clamp(20px, calc(20px + 16 * (100vw - 390px) / 810), 36px))",
};

export interface MoreProjectCard {
  href: string;
  category: string;
  /** Title exactly as that page spells it, including its own quirks. */
  title: string;
  description: string;
}

/**
 * The card shows the linked case study's own hero, the same picture and the
 * same frame the cards on My Projects use. Framer gave each card a picture of
 * its own, but several were page screenshots rather than heroes, one of them
 * with Framer's editor chrome in it.
 */
function CardMedia({ href, title }: { href: string; title: string }) {
  const slug = href.replace("/projects/", "") as ProjectSlug;
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px] bg-white"
      style={{ aspectRatio: CARD_ASPECT }}
    >
      <PreviewMedia
        preview={projectPreview(slug)}
        alt={title}
        sizes="480px"
        className="transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </div>
  );
}

function RuleCard({ card, index }: { card: MoreProjectCard; index: number }) {
  return (
    <AppearEffect
      enter={{
        opacity: 0,
        y: 60,
        transition: `spring-duration 0.6s 0 ${index * 0.1}s`,
      }}
      trigger="onInView"
      threshold={0.1}
      className="w-full max-w-[480px] tablet:w-[480px]"
    >
      <Link
        href={card.href}
        className="group flex w-full flex-col items-start gap-5"
        /* The card sizes its own title; see CARD_TITLE. */
        style={{ containerType: "inline-size" }}
      >
        <CardMedia href={card.href} title={card.title.trim()} />
        <div className="flex w-full flex-col items-start gap-5">
          <CategoryBadge label={card.category} size="small" />
          <h3 className="ts-heading-3 w-full text-left" style={CARD_TITLE}>
            {card.title}
          </h3>
          <p className="ts-body-small-light w-full text-left">
            {card.description}
          </p>
        </div>
      </Link>
    </AppearEffect>
  );
}

function CompactCard({
  card,
  index,
}: {
  card: MoreProjectCard;
  index: number;
}) {
  return (
    <AppearEffect
      enter={{
        opacity: 0,
        y: 60,
        transition: `spring-duration 0.6s 0 ${index * 0.1}s`,
      }}
      trigger="onInView"
      threshold={0.1}
      className="w-full max-w-[480px] tablet:w-[480px]"
    >
      <Link
        href={card.href}
        className="group flex w-full flex-col items-start gap-5"
        /* The card sizes its own title; see CARD_TITLE. */
        style={{ containerType: "inline-size" }}
      >
        <CardMedia href={card.href} title={card.title.trim()} />
        <div className="flex w-full flex-col items-start gap-2.5">
          <span className="ts-button rounded-[30px] bg-dark-charcoal px-3 py-1 text-off-white">
            {card.category}
          </span>
          <h3 className="ts-heading-5 w-full text-left" style={CARD_TITLE}>
            {card.title}
          </h3>
          <p className="ts-body-small-light w-full text-left">
            {card.description}
          </p>
        </div>
      </Link>
    </AppearEffect>
  );
}

function ViewMore({ href = "/my-projects" }: { href?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="flex w-full items-center justify-center">
      <motion.div
        animate={{ scale: hovered ? 1.04 : 1 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0 }}
      >
        <Link
          href={href}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          className="flex items-center justify-center rounded-full bg-orange px-6 py-3"
        >
          <span className="ts-button text-off-white select-none">
            View More
          </span>
        </Link>
      </motion.div>
    </div>
  );
}

export function MoreProjects({
  items,
  variant = "rule",
  showViewMore = true,
}: {
  items: MoreProjectCard[];
  variant?: "rule" | "compact";
  showViewMore?: boolean;
}) {
  const compact = variant === "compact";

  return (
    /* The two cards are 480px each with a 40px gap, so the strip is 1000px wide
       whatever the column around it measures: 1000 on Jubo and Little Chestnut
       Thief, but 1120 on Taipei and BudgetCart and 1200 on Ryze. Left to fill
       those, the cards sat against the left edge with the slack piled up on the
       right. Heading and cards now share one block, capped at the width the
       cards come to and centred in the column. */
    <section className="flex w-full flex-col items-center gap-10">
      <div className="flex w-full max-w-[1000px] flex-col gap-10">
        {compact ? (
          <h2 className="ts-heading-3 w-full text-left">More Projects</h2>
        ) : (
          <div className="flex w-full items-center gap-5">
            {/* Framer sets 60px; it is stepped down below desktop so the rule
              beside it still has room and the page never scrolls sideways. */}
            <h2 className="ts-more-projects whitespace-nowrap text-grey-200 uppercase">
              More Projects
            </h2>
            <span className="h-px flex-1 bg-grey-150" aria-hidden />
          </div>
        )}

        <div className="flex w-full flex-col items-center gap-10 tablet:flex-row tablet:items-start">
          {items.map((card, i) =>
            compact ? (
              <CompactCard key={card.href} card={card} index={i} />
            ) : (
              <RuleCard key={card.href} card={card} index={i} />
            ),
          )}
        </div>
      </div>

      {showViewMore ? <ViewMore /> : null}
    </section>
  );
}
