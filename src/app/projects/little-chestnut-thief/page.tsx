import type { Metadata } from "next";

import {
  Banner,
  CaseHeader,
  CaseSection,
  Paragraphs,
} from "@/components/case/CaseParts";
import { CaseShell } from "@/components/case/CaseShell";
import type { MoreProjectCard } from "@/components/case/MoreProjects";

export const metadata: Metadata = {
  title: "Little Chestnut Thief — Anne Lin",
  description:
    "A boutique-style web store for chestnut-based desserts, a personal passion turned into a brand concept.",
};

const MORE: MoreProjectCard[] = [
  {
    href: "/projects/jubo-healthcare",
    category: "Web Development",
    title: "JUBO HEALTHCARE PLATFORM",
    description:
      "Built frontend modules for a senior care dashboard, reducing cognitive load and improving data visibility through close collaboration with designers and nurses.",
    image: "/case/OWmpqKnvk6IiDk3SNIkMzaYwrw.jpg",
  },
  {
    href: "/projects/taipei-metro-app",
    category: "UI/UX Design",
    title: "TAIPEI METRO GO APP REDEISGN ",
    description:
      "Reimagining Metro Points to make rewards visible, understandable, and part of everyday commuting.",
    image: "/case/d9Agr8f5b1nw4pglAkV8JRPdZgc.jpg",
  },
];

export default function LittleChestnutThiefPage() {
  return (
    <CaseShell
      more={MORE}
      pageTop={60}
      bodyPad={120}
      bodyGap={31}
      moreBottom={120}
    >
      <CaseHeader
        category="Graphic Design"
        title="Little Chestnut Thief"
        description="Designed a boutique-style web store for chestnut-based desserts — a personal passion turned into a brand concept. "
        titleGap={20}
        meta={[
          { label: "Client", value: "Personal Project" },
          { label: "Role", value: "UIUX designer" },
          { label: "Year", value: "2025" },
          { label: "Duration", value: "4 weeks" },
        ]}
      />

      <div className="flex w-full flex-col gap-20">
        <Banner
          src="/case/XoA9GzMoPNV9ZWiVKe277xixE.jpg"
          alt="Two pages of the Little Chestnut Thief web store, showing the home page and the cakes collection"
          height={527}
          priority
        />

        <CaseSection title="OVERVIEW" gap={40}>
          <Paragraphs
            items={[
              "I’ve always had a deep love for chestnuts! The flavor, the warmth, the nostalgia. Every time I see a chestnut dessert, I just can’t help but get one for myself. Whether it’s chestnut cream cakes, roasted kuri, or handmade jam, these little treats always bring me joy!",
              "Inspired by this passion, I started a brand concept called “Little Chestnut Thief.” Opening a chestnut-themed dessert shop has always been my dream, and before it becomes a reality, I wanted to take the first step by designing a website for it.",
              "I imagine a cozy boutique bakery selling all kinds of chestnut desserts, made with locally grown American chestnuts, and I’m so excited to see this dream start to take shape!",
            ]}
          />
        </CaseSection>

        <CaseSection title="Design Process" gap={40}>
          <Paragraphs
            items={[
              "This project was all about bringing that vision to life through thoughtful design.",
              "I began by crafting a playful yet elegant logo featuring a squirrel mascot, paired with cozy autumn tones to capture the charm of small-batch chestnut desserts. I built a color palette around chestnut browns, forest greens, and soft creams to create a warm, earthy feel, and of course, I couldn’t resist adding my favorite touch: a cheerful blue ribbon!",
              "To shape the user experience, I designed a clear and simple information architecture that mirrors the feeling of browsing in a cozy neighborhood bakery. The interface is easy to explore, with intuitive access to collections like cakes, spreads, and seasonal specials.",
              "From the homepage layout to product cards and little micro-interactions, every detail was thoughtfully designed to make the online experience feel just as comforting and delightful as walking into a real shop.",
            ]}
          />
        </CaseSection>

        <CaseSection title="Deliverable" gap={40}>
          <Banner
            src="/case/1nbtGdwKuMThEe1frjcnG2HCoB4.jpg"
            alt="The full Little Chestnut Thief store design, from the home page through to product listings"
            height="auto"
          />
          <Banner
            src="/case/c5mNLu4sjy0uHEo8klF47U8c3MA.jpg"
            alt="Further pages of the Little Chestnut Thief store design"
            height="auto"
          />
        </CaseSection>
      </div>
    </CaseShell>
  );
}
