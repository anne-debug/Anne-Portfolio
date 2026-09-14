import type { Metadata } from "next";
import Image from "next/image";

import {
  Banner,
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
import type { MoreProjectCard } from "@/components/case/MoreProjects";

export const metadata: Metadata = {
  title: "Ryze Coffee Web Redesign — Anne Lin",
  description:
    "Redesigning with user trust and autonomy for long-term retention.",
};

const MORE: MoreProjectCard[] = [
  {
    href: "/projects/jubo-healthcare",
    category: "Web Development",
    title: "Jubo Heallthcare Platform",
    description:
      "Built frontend modules for a senior care dashboard, reducing cognitive load and improving data visibility through close collaboration with designers and nurses.",
    image: "/case/OWmpqKnvk6IiDk3SNIkMzaYwrw.jpg",
  },
  {
    href: "/projects/little-chestnut-thief",
    category: "Graphic Design",
    title: "Little Chestnut THief",
    description:
      "Designed a boutique-style web store for chestnut-based desserts — a personal passion turned into a brand concept. ",
    image: "/case/XoA9GzMoPNV9ZWiVKe277xixE.jpg",
  },
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
    items: ["Reworded CTA (e.g., “Subscription”)", "Clearly stated recurring payment details"],
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
      more={MORE}
      canvasWidth={1440}
      bodyWidth={1200}
      bodyGap={50}
      pageTop={60}
      bodyPad={120}
      moreBottom={120}
    >
      {/* Hero: the cover and its glow both overhang the column to the right */}
      {/* The glow overhangs the column by design, so the stage clips it */}
      <div className="relative w-full overflow-hidden pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -z-10 rounded-full"
          style={{
            right: -120,
            bottom: -19,
            width: 976,
            height: 623,
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(184, 66, 7, 0.48) 0%, rgba(255, 255, 255, 0.48) 100%)",
          }}
        />
        <CaseHeader
          category="UI / UX Design"
          title="Ryze Coffee WEB Redesign"
          description="Redesigning with user trust and autonomy for long-term retention"
          titleGap={20}
          meta={[
            { label: "Client", value: "Ryze coffee (Coursework Project)" },
            { label: "Role", value: "UIUX designer/ Researcher" },
            { label: "Team", value: "Anne Lin, Tuyara Chinbat" },
            { label: "Duration", value: "4 weeks (2026)" },
          ]}
        />
        <Reveal className="mt-8 w-full">
          <div className="relative mx-auto h-[447px] w-full max-w-[967px] overflow-hidden rounded-[20px]">
            <Image
              src="/case/TgcH0WP5wCamtgc6Wja3z3NQVE.png"
              alt="The redesigned Ryze Coffee home page"
              fill
              sizes="967px"
              className="object-cover"
              priority
            />
          </div>
        </Reveal>
      </div>

      <div className="flex w-full flex-col gap-[90px]">
        <CaseSection title="Project context" gap={10}>
          <Paragraphs
            items={[
              "Ryze is a fast-growing wellness brand known for its mushroom coffee, which has gained popularity largely through social media and word of mouth.",
              "However, while the product itself is appealing, the website experience does not reflect the same level of trust and clarity. Many users visit the site looking for a healthier coffee alternative, but struggle to understand the product, the purchase model, and the overall value.",
              "This project focuses on redesigning key user flows to improve trust, transparency, and decision-making, ultimately supporting long-term customer retention.",
            ]}
          />
        </CaseSection>

        <CaseSection title="Problem" gap={40}>
          <div className="flex w-full flex-col gap-[42px]">
            {PROBLEMS.map((problem) => (
              <Reveal key={problem.title} className="w-full">
                <div
                  className={`flex w-full flex-col items-center gap-10 tablet:flex-row ${
                    problem.imageFirst ? "tablet:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex flex-1 flex-col gap-2.5">
                    <h3 className="ts-heading-5">{problem.title}</h3>
                    <p className="ts-body">{problem.body}</p>
                  </div>
                  <div className="relative w-full tablet:w-[60%]">
                    <Image
                      src={problem.image}
                      alt={problem.title}
                      width={1400}
                      height={900}
                      sizes="700px"
                      className="h-auto w-full"
                    />
                  </div>
                </div>
              </Reveal>
            ))}

            <div className="flex w-full flex-col gap-2.5">
              <h3 className="ts-heading-5">🚫 Overall Impact</h3>
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
            <p className="ts-body">The problem statement that guided this project was:</p>
            <Banner
              src="/case/L45GPIPkSSVXj1s0K0WvoiJaw.png"
              alt="How might we reduce deceptive patterns and cognitive overload to build trust and help users feel in control when making a purchase decision, while still supporting business goals?"
              height="auto"
            />
          </div>
        </CaseSection>

        <CaseSection title="My role" gap={10}>
          <p className="ts-body">
            In this project, I led the redesign of{" "}
            <strong className="font-semibold">
              Product page, shopping cart and Hero Section on the home Page
            </strong>
          </p>
          <p className="ts-body font-semibold">Key responsibilities:</p>
          <StarPointList
            points={[
              { title: "Identified usability issues related to trust, clarity, and subscription transparency" },
              { title: "Translated research insights into design solutions that reduce cognitive load and improve decision-making" },
              { title: "Improved information hierarchy and CTA clarity to better communicate product " },
              { title: "Collaborated on usability testing and iterated designs based on user feedback and behavioral insights" },
            ]}
          />
        </CaseSection>

        <CaseSection title="Solutions" gap={10}>
          <h3 className="ts-heading-3b w-full text-left">
            Redesigned the experience with a focus on clarity, transparency, and user autonomy
          </h3>
          <div className="w-full p-[30px]">
            <StarPointList points={SOLUTION_POINTS} columns={2} bold />
          </div>
          <p className="ts-body-medium-bold">Explore our Prototype here🔗 </p>
          <SkipButton href="#redesign-details" label="skip to Redesign Details" />
        </CaseSection>

        <CaseSection title="Research Process" gap={10}>
          <div className="flex w-full flex-col gap-2.5">
            <h3 className="ts-heading-3b w-full text-left">target user</h3>
            <p className="ts-body">
              Health-conscious individuals who are looking for a healthier alternative to
              coffee and are interested in improving their daily wellness habits.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2.5 pt-[90px]">
            <h3 className="ts-heading-3b w-full text-left">PersonA</h3>
            <Paragraphs
              items={[
                "Before jumping into the design, we wanted to understand our users better.",
                "So we created a persona to represent our target user. This helped us identify key pain points and opportunities for improvement.",
              ]}
            />
            <Reveal className="w-full">
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
            <h3 className="ts-heading-3b w-full text-left">Journey Mapping</h3>
            <div className="flex w-full flex-col gap-[25px]">
              <Paragraphs
                items={[
                  "Based on this persona, we mapped out the user journey and identified key moments in the experience, including the peak and the pit.",
                  "Users feel excited during product discovery, but their experience drops significantly during checkout, especially when they realize it is a subscription.",
                ]}
              />
              <Slideshow slides={JOURNEY_SLIDES} height={600} alt="Journey map slide" />

              <div className="flex w-full flex-col gap-2.5 tablet:flex-row">
                <div className="flex flex-1 flex-col gap-2.5 py-[7px]">
                  <p className="ts-body-large">Product Purchase Flow</p>
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
                  <p className="ts-body-large">Service sign up flow</p>
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
            <h3 className="ts-heading-3b w-full text-left">Usability Testing</h3>
            <div className="flex w-full flex-col gap-[30px]">
              <Paragraphs
                items={[
                  "Based on this journey map we identified potential pain points in the user experience.",
                  "To validate these assumptions, we conducted usability testing on two key flows.",
                ]}
              />
              <div className="flex w-full flex-col gap-10 tablet:flex-row">
                <div className="flex flex-1 flex-col gap-2.5">
                  <h4 className="ts-heading-6-small">Flow 1: Purchase &amp; Checkout</h4>
                  <p className="ts-body">Goal: Evaluate trust, clarity, and decision-making</p>
                  <p className="ts-body">We tested:</p>
                  <BulletList items={FLOW_ONE} />
                </div>
                <div className="flex flex-1 flex-col gap-2.5">
                  <h4 className="ts-heading-6-small">Flow 2: Mindfulness Service Sign-Up</h4>
                  <p className="ts-body">Goal: Evaluate understanding and perceived value</p>
                  <p className="ts-body">We tested:</p>
                  <BulletList items={FLOW_TWO} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2.5 pt-[90px]">
            <h3 className="ts-heading-3b w-full text-left">Pain points</h3>
            <p className="ts-body">
              Through the usability testing, we identified several key issues…
            </p>
            <Reveal className="w-full">
              <Image
                src="/case/d7NfVDFgWnynAYPidIExAlDe0.png"
                alt="The pain points identified during usability testing"
                width={2000}
                height={1200}
                sizes="1200px"
                className="h-auto w-full rounded-[20px] p-[5px]"
              />
            </Reveal>
          </div>
        </CaseSection>

        <section id="redesign-details" className="flex w-full flex-col gap-[60px]">
          <div className="flex w-full flex-col gap-[30px]">
            <div className="flex w-full flex-col gap-2.5">
              <h2 className="ts-heading-2 w-full text-left text-grey-200">SOLUTIONS</h2>
              <h3 className="ts-heading-3b w-full text-left">
                MAKING THE EXPERIENCE CLEAR, TRANSPARENT, AND TRUSTWORTHY
              </h3>
              <div className="flex w-full flex-col gap-2">
                <h3 className="ts-heading-3 w-full text-left">
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
                  <h3 className="ts-heading-3 w-full text-left">
                    2. Redesigning the checkout flow to provide transparency to the
                    subscription model
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
                      Changed the CTA to <strong className="font-semibold">“Subscription”</strong> to
                      clearly communicate the purchase type
                    </li>
                    <li className="ts-body">
                      Reworded the subscription details to explicitly state it is a{" "}
                      <strong className="font-semibold">monthly recurring charge</strong>
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
                    These changes help users better understand what they are purchasing and
                    reduce the risk of unintended subscriptions.
                  </p>
                </div>
              </div>
              <VideoBlock src="/case/Kr0Uqxgh9UPW3BZBC6FJDia9dtg.mp4" />
            </div>
          </div>

          <div className="flex w-full flex-col gap-[55px]">
            <div className="flex w-full flex-col gap-9">
              <div className="flex w-full flex-col gap-2">
                <h3 className="ts-heading-3 w-full text-left">
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

        <CaseSection title="RESULT & IMPACT " gap={10}>
          <h3 className="ts-heading-3 w-full text-left">Validating the Redesign</h3>
          <Paragraphs
            items={[
              "We conducted A/B testing with 5 users to evaluate the impact of our redesign.",
              "Each participant interacted with both the current website and our redesigned prototype. Afterward, we asked them to rate their levels of confusion, trust, and their likelihood to recommend or discourage others from purchasing for each version.",
            ]}
          />
          <Reveal className="w-full">
            <Image
              src="/case/ww7dfiuEeuIGqmwsNcJrvgZPEE.png"
              alt="A/B testing results comparing the current site with the redesign"
              width={2000}
              height={1200}
              sizes="1200px"
              className="h-auto w-full"
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
                className="h-auto w-full"
              />
            </Reveal>
          </div>
        </CaseSection>
      </div>
    </CaseShell>
  );
}
