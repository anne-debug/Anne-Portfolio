"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";

import { AppearEffect } from "@/lib/framer-effects";
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

export interface MoreProjectCard {
  href: string;
  category: string;
  /** Title exactly as that page spells it, including its own quirks. */
  title: string;
  description: string;
  image: string;
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
      className="w-full tablet:w-[480px]"
    >
      <Link href={card.href} className="group flex w-full flex-col items-start gap-5">
        <div className="relative h-[320px] w-full overflow-hidden rounded-[20px]">
          <Image
            src={card.image}
            alt={card.title.trim()}
            fill
            sizes="480px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex w-full flex-col items-start gap-5">
          <CategoryBadge label={card.category} size="small" />
          <h3 className="ts-heading-3 w-full text-left">{card.title}</h3>
          <p className="ts-body-small-light w-full text-left">{card.description}</p>
        </div>
      </Link>
    </AppearEffect>
  );
}

function CompactCard({ card, index }: { card: MoreProjectCard; index: number }) {
  return (
    <AppearEffect
      enter={{
        opacity: 0,
        y: 60,
        transition: `spring-duration 0.6s 0 ${index * 0.1}s`,
      }}
      trigger="onInView"
      threshold={0.1}
      className="w-full tablet:w-[480px]"
    >
      <Link href={card.href} className="group flex w-full flex-col items-start gap-5">
        <div className="relative h-[320px] w-full overflow-hidden rounded-[20px]">
          <Image
            src={card.image}
            alt={card.title.trim()}
            fill
            sizes="480px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex w-full flex-col items-start gap-2.5">
          <span className="ts-button rounded-[30px] bg-dark-charcoal px-3 py-1 text-off-white">
            {card.category}
          </span>
          <h3 className="ts-heading-5 w-full text-left">{card.title}</h3>
          <p className="ts-body-small-light w-full text-left">{card.description}</p>
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
          <span className="ts-button text-off-white select-none">View More</span>
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
    <section className="flex w-full flex-col gap-10">
      {compact ? (
        <h2 className="ts-heading-3 w-full text-left">More Projects</h2>
      ) : (
        <div className="flex w-full items-center gap-5">
          {/* Framer sets 60px; it is stepped down below desktop so the rule
              beside it still has room and the page never scrolls sideways. */}
          <h2
            className="ts-more-projects whitespace-nowrap text-grey-200 uppercase"
          >
            More Projects
          </h2>
          <span className="h-px flex-1 bg-grey-150" aria-hidden />
        </div>
      )}

      <div className="flex w-full flex-col items-start gap-10 tablet:flex-row">
        {items.map((card, i) =>
          compact ? (
            <CompactCard key={card.href} card={card} index={i} />
          ) : (
            <RuleCard key={card.href} card={card} index={i} />
          ),
        )}
      </div>

      {showViewMore ? <ViewMore /> : null}
    </section>
  );
}
