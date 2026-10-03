import type { Metadata } from "next";

import {
  Banner,
  CaseHeader,
  CaseSection,
  Paragraphs,
  SkillsRow,
  SubHeading,
} from "@/components/case/CaseParts";
import { CaseShell } from "@/components/case/CaseShell";
import { SidebarNav, type SidebarEntry } from "@/components/case/SidebarNav";
import { LaptopMockup } from "@/components/case/LaptopMockup";

export const metadata: Metadata = {
  title: "Jubo Healthcare Platform — Anne Lin",
  description:
    "Built frontend modules for a healthcare dashboard used in senior care facilities.",
};

/** This page's own sections; see CASE_STUDY_NAV_RULES.md. */
const SECTIONS: SidebarEntry[] = [
  { id: "overview", label: "Overview" },
  { id: "my-role", label: "My Role" },
  { id: "development-process", label: "Development Process" },
  { id: "reflection", label: "Reflection" },
];

const SKILLS = [
  { name: "HTML", icon: "/case/Ur7CBU42qb5WP0bPckxIJIGn6g.svg" },
  { name: "CSS", icon: "/case/nTruLLI8s7a65vHwSD1gRsc6Wc.svg" },
  { name: "React", icon: "/case/nRK40rqzPPpriZSo9MhckTVXTUY.svg" },
  { name: "TypeScript", icon: "/case/JBV2LUOox3L1gJXqijRHZuuRids.svg" },
];

export default function JuboHealthcarePage() {
  return (
    <CaseShell
      current="jubo-healthcare"
      sidebar={<SidebarNav entries={SECTIONS} />}
      bodyPadX={40}
      moreVariant="compact"
      pageTop={60}
      bodyPad={120}
      moreBottom={120}
    >
      <CaseHeader
        category="Web Development"
        title="Jubo Healthcare Platform"
        titleGap={20}
        description="Designed frontend modules for a senior care platform to streamline medical record input and improve patient data visibility across devices."
        meta={[
          { label: "Client", value: "Jubo" },
          { label: "Role", value: "Frontend Developer" },
          { label: "Year", value: "2024" },
          { label: "Duration", value: "8 months" },
        ]}
        media={
          <LaptopMockup
            screen="/case/OWmpqKnvk6IiDk3SNIkMzaYwrw.jpg"
            alt="The Jubo healthcare dashboard showing a resident's assessment records"
            sizes="(width < 810px) 92vw, 560px"
            priority
          />
        }
      />

      {/* The rule Metro and BudgetCart draw under their heroes. */}
      <span className="h-px w-full bg-grey-100" aria-hidden />

      <SkillsRow skills={SKILLS} />

      <CaseSection id="overview" title="Overview">
        <Paragraphs
          items={[
            "A health tracking tool built for rural caregivers, grounded in real care routines and daily use.",
            "The Jubo healthcare platform is created for elderly residents in rural Taiwan, where access to medical services is often limited. It pairs wearable devices with routine caregiver check-ins to deliver ongoing, personalized care. In this project, I worked on building the part of the system that helps caregivers track and report what they observe during home visits. ",
          ]}
        />
      </CaseSection>

      <CaseSection id="my-role" title="My Role">
        <Paragraphs
          items={[
            "I collaborated closely with designers and nurses to translate real caregiving workflows into a practical digital experience. My focus was the design and implementation of the metrics and feedback interface, where I developed nine streamlined health assessment forms and one comprehensive evaluation form using React and Material UI. To keep form sessions consistent and reliable, I used Zustand and React hooks such as useState and useEffect to manage state and ensure each visit started fresh.",
          ]}
        />
      </CaseSection>

      <CaseSection
        id="development-process"
        title="Development Process"
        gap={10}
      >
        <SubHeading
          title="Agile Workflow & Iteration"
          lede="Shaped by real caregiver feedback, week by week"
        />
        <Paragraphs
          items={[
            "Beyond just building forms, I played a key role in bringing user feedback into our development cycle. We worked in weekly sprints, continuously refining the interface and function based on real input from caregivers. Each round of updates reflected how the tool was actually being used in the field, which helped us stay responsive and make meaningful improvements week by week.",
          ]}
        />

        <div className="h-10" aria-hidden />

        <SubHeading
          title="Data Visualization"
          lede="Helping caregivers notice what matters"
        />
        <Paragraphs
          items={[
            "To help caregivers and researchers quickly spot trends, I integrated Recharts to visualize data like sleep hours, heart rate, and blood pressure. The goal was to make the data instantly readable, so caregivers could catch important trends at a glance, even during a quick check-in.",
          ]}
        />

        <div className="pt-5">
          <Banner
            src="/case/C43uWuxaA0RRm2fWLU2DnL1qmU.jpg"
            alt="Charts in the Jubo dashboard plotting blood pressure and heart rate over time"
            height="auto"
          />
        </div>
      </CaseSection>

      <CaseSection id="reflection" title="Reflection">
        <Paragraphs
          items={[
            "This project taught me how to quickly adapt to the fast, iterative rhythm of agile development. At first, I felt a bit overwhelmed by the weekly sprint cycles, but I soon realized how valuable they were for building something that actually worked for real people, and I gradually became comfortable with the pace. ",
            "Constantly gathering feedback, testing ideas, and refining small pieces over time helped us stay aligned with users’ needs and avoid overbuilding. In the end, I gained more than just technical experience but also developed a stronger understanding of user-centered design and how it fits into real-world development cycles.",
            "Beyond just building forms, I played a key role in bringing user feedback into our development cycle. We worked in weekly sprints, continuously refining the interface and function based on real input from caregivers. Each round of updates reflected how the tool was actually being used in the field, which helped us stay responsive and make meaningful improvements week by week.",
          ]}
        />
      </CaseSection>
    </CaseShell>
  );
}
