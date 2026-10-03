import type { Metadata } from "next";
import Image from "next/image";

import {
  CaseHeader,
  CaseSection,
  Paragraphs,
} from "@/components/case/CaseParts";
import {
  BulletList,
  Reveal,
  SkipButton,
  Slideshow,
  StarPointList,
  VideoBlock,
} from "@/components/case/CaseExtras";
import { CaseShell } from "@/components/case/CaseShell";
import { SidebarNav, type SidebarEntry } from "@/components/case/SidebarNav";
import { RyzeHeroArt } from "@/components/case/RyzeHeroArt";
import { ProblemStatement } from "@/components/case/ProblemStatement";
import { PrototypeInvite } from "@/components/case/PrototypeInvite";

export const metadata: Metadata = {
  title: "Ryze Coffee Web Redesign — Anne Lin",
  description:
    "Redesigning with user trust and autonomy for long-term retention.",
};

/**
 * The Figma prototype the Solutions section links out to. Framer set that line
 * as plain text with no link behind it, so this came from Anne rather than from
 * the source file.
 */
/**
 * This page's own sections; see CASE_STUDY_NAV_RULES.md.
 *
 * The research phase is one entry pointing at Research Process, the first of
 * its sections; Target User, Persona, Journey Mapping, Usability Testing and
 * Pain points sit inside it and are not listed separately. "Design Breakdown"
 * is this page's second Solutions section, the one that walks through the three
 * redesigns.
 */
const SECTIONS: SidebarEntry[] = [
  { id: "project-context", label: "Project Context" },
  { id: "problem", label: "Problem" },
  { id: "my-role", label: "My Role" },
  { id: "solution-overview", label: "Solution Overview" },
  { id: "research-process", label: "User Research" },
  { id: "redesign-details", label: "Design Breakdown" },
  { id: "result-impact", label: "Result & Impact" },
];

const PROTOTYPE_URL =
  "https://www.figma.com/proto/KOtXVHJhI7dznw05o82Fvx/Ryze-High-Fi?node-id=2988-4920&viewport=54%2C46%2C0.14&t=hAMRthDpOGODITXq-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=2988%3A4920&page-id=2988%3A4792";

/** The three the usability testing turned up; Framer holds them in a picture. */
const PAIN_POINTS = [
  { number: "01.", title: "Subscription transparency is unclear" },
  { number: "02.", title: "Key information is hidden or hard to find" },
  { number: "03.", title: "Promotions and wording reduce trust" },
];

const PROBLEMS = [
  {
    title: "Problem 1 — Lack of transparency in the subscription model",
    body: "The subscription is often disguised as a one-time purchase. Users frequently do not realize they are subscribing until checkout, or even after being charged.  ",
    image: "/case/NOJQEj7x4PEMviYP9RccxGIL6uA.png",
    imageFirst: false,
  },
  {
    title: "Problem 2 — Overwhelming and promotional-heavy interface",
    body: "The interface relies heavily on repeated promotions and urgency tactics (e.g., countdown timers), which increase cognitive load and pressure users into quick decisions.  ",
    image: "/case/dZaTS0TuY5fsGy7rSu4P83DfNg.png",
    imageFirst: true,
  },
  {
    title: "Problem 3 — Misleading and unclear communication",
    body: "Important information is hidden in fine print or unclear wording (e.g., “Try now”), making it difficult for users to understand what they are purchasing or how the service works.",
    image: "/case/ImWPqDibGDcW7Askz1sUIdEQo8.png",
    imageFirst: false,
  },
  {
    title: "Problem 4 — Forced consent for marketing communication",
    body: "Users must agree to receive marketing messages to access the service, reducing user control and trust.",
    image: "/case/m9kePksEY5lKXqt1ZoRWuhHQ9Rw.png",
    imageFirst: true,
  },
];

const SOLUTION_POINTS = [
  {
    title: "Make the subscription model explicit",
    items: [
      "Reworded CTA (e.g., “Subscription”)",
      "Clearly stated recurring payment details",
    ],
  },
  {
    title: "Reduce cognitive load",
    items: [
      "Removed excessive promotions and countdown timers",
      "Simplified layout and improved information hierarchy",
      "Surfaced key product details (e.g., nutrition, pricing)",
    ],
  },
  {
    title: "Improve clarity and trust",
    items: [
      "Replaced ambiguous wording with direct language",
      "Clarified navigation and product categories",
      "Made service descriptions more accurate",
    ],
  },
  {
    title: "Support user autonomy",
    items: ["Removed forced marketing opt-ins"],
  },
];

const JOURNEY_SLIDES = [
  "8DrepHLEbPFSqfpKZZtAVPnksyc.png",
  "f6ibVWtQ5q2RQ6MScx0KefJzxUo.png",
  "HfwJG50rfaVLFsbQSrysn1JNzVU.png",
  "SMu9mRcO1ddfv4fkbHSixloQxco.png",
  "Iw7iW9jZugwEozFupkT8YcOErcc.png",
  "jc0GyZbCZHDS91jlMLb8czih4g.png",
  "9weFAednsLgEGtVg0m8FBogtnM.png",
  "iLGQQ561nsjEJE8pdlo81PmwcE.png",
  "L12X6LasGUdUe0eSVJI3qDuiv8.png",
  "U2YqiocJgPhTOFpj4DthmPm0RY.png",
  "UFkLy8K7pI6RuOJEdBFJeA3oFRc.png",
].map((f) => `/case/${f}`);

const FLOW_ONE = [
  "Can users complete the purchase without confusion?",
  "Do users realize it is a subscription?",
  "Do users feel confident and trust the website?",
  "How do users react when they discover the subscription?",
];

const FLOW_TWO = [
  "Can users find the service?",
  "Do they understand what it does?",
  "Do they understand how it works?",
  "Are they comfortable providing their information?",
];

export default function RyzeCoffeePage() {
  return (
    <CaseShell
      current="ryze-coffee"
      sidebar={<SidebarNav entries={SECTIONS} />}
      moreVariant="compact"
      canvasWidth={1200}
      bodyWidth={1200}
      bodyGap={50}
      pageTop={60}
      bodyPad={120}
      bodyPadX={40}
      moreBottom={120}
    >
      <div className="relative w-full pb-20">
        <CaseHeader
          category="UI/UX Design"
          title="Ryze Coffee Web Redesign"
          description="Redesigning with user trust and autonomy for long-term retention"
          titleGap={20}
          meta={[
            { label: "Client", value: "Ryze coffee (Coursework Project)" },
            { label: "Role", value: "UI/UX Designer / Researcher" },
            { label: "Team", value: "Anne Lin, Tuyara Chinbat" },
            { label: "Duration", value: "4 weeks (2026)" },
          ]}
          media={<RyzeHeroArt />}
        />
      </div>

      {/* The rule Metro and BudgetCart draw under their heroes. */}
      <span className="h-px w-full bg-grey-100" aria-hidden />

      <div className="flex w-full flex-col gap-[90px]">
        <CaseSection id="project-context" title="Project context" gap={10}>
          <Paragraphs
            items={[
              "Ryze is a fast-growing wellness brand known for its mushroom coffee, which has gained popularity largely through social media and word of mouth.",
              "However, while the product itself is appealing, the website experience does not reflect the same level of trust and clarity. Many users visit the site looking for a healthier coffee alternative, but struggle to understand the product, the purchase model, and the overall value.",
              "This project focuses on redesigning key user flows to improve trust, transparency, and decision-making, ultimately supporting long-term customer retention.",
            ]}
          />
        </CaseSection>

        <CaseSection id="problem" title="Problem" gap={40}>
          <div className="flex w-full flex-col gap-[90px]">
            {PROBLEMS.map((problem) => (
              <Reveal key={problem.title} className="w-full">
                <div
                  className={`flex w-full flex-col items-center gap-10 tablet:flex-row ${
                    problem.imageFirst ? "tablet:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex flex-1 flex-col gap-2.5">
                    <h3 className="ts-heading-6">{problem.title}</h3>
                    <p className="ts-body">{problem.body}</p>
                  </div>
                  <div className="relative w-full tablet:w-[60%]">
                    <Image
                      src={problem.image}
                      alt={problem.title}
                      width={1400}
                      height={900}
                      sizes="700px"
                      className="h-auto w-full rounded-[20px]"
                    />
                  </div>
                </div>
              </Reveal>
            ))}

            <div className="flex w-full flex-col gap-2.5">
              <h3 className="ts-heading-6">Overall Impact</h3>
              <BulletList
                items={[
                  "Reduced user control and trust ",
                  "Confusion during decision-making",
                  "Risk of unintended subscriptions",
                  "Negative long-term brand perception",
                ]}
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-2.5">
            <p className="ts-body">
              The problem statement that guided this project was:
            </p>
            {/* Framer set this statement as a flat picture of itself, which
                left it at whatever type that export was drawn at and unable to
                rewrap. It is the shared card now, so it carries the same
                gradient, corner, padding and Heading 6 as Metro and
                BudgetCart, and the words are real text. */}
            <ProblemStatement stars>
              How might we reduce deceptive patterns and cognitive overload to
              build trust and help users feel in control when making a purchase
              decision, while still supporting business goals?
            </ProblemStatement>
          </div>
        </CaseSection>

        <CaseSection id="my-role" title="My role" gap={10}>
          <p className="ts-body">
            In this project, I led the redesign of{" "}
            <strong className="font-semibold">
              Product page, shopping cart and Hero Section on the home Page
            </strong>
          </p>
          <p className="ts-body font-semibold">Key responsibilities:</p>
          <StarPointList
            points={[
              {
                title:
                  "Identified usability issues related to trust, clarity, and subscription transparency",
              },
              {
                title:
                  "Translated research insights into design solutions that reduce cognitive load and improve decision-making",
              },
              {
                title:
                  "Improved information hierarchy and CTA clarity to better communicate product ",
              },
              {
                title:
                  "Collaborated on usability testing and iterated designs based on user feedback and behavioral insights",
              },
            ]}
          />
        </CaseSection>

        <CaseSection id="solution-overview" title="Solutions" gap={10}>
          <h3 className="ts-heading-6 w-full text-left">
            Redesigned the experience with a focus on clarity, transparency, and
            user autonomy
          </h3>
          <div className="w-full p-[30px]">
            <StarPointList points={SOLUTION_POINTS} columns={2} bold />
          </div>
          {/* The playful way into the prototype. It sits under the four
              points and keeps its distance from the Skip button below, so the
              two never read as a pair of competing buttons. */}
          <div className="pt-6 pb-10">
            <PrototypeInvite href={PROTOTYPE_URL} />
          </div>
          <SkipButton
            href="#redesign-details"
            label="Skip to redesign details"
          />
        </CaseSection>

        <CaseSection id="research-process" title="Research Process" gap={10}>
          <div className="flex w-full flex-col gap-2.5">
            <h3 className="ts-heading-5 w-full text-left">Target User</h3>
            <p className="ts-body">
              Health-conscious individuals who are looking for a healthier
              alternative to coffee and are interested in improving their daily
              wellness habits.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2.5 pt-[90px]">
            <h3 className="ts-heading-5 w-full text-left">Persona</h3>
            <Paragraphs
              items={[
                "Before jumping into the design, we wanted to understand our users better.",
                "So we created a persona to represent our target user. This helped us identify key pain points and opportunities for improvement.",
              ]}
            />
            <Reveal className="w-full pt-5">
              <div className="w-full tablet:w-[77%]">
                <Image
                  src="/case/TiWQE7JDRoA2Uw2psZXUDkOqD24.png"
                  alt="The persona created for the Ryze redesign"
                  width={1600}
                  height={1000}
                  sizes="900px"
                  className="h-auto w-full rounded-[20px]"
                />
              </div>
            </Reveal>
          </div>

          <div className="flex w-full flex-col gap-2.5 pt-[90px]">
            <h3 className="ts-heading-5 w-full text-left">Journey Mapping</h3>
            <div className="flex w-full flex-col gap-[25px]">
              <Paragraphs
                items={[
                  "Based on this persona, we mapped out the user journey and identified key moments in the experience, including the peak and the pit.",
                  "Users feel excited during product discovery, but their experience drops significantly during checkout, especially when they realize it is a subscription.",
                ]}
              />
              <Slideshow slides={JOURNEY_SLIDES} alt="Journey map slide" />

              <div className="flex w-full flex-col gap-2.5 tablet:flex-row">
                <div className="flex flex-1 flex-col gap-2.5 py-[7px]">
                  <p className="ts-body-large-fluid">Product Purchase Flow</p>
                  <Image
                    src="/case/M7aLJj0ice1Acd6O9dArLQyET0.jpg"
                    alt="The product purchase flow"
                    width={1400}
                    height={900}
                    sizes="600px"
                    className="h-auto w-full rounded-[20px]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2.5">
                  <p className="ts-body-large-fluid">Service sign up flow</p>
                  <Image
                    src="/case/kLxue3vInOHnU1O9CIjvU1sNOU.jpg"
                    alt="The mindfulness service sign-up flow"
                    width={1400}
                    height={900}
                    sizes="600px"
                    className="h-auto w-full rounded-[20px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2.5 pt-[90px]">
            <h3 className="ts-heading-5 w-full text-left">Usability Testing</h3>
            <div className="flex w-full flex-col gap-[30px]">
              <Paragraphs
                items={[
                  "Based on this journey map we identified potential pain points in the user experience.",
                  "To validate these assumptions, we conducted usability testing on two key flows.",
                ]}
              />
              <div className="flex w-full flex-col gap-10 tablet:flex-row">
                <div className="flex flex-1 flex-col gap-2.5">
                  <h4 className="ts-heading-6">
                    Flow 1: Purchase &amp; Checkout
                  </h4>
                  <p className="ts-body">
                    Goal: Evaluate trust, clarity, and decision-making
                  </p>
                  <p className="ts-body">We tested:</p>
                  <BulletList items={FLOW_ONE} />
                </div>
                <div className="flex flex-1 flex-col gap-2.5">
                  <h4 className="ts-heading-6">
                    Flow 2: Mindfulness Service Sign-Up
                  </h4>
                  <p className="ts-body">
                    Goal: Evaluate understanding and perceived value
                  </p>
                  <p className="ts-body">We tested:</p>
                  <BulletList items={FLOW_TWO} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2.5 pt-[90px]">
            <h3 className="ts-heading-5 w-full text-left">Pain points</h3>
            <p className="ts-body">
              Through the usability testing, we identified several key issues…
            </p>
            {/* Framer draws these as one flat picture of three cards, which on a
                phone came to 342px wide and 78 tall with the type inside it
                unreadable. They are the cards the Taipei page builds the same
                three points from: stacked one to a row below 810, across from
                there, and real text at every size. */}
            <div className="flex w-full flex-col gap-[9px] tablet:flex-row">
              {PAIN_POINTS.map((point) => (
                <div
                  key={point.number}
                  className="flex flex-1 flex-col gap-3 rounded-[20px] border border-grey-100 px-5 py-6 tablet:gap-[25px] tablet:px-[30px] tablet:py-10"
                >
                  <p className="ts-heading-5 font-bold">{point.number}</p>
                  <p className="ts-body font-semibold">{point.title}</p>
                </div>
              ))}
            </div>
          </div>
        </CaseSection>

        <section
          id="redesign-details"
          className="flex w-full flex-col gap-[60px]"
        >
          <div className="flex w-full flex-col gap-[30px]">
            <div className="flex w-full flex-col gap-2.5">
              <h2 className="ts-heading-3 w-full text-left text-grey-200">
                Solutions
              </h2>
              {/* The section's umbrella statement, so it sits between the
                  title above it and the numbered solutions under it: 36 against
                  55 and 24 on a desktop, the scale's own steps. It used to be
                  the smallest of the three, which read as though each solution
                  outranked the sentence introducing all of them. */}
              <h3 className="ts-heading-5 w-full text-left">
                Making the experience clear, transparent, and trustworthy
              </h3>
              <div className="flex w-full flex-col gap-2">
                <h3 className="ts-heading-6 w-full text-left">
                  1. Simplified UI to reduce cognitive load
                </h3>
                <Paragraphs
                  items={[
                    "The biggest drop in the user journey occurred when users were overwhelmed by excessive information and promotional elements like countdown timers.",
                    "To address this, we reduced visual clutter and unnecessary promotions, helping users focus on the most relevant information and better understand what they are viewing.",
                  ]}
                />
              </div>
            </div>
            <VideoBlock src="/case/mqjuuhwCqzIUFccvoCN3Y9wm0eo.mp4" />
          </div>

          <div className="flex w-full flex-col gap-[59px]">
            <div className="flex w-full flex-col gap-[30px]">
              <div className="flex w-full flex-col gap-5">
                <div className="flex w-full flex-col gap-2">
                  <h3 className="ts-heading-6 w-full text-left">
                    2. Redesigning the checkout flow to provide transparency to
                    the subscription model
                  </h3>
                  <Paragraphs
                    items={[
                      "Many users did not realize they were subscribing until reaching the checkout—or even after completing the purchase.",
                      "The subscription model was not clearly communicated. Key details were hidden in small text or secondary areas, and the CTA did not indicate that the purchase was a recurring subscription.",
                      "As a result, users often misunderstood the purchase as a one-time transaction, leading to confusion and loss of trust.",
                      "To address this, we focused on making the subscription model more explicit and visible throughout the flow.",
                    ]}
                  />
                  <ul className="flex w-full list-disc flex-col gap-1 pl-5">
                    <li className="ts-body">
                      Changed the CTA to{" "}
                      <strong className="font-semibold">“Subscription”</strong>{" "}
                      to clearly communicate the purchase type
                    </li>
                    <li className="ts-body">
                      Reworded the subscription details to explicitly state it
                      is a{" "}
                      <strong className="font-semibold">
                        monthly recurring charge
                      </strong>
                    </li>
                    <li className="ts-body">
                      Clearly surfaced a{" "}
                      <strong className="font-semibold">
                        “Monthly Subscription” section in the cart
                      </strong>{" "}
                      to reinforce the model before checkout
                    </li>
                  </ul>
                  <p className="ts-body">
                    These changes help users better understand what they are
                    purchasing and reduce the risk of unintended subscriptions.
                  </p>
                </div>
              </div>
              <VideoBlock src="/case/Kr0Uqxgh9UPW3BZBC6FJDia9dtg.mp4" />
            </div>
          </div>

          <div className="flex w-full flex-col gap-[55px]">
            <div className="flex w-full flex-col gap-9">
              <div className="flex w-full flex-col gap-2">
                <h3 className="ts-heading-6 w-full text-left">
                  3. Providing decision autonomy and information privacy
                </h3>
                <Paragraphs
                  items={[
                    "In the mindfulness flow, the biggest drop occurred when users realized the service was a texting service rather than an app.",
                    "Users were also required to provide unnecessary personal information and agree to marketing communication, which made the experience feel intrusive and frustrating.",
                    "In our redesign, we focused on improving transparency and giving users more control.",
                    "We clarified how the service works, reduced the amount of required information, and made marketing opt-in optional.",
                    "This creates a more transparent and respectful experience, helping users feel more comfortable signing up.",
                  ]}
                />
              </div>
              <VideoBlock src="/case/f0IA8qWnY5cftwc7u2QBcaUUB2s.mp4" />
            </div>
          </div>
        </section>

        <CaseSection id="result-impact" title="Result & Impact" gap={10}>
          <h3 className="ts-heading-6 w-full text-left">
            Validating the Redesign
          </h3>
          <Paragraphs
            items={[
              "We conducted A/B testing with 5 users to evaluate the impact of our redesign.",
              "Each participant interacted with both the current website and our redesigned prototype. Afterward, we asked them to rate their levels of confusion, trust, and their likelihood to recommend or discourage others from purchasing for each version.",
            ]}
          />
          <Reveal className="w-full pt-6">
            <Image
              src="/case/ww7dfiuEeuIGqmwsNcJrvgZPEE.png"
              alt="A/B testing results comparing the current site with the redesign"
              width={2000}
              height={1200}
              sizes="1200px"
              className="h-auto w-full rounded-[20px]"
            />
          </Reveal>
        </CaseSection>

        <CaseSection title="Next Steps" gap={10}>
          <div className="flex w-full flex-col gap-[29px]">
            <Paragraphs
              items={[
                "For next steps, we prioritized solutions based on feasibility, user impact, and business goals.",
                "First, we would remove countdown timers and excessive promotions. This is low effort and helps build trust.",
                "Second, we would clarify the subscription model through improved wording and CTA, which has high impact on transparency.",
                "Third, we would redesign the homepage to better highlight the product and brand, creating long-term value.",
                "Lastly, we would redesign the mindfulness service page, which we deprioritized for now and plan to improve in the future.",
              ]}
            />
            <Reveal className="w-full">
              <Image
                src="/case/sWbImqiE0I1hv9hwbIiA8hBxU0.png"
                alt="What I learned from the Ryze Coffee redesign"
                width={2000}
                height={1200}
                sizes="1200px"
                className="h-auto w-full rounded-[20px]"
              />
            </Reveal>
          </div>
        </CaseSection>
      </div>
    </CaseShell>
  );
}
