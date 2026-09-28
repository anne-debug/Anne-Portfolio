import type { Metadata } from "next";
import Image from "next/image";
import { Fragment } from "react";

import { Paragraphs } from "@/components/case/CaseParts";
import {
  Reveal,
  SkipButton,
  StarPointList,
} from "@/components/case/CaseExtras";
import { CaseShell } from "@/components/case/CaseShell";
import { ProblemStatement } from "@/components/case/ProblemStatement";
import type { MoreProjectCard } from "@/components/case/MoreProjects";
import { PhoneMockup } from "@/components/case/PhoneMockup";
import { SidebarNav, type SidebarEntry } from "@/components/case/SidebarNav";
import { Tabs, type TabPanel } from "@/components/case/Tabs";
import { Zoomable } from "@/components/case/Zoomable";

export const metadata: Metadata = {
  title: "BudgetCart — Anne Lin",
  description:
    "An online grocery app that eliminates checkout anxiety for budget-constrained shoppers.",
};

const MORE: MoreProjectCard[] = [
  {
    href: "/projects/taipei-metro-app",
    category: "UI/UX Design",
    title: "Taipei Metro Point Redesign",
    description:
      "Reimagining Metro Points to make rewards visible, understandable, and part of everyday commuting.",
  },
  {
    href: "/projects/ryze-coffee",
    category: "UI/UX Design",
    title: "Ryze Coffee Redesign",
    description:
      "Redesigning with user trust and autonomy for long-term retention",
  },
];

/**
 * Framer's sidebar links on the Desktop variant point at the Taipei page, which
 * is a copy-paste slip in the source file. The anchors are corrected here so
 * the rail scrolls this page; see README-port.md.
 */
/**
 * This page's own sections; see CASE_STUDY_NAV_RULES.md.
 *
 * No Project Context entry: unlike Taipei, this hero is the title, the subtitle
 * and the project meta, with no section of that name. Its `#project-context` id
 * stays on the hero for deep links, which does not earn it a place here.
 *
 * The whole research phase is one entry pointing at the first of its sections,
 * "Key Research Insight". Target User, Competitive Analysis and Design
 * Opportunity follow it inside the same block and are not listed separately.
 */
const SECTIONS: SidebarEntry[] = [
  { id: "problem", label: "Problem" },
  { id: "my-role", label: "My Role" },
  { id: "solutions-overview", label: "Solution Overview" },
  { id: "research-process", label: "User Research" },
  { id: "design-breakdown", label: "Design Breakdown" },
];

const SOLUTION_POINTS = [
  {
    title: "Redesign the shopping flow ",
    items: [
      "→ minimizing the step for compare price so shoppers don't need to rebuild cart to compare price.",
    ],
  },
  {
    title: "Redesign the Information Architecture",
    items: ["→ Consolidate total cost comparison into one unified view."],
  },
  {
    title: "Build a Budget Awareness System",
    items: [
      "→ Surface real-time budget signals to help users stay within limits.",
    ],
  },
  {
    title: "Introduce Persistent SNAP Signals",
    items: [
      "→  Show coverage and out-of-pocket costs early to prevent checkout surprises.",
    ],
  },
];

/**
 * The four competitors, each drawn in a box of the same size.
 *
 * Framer gave every logo its own width, between 138 and 165, which is what made
 * one competitor look more important than another. They share one box now, and
 * what differs is `scale`: how much of that box each mark is allowed to fill, so
 * that the marks come out the same optical size rather than the same measured
 * size.
 *
 * The two app icons are solid squares that reach their own edges, so they read
 * heavier than a mark on transparency and are held back to about three quarters
 * of the box. Instacart's carrot covers 61% of the width of its file and Framer
 * compensated by drawing it largest of the four; it takes the whole box instead.
 * BudgetCart's trolley is nearly as wide as its file, so it sits between them.
 *
 * `radius` is a share of the box rather than a pixel count, so the icons keep
 * their corner as the box shrinks. It is Framer's radius over Framer's width.
 *
 * The box itself is 76px on a phone, where the four of them stack down the
 * screen, ramping to Framer's own scale by the width at which the row goes four
 * across.
 */
const LOGO_BOX = "clamp(76px, calc(76px + 44 * (100vw - 390px) / 420), 120px)";

const COMPETITORS = [
  {
    name: "Flashfood",
    image: "/case/JLSjeOpaIz8hucZjlpSsPW5zdU8.png",
    lead: "discounts",
    tail: ", not total decision planning",
    width: 512,
    height: 512,
    scale: 0.76,
    radius: "22%",
  },
  {
    name: "Instacart",
    image: "/case/WATEHN6UH1iE6C7sR1IsSQ1zhI.png",
    lead: "convenience",
    tail: ", not cross-store comparison",
    width: 512,
    height: 425,
    scale: 1,
    radius: "0",
  },
  {
    name: "Walmart",
    image: "/case/h8UQWRJeDYrQzu8lczYQWOwEWM.png",
    lead: "pricing",
    tail: ", not integrated budgeting & eligibility",
    width: 512,
    height: 512,
    scale: 0.76,
    radius: "20%",
  },
  {
    name: "Budgetcart",
    image: "/case/kWbiUi9znPLcP4vY36ZEfzv9130.svg",
    lead: "unified financial decision-making",
    tail: "",
    width: 200,
    height: 214,
    scale: 0.82,
    radius: "0",
  },
];

const OPPORTUNITIES = [
  {
    number: "01.",
    title: "COMPARISON EFFICIENCY",
    body: "Redesign the flow so users compare stores without rebuilding carts.",
  },
  {
    number: "02.",
    title: "BUDGET AWARENESS",
    body: "Provide continuous visibility into total cost and remaining budget before checkout",
  },
  {
    number: "03.",
    title: "ELIGIBILITY TRANSPARENCY",
    body: "Surface SNAP coverage and out-of-pocket costs early in the journey",
  },
];

const WALKTHROUGH = [
  {
    step: "Build cart once",
    lines: [
      "Users add items to a single cart without selecting a store.",
      "The cart is built only once.",
    ],
  },
  {
    step: "Compare cost across stores before commitment",
    lines: [
      "Instead of committing first, users see total cost across stores before choosing. Comparison happens before any checkout decision.",
    ],
  },
  {
    step: "Select & Confirm cart",
    lines: [
      "Only after reviewing the full cost picture do users select a store and proceed.",
      "No cart rebuilding. No switching back and forth.",
    ],
  },
];

const COMPARISON_POINTS = [
  {
    step: "Total Cost First",
    lines: [
      "Each store shows the full cart total first, ensuring users compare final cost rather than piecing together item prices",
    ],
  },
  {
    step: "Best Match Indicator",
    lines: [
      "The system highlights the best value option to reduce cognitive load",
    ],
  },
  {
    step: "Trade-off Transparency",
    lines: [
      "Delivery fees, pickup time, and discount breakdown are surfaced inline",
    ],
  },
];

const NEXT_STEPS = [
  {
    title: "Explore an AI-powered shopping assistant",
    lines: [
      "Users could upload a grocery list and the system would automatically generate a cart optimized for their budget.",
      "This assistant could help users quickly identify the most affordable store and maximize SNAP usage without manually comparing prices.",
    ],
  },
  {
    title: "Conduct deeper testing with SNAP users",
    lines: [
      "Due to limited access to SNAP participants, many early design decisions were informed by one interview and secondary research.",
      "With more time, I would recruit more SNAP users to better understand their real budgeting behaviors and evaluate whether the solution truly reduces decision anxiety during real shopping scenarios.",
    ],
  },
];

/**
 * Framer's "Tab Component" panels. Mobile renders all three stacked with their
 * headings, tablet and desktop keep the switcher; both read from this one list.
 *
 * The four steps are numbered straight through the three tabs, so "During
 * Shopping" carries 2 and 3. `side` puts a handset against one edge of the card
 * when a tab holds two of them, and `anchor` is how far down that handset the
 * green marker sits, so it lands on the part of the screen its note is about.
 */
const BUDGET_TABS: TabPanel[] = [
  {
    title: "Before Shopping",
    steps: [
      {
        screen: "/case/QT2H5s5NBfljvsIhypcEIa2vFyY.png",
        alt: "The BudgetCart home screen showing the remaining monthly budget",
        step: "Ongoing Budget Overview",
        body: "Users can see their remaining monthly budget directly on the home screen, giving them a clear sense of how much they can afford before they start shopping",
        share: 0.35,
        ratio: 1.392,
        anchor: 0.6,
      },
    ],
  },
  {
    title: "During Shopping",
    steps: [
      {
        screen: "/case/nwhJqK0cldWae95yyP0po1KsDcg.png",
        alt: "A replacement alert warning about a higher total",
        step: "Replacement Alert",
        body: "If a replacement increases the total cost, users are notified before confirming the change",
        side: "right",
        share: 0.26,
        ratio: 2.052,
        anchor: 0.48,
      },
      {
        screen: "/case/YRfP1yf50cvwDEijBfGpKvkOVY.gif",
        frame: "/case/KeM51xdSgQpZYT8AmhdjfWCtANE.png",
        alt: "A floating cart estimator updating in real time",
        step: "Live Cart estimator",
        body: "As users add items, a floating cart estimator updates in real time, keeping users aware of how much they\u2019ve already added to the cart",
        unoptimized: true,
        side: "left",
        share: 0.24,
        anchor: 0.86,
      },
    ],
  },
  {
    title: "After Shopping",
    steps: [
      {
        screen: "/case/1lB4U7TO1nFOP7rD1R4JV66Ut0.gif",
        frame: "/case/KeM51xdSgQpZYT8AmhdjfWCtANE.png",
        alt: "The budget tracking calendar",
        step: "Budget Tracking Calendar",
        body: "The Budget Calendar helps users review daily spending and access receipts, reinforcing long-term budgeting behavior",
        unoptimized: true,
        share: 0.27,
        anchor: 0.53,
      },
    ],
  },
];

/**
 * Framer's Body Large is 20px on its Desktop frame and 32px on its tablet one,
 * which is the size every label in the design breakdown inherits between 810 and
 * 1199. At 32px a three-word label wraps twice on a tablet and the step
 * headings outweigh the section titles above them.
 *
 * These two ramps keep Framer's desktop sizes exactly and come down below 1200
 * instead of stepping up. `LABEL` is for the plain captions over the two flow
 * diagrams; `STEP_TITLE` is a little larger because it has to stay a heading
 * against 16px body copy.
 */
const LABEL = {
  fontSize: "clamp(16px, calc(16px + 4 * (100vw - 390px) / 810), 20px)",
};
const STEP_TITLE = {
  fontSize: "clamp(18px, calc(18px + 2 * (100vw - 390px) / 810), 20px)",
};

/**
 * "Build cart → Compare Price → Commit".
 *
 * Framer sets this at Body Large with a 28px gap, which on a phone is three
 * large rows. It reads as one row wherever the width allows: the type and the
 * gap both ramp, and at the narrowest phone the whole journey comes to about
 * 280px of a 327px column. Desktop keeps Framer's 20px and 28px.
 */
const JOURNEY = {
  fontSize: "clamp(14px, calc(14px + 6 * (100vw - 390px) / 810), 20px)",
  gap: "clamp(10px, calc(10px + 18 * (100vw - 390px) / 810), 28px)",
};

function NumberedSteps({
  items,
}: {
  items: { step: string; lines: string[] }[];
}) {
  return (
    <ol className="flex w-full flex-col gap-[25px]">
      {items.map((item, i) => (
        <li key={item.step} className="flex w-full flex-col gap-2.5">
          <p className="ts-body-large font-semibold" style={STEP_TITLE}>
            {i + 1}. {item.step}
          </p>
          {item.lines.map((line) => (
            <p key={line} className="ts-body">
              {line}
            </p>
          ))}
        </li>
      ))}
    </ol>
  );
}

/**
 * A design-breakdown walkthrough: a title, an optional journey, a handset
 * playing the flow, and the numbered steps that describe it.
 *
 * The three parts are arranged differently in each range, so they are placed on
 * a grid rather than nested in boxes that would have to be written twice.
 *
 * - Phone: one column, in reading order. Title, then journey, then the demo,
 *   then the steps, so the recording arrives before the description of it.
 * - Tablet: the title and journey run the full width on their own row, and the
 *   demo and the steps share the row beneath.
 * - Desktop: the title and journey sit at the top of the text column, on the
 *   side Framer puts them, and the demo and the steps share the row beneath as
 *   they do on a tablet. `side` is the only thing that differs between the two
 *   walkthroughs; they alternate.
 *
 * From 810 the demo and the steps are both centred in that shared row, so the
 * description sits level with the middle of the handset whichever of the two is
 * taller.
 */
function Walkthrough({
  title,
  journey,
  screen,
  alt,
  items,
  side,
}: {
  title: string;
  journey?: string[];
  screen: string;
  alt: string;
  items: { step: string; lines: string[] }[];
  /** Which side the demo sits on from 1200, as Framer draws it. */
  side: "left" | "right";
}) {
  const demoLeft = side === "left";
  return (
    <div
      className={`grid w-full grid-cols-1 items-start gap-8 pb-[50px] tablet:grid-cols-[38%_1fr] tablet:gap-x-10 tablet:gap-y-9 desktop:gap-x-[60px] desktop:gap-y-[86px] ${
        demoLeft
          ? "desktop:grid-cols-[240px_1fr] desktop:pr-[70px] desktop:pl-[100px]"
          : "desktop:grid-cols-[1fr_240px] desktop:pr-[100px] desktop:pl-[70px]"
      }`}
    >
      <div
        className={`flex flex-col gap-2.5 tablet:col-span-2 tablet:col-start-1 tablet:row-start-1 desktop:col-span-1 desktop:row-start-1 ${
          demoLeft ? "desktop:col-start-2" : "desktop:col-start-1"
        }`}
      >
        <h4 className="ts-heading-5">{title}</h4>
        {journey ? (
          <div
            className="flex flex-wrap items-center"
            style={{ gap: JOURNEY.gap }}
          >
            {journey.map((label, i) => (
              <Fragment key={label}>
                {i > 0 ? (
                  <span
                    aria-hidden
                    className="text-light-grey"
                    style={{ fontSize: JOURNEY.fontSize }}
                  >
                    →
                  </span>
                ) : null}
                <span
                  className="ts-body-large whitespace-nowrap"
                  style={{ fontSize: JOURNEY.fontSize }}
                >
                  {label}
                </span>
              </Fragment>
            ))}
          </div>
        ) : null}
      </div>

      <div
        /*
          The demo column is 38% of the row, but the handset does not fill it:
          it takes about two thirds of that column and is centred in the rest,
          which puts it at roughly a quarter of the article, the share it has on
          desktop. Filling the column instead drew a 426px handset at 1199
          against Framer's 240, and the composition stopped reading as two
          balanced columns.

          240 is that desktop width, and it is the ceiling at every width below
          1200 as well: a narrower screen should never draw this larger than the
          layout it is scaled down from. Left at 72% of the column it reached
          340x704 between 600 and 809, half the width of the article and a
          screen and a half tall. It ramps to 240 and then holds.
        */
        className={`mx-auto w-[72%] max-w-[240px] tablet:row-start-2 tablet:w-[68%] tablet:self-center desktop:w-full desktop:max-w-none ${
          demoLeft
            ? "tablet:col-start-1 desktop:col-start-1"
            : "tablet:col-start-1 desktop:col-start-2"
        }`}
      >
        {/* `fluid` so the handset takes the column it is given; `width` still
            sets the side buttons, which keeps desktop identical to Framer. */}
        <PhoneMockup screen={screen} width={240} alt={alt} unoptimized fluid />
      </div>

      {/* The steps are shorter than the handset beside them, so from 810 they
          are centred on it rather than hung from the top of the row. The row is
          as tall as the handset, so centring in the row centres on the
          handset. */}
      <div
        className={`tablet:col-start-2 tablet:row-start-2 tablet:self-center desktop:row-start-2 ${
          demoLeft ? "desktop:col-start-2" : "desktop:col-start-1"
        }`}
      >
        <NumberedSteps items={items} />
      </div>
    </div>
  );
}

export default function BudgetCartPage() {
  return (
    <CaseShell
      more={MORE}
      /* The same strip the Taipei page closes with, rather than the Chonburi
         rule: one component, one set of card measurements, on both pages. */
      moreVariant="compact"
      sidebar={<SidebarNav entries={SECTIONS} />}
      bodyWidth={1200}
      canvasWidth={1200}
      bodyGap={90}
      pageTop={60}
      bodyPad={120}
      bodyPadX={40}
      moreBottom={120}
    >
      {/* ---- Hero ---------------------------------------------------- */}
      <section
        id="project-context"
        /* Framer's Desktop "Hero" is a horizontal stack with no gap: the two
           columns meet, and the image column's own 30px left padding is the
           only space between them. Below 1200 the 30px stays. */
        /*
          Below 1200 the hero is held at the width it has on desktop, 951px,
          and centred in the article.

          The artwork overhangs the text column by design — Framer pins the
          shopper 225px to the left of the image column — and that only works
          at the proportions Framer drew it at. Below 1200 the section rail
          stops taking a column, so the article grows to 1119px while the
          artwork stays 701; the text column took the extra width, wrapped onto
          fewer lines, ran shorter, and the shopper ended up painted across the
          description. Holding the row at 951 keeps both columns in Framer's
          ratio, so the tablet hero is the desktop hero at the same size or
          smaller, never a different arrangement of it.
        */
        className="flex w-full flex-col items-start gap-[30px] tablet:mx-auto tablet:max-w-[951px] tablet:flex-row tablet:items-stretch desktop:max-w-none desktop:gap-0"
      >
        {/* The 144px between the title and the project information is Framer's
            minimum. From 810 the column stretches to the height of the artwork
            beside it and the information sits at the foot of it, so the two
            columns finish level. Framer leaves the artwork hanging 65px below
            the information on its own Desktop frame; this closes that too.
            Only the information moves — the title and description stay at the
            top, clear of the shopper. */}
        <div className="flex flex-1 flex-col gap-[144px] tablet:justify-between">
          <div className="flex w-full flex-col gap-5">
            <span className="ts-button self-start rounded-[30px] bg-dark-charcoal px-[15px] py-[3px] text-off-white">
              UI / UX Design
            </span>
            <div className="flex w-full flex-col gap-[5px]">
              <h1 className="ts-heading-2 text-grey-200">BudgetCart</h1>
              {/* `.ts-body-large` steps to 32px at the tablet breakpoint, which
                  is larger than the 20px Framer sets here on desktop. It ramps
                  up to that 20px instead. */}
              <p
                className="ts-body-large"
                style={{
                  fontSize:
                    "clamp(16px, calc(16px + 4 * (100vw - 390px) / 810), 20px)",
                }}
              >
                An online grocery app that eliminates checkout anxiety for
                budget-constrained shoppers
              </p>
            </div>
          </div>

          {/* Framer's "Project Meta Grid" is one column on its Desktop frame.
              Below that the four facts read as a 2x2 block, as they do on the
              other case studies. */}
          {/* Two across on a phone, and Framer's single column from 810.
              Four across never fits: this hero's text column is half the row,
              so each fact would get 66px at 858 and 104px even at 1199,
              wrapping the values onto three and four lines. The other case
              studies can manage four because their headers run the full width.

              Two across does not work beside the artwork either. The shopper is
              pinned 225px into the text column, and a 2x2 grid runs the full
              width of that column, so the trolley was drawn over "Product
              designer". A single column keeps the facts clear of it and is what
              Framer draws above 1200 anyway. */}
          <dl className="grid w-full grid-cols-2 gap-x-[6px] gap-y-5 tablet:grid-cols-1">
            {[
              ["Client", "Course Work Project"],
              ["Role", "Product designer"],
              ["Team", "Tunisia Smith, Dhwani Bagrecha"],
              ["Timeline ", "4 months (2025)"],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <dt className="ts-body font-semibold">{label}</dt>
                <dd className="ts-body">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/*
          Framer's "Hero Image Container".

          The shopper, the handset, the doodle and the money bag are one
          composition, not four elements that each answer to the viewport. Every
          one of them is placed as a percentage of the canvas below, so the whole
          group scales together and keeps Framer's spacing, overlap and hierarchy
          at any size.

          The canvas is this column extended 225px to the left, which is where
          Framer pins the shopper. From 1200 it keeps that width and overhangs the
          text column, exactly as Framer draws it. Below 1200 it is the column's
          own width, so the same composition simply arrives smaller and nothing
          leaves the screen.
        */}
        {/*
          Half the row, as on Framer's Desktop frame, but never wider than the
          476px it comes to there.

          Below 1200 the section rail stops taking a column, so the article is
          wider on a tablet than it is on desktop — 1119px at 1199 against 951.
          Left to fill it, the artwork would come out larger on the smaller
          screen. The cap keeps the composition at its desktop size and lets the
          text column take the extra width instead.
        */}
        {/* Whichever column is the taller one, the two finish level: the text
            drops its project information to the foot of a short column, and the
            artwork sits at the foot of this one when the text is the longer of
            the two, which it is below about 950px. */}
        <div className="relative w-full tablet:flex tablet:w-[min(50%,476px)] tablet:flex-col tablet:justify-end desktop:w-1/2">
          {/* 225px of the canvas hangs off the left, which is 47.32% of this
              column's width; a negative margin is what moves it there, since
              `ml-auto` collapses to zero once a box is wider than its parent.
              The overhang runs from 810 rather than 1200: without it the whole
              group was 56% of the article on a tablet against 73.7% on
              desktop, which is what made it look like a small object in the
              corner rather than the same composition scaled down. */}
          <div className="relative aspect-[700.5/628.4] w-full tablet:ml-[-47.32%] tablet:w-[147.32%]">
            {/* "character". Behind the handset: Framer gives it a z-index of 1,
                but its own render draws the handset in front, and the shopper's
                arm reading over the screen is wrong. */}
            <Image
              src="/case/CzIpIqrBNYg6Mptyt3oTzVDzm8c.png"
              alt=""
              width={350}
              height={350}
              className="absolute h-auto object-contain"
              style={{ left: "0%", top: "35.55%", width: "49.96%" }}
            />

            {/* Framer's iPhone 17 Pro variant, 265px of a 700.5px canvas. */}
            <div
              className="absolute"
              style={{ left: "47.30%", top: "7.96%", width: "37.83%" }}
            >
              <PhoneMockup
                screen="/case/gYGzaYBJBLaboENZJAHFQLRqlPo.gif"
                alt="The BudgetCart shopping flow"
                unoptimized
                fluid
              />
            </div>

            {/* Framer's "Vector" doodle */}
            <Image
              src="/vectors/squiggle.png"
              alt=""
              width={57}
              height={57}
              className="absolute h-auto object-contain"
              style={{ left: "80.59%", top: "1.75%", width: "8.14%" }}
            />

            {/* "money", in front of the handset */}
            <Image
              src="/case/5resnnnMK0AZd5cIOtw7aPC0eng.png"
              alt=""
              width={400}
              height={715}
              className="absolute z-[1] h-auto object-contain"
              style={{ left: "72.85%", top: "79.14%", width: "27.15%" }}
            />
          </div>
        </div>
      </section>

      <span className="h-px w-full bg-grey-100" aria-hidden />

      {/* ---- Problem ------------------------------------------------- */}
      <section id="problem" className="flex w-full flex-col gap-10">
        <div className="flex w-full flex-col gap-2.5">
          <h2 className="ts-heading-3">Problem</h2>
          <h3 className="ts-heading-6">
            Shopping requires too much mental math
          </h3>
        </div>
        <div className="flex w-full flex-col gap-10">
          <div className="flex w-full flex-col gap-2.5">
            <p className="ts-body">
              As graduate students ourselves, life is busy. We noticed that{" "}
              <strong className="font-semibold">
                grocery shopping took far more mental energy than it should.
              </strong>
            </p>
            <p className="ts-body">
              We often jumped between apps to compare prices, track budgets, and
              calculate totals.{" "}
              <strong className="font-semibold">
                Yet None of these systems worked together.{" "}
              </strong>
            </p>
            <p className="ts-body">But this wasn’t just our experience.</p>
            <p className="ts-body">
              For budget-constrained shoppers, particularly those relying on
              SNAP/WIC,{" "}
              <strong className="font-semibold">
                grocery shopping means managing multiple constraints at once.
              </strong>
            </p>
          </div>
          <Reveal className="w-full">
            <div className="flex w-full items-end gap-2.5">
              <div className="w-[34%]">
                <Zoomable
                  src="/case/R4QNcJcHWmiPn8uwiqRdpZP43Q.png"
                  alt="Shoppers comparing prices across apps"
                  width={960}
                  height={960}
                >
                  <Image
                    src="/case/R4QNcJcHWmiPn8uwiqRdpZP43Q.png"
                    alt="Shoppers comparing prices across apps"
                    width={960}
                    height={960}
                    sizes="(width < 810px) 32vw, 400px"
                    className="h-auto w-full"
                  />
                </Zoomable>
              </div>
              <div className="w-[55%]">
                <Zoomable
                  src="/case/z1sqGS2uRo1HdtIjVlPi9HiTGE.png"
                  alt="A grocery receipt"
                  width={1942}
                  height={991}
                >
                  <Image
                    src="/case/z1sqGS2uRo1HdtIjVlPi9HiTGE.png"
                    alt="A grocery receipt"
                    width={1942}
                    height={991}
                    sizes="(width < 810px) 52vw, 640px"
                    className="h-auto w-full"
                  />
                </Zoomable>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <p className="ts-body">
            The problem statement that guided this project was:
          </p>
          <ProblemStatement>
            How might we help budget-conscious shoppers make confident grocery
            decisions without forcing them to constantly calculate budget,
            eligibility, and trade-offs in their head?
          </ProblemStatement>
        </div>
      </section>

      {/* ---- My role ------------------------------------------------- */}
      <section id="my-role" className="flex w-full flex-col gap-10">
        <div className="flex w-full flex-col gap-2.5">
          <h2 className="ts-heading-3">My role</h2>
          <p className="ts-body">
            In this project, I led the end-to-end design of{" "}
            <strong className="font-semibold">core shopping experience</strong>.
          </p>
          <p className="ts-body">Key responsibilities:</p>
          <StarPointList
            points={[
              { title: "Led user research and problem framing" },
              { title: "Designed the end-to-end shopping experience" },
              {
                title:
                  "Integrated budgeting and SNAP visibility into core flows",
              },
              { title: "Iterated through prototyping and testing" },
            ]}
          />
        </div>
      </section>

      {/* ---- Solutions overview -------------------------------------- */}
      <section id="solutions-overview" className="flex w-full flex-col gap-2.5">
        <h2 className="ts-heading-3">Solutions Overview</h2>
        <div className="flex w-full flex-col gap-5">
          <h3 className="ts-heading-6">
            Make Cost Visible Early in the Shopping Journey
          </h3>
          {/* From 810 the two columns are centred on each other rather than
              stretched, so the four points sit level with the middle of the
              handsets beside them instead of starting at their top edge. The
              29px between the points is untouched: the group moves, not its
              spacing. */}
          <div className="flex w-full flex-col gap-5 tablet:flex-row tablet:items-center">
            <div className="flex flex-1 flex-col gap-[29px] py-5">
              <StarPointList points={SOLUTION_POINTS} bold />
            </div>
            {/* Both screens are 2.167:1, against the handset's 2.176:1 screen,
                so each fills its frame with nothing cropped.

                One demo per row on a phone, each taking most of the column, so
                the screens are worth looking at; side by side from 810. This is
                the Taipei page's Solution Overview, to the class. */}
            {/* Side by side from 700 rather than from Framer's 810: a 768px
                iPad is the commonest tablet there is and it falls below that
                breakpoint, so the pair stacked on exactly the device the row is
                meant for. 700 is the width at which two capped handsets and
                their gap still leave a comfortable margin.

                Each handset is capped at the 228px it measures on desktop, so
                neither the wider tablet article nor a full-width phone column
                can draw it larger than the layout it is scaled down from. */}
            <div className="flex flex-1 flex-col items-center gap-8 min-[700px]:flex-row min-[700px]:items-stretch min-[700px]:justify-center min-[700px]:gap-2.5">
              <figure className="flex w-[72%] max-w-[300px] flex-col gap-2.5 min-[700px]:w-auto min-[700px]:max-w-[228px] min-[700px]:flex-1">
                <PhoneMockup
                  screen="/case/gYGzaYBJBLaboENZJAHFQLRqlPo.gif"
                  alt="The redesigned shopping flow"
                  unoptimized
                  fluid
                />
                <figcaption className="ts-body text-center italic">
                  Shopping Flow
                </figcaption>
              </figure>
              <figure className="flex w-[72%] max-w-[300px] flex-col gap-2.5 min-[700px]:w-auto min-[700px]:max-w-[228px] min-[700px]:flex-1">
                <PhoneMockup
                  screen="/case/fUdyc9IdXAA6b6f4B1kuPIoWD8.png"
                  alt="Selecting a store"
                  fluid
                />
                <figcaption className="ts-body text-center italic">
                  Select Store
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
        <SkipButton href="#design-breakdown" label="Skip to Redesign Details" />
      </section>

      {/* ---- Research ------------------------------------------------- */}
      <section
        id="research-process"
        className="flex w-full flex-col gap-[90px]"
      >
        <div className="flex w-full flex-col gap-2.5">
          <h2 className="ts-heading-3">Key Research Insight</h2>
          <div className="flex w-full flex-col gap-5">
            <h3 className="ts-heading-6">
              Budget-constrained grocery shopping is a multi-constraint decision
              problem, not just price comparison
            </h3>
            {/* The brain sits to the right of the quotes from 810 and below
                them, still to the right, on a phone, where there is no room for
                a column beside three quotes. It is the same order either way,
                so `order` is set once: the illustration is first in the markup
                because it is decorative, and last in the reading order. */}
            <div className="flex w-full flex-col items-stretch gap-6 tablet:flex-row tablet:items-center">
              <Image
                src="/case/LQPH6J1KtYHvjkpIS9qdZGva1mA.png"
                alt=""
                width={160}
                height={175}
                sizes="160px"
                className="order-2 ml-auto h-[131px] w-[120px] shrink-0 object-contain tablet:h-[175px] tablet:w-[160px]"
              />
              <div className="order-1 flex flex-1 flex-col gap-3">
                <p className="ts-body">
                  “I need to know I won’t{" "}
                  <strong className="font-semibold">go over my budget</strong>{" "}
                  before I pay“
                </p>
                <p className="ts-body">
                  “Comparing stores is exhausting. I just want to know the{" "}
                  <strong className="font-semibold">best option</strong> for my
                  situation.”
                </p>
                <p className="ts-body">
                  “I want to see how much{" "}
                  <strong className="font-semibold">SNAP/WIC</strong> I’m
                  spending before checkout”
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <h2 className="ts-heading-3">Target User</h2>
          <p className="ts-body">
            <strong className="font-semibold">
              Budget-constrained shoppers{" "}
            </strong>
            or <strong className="font-semibold">snap users</strong> who
            actively compare prices and track total spending to stay within a
            limited budget
          </p>
        </div>

        <div className="flex w-full flex-col gap-5">
          <h2 className="ts-heading-3">Competitive Analysis</h2>
          <div className="flex w-full flex-col gap-9">
            <h3 className="ts-heading-6">
              No existing tool integrates pricing, budgeting, and eligibility
              into one unified decision flow
            </h3>
            <div className="flex w-full flex-col gap-[66px]">
              {/* Four across from 810. Two of them on a phone left each
                  competitor 121px for a logo and a paragraph, so they stack
                  until there is room for a readable pair. */}
              <div className="grid w-full grid-cols-1 items-start gap-10 min-[560px]:grid-cols-2 tablet:grid-cols-4">
                {COMPETITORS.map((c) => (
                  <div
                    key={c.name}
                    /* Logo, name and description are one column, centred on
                       each other, so each competitor reads as a single unit. */
                    className="flex min-w-0 flex-col items-center gap-[30px] text-center"
                  >
                    {/* The shared box. Every logo is centred in one of these and
                        fitted inside it, so a tall mark and a wide one still
                        occupy the same square and sit on the same axis. */}
                    <div
                      className="flex shrink-0 items-center justify-center"
                      style={{ width: LOGO_BOX, height: LOGO_BOX }}
                    >
                      {/* A square of its own, so the element has a size before
                          the file arrives and the row never shifts. The mark is
                          fitted inside that square, which is what keeps a
                          non-square logo at its own proportions. */}
                      <Image
                        src={c.image}
                        alt={c.name}
                        width={c.width}
                        height={c.height}
                        sizes="120px"
                        className="object-contain"
                        style={{
                          width: `calc(${LOGO_BOX} * ${c.scale})`,
                          height: `calc(${LOGO_BOX} * ${c.scale})`,
                          borderRadius: c.radius,
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-2.5">
                      <h4 className="ts-heading-6">{c.name}</h4>
                      <p className="ts-body">
                        {c.tail ? "Optimized for " : "Designed for "}
                        <strong className="font-semibold">{c.lead}</strong>
                        {c.tail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <h3 className="ts-heading-6 italic">
                The burden of budgeting and eligibility decisions still falls on
                users
              </h3>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-5">
          <div className="flex w-full flex-col gap-5">
            <h2 className="ts-heading-3">Design Opportunity</h2>
            <h3 className="ts-heading-6">
              Address both user constraints and market gaps by redesigning
              grocery shopping as an integrated decision system
            </h3>
          </div>
          <div className="flex w-full flex-col gap-[9px] tablet:flex-row">
            {OPPORTUNITIES.map((o) => (
              <div
                key={o.number}
                /* Framer's 30/40 padding and 25px gap from 810 up; tighter below, where
                  the card is the width of the screen and that much air made each
                  one half a phone tall. */
                className="flex flex-1 flex-col gap-3 rounded-[20px] border border-grey-100 px-5 py-6 tablet:gap-[25px] tablet:px-[30px] tablet:py-10"
              >
                <p className="ts-heading-5 font-bold">{o.number}</p>
                <div className="flex flex-col gap-2.5">
                  <p className="ts-body font-semibold">{o.title}</p>
                  <p className="ts-body">{o.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Design breakdown ---------------------------------------- */}
      <section id="design-breakdown" className="flex w-full flex-col gap-5">
        <h2 className="ts-heading-3">Design Breakdown</h2>

        <div className="flex w-full flex-col gap-[60px]">
          {/* Solution 1 */}
          <div className="flex w-full flex-col gap-[60px] pb-[50px]">
            <div className="flex w-full flex-col gap-[90px]">
              <div className="flex w-full flex-col gap-5">
                <h3 className="ts-heading-5">
                  1. Minimizing the step for compare price
                </h3>
                <div className="flex w-full flex-col gap-2.5">
                  <h4 className="ts-heading-6">1. Redesign shopping flow </h4>
                  <p className="ts-body font-semibold">
                    Impact: Users see the real total cost across stores without
                    rebuilding cart to compare stores
                  </p>
                  <p className="ts-body italic">
                    In current shopping flows, users must commit to a store
                    first, build a cart, manually compare across stores, and
                    repeatedly rebuild the cart.
                  </p>
                  <p className="ts-body italic">
                    I redesigned the flow so users build the cart once, compare
                    total costs across stores in one view, and choose a store
                    only after seeing the complete cost breakdown.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-[30px]">
                {/* Both diagrams are 2800px wide and under 9:1, so in the
                    column they come to 39px tall on a phone and the boxes are
                    unreadable. They open full screen and pan. */}
                <div className="flex w-full flex-col gap-[25px]">
                  <p className="ts-body-large" style={LABEL}>
                    Traditional Shopping Order:
                  </p>
                  <Zoomable
                    src="/case/qJMNLto7fdjSEa2nYM4IQinS1uI.png"
                    alt="The traditional shopping order"
                    width={2800}
                    height={320}
                  >
                    <Image
                      src="/case/qJMNLto7fdjSEa2nYM4IQinS1uI.png"
                      alt="The traditional shopping order"
                      width={2800}
                      height={320}
                      sizes="(width < 810px) 92vw, 1120px"
                      className="h-auto w-full"
                    />
                  </Zoomable>
                </div>
                <div className="flex w-full flex-col gap-[25px]">
                  <p className="ts-body-large" style={LABEL}>
                    BudgetCart Shopping Order:
                  </p>
                  <Zoomable
                    src="/case/7qcKT122ZJVDc2Paih8U6pkWwDs.png"
                    alt="The BudgetCart shopping order"
                    width={2800}
                    height={324}
                  >
                    <Image
                      src="/case/7qcKT122ZJVDc2Paih8U6pkWwDs.png"
                      alt="The BudgetCart shopping order"
                      width={2800}
                      height={324}
                      sizes="(width < 810px) 92vw, 1120px"
                      className="h-auto w-full"
                    />
                  </Zoomable>
                </div>
              </div>

              <Walkthrough
                title="Experience Walkthrough"
                journey={["Build cart", "Compare Price", "Commit"]}
                screen="/case/gYGzaYBJBLaboENZJAHFQLRqlPo.gif"
                alt="Building the cart once"
                items={WALKTHROUGH}
                side="left"
              />
            </div>

            <p className="ts-body">
              Reordering the decision flow eliminated cart rebuilding, but this
              shift wasn’t only about changing steps. It required rethinking how
              cost information is structured and surfaced
            </p>

            <div className="flex w-full flex-col gap-20">
              <div className="flex w-full flex-col gap-5">
                <h4 className="ts-heading-6">
                  2. Redesign store comparison interface
                </h4>
                {/* A sentence, not a heading: it reads as the body copy that
                    introduces the walkthrough below it. */}
                <p className="ts-body">
                  I redesigned the comparison interface so the system
                  automatically applies the same cart across stores and surfaces
                  total cost and trade-offs at a glance, reducing mental math
                  and decision fatigue.
                </p>
              </div>
              <Walkthrough
                title="Making Total Cost Comparable at a Glance"
                screen="/case/dH7ECcQFl9EXqWSojBXUcjz2XyY.gif"
                alt="Comparing total cost across stores"
                items={COMPARISON_POINTS}
                side="right"
              />
            </div>
          </div>

          {/* Solution 2 */}
          <div className="flex w-full flex-col gap-10 pb-[50px]">
            <div className="flex w-full flex-col gap-5">
              <h3 className="ts-heading-5">
                2. Create Budget Awareness System
              </h3>
              <p className="ts-body font-semibold">
                Impact: Users gain continuous visibility into spending — before,
                during, and after purchase
              </p>
              <p className="ts-body">
                I designed a budget awareness system that provides real-time
                financial visibility across the entire shopping journey from
                building cart to checkout
              </p>
            </div>

            <Tabs panels={BUDGET_TABS} />
          </div>

          {/* Solution 3 */}
          <div className="flex w-full flex-col gap-10 pb-[50px]">
            <div className="flex w-full flex-col gap-5">
              <h3 className="ts-heading-5">
                3. Make SNAP benefit visible at every decision point{" "}
              </h3>
              <p className="ts-body font-semibold">
                Impact: SNAP users can clearly understand how their benefits are
                applied and how much they will pay out of pocket before making
                decisions
              </p>
              <p className="ts-body">
                SNAP users often struggle to understand how their benefits apply
                across different stores and items.
              </p>
              <p className="ts-body">
                I introduced clear SNAP signals at every key decision point,
                helping users maximize benefits and avoid unexpected
                out-of-pocket costs.
              </p>
            </div>
            {/* Framer's 60/30 inset is drawn against a 1120px column. On a
                phone it took 120 of 342px, a third of the width, and left the
                three screens in it too small to read. It holds from 1200. */}
            <Reveal className="w-full">
              <Zoomable
                src="/case/dU8zzf1NLNV9xV6KJ1ua3ocYhc.png"
                alt="SNAP signals shown across the shopping journey"
                width={2800}
                height={1242}
              >
                <Image
                  src="/case/dU8zzf1NLNV9xV6KJ1ua3ocYhc.png"
                  alt="SNAP signals shown across the shopping journey"
                  width={2800}
                  height={1242}
                  sizes="(width < 810px) 92vw, 1120px"
                  className="h-auto w-full rounded-[20px] tablet:px-8 tablet:py-4 desktop:px-[60px] desktop:py-[30px]"
                />
              </Zoomable>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Design iteration ---------------------------------------- */}
      <section id="design-iteration" className="flex w-full flex-col gap-2.5">
        <h2 className="ts-heading-3">Design Iteration</h2>
        <div className="flex w-full flex-col gap-5">
          <h3 className="ts-heading-6">
            Iterating Toward Clearer Store Comparison
          </h3>
          <p className="ts-body">
            Through iterative design and usability testing, I refined how store
            comparison information is structured so users can make faster,
            lower-effort decisions.
          </p>
          {/* Three iterations side by side in one 2800px picture, so the inset
              comes off below 1200 and it opens full screen to be read. */}
          <Reveal className="w-full">
            <Zoomable
              src="/case/k9u4Ty2OAji64lIZlRF0SYyFmg.png"
              alt="Iterations of the store comparison interface"
              width={2800}
              height={1104}
            >
              <Image
                src="/case/k9u4Ty2OAji64lIZlRF0SYyFmg.png"
                alt="Iterations of the store comparison interface"
                width={2800}
                height={1104}
                sizes="(width < 810px) 92vw, 1120px"
                className="h-auto w-full rounded-[20px] tablet:px-8 tablet:py-4 desktop:px-[60px] desktop:py-[30px]"
              />
            </Zoomable>
          </Reveal>
        </div>
      </section>

      {/* ---- Next steps ---------------------------------------------- */}
      <section className="flex w-full flex-col gap-2.5">
        <h2 className="ts-heading-3">Next Steps</h2>
        {/* Two numbered steps rather than two headed paragraphs: they are the
            order the work would be picked up in. */}
        <ol className="flex w-full list-none flex-col gap-10 pt-5">
          {NEXT_STEPS.map((step, i) => (
            <li key={step.title} className="flex w-full flex-col gap-2.5">
              <h3 className="ts-heading-6">
                {i + 1}. {step.title}
              </h3>
              <Paragraphs items={step.lines} />
            </li>
          ))}
        </ol>
      </section>

      {/* ---- Reflection ---------------------------------------------- */}
      <section className="flex w-full flex-col gap-2.5">
        <h2 className="ts-heading-3">Reflection</h2>
        <Paragraphs
          items={[
            "What I enjoyed most about this project was seeing how quickly design ideas evolved through iteration. I learned that weekly deliverables weren’t meant to be the final solution, but an opportunity to test ideas and refine the design. Each round of feedback helped clarify what actually mattered to users.",
            "One of the biggest lessons for me was learning how to balance transparency and simplicity, making important information visible without overwhelming users with too many details. This project also strengthened my ability to iterate quickly and refine designs based on user feedback, especially when working through complex decision-making scenarios.",
          ]}
        />
      </section>
    </CaseShell>
  );
}
