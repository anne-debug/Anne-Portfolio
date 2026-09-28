import type { Metadata } from "next";
import Image from "next/image";

import { Accordion } from "@/components/case/Accordion";
import { Paragraphs } from "@/components/case/CaseParts";
import {
  BulletList,
  Reveal,
  SkipButton,
  StarGlyph,
  StarPointList,
} from "@/components/case/CaseExtras";
import { CaseShell } from "@/components/case/CaseShell";
import { ProblemStatement } from "@/components/case/ProblemStatement";
import type { MoreProjectCard } from "@/components/case/MoreProjects";
import { PhoneMockup } from "@/components/case/PhoneMockup";
import { Zoomable } from "@/components/case/Zoomable";
import { SidebarNav, type SidebarEntry } from "@/components/case/SidebarNav";

export const metadata: Metadata = {
  title: "Taipei Metro Point Redesign — Anne Lin",
  description:
    "Reimagining Metro Points to make rewards visible, understandable, and part of everyday commuting.",
};

const MORE: MoreProjectCard[] = [
  {
    href: "/projects/budgetcart",
    category: "UI/UX Design",
    title: "BudgetCart",
    description:
      "An online grocery app that eliminates checkout anxiety for budget-constrained shoppers",
  },
  {
    href: "/projects/jubo-healthcare",
    category: "Web Development",
    title: "Jubo Healthcare Platform",
    description:
      "Built frontend modules for a senior care dashboard, reducing cognitive load and improving data visibility through close collaboration with designers and nurses",
  },
];

/**
 * This page's own sections; see CASE_STUDY_NAV_RULES.md.
 *
 * Project Context stays: this hero carries a heading of that name, which
 * BudgetCart's does not. The research entry points at the first section of that
 * phase, "User Recruitment & Survey Strategy"; Pain points, Target User, Reward
 * System Comparison and Design Strategy follow it and are not listed
 * separately. Framer's rail lists the six flat, with no sub-entries.
 */
const SECTIONS: SidebarEntry[] = [
  { id: "project-context", label: "Project Context" },
  { id: "problem", label: "Problem" },
  { id: "my-role", label: "My Role" },
  { id: "solution-overview", label: "Solution Overview" },
  { id: "user-research", label: "User Research" },
  { id: "design-breakdown", label: "Design Breakdown" },
];

const SOLUTION_POINTS = [
  {
    title: "Give Metro Points a Clear Home",
    items: [
      "→ Consolidate all point-related information into a single, dedicated entry.",
    ],
  },
  {
    title: "Make Rewards Visible and Actionable",
    items: [
      "→ Earning and redemption information is surfaced clearly within a single interaction, allowing riders to understand value and take action at a glance.",
    ],
  },
  {
    title: "Redefining Metro Points as a Meaningful Reward System",
    items: [
      "→ Converted distance-based fare discounts into visible Metro Points,  aligning the reward system with riders’ daily commuting behavior.",
    ],
  },
  {
    title: "Introducing Little Jie: A Personalized Reward Assistant",
    items: [
      "→ Providing timely, personalized reward suggestions based on location, remaining points, and past behavior—making rewards easier to discover and more likely to be used.",
    ],
  },
];

const PAIN_POINTS = [
  { number: "01.", title: "VALUE IS HIDDEN BEHIND LAYERS" },
  { number: "02.", title: "THE EARNING LOGIC IS UNINTUITIVE" },
  { number: "03.", title: "REWARDS LACK CONTEXTUAL RELEVANCE" },
];

const STRATEGY = [
  {
    number: "01.",
    title: "Value must be visible before effort is required",
    body: "Users need to understand what they can earn at a glance",
  },
  {
    number: "02.",
    title: "Metro Points need a clear and dedicated entry",
    body: " Separate Metro Points from the commuting map to reduce confusion",
  },
  {
    number: "03.",
    title: "Commuting should be part of the reward system",
    body: "Points were only earned through special events, making the system feel unrelated to everyday rides",
  },
  {
    number: "04.",
    title: "Rewards should appear at relevant moments during commuting",
    body: "Rewards were not surfaced during the commuting journey, requiring users to search instead of discover them naturally",
  },
];

const PRIORITIES = [
  {
    title: "Redesign Homepage Navigation",
    items: [
      "Minimal frontend change (removing Go! Map entry)",
      "Reduces initial friction and improves journey start rate",
    ],
  },
  {
    title: "Restructure Metro Point Page IA",
    items: [
      "Requires new interface structure, but leverages existing backend data",
      "Improves discoverability of earning and redemption information",
    ],
  },
  {
    title: "Reframe Metro Point Mechanism",
    items: [
      "Requires stakeholder alignment and policy-level adjustments",
      "Positioned as a longer-term, system-level transformation",
    ],
  },
];

const ITERATIONS = [
  {
    label: "Iteration 0",
    title: "Improving Surface-Level Visibility",
    lede: "I improved discoverability, but engagement didn’t change.",
    summary: "What I tried & what didn’t work",
    body: (
      <>
        <p className="ts-body font-semibold">Initial approach</p>
        <p className="ts-body">
          The first iteration focused on improving discoverability and UI
          clarity:
        </p>
        <BulletList
          items={[
            "Removed Metro Points from the cluttered Go! Map experience",
            "Reorganized point-earning events into list-based views",
            "Separated navigation tasks from reward-related content",
          ]}
        />
        <p className="ts-body font-semibold">Outcome</p>
        <p className="ts-body">
          Visibility improved, but engagement remained low.
        </p>
        <p className="ts-body font-semibold">Key learning </p>
        <p className="ts-body">
          Simply making rewards visible did not change behavior.
        </p>
        <p className="ts-body">
          Users could <em className="italic">find</em> Metro Points, but still
          didn’t feel compelled to engage.
        </p>
      </>
    ),
  },
  {
    label: "Key Insight",
    title: "Visibility Wasn’t the Core Problem",
    lede: "Riders rarely noticed Metro Points during everyday commuting. Rewards were tied to special events, not daily travel. This revealed a mismatch between the system and riders’ mental model of value.",
    summary: "What led to this insight",
    body: (
      <>
        <p className="ts-body">Further analysis revealed that:</p>
        <BulletList
          items={[
            "Metro Points were rarely noticed during everyday commuting",
            "Point accumulation was limited to special events and campaigns",
            "Rewards felt disconnected from riders’ daily travel behavior",
          ]}
        />
        <p className="ts-body">
          At the same time, we uncovered an{" "}
          <strong className="font-semibold">
            existing mileage-based fare rebate mechanism
          </strong>{" "}
          already built into the system, one that closely matched riders’ mental
          model of value:{" "}
          <strong className="font-semibold">
            saving money through mileage.
          </strong>
        </p>
        <p className="ts-body">This reframed the challenge from:</p>
        <p className="ts-body">“Can users find Metro Points?” </p>
        <p className="ts-body">to </p>
        <p className="ts-body">
          “How might Metro Points become part of riders’ everyday experience?”
        </p>
        <Zoomable
          src="/case/fzF5n4Ff6g9fa90YW4Q4fBSm3Co.png"
          alt="The existing mileage-based fare rebate"
          width={1800}
          height={1200}
        >
          <Image
            src="/case/fzF5n4Ff6g9fa90YW4Q4fBSm3Co.png"
            alt="The existing mileage-based fare rebate"
            width={1800}
            height={1200}
            sizes="900px"
            className="mt-2 h-auto w-full rounded-[20px]"
          />
        </Zoomable>
      </>
    ),
  },
  {
    label: "Iteration 1 ",
    title: "Making Value Continuous",
    lede: "We reframed Metro Points around daily commuting to build familiarity.",
    summary: "How I reframed value",
    body: (
      <>
        <p className="ts-body font-semibold">Design question</p>
        <p className="ts-body">
          How might Metro Points feel present during routine commuting, even
          without active participation in events?
        </p>
        <p className="ts-body font-semibold">What we changed</p>
        <BulletList
          items={[
            "Reframed Metro Points around daily commuting behavior",
            "Integrated distance-based fare value into point accumulation",
            "Made point growth visible through everyday travel",
          ]}
        />
        <p className="ts-body font-semibold">Shift in thinking</p>
        <p className="ts-body">
          From event-driven discovery →{" "}
          <strong className="font-semibold">continuous exposure</strong>
        </p>
        <p className="ts-body">
          From rewards as “something extra” →{" "}
          <strong className="font-semibold">
            rewards as part of the commute
          </strong>
        </p>
        <Zoomable
          src="/case/oUBlOSx88XZWYIKfSJrzZbV0E.png"
          alt="Metro Points reframed around daily commuting"
          width={1800}
          height={1200}
        >
          <Image
            src="/case/oUBlOSx88XZWYIKfSJrzZbV0E.png"
            alt="Metro Points reframed around daily commuting"
            width={1800}
            height={1200}
            sizes="900px"
            className="mt-2 h-auto w-full rounded-[20px]"
          />
        </Zoomable>
      </>
    ),
  },
  {
    label: "Iteration2",
    title: "Making Value Situational and Actionable",
    lede: "Daily exposure increased awareness, but didn’t always lead to action.",
    summary: "How I made value actionable",
    body: (
      <>
        <p className="ts-body">
          While daily exposure increased awareness, we observed that awareness
          alone still didn’t lead to action.
        </p>
        <p className="ts-body font-semibold">New insight</p>
        <BulletList
          items={[
            "Riders struggled to judge when it was worth engaging.",
            "Abstract metrics like distance were visible, but not always meaningful in the moment.",
          ]}
        />
        <p className="ts-body font-semibold">What we explored</p>
        <p className="ts-body">
          To reduce decision effort, we iterated on how proximity and value were
          communicated:
        </p>
        <BulletList
          items={[
            "Translating distance into time-based cues (e.g. “7 min away”)",
            "Highlighting nearby opportunities based on current location",
            "Introducing lightweight, context-aware recommendations",
          ]}
        />
        <p className="ts-body">
          These variations explored the same question from different angles:
        </p>
        <p className="ts-body font-semibold">
          How can the system signal relevance at a glance, without requiring
          calculation or planning?
        </p>
        <p className="ts-body font-semibold">Outcome</p>
        <p className="ts-body">
          Metro Points shifted from a passive system to one that supports
          effortless participation through calculated value and timely
          recommendations.
        </p>
        <Zoomable
          src="/case/Yq6Pbh5kfTFnt4CgDN7K8JhcYLI.png"
          alt="Explorations of how proximity and value were communicated"
          width={1800}
          height={1200}
        >
          <Image
            src="/case/Yq6Pbh5kfTFnt4CgDN7K8JhcYLI.png"
            alt="Explorations of how proximity and value were communicated"
            width={1800}
            height={1200}
            sizes="900px"
            className="mt-2 h-auto w-[93%] rounded-[20px]"
          />
        </Zoomable>
      </>
    ),
  },
  {
    label: "Final Direction",
    title: "A Layered Reward System",
    lede: "The final design evolved Metro Points into a layered system:",
    detail: (
      <>
        <BulletList
          items={[
            "Baseline exposure through daily commuting builds familiarity and trust",
            "High-value accelerators (markets and events) provide meaningful incentives tied to real-world actions",
            "Contextual cues and recommendations guide riders toward relevant opportunities without overwhelming them",
          ]}
        />
        <p className="ts-body font-semibold">Result</p>
        <p className="ts-body">
          Metro Points transformed from an event-only reward into a system that
          makes value visible every day—while preserving markets and events as
          the most meaningful and economically aligned paths to earning.
        </p>
        <p className="ts-body">
          The goal wasn’t to force engagement, but to make participation feel
          reasonable when the moment was right.
        </p>
      </>
    ),
    summary: "Why this system works",
    body: (
      <>
        <p className="ts-body">
          The final design evolved Metro Points into a layered system:
        </p>
        <BulletList
          items={[
            "Every ride automatically earns value, helping riders understand and trust the system over time",
            "Markets and events offer higher rewards, giving riders clear reasons to engage when it feels worthwhile",
            "The system surfaces nearby, relevant opportunities, so riders don’t have to search or calculate on their own",
          ]}
        />
        <p className="ts-body font-semibold">Result</p>
        <p className="ts-body">
          Metro Points transformed from an event-only reward into a system that
          makes value visible every day while preserving markets and events as
          the most meaningful and economically aligned paths to earning.
        </p>
      </>
    ),
  },
];

export default function TaipeiMetroPage() {
  return (
    <CaseShell
      more={MORE}
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
      {/* Side by side, the two columns meet at the bottom: the collage ends
          level with the last row of the meta grid. Aligned to the top instead,
          the collage's own height decided where it finished, which put it
          anywhere from 71px above that line to 56px below it. */}
      <section className="flex w-full flex-col items-start gap-[30px] tablet:flex-row tablet:items-end tablet:gap-[10px]">
        {/* Framer's text column measures 424px against a 550px stage, which is
            wider than the two together fit; capping the text and letting the
            stage take the rest keeps Framer's line breaks. */}
        <div
          className="flex min-w-0 flex-1 flex-col gap-[120px] tablet:max-w-[var(--hero-text-w)]"
          /* Framer gives the text 424px against a 550px stage on desktop but
             only about 195px on tablet, where the stage keeps its size. The cap
             ramps between the two so the split moves smoothly rather than
             snapping at the breakpoint.

             It only applies from 810 up. Below that the hero stacks, so there is
             no stage beside the text to leave room for, and the ramp bottoms out
             at its 240px floor: the text sat in a 240px column on a screen three
             times that wide. */
          style={
            {
              "--hero-text-w":
                "clamp(240px, calc(240px + 184 * (100vw - 810px) / 390), 424px)",
            } as React.CSSProperties
          }
        >
          <div className="flex w-full flex-col gap-5">
            <span className="ts-button self-start rounded-[30px] bg-dark-charcoal px-3 py-1 text-off-white">
              UI / UX Design
            </span>
            <div className="flex w-full flex-col gap-5">
              <h1 className="ts-heading-2 text-grey-200">
                Taipei Metro Point Redesign
              </h1>
              {/* `.ts-body-large` steps to 32px at the tablet breakpoint, which is
                  three times what Framer sets here. The lede holds Framer's own
                  size instead: ~14px through tablet, 20px from 1200 up. */}
              <p
                className="ts-body-large"
                style={{
                  fontSize:
                    "clamp(14px, calc(14px + 6 * (100vw - 810px) / 390), 20px)",
                }}
              >
                Reimagining Metro Points to make rewards visible,
                understandable, and part of everyday commuting
              </p>
            </div>
          </div>

          {/* Two across at every width, so the four facts read as a block
              rather than a long list on a phone. */}
          <dl className="grid w-full grid-cols-2 gap-x-[6px] gap-y-5">
            {[
              ["Client", "Taipei Metro Company"],
              ["Role", "UI/UX designer"],
              ["Team", "Hao Liu, Alexis Chung, Woody Wu"],
              ["Timeline ", "6 weeks (2025)"],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <dt className="ts-body font-semibold">{label}</dt>
                <dd className="ts-body">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Framer's hero collage, measured off its Desktop frame: a 550x594
            stage holding the green triangles, the Metro Taipei mark, the blue
            disc, the mascot and the handset. Every piece is placed as a
            percentage of that stage, so the whole composition keeps its
            proportions at any width instead of coming apart. */}
        <div className="relative w-full max-w-[550px] tablet:min-w-0 tablet:flex-1">
          <div className="relative aspect-[550/594] w-full">
            {/* Green triangles, tiled the way Framer tiles them */}
            <svg
              aria-hidden
              viewBox="0 0 265 262"
              className="absolute"
              style={{
                left: "51.82%",
                top: "0%",
                width: "48.18%",
                height: "44.11%",
              }}
              fill="#44AE3A"
            >
              <polygon points="5,8 125,8 125,128" />
              <polygon points="141,8 253,8 253,120" />
              <polygon points="5,136 125,136 125,256" />
              <polygon points="141,136 253,136 253,248" />
            </svg>

            {/* Blue disc, mostly behind the handset */}
            <span
              aria-hidden
              className="absolute rounded-full bg-[#017BAE]"
              style={{
                left: "29.09%",
                top: "58.42%",
                width: "40%",
                height: "37.04%",
              }}
            />

            <Image
              src="/case/1MeOVEBvOGnOx8hi8SWSqyAG1lU.png"
              alt="Metro Taipei"
              width={800}
              height={600}
              sizes="140px"
              className="absolute object-contain"
              style={{
                left: "9.27%",
                top: "23.4%",
                width: "23.82%",
                height: "15.32%",
              }}
            />

            <Image
              src="/case/GSjPc6ucjUjRwG2ne6R89XIuY.png"
              alt=""
              width={800}
              height={600}
              sizes="180px"
              className="absolute object-contain"
              style={{
                left: "2.18%",
                top: "69.36%",
                width: "30.91%",
                height: "25.76%",
              }}
            />

            <div
              className="absolute"
              style={{ left: "40.55%", top: "7.41%", width: "48%" }}
            >
              <PhoneMockup
                screen="/case/DtQR8qdhX8W9HeHl0NMKVdtndI.gif"
                alt="The redesigned Metro Points page"
                unoptimized
                fluid
              />
            </div>
          </div>
        </div>
      </section>

      <span className="h-px w-full bg-grey-100" aria-hidden />

      {/* ---- Project context ----------------------------------------- */}
      <section id="project-context" className="flex w-full flex-col gap-[90px]">
        <div className="flex w-full flex-col gap-6 tablet:gap-[41px]">
          <h2 className="ts-heading-3">Project context</h2>
          <div className="flex w-full flex-col gap-2.5">
            <p className="ts-body">
              Unlike most U.S. metro systems, Taipei Metro stations function as
              <strong className="font-semibold">
                {" "}
                both transit spaces
              </strong>{" "}
              and{" "}
              <strong className="font-semibold">everyday shopping hubs</strong>.
              Many stations integrate convenience stores and local retailers,
              <strong className="font-semibold">
                {" "}
                making daily commuting a key driver of local commerce
              </strong>{" "}
              .
            </p>
            <p className="ts-body">
              Over the past decade, operating costs continued to rise while
              metro fares remained unchanged. As a result,{" "}
              <strong className="font-semibold">
                Taipei Metro faces growing financial pressure
              </strong>{" "}
              and increasingly relies on non-fare revenue from{" "}
              <strong className="font-semibold">
                station-area businesses.
              </strong>
            </p>
            <p className="ts-body">
              This is why Metro Points was introduced to{" "}
              <strong className="font-semibold">
                turn daily commuting into a reward-based system that supports
                riders, local businesses, and the metro’s financial
                sustainability.
              </strong>
            </p>
            <p className="ts-body">
              The Taipei Metro Go app serves two core functions:
            </p>
          </div>

          {/* Stacked, each screen follows the block it belongs to; across, the
              two blocks hold the left column and the screens stand together in
              the right, which is Framer's arrangement. One grid does both, so
              the screens are written once. */}
          <div className="grid w-full grid-cols-1 items-start gap-6 tablet:grid-cols-[2fr_1fr_1fr] tablet:gap-x-5 tablet:pt-[50px]">
            {/* The two blocks are one group from 810, centred against the
                screens beside them. Framer's 90px between them was measured to
                fill the height of those screens, which read as two unrelated
                blocks pinned to the top and the bottom; they sit 40px apart now
                and the group finds the middle. `contents` leaves the phone
                layout alone: below 810 both blocks are still grid items in
                their own right, interleaved with the screens. */}
            <div className="contents tablet:col-start-1 tablet:row-start-1 tablet:flex tablet:flex-col tablet:gap-10 tablet:self-center">
              <div className="flex w-full flex-col gap-2.5">
                <h3 className="ts-heading-6 flex items-center gap-2.5">
                  {/* Framer sets a subway glyph beside this heading */}
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M12 2c-4 0-7 .6-7 4v9a3.5 3.5 0 0 0 3.5 3.5L7 20v.5h10V20l-1.5-1.5A3.5 3.5 0 0 0 19 15V6c0-3.4-3-4-7-4Zm-5 5h4v3.5H7V7Zm6 0h4v3.5h-4V7Zm-4.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
                  </svg>
                  Metro Navigation
                </h3>
                <BulletList
                  marker="check"
                  items={[
                    "Real time train arrival times",
                    "Metro route planning",
                  ]}
                />
              </div>
              <div className="flex w-full flex-col gap-2.5">
                <h3 className="ts-heading-6 flex items-center gap-2.5">
                  {/* and a shopping-bag glyph beside this one */}
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M8 7V6a4 4 0 1 1 8 0v1h2.2a1.4 1.4 0 0 1 1.4 1.3l.9 10.3A2.4 2.4 0 0 1 18.1 21H5.9a2.4 2.4 0 0 1-2.4-2.4l.9-10.3A1.4 1.4 0 0 1 5.8 7H8Zm2 0h4V6a2 2 0 1 0-4 0v1Z" />
                  </svg>
                  Metro Point (Shopping)
                </h3>
                <BulletList
                  marker="check"
                  items={[
                    "Earn points by participating in in-station activity",
                    "Redeem rewards at in-station partner stores",
                  ]}
                />
              </div>
            </div>

            <Zoomable
              src="/case/REE0JaUnJICsEfqE2M8qDkaS63U.png"
              alt="The Go! Map screen in the Taipei Metro Go app"
              width={600}
              height={1200}
            >
              <Image
                src="/case/REE0JaUnJICsEfqE2M8qDkaS63U.png"
                alt="The Go! Map screen in the Taipei Metro Go app"
                width={600}
                height={1200}
                sizes="(width < 810px) 72vw, 280px"
                className="mx-auto h-auto w-[72%] tablet:w-full"
              />
            </Zoomable>

            <Zoomable
              src="/case/OC6dBjwB3jILlhROATsLkmgxJp8.png"
              alt="The Metro Points screen in the Taipei Metro Go app"
              width={600}
              height={1200}
            >
              <Image
                src="/case/OC6dBjwB3jILlhROATsLkmgxJp8.png"
                alt="The Metro Points screen in the Taipei Metro Go app"
                width={600}
                height={1200}
                sizes="(width < 810px) 72vw, 280px"
                className="mx-auto h-auto w-[72%] tablet:w-full"
              />
            </Zoomable>
          </div>

          {/* Framer runs this line across the full column with the figure set
              larger and underlined by hand, then sets the speech bubble and the
              character below it and to the right. */}
          <div className="flex w-full flex-col gap-6">
            <p
              className="w-full text-dark-charcoal"
              style={{
                fontFamily: "var(--font-dm-sans)",
                lineHeight: "1.5em",
                fontSize:
                  "clamp(16px, calc(16px + 4 * (100vw - 810px) / 390), 20px)",
              }}
            >
              However, Data Showed That Nearly{" "}
              <span className="relative inline-block whitespace-nowrap px-1 align-baseline">
                <span style={{ fontSize: "1.45em" }}>72%</span>
                <svg
                  aria-hidden
                  viewBox="0 0 120 8"
                  preserveAspectRatio="none"
                  fill="none"
                  className="absolute -bottom-1 left-0 h-2 w-full"
                >
                  <path
                    d="M2 5.6C28 2.4 72 7.2 118 3.2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              Of App Users Never Engage With Metro Point, This Is A Significant
              Revenue Gap For The Metro Company
            </p>

            <div className="flex w-full items-start justify-center gap-2.5 tablet:justify-start tablet:pl-[50%]">
              <span className="relative block w-[240px] max-w-[52%] shrink-0">
                <Image
                  src="/case/szP9tqheMkCDg6ZTNmU78RB1jo.png"
                  alt=""
                  width={245}
                  height={127}
                  sizes="240px"
                  className="h-auto w-full"
                />
                <span className="absolute inset-x-0 top-[26%] text-center text-[clamp(26px,4vw,40px)] leading-none font-medium text-dark-charcoal">
                  Why?
                </span>
              </span>
              <Image
                src="/case/GyTFSVEROuIS9A2t6v7auAAyo.png"
                alt=""
                width={161}
                height={201}
                sizes="142px"
                className="mt-[36px] h-auto w-[142px] max-w-[32%] shrink-0 object-contain"
              />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-[26px] tablet:gap-[45px]">
          <h2 className="ts-heading-3">Today&apos;s Focus</h2>
          <div className="flex w-full flex-col gap-2.5">
            <h3 className="ts-heading-6">
              Redesigning the “Collect/Redeem Points” experience
            </h3>
            <p className="ts-body">
              While navigation fulfills a core functional need, Metro Points
              plays a critical role in{" "}
              <strong className="font-semibold">
                long-term engagement and financial sustainability.{" "}
              </strong>
              Hence,this project focuses on{" "}
              <strong className="font-semibold">
                improving Metro Points adoption.
              </strong>
            </p>
            <p className="ts-body">
              I focused on{" "}
              <strong className="font-semibold">
                redesigning the Collect Points page
              </strong>
              , where riders are expected to understand:
            </p>
            <BulletList
              items={[
                "How points are earned",
                "What actions they should take",
                "Why Metro Points are relevant to daily commuting",
              ]}
            />
          </div>
          <Reveal className="w-full">
            <Zoomable
              src="/case/rVYcn7al7gIYMqYcqgmTpTnNKHw.png"
              alt="Overview of the Metro Points redesign"
              width={2400}
              height={1400}
            >
              <Image
                src="/case/rVYcn7al7gIYMqYcqgmTpTnNKHw.png"
                alt="Overview of the Metro Points redesign"
                width={2400}
                height={1400}
                sizes="1120px"
                className="h-auto w-full"
              />
            </Zoomable>
          </Reveal>
        </div>
      </section>

      {/* ---- Problem ------------------------------------------------- */}
      <section id="problem" className="flex w-full flex-col gap-[70px]">
        <div className="flex w-full flex-col gap-5">
          <div className="flex w-full flex-col gap-2.5">
            <h2 className="ts-heading-3">Problem</h2>
            <h3 className="ts-heading-6">
              Metro Points had business potential but failed to become part of
              daily commuting
            </h3>
          </div>
          <div className="flex w-full flex-col gap-10">
            <Paragraphs
              items={[
                "Despite strong business intent, Metro Points failed at the experience level.",
                "Through user interviews and flow analysis, we identified two core problems:",
              ]}
            />
            <div className="flex w-full flex-col gap-[42px]">
              <div className="flex w-full flex-col gap-2.5">
                <h4 className="ts-heading-6">
                  Problem 1 — Value was buried too deep
                </h4>
                <p className="ts-body">
                  Users needed multiple steps just to evaluate earning value.
                </p>
                <p className="ts-body">
                  Rules and rewards were only visible at the final screen.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2.5">
                <h4 className="ts-heading-6">
                  Problem 2 — Rewards felt disconnected from commuting behavior
                </h4>
                <p className="ts-body">
                  Most riders expected to earn points simply by riding the
                  metro.
                </p>
                <p className="ts-body">
                  Instead, points can only earn through participating in
                  specific partner events at designated stations.
                </p>
                <p className="ts-body">
                  Since these activities were often outside users’ regular
                  routes and unrelated to riding itself, the system felt
                  disconnected from everyday travel.
                </p>
              </div>
              <Reveal className="w-full">
                <Zoomable
                  src="/case/CedlfXpFrJY8EXvd7JkVSFFIUo.png"
                  alt="The existing Metro Points earning flow"
                  width={2400}
                  height={1400}
                >
                  <Image
                    src="/case/CedlfXpFrJY8EXvd7JkVSFFIUo.png"
                    alt="The existing Metro Points earning flow"
                    width={2400}
                    height={1400}
                    sizes="1120px"
                    className="h-auto w-full rounded-[20px]"
                  />
                </Zoomable>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <p className="ts-body">
            The problem statement that guided this project was:
          </p>
          <ProblemStatement stars>
            How might we make Metro Points immediately understandable and
            actionable, so riders can decide whether to engage without
            searching, guessing, or extra effort?
          </ProblemStatement>
        </div>
      </section>

      {/* ---- My role ------------------------------------------------- */}
      <section id="my-role" className="flex w-full flex-col gap-10">
        <div className="flex w-full flex-col gap-2.5">
          <h2 className="ts-heading-3">My Role</h2>
          <p className="ts-body">
            In this hackathon project, I led the redesign of{" "}
            <strong className="font-semibold">
              Metro Points reward system
            </strong>
            .{" "}
          </p>
          <p className="ts-body">Key responsibilities:</p>
          <StarPointList
            points={[
              { title: "Identifying adoption barriers" },
              { title: "Aligning incentive structure with daily commuting" },
              { title: "Redesigning visibility and earning logic" },
            ]}
          />
        </div>
      </section>

      {/* ---- Solution overview --------------------------------------- */}
      <section id="solution-overview" className="flex w-full flex-col gap-2.5">
        <h2 className="ts-heading-3">Solution Overview</h2>
        <div className="flex w-full flex-col gap-5">
          <h3 className="ts-heading-6">
            Making Metro Points Visible, Clear and Actionable
          </h3>
          {/* The four points are one group and the two demos with their
              captions are another; from 810 the two groups are centred on each
              other rather than both hung from the top, so neither the type nor
              the screens read as starting high. */}
          <div className="flex w-full flex-col gap-5 tablet:flex-row tablet:items-center">
            <div className="flex flex-1 flex-col gap-[29px] py-5">
              <StarPointList points={SOLUTION_POINTS} bold />
            </div>
            {/* One demo per row on a phone, each taking most of the column, so
                the screens are worth looking at; side by side from 810. */}
            <div className="flex flex-1 flex-col items-center gap-8 tablet:flex-row tablet:items-stretch tablet:gap-2.5">
              <figure className="flex w-[72%] flex-col gap-2.5 tablet:w-auto tablet:flex-1">
                <PhoneMockup
                  screen="/case/PE7XGk4EfULbKROvmWyDDbbBaPw.gif"
                  alt="Earning Metro Points"
                  unoptimized
                  fluid
                />
                <figcaption className="ts-body text-center italic">
                  Point Earning
                </figcaption>
              </figure>
              <figure className="flex w-[72%] flex-col gap-2.5 tablet:w-auto tablet:flex-1">
                <PhoneMockup
                  screen="/case/vJgCBvr84OylJWunPSJYgGUhUk.gif"
                  alt="Redeeming Metro Points"
                  unoptimized
                  fluid
                />
                <figcaption className="ts-body text-center italic">
                  Point Redepmtion
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
        <SkipButton href="#design-breakdown" label="Skip to Redesign Details" />
      </section>

      {/* ---- Research ------------------------------------------------ */}
      <section id="user-research" className="flex w-full flex-col gap-[100px]">
        <div className="flex w-full flex-col gap-2.5">
          <h2 className="ts-heading-3">
            User Recruitment &amp; Survey Strategy
          </h2>
          <Paragraphs
            items={[
              "To ensure we gathered diverse and representative insights, we first defined three user groups based on their level of engagement with the app and the Metro Points feature, specifically by (1) frequency of app usage and (2) interaction with Metro Points.",
              "Based on this segmentation, we designed and distributed a screener survey to recruit and filter participants for user interviews, ensuring each group was appropriately represented.",
            ]}
          />
          <Reveal className="w-full">
            <Zoomable
              src="/case/wDPo1NTuWfkIl1pEa8YhSFa3ehQ.png"
              alt="The three user groups defined for recruitment"
              width={2400}
              height={1200}
            >
              <Image
                src="/case/wDPo1NTuWfkIl1pEa8YhSFa3ehQ.png"
                alt="The three user groups defined for recruitment"
                width={2400}
                height={1200}
                sizes="1120px"
                className="h-auto w-full"
              />
            </Zoomable>
          </Reveal>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <h2 className="ts-heading-3">Key Research Insights</h2>
          <div className="flex w-full flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h3 className="ts-heading-6">
                Riders didn’t perceive Metro Points as part of their daily
                commute
              </h3>
              <h3 className="ts-heading-6">
                The system required extra effort, and rewards felt disconnected
                from everyday travel behavior
              </h3>
            </div>
            {/* Framer scatters the three quotes at different indents rather
                than stacking them, sets a large quote mark at the bottom left,
                and puts the brain on the right. */}
            <div className="relative w-full pt-10">
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-0 hidden leading-[0.7] font-serif text-[150px] text-grey-100 select-none tablet:block"
              >
                &ldquo;
              </span>

              <div className="flex w-full flex-col gap-9 tablet:pl-[6%]">
                <p className="ts-body tablet:max-w-[52%]">
                  &ldquo;I don&rsquo;t really understand what Go! Map is for.{" "}
                  <strong className="font-semibold">
                    It looks like the metro route page
                  </strong>
                  , so I don&rsquo;t know how to use it.&rdquo;
                </p>
                <p className="ts-body tablet:ml-[38%] tablet:max-w-[31%]">
                  &ldquo;I don&rsquo;t really understand{" "}
                  <strong className="font-semibold">
                    how to collect or use Metro Points
                  </strong>
                  .&rdquo;
                </p>
                <p className="ts-body tablet:ml-[20%] tablet:max-w-[52%]">
                  &ldquo;I would use Metro Points more if the rewards were
                  actually{" "}
                  <strong className="font-semibold">
                    relevant to my daily commute
                  </strong>
                  .&rdquo;
                </p>
              </div>

              <Image
                src="/case/LQPH6J1KtYHvjkpIS9qdZGva1mA.png"
                alt=""
                width={160}
                height={175}
                sizes="160px"
                className="mt-6 ml-auto h-[131px] w-[120px] object-contain tablet:absolute tablet:right-[6%] tablet:-bottom-2 tablet:mt-0 tablet:ml-0 tablet:h-[175px] tablet:w-[160px]"
              />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <h2 className="ts-heading-3">Pain points</h2>
          <div className="flex w-full flex-col gap-[9px] tablet:flex-row">
            {PAIN_POINTS.map((p) => (
              <div
                key={p.number}
                /* Framer's 30/40 padding and 25px gap from 810 up; tighter below, where
                  the card is the width of the screen and that much air made each
                  one half a phone tall. */
                className="flex flex-1 flex-col gap-3 rounded-[20px] border border-grey-100 px-5 py-6 tablet:gap-[25px] tablet:px-[30px] tablet:py-10"
              >
                <p className="ts-heading-5 font-bold">{p.number}</p>
                <p className="ts-body font-semibold">{p.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <h2 className="ts-heading-3">Target User</h2>
          <Paragraphs
            items={[
              "While we initially segmented users into three groups, our interviews revealed that medium-engagement users and potential users both lacked awareness and understanding of the Metro Points feature. ",
              "As a result, we grouped them together into a single segment focused on clarity challenges.",
            ]}
          />
          <div className="flex w-full flex-col items-center gap-8 pt-2 tablet:flex-row">
            <ol className="flex flex-1 flex-col gap-4">
              <li className="flex flex-col gap-1">
                <h3 className="ts-heading-6">
                  1. Low-to-mid engagement riders
                </h3>
                <p className="ts-body">
                  → Make Metro Points visible, understandable, and effortless to
                  start using.
                </p>
              </li>
              <li className="flex flex-col gap-1">
                <h3 className="ts-heading-6">
                  2. High-frequency riders &amp; existing point users
                </h3>
                <p className="ts-body">
                  → Reduce friction by surfacing relevant rewards at the right
                  moment.
                </p>
              </li>
            </ol>
            <Reveal className="w-full tablet:w-[52%]">
              <Zoomable
                src="/case/pNyfX9DrGQ19Zt7RnUUADVb24.png"
                alt="The two rider segments, with high-frequency point users nested inside the low-to-mid engagement group"
                width={2800}
                height={1852}
              >
                <Image
                  src="/case/pNyfX9DrGQ19Zt7RnUUADVb24.png"
                  alt="The two rider segments, with high-frequency point users nested inside the low-to-mid engagement group"
                  width={2800}
                  height={1852}
                  sizes="(width < 810px) 92vw, 500px"
                  className="h-auto w-full"
                />
              </Zoomable>
            </Reveal>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <h2 className="ts-heading-3">Reward System Comparison</h2>
          <h3 className="ts-heading-6">
            Metro Points: High Potential, Underutilized System
          </h3>
          <div className="flex w-full flex-col items-start gap-8 pt-2 tablet:flex-row">
            <Reveal className="w-full tablet:w-[46%]">
              <Zoomable
                src="/case/D5kodJ1CD0Cjg7IhFE0pqpadrRI.png"
                alt="A matrix plotting each reward system by daily presence against ease of redemption"
                width={2400}
                height={1400}
              >
                <Image
                  src="/case/D5kodJ1CD0Cjg7IhFE0pqpadrRI.png"
                  alt="A matrix plotting each reward system by daily presence against ease of redemption"
                  width={2400}
                  height={1400}
                  sizes="(width < 810px) 92vw, 440px"
                  className="h-auto w-full"
                />
              </Zoomable>
            </Reveal>
            <div className="flex flex-1 flex-col gap-[45px]">
              <p className="ts-body">
                Metro Points sit in high-frequency daily touchpoints
                <br />
                <em className="font-semibold not-italic">→ High exposure</em>
              </p>
              <p className="ts-body">
                However, unclear earning logic and poor value visibility
                <br />
                <em className="font-semibold not-italic">
                  → Low usability &amp; weak value framing
                </em>
              </p>
              <p className="ts-body">
                As a result,{" "}
                <strong className="font-semibold">
                  high exposure fails to convert into meaningful engagement
                </strong>
                <br />
                due to unclear earning logic and weak value visibility.
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-5">
          <div className="flex w-full flex-col">
            <h2 className="ts-heading-3">Design Strategy</h2>
            <p className="ts-body">
              Instead of optimizing isolated features, I redesigned the reward
              system around how riders experience value during their daily
              commute.
            </p>
          </div>
          <div className="grid w-full gap-x-5 gap-y-[45px] tablet:grid-cols-2">
            {STRATEGY.map((s) => (
              <div key={s.number} className="flex flex-col gap-2.5">
                <p className="ts-body-large font-semibold text-orange">
                  {s.number}
                </p>
                <p className="ts-body font-semibold">{s.title}</p>
                <p className="ts-body text-light-grey">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-10">
          <div className="flex w-full flex-col gap-5">
            <h2 className="ts-heading-3">Strategy Evolution</h2>
            {/* A timeline: each step is numbered and the dots are joined by a
                line that runs on through the gap to the next one. The line is
                only drawn from tablet up, where the rail has a column of its
                own; below that the step sits above its content and a vertical
                line would cut straight through the copy. */}
            <ol className="flex w-full flex-col gap-[74px]">
              {ITERATIONS.map((it, i) => (
                <li
                  key={it.label}
                  className="relative flex w-full flex-col items-start gap-2.5 tablet:flex-row"
                >
                  {/* The connector hangs off the row, not off the rail, so it
                      reaches the next dot whatever this row's content adds up
                      to: the row's own height, less the 30px down to the first
                      dot's underside, plus the 74px gap to the next row. */}
                  {i < ITERATIONS.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute top-[30px] left-[13px] hidden h-[calc(100%+44px)] w-px bg-grey-150 tablet:block"
                    />
                  ) : null}
                  <div className="relative flex w-full shrink-0 items-start gap-3 tablet:w-[250px]">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-dark-charcoal text-[11px] font-semibold text-off-white desktop:size-[26px] desktop:text-[13px]">
                      {i + 1}
                    </span>
                    <h3 className="ts-heading-6 pt-[1px]">{it.label}</h3>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                    <h4 className="ts-heading-5">{it.title}</h4>
                    <p className="ts-body">{it.lede}</p>
                    {"detail" in it ? it.detail : null}
                    <Accordion summary={it.summary}>{it.body}</Accordion>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---- Design breakdown ---------------------------------------- */}
      <section
        id="design-breakdown"
        className="flex w-full flex-col gap-[60px]"
      >
        <div className="flex w-full flex-col gap-[30px]">
          <div className="flex w-full flex-col gap-2.5">
            <h2 className="ts-heading-3">Design Breakdown</h2>
            <h3 className="ts-heading-6">
              Making Metro Points Visible, Clear and Actionable
            </h3>
            <h4 className="ts-heading-6 pt-4">
              1. Give Metro Points a Clear Home
            </h4>
            <p className="ts-body font-semibold">
              Impact: Users have a clear entry point for Metro Points, reducing
              confusion and improving discoverability.
            </p>
            <p className="ts-body">
              Before the redesign, riders had to rely on{" "}
              <strong className="font-semibold">Go! Map</strong> to discover
              where they could earn or redeem Metro Points.
            </p>
            <p className="ts-body">
              Because earning activities and{" "}
              <strong className="font-semibold">
                rewards were tied to specific stations, users were forced to
                scan the map
              </strong>{" "}
              to figure out which stations offered campaigns, where rewards
              could be redeemed, and how points could be earned,{" "}
              <strong className="font-semibold">
                adding cognitive load and making points feel hard to access.
              </strong>
            </p>
            <p className="ts-body">
              I removed Metro Points from the cluttered Go! Map experience and{" "}
              <strong className="font-semibold">
                consolidate all point-related information into a single,
                dedicated entry.
              </strong>
            </p>
          </div>
          <Reveal className="w-full">
            <Zoomable
              src="/case/sBEweLasNhWBXDBcOUGtbYZFNHg.png"
              alt="The consolidated Metro Points entry"
              width={2800}
              height={1200}
            >
              <Image
                src="/case/sBEweLasNhWBXDBcOUGtbYZFNHg.png"
                alt="The consolidated Metro Points entry"
                width={2800}
                height={1200}
                sizes="1120px"
                className="h-auto w-full"
              />
            </Zoomable>
          </Reveal>
        </div>

        <div className="flex w-full flex-col gap-[59px]">
          <div className="flex w-full flex-col gap-[30px]">
            <div className="flex w-full flex-col gap-2.5">
              <h4 className="ts-heading-6">
                2. Redefining Metro Points as a Meaningful Reward System
              </h4>
              <p className="ts-body font-semibold">
                Impact: Users see the value of everyday commuting, while
                point-based rewards drive foot traffic to station-area stores
                and non-fare revenue for Taipei Metro.
              </p>
              <p className="ts-body">
                During research, I discovered that Taipei Metro was already{" "}
                <strong className="font-semibold">
                  incentivizing frequent riders through distance-based fare
                  discounts and cashback.{" "}
                </strong>
                However, these benefits were{" "}
                <strong className="font-semibold">buried</strong> in the Metro
                Card information page, and most riders, including myself, barely
                noticed them.
              </p>
              <p className="ts-body">
                At the same time,{" "}
                <strong className="font-semibold">
                  Metro Points struggled to function as a meaningful reward
                  system on its own
                </strong>
                :
              </p>
              <BulletList
                items={[
                  "Points were mostly earned through temporary campaigns",
                  "Explanations about how earning worked were easy to miss",
                  "For new riders, point accumulation felt confusing and not worth the effort",
                ]}
              />
              <p className="ts-body">
                As a result, neither system helped riders clearly recognize or
                engage with the value of everyday commuting.
              </p>
              <p className="ts-body font-semibold">our Insight:</p>
              <p className="ts-body">
                Through research, I identified a gap between{" "}
                <strong className="font-semibold">
                  hidden fare incentives
                </strong>{" "}
                and an{" "}
                <strong className="font-semibold">
                  unclear reward system.
                </strong>{" "}
                This insight led our team to reframe{" "}
                <strong className="font-semibold">
                  Metro Points as a single, visible mechanism
                </strong>{" "}
                that{" "}
                <strong className="font-semibold">
                  surfaces existing value{" "}
                </strong>
                and{" "}
                <strong className="font-semibold">
                  gives rewards a clearer, more meaningful role.
                </strong>
              </p>
              <p className="ts-body font-semibold">What I changed:</p>
              <ul className="flex w-full list-disc flex-col gap-2 pl-5">
                <li className="ts-body">
                  Redefined Metro Points as the primary, visible reward
                  mechanism
                  <br />→ Converted distance-based fare discounts into visible
                  Metro Points, making everyday savings clear and recognizable.
                </li>
                <li className="ts-body">
                  Unified all earning logic into one system
                  <br />→{" "}
                  <strong className="font-semibold">
                    Travel distance and campaigns
                  </strong>{" "}
                  now contribute to a single point balance, creating a clearer
                  link between riding the metro and earning rewards.
                </li>
              </ul>
            </div>
            <Reveal className="w-full">
              <Zoomable
                src="/case/y2WHxFY8x6y1DfdzC3rFDqsTI.png"
                alt="Metro Points redefined around travel distance"
                width={2800}
                height={1200}
              >
                <Image
                  src="/case/y2WHxFY8x6y1DfdzC3rFDqsTI.png"
                  alt="Metro Points redefined around travel distance"
                  width={2800}
                  height={1200}
                  sizes="1120px"
                  className="h-auto w-full rounded-[20px]"
                />
              </Zoomable>
            </Reveal>
          </div>
        </div>

        <div className="flex w-full flex-col gap-[55px]">
          <div className="flex w-full flex-col gap-9">
            <div className="flex w-full flex-col gap-2.5">
              <h4 className="ts-heading-6">
                3. Make Rewards Relevant and Actionable
              </h4>
              <p className="ts-body font-semibold">
                Impact: Users can immediately see what they can earn and redeem,
                and decide whether to engage without extra effort.
              </p>
              <p className="ts-body">
                I redesigned the reward experience to answer one clear question
                upfront:
              </p>
              <p className="ts-body">
                &quot;How do I earn points—and what can I use them for right
                now?&quot;{" "}
              </p>
              <p className="ts-body font-semibold">What I changed:</p>
              <BulletList
                items={[
                  "Rewards are shown with real product images, nearby locations, and required point thresholds",
                  "Users can preview what they can redeem before deciding whether to earn more points",
                  "Point-earning activities are surfaced directly on the Metro Points page, so riders can decide upfront whether they want to engage.",
                ]}
              />
            </div>
            <Reveal className="w-full">
              <Zoomable
                src="/case/T52XV12BcXFyv9VUac5hG6uEE9g.png"
                alt="The redesigned rewards experience"
                width={2800}
                height={1200}
              >
                <Image
                  src="/case/T52XV12BcXFyv9VUac5hG6uEE9g.png"
                  alt="The redesigned rewards experience"
                  width={2800}
                  height={1200}
                  sizes="1120px"
                  className="h-auto w-full rounded-[20px]"
                />
              </Zoomable>
            </Reveal>
          </div>

          {/* One column, as Framer sets it: the italic lead, what the assistant
              does, the line it would say, then the panel across the full width.
              The yellow speech bubble belongs to the "Why?" block earlier on the
              page and Framer does not repeat it here. */}
          <div className="flex w-full flex-col gap-5">
            <h4 className="ts-heading-4 italic">
              To support this, we introduced Little Jie, a smart reward
              assistant
            </h4>
            <div className="flex w-full flex-col gap-2.5">
              <p className="ts-body font-semibold">What Little Jie Does:</p>
              <BulletList
                items={[
                  "Detects user’s location and notifies riders at nearby stations with redeemable rewards  ",
                  "Calculates available redemptions based on point balance",
                  "Personalizes recommendations using past redemption",
                ]}
              />
            </div>
            <h5 className="ts-heading-6 pt-4">
              “There’s a 20% discount at the bakery near Exit 2 — redeem it with
              30 points!”
            </h5>
            {/* The artwork is a transparent PNG and sits straight on the page:
                no panel behind it. */}
            <Reveal className="w-full pt-2">
              <Zoomable
                src="/case/uG6UgyeylPUQYscl6pJUW8XM.png"
                alt="Little Jie surfacing a nearby reward beside the point rewards tab"
                width={2800}
                height={1600}
              >
                <Image
                  src="/case/uG6UgyeylPUQYscl6pJUW8XM.png"
                  alt="Little Jie surfacing a nearby reward beside the point rewards tab"
                  width={2800}
                  height={1600}
                  sizes="(width < 810px) 92vw, 950px"
                  className="h-auto w-full"
                />
              </Zoomable>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Prioritise ---------------------------------------------- */}
      <section className="flex w-full flex-col gap-3.5">
        <div className="flex w-full flex-col gap-2.5">
          <h2 className="ts-heading-3">Prioritize Strategy</h2>
          <div className="flex w-full flex-col gap-2.5">
            <h3 className="ts-heading-6">
              Balancing user impact, engineering cost, and business dependency
            </h3>
            <p className="ts-body">
              Since this project addressed a real-world financial challenge,
              time and feasibility were critical.
            </p>
            <p className="ts-body">
              I prioritized initiatives based on impact, cost, and stakeholder
              alignment.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-12 pt-[60px]">
          {/* From 810 the axis reads across, above the three initiatives: a
              dashed run ending in an arrowhead, as Framer draws it. The dashes
              are a repeating gradient so their length and spacing are set
              rather than left to the browser's dashed border. */}
          <div className="hidden w-full items-center gap-5 tablet:flex">
            <span className="ts-body shrink-0 font-semibold">
              Less Eng cost
            </span>
            <span
              aria-hidden
              className="flex flex-1 items-center text-deep-blue"
            >
              <span
                className="h-[3px] flex-1"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to right, currentColor 0 14px, transparent 14px 24px)",
                }}
              />
              <svg width="15" height="18" viewBox="0 0 15 18" fill="none">
                <path
                  d="m3 2 8 7-8 7"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="ts-body shrink-0 font-semibold">
              More Eng cost/
              <br />
              Business dependency
            </span>
          </div>

          {/* Below 810 the two labels cannot sit either side of it, so the axis
              turns upright and runs down the side of the initiatives, from the
              first to the third, with a label at each end. */}
          <div className="flex w-full flex-col gap-3 tablet:block">
            <span className="ts-body font-semibold tablet:hidden">
              Less Eng cost
            </span>

            <div className="flex w-full gap-4 tablet:block">
              <span
                aria-hidden
                className="flex shrink-0 flex-col items-center text-deep-blue tablet:hidden"
              >
                <span
                  className="w-[3px] flex-1"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(to bottom, currentColor 0 14px, transparent 14px 24px)",
                  }}
                />
                <svg width="18" height="15" viewBox="0 0 18 15" fill="none">
                  <path
                    d="m2 3 7 8 7-8"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              {/* Upright, the list starts level with the axis and each title
                  sits straight on its bullets. A little air above the first one
                  and under each title gives them room; across, Framer's own
                  spacing stands. */}
              <div className="grid w-full min-w-0 gap-10 pt-2 tablet:grid-cols-3 tablet:pt-0">
                {PRIORITIES.map((p, i) => (
                  <div
                    key={p.title}
                    className="flex flex-col gap-4 tablet:gap-2.5"
                  >
                    <p className="ts-body flex gap-2 font-semibold">
                      <span className="shrink-0">{i + 1}.</span>
                      <span>{p.title}</span>
                    </p>
                    <ul className="flex list-disc flex-col gap-1 pl-5">
                      {p.items.map((item) => (
                        <li key={item} className="ts-body-small-light">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <span className="ts-body font-semibold tablet:hidden">
              More Eng cost/
              <br />
              Business dependency
            </span>
          </div>
        </div>
      </section>

      {/* ---- Impact -------------------------------------------------- */}
      <section className="flex w-full flex-col gap-3.5">
        <div className="flex w-full flex-col gap-2.5">
          <h2 className="ts-heading-3">Impact</h2>
          <p className="ts-body">
            A sustainable, win–win–win ecosystem where better rider experiences
            drive engagement, partner value, and long-term growth.
          </p>
        </div>
        {/* Framer flanks the closing line with sparkles and colours its second
            half: the feature in deep blue, what happened to it in green. */}
        <div className="relative flex w-full items-start gap-4 pt-8 tablet:pl-[9%]">
          <span aria-hidden className="mt-1 shrink-0 text-dark-charcoal">
            <StarGlyph size={20} />
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="ts-heading-6">
              By removing friction, restructuring the IA, and reframing the
              mechanism,
            </h3>
            <h3 className="ts-heading-6">
              <span className="text-deep-blue">Metro Points</span>{" "}
              <span className="text-[#2f9e68]">
                became embedded into daily commuting
              </span>
            </h3>
          </div>
          {/* The pair on the right was drawn only from 810 up, which left the
              line with a star at one end and nothing at the other on a phone.
              It shows at every width now, sitting at the foot of the text
              below tablet where the line wraps. */}
          <span
            aria-hidden
            className="mt-[-6px] flex shrink-0 flex-col items-start gap-1 self-end text-dark-charcoal tablet:self-auto"
          >
            <StarGlyph size={18} />
            <StarGlyph size={12} />
          </span>
        </div>
      </section>

      {/* ---- Learning ------------------------------------------------ */}
      <section className="flex w-full flex-col gap-10">
        <div className="flex w-full flex-col gap-2.5">
          <h2 className="ts-heading-3">My Learning</h2>
          <div className="flex w-full flex-col items-start gap-10 tablet:flex-row">
            {/* Framer's 89px between the two learnings is measured for the
                desktop column; stacked on a phone it reads as a hole. */}
            <div className="flex flex-1 flex-col gap-10 tablet:gap-[89px]">
              <div className="flex w-full flex-col gap-2.5 pt-5">
                <h3 className="ts-heading-6">
                  Design must align with existing behavior
                </h3>
                <p className="ts-body">
                  Commuting was already part of riders’ daily routines. By
                  integrating rewards into that natural behavior instead of
                  requiring extra effort, engagement became more intuitive and
                  sustainable.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2.5">
                <h3 className="ts-heading-6">
                  Design decisions must account for business goals and
                  feasibility
                </h3>
                <p className="ts-body">
                  Strong user-centered ideas only create impact when they align
                  with organizational priorities and can realistically be
                  implemented
                </p>
              </div>
            </div>
            <Image
              src="/case/ODUF40NzVYFLwC6n63ckMD5FY.png"
              alt=""
              width={187}
              height={294}
              /* Stacked, she keeps the right-hand side she has when the two sit
                 side by side, rather than dropping to the left margin. */
              className="h-[220px] w-[140px] shrink-0 self-end object-contain tablet:h-[294px] tablet:w-[187px] tablet:self-auto"
            />
          </div>
        </div>
      </section>
    </CaseShell>
  );
}
