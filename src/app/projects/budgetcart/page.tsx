import type { Metadata } from "next";
import Image from "next/image";

import { Paragraphs } from "@/components/case/CaseParts";
import {
  Reveal,
  SkipButton,
  StarPointList,
} from "@/components/case/CaseExtras";
import { CaseShell } from "@/components/case/CaseShell";
import type { MoreProjectCard } from "@/components/case/MoreProjects";
import { PhoneMockup } from "@/components/case/PhoneMockup";
import { SidebarNav, type SidebarEntry } from "@/components/case/SidebarNav";
import { Tabs, type TabPanel } from "@/components/case/Tabs";

export const metadata: Metadata = {
  title: "BudgetCart — Anne Lin",
  description:
    "An online grocery app that eliminates checkout anxiety for budget-constrained shoppers.",
};

const MORE: MoreProjectCard[] = [
  {
    href: "/projects/jubo-healthcare",
    category: "Web Development",
    title: "Jubo Healthcare Platform",
    description:
      "Built frontend modules for a senior care dashboard, reducing cognitive load and improving data visibility through close collaboration with designers and nurses.",
  },
  {
    href: "/projects/taipei-metro-app",
    category: "UI/UX Design",
    title: "Taipei Metro Point Redesign",
    description:
      "Reimagining Metro Points to make rewards visible, understandable, and part of everyday commuting.",
  },
];

/**
 * Framer's sidebar links on the Desktop variant point at the Taipei page, which
 * is a copy-paste slip in the source file. The anchors are corrected here so
 * the rail scrolls this page; see README-port.md.
 */
const SECTIONS: SidebarEntry[] = [
  { id: "project-context", label: "Project Context" },
  { id: "problem", label: "Problem" },
  { id: "my-role", label: "My Role" },
  { id: "solutions-overview", label: "Solution Overview" },
  {
    id: "research-process",
    label: "User Research",
    children: [
      "Survey Strategy",
      "Research Insight",
      "Competitive Analysis",
      "Strategy Evolution",
    ],
  },
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

const COMPETITORS = [
  {
    name: "Flashfood",
    image: "/case/JLSjeOpaIz8hucZjlpSsPW5zdU8.png",
    lead: "discounts",
    tail: ", not total decision planning",
    size: 138,
    radius: 30,
  },
  {
    name: "Instacart",
    image: "/case/WATEHN6UH1iE6C7sR1IsSQ1zhI.png",
    lead: "convenience",
    tail: ", not cross-store comparison",
    size: 165,
    radius: 61,
  },
  {
    name: "Walmart",
    image: "/case/h8UQWRJeDYrQzu8lczYQWOwEWM.png",
    lead: "pricing",
    tail: ", not integrated budgeting & eligibility",
    size: 150,
    radius: 30,
  },
  {
    name: "Budgetcart",
    image: "/case/kWbiUi9znPLcP4vY36ZEfzv9130.svg",
    lead: "unified financial decision-making",
    tail: "",
    size: 150,
    radius: 0,
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

/**
 * Framer's "Tab Component" panels. Mobile renders all three stacked with their
 * headings, desktop keeps the switcher; both read from this one list.
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
        width: 265,
      },
    ],
  },
  {
    title: "During Shopping",
    steps: [
      {
        screen: "/case/YRfP1yf50cvwDEijBfGpKvkOVY.gif",
        frame: "/case/KeM51xdSgQpZYT8AmhdjfWCtANE.png",
        alt: "A floating cart estimator updating in real time",
        step: "Live Cart estimator",
        body: "As users add items, a floating cart estimator updates in real time, keeping users aware of how much they\u2019ve already added to the cart",
        unoptimized: true,
      },
      {
        screen: "/case/nwhJqK0cldWae95yyP0po1KsDcg.png",
        alt: "A replacement alert warning about a higher total",
        step: "Replacement Alert",
        body: "If a replacement increases the total cost, users are notified before confirming the change",
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
        width: 215,
      },
    ],
  },
];

function NumberedSteps({
  items,
}: {
  items: { step: string; lines: string[] }[];
}) {
  return (
    <ol className="flex w-full flex-col gap-[25px]">
      {items.map((item, i) => (
        <li key={item.step} className="flex w-full flex-col gap-2.5">
          <p className="ts-body-large font-semibold">
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

export default function BudgetCartPage() {
  return (
    <CaseShell
      more={MORE}
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
        className="flex w-full flex-col items-start gap-[30px] tablet:flex-row desktop:gap-0"
      >
        <div className="flex flex-1 flex-col gap-[144px]">
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
          {/* Two across, and one column from 1200 where Framer's Desktop frame
              draws it that way. Four across does not fit: this hero's text
              column is half the row, so each fact would get 66px at 858 and
              104px even at 1199, wrapping the values onto three and four
              lines. The other case studies can manage four because their
              headers run the full width. */}
          <dl className="grid w-full grid-cols-2 gap-x-[6px] gap-y-5 desktop:grid-cols-1">
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
        <div className="relative w-full tablet:w-[56%] desktop:w-1/2">
          {/* 225px of the canvas hangs off the left, which is 47.32% of this
              column's width; a negative margin is what moves it there, since
              `ml-auto` collapses to zero once a box is wider than its parent. */}
          <div className="relative aspect-[700.5/628.4] w-full desktop:ml-[-47.32%] desktop:w-[147.32%]">
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
              <Image
                src="/case/R4QNcJcHWmiPn8uwiqRdpZP43Q.png"
                alt="Shoppers comparing prices across apps"
                width={800}
                height={600}
                sizes="400px"
                className="h-auto w-[34%]"
              />
              <Image
                src="/case/z1sqGS2uRo1HdtIjVlPi9HiTGE.png"
                alt="A grocery receipt"
                width={900}
                height={700}
                sizes="640px"
                className="h-auto w-[55%]"
              />
            </div>
          </Reveal>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <p className="ts-body">
            The problem statement that guided this project was:
          </p>
          <div
            className="flex h-[229px] w-full items-center justify-center rounded-[20px] px-10"
            style={{
              background:
                "linear-gradient(117deg, rgba(240,253,244,1) 0%, rgba(238,245,254,1) 50%, rgba(255,255,255,1) 100%)",
            }}
          >
            <p className="ts-heading-6 max-w-[900px] text-center">
              How might we help budget-conscious shoppers make confident grocery
              decisions without forcing them to constantly calculate budget,
              eligibility, and trade-offs in their head?
            </p>
          </div>
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
          <div className="flex w-full flex-col gap-5 tablet:flex-row">
            <div className="flex flex-1 flex-col gap-[29px] py-5">
              <StarPointList points={SOLUTION_POINTS} bold />
            </div>
            {/* Both screens are 2.167:1, against the handset's 2.176:1 screen,
                so each fills its frame with nothing cropped. */}
            <div className="flex flex-1 gap-2.5">
              <figure className="flex flex-1 flex-col gap-2.5">
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
              <figure className="flex flex-1 flex-col gap-2.5">
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
            <div className="flex w-full flex-col items-start gap-6 tablet:flex-row tablet:items-center">
              <Image
                src="/case/LQPH6J1KtYHvjkpIS9qdZGva1mA.png"
                alt=""
                width={160}
                height={175}
                className="h-[175px] w-[160px] shrink-0 object-contain"
              />
              <div className="flex flex-1 flex-col gap-3">
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
                    className="flex min-w-0 flex-col gap-[30px]"
                  >
                    <Image
                      src={c.image}
                      alt={c.name}
                      width={c.size}
                      height={c.size}
                      className="object-contain"
                      style={{
                        width: "100%",
                        maxWidth: c.size,
                        height: "auto",
                        borderRadius: c.radius,
                      }}
                    />
                    <div className="flex flex-col gap-2.5">
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
                <div className="flex w-full flex-col gap-[25px]">
                  <p className="ts-body-large">Traditional Shopping Order:</p>
                  <Image
                    src="/case/qJMNLto7fdjSEa2nYM4IQinS1uI.png"
                    alt="The traditional shopping order"
                    width={2000}
                    height={400}
                    sizes="1120px"
                    className="h-auto w-full"
                  />
                </div>
                <div className="flex w-full flex-col gap-[25px]">
                  <p className="ts-body-large">BudgetCart Shopping Order:</p>
                  <Image
                    src="/case/7qcKT122ZJVDc2Paih8U6pkWwDs.png"
                    alt="The BudgetCart shopping order"
                    width={2000}
                    height={400}
                    sizes="1120px"
                    className="h-auto w-full"
                  />
                </div>
              </div>

              <div className="flex w-full flex-col items-center gap-[60px] pb-[50px] tablet:flex-row tablet:pr-[70px] tablet:pl-[100px]">
                <PhoneMockup
                  screen="/case/gYGzaYBJBLaboENZJAHFQLRqlPo.gif"
                  width={240}
                  alt="Building the cart once"
                  unoptimized
                />
                <div className="flex w-full flex-col gap-[86px] tablet:w-3/5">
                  <div className="flex w-full flex-col gap-2.5">
                    <h4 className="ts-heading-5">Experience Walkthrough</h4>
                    <div className="flex flex-wrap items-center gap-[28px]">
                      <span className="ts-body-large">Build cart</span>
                      <span aria-hidden className="text-light-grey">
                        →
                      </span>
                      <span className="ts-body-large">Compare Price</span>
                      <span aria-hidden className="text-light-grey">
                        →
                      </span>
                      <span className="ts-body-large">Commit</span>
                    </div>
                  </div>
                  <NumberedSteps items={WALKTHROUGH} />
                </div>
              </div>
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
                <h3 className="ts-heading-6 italic">
                  I redesigned the comparison interface so the system
                  automatically applies the same cart across stores and surfaces
                  total cost and trade-offs at a glance, reducing mental math
                  and decision fatigue.
                </h3>
              </div>
              <div className="flex w-full flex-col-reverse items-center gap-[60px] pb-[50px] tablet:flex-row tablet:pr-[100px] tablet:pl-[70px]">
                <div className="flex w-full flex-col gap-[86px] tablet:w-3/5">
                  <h4 className="ts-heading-5">
                    Making Total Cost Comparable at a Glance
                  </h4>
                  <NumberedSteps items={COMPARISON_POINTS} />
                </div>
                <PhoneMockup
                  screen="/case/dH7ECcQFl9EXqWSojBXUcjz2XyY.gif"
                  width={240}
                  alt="Comparing total cost across stores"
                  unoptimized
                />
              </div>
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
            <Reveal className="w-full">
              <Image
                src="/case/dU8zzf1NLNV9xV6KJ1ua3ocYhc.png"
                alt="SNAP signals shown across the shopping journey"
                width={2000}
                height={1200}
                sizes="1120px"
                className="h-auto w-full rounded-[20px] px-[60px] py-[30px]"
              />
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
          <Reveal className="w-full">
            <Image
              src="/case/k9u4Ty2OAji64lIZlRF0SYyFmg.png"
              alt="Iterations of the store comparison interface"
              width={2000}
              height={1200}
              sizes="1120px"
              className="h-auto w-full rounded-[20px] px-[60px] py-[30px]"
            />
          </Reveal>
        </div>
      </section>

      {/* ---- Next steps ---------------------------------------------- */}
      <section className="flex w-full flex-col gap-2.5">
        <h2 className="ts-heading-3">Next Steps</h2>
        <div className="flex w-full flex-col gap-2.5 pt-5">
          <h3 className="ts-heading-6">
            Explore an AI-powered shopping assistant
          </h3>
          <Paragraphs
            items={[
              "Users could upload a grocery list and the system would automatically generate a cart optimized for their budget.",
              "This assistant could help users quickly identify the most affordable store and maximize SNAP usage without manually comparing prices.",
            ]}
          />
        </div>
        <div className="flex w-full flex-col gap-2.5">
          <h3 className="ts-heading-6">
            Conduct deeper testing with SNAP users
          </h3>
          <Paragraphs
            items={[
              "Due to limited access to SNAP participants, many early design decisions were informed by one interview and secondary research.",
              "With more time, I would recruit more SNAP users to better understand their real budgeting behaviors and evaluate whether the solution truly reduces decision anxiety during real shopping scenarios.",
            ]}
          />
        </div>
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
