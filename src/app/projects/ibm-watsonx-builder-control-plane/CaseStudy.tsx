import {
  CaseHeader,
  CaseSection,
  SubHeading,
} from "@/components/case/CaseParts";
import { CaseShell } from "@/components/case/CaseShell";
import { SidebarNav, type SidebarEntry } from "@/components/case/SidebarNav";

/**
 * The IBM case study itself, rendered only once the server has granted access.
 *
 * It is a separate module from the route for a reason: `page.tsx` returns the
 * password screen without ever calling this, so nothing below reaches a visitor
 * who has not passed the gate.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * This is a scaffold. Every section below is a real section in the portfolio's
 * own system — the same `CaseShell`, `CaseHeader`, `CaseSection`, `SubHeading`
 * and rail the other case studies use — with its content left to be written.
 * Nothing here states a finding, a number, a quote or an outcome, because none
 * was supplied, and inventing them for an internship case study is the one
 * thing worth getting wrong twice.
 *
 * To fill it in: replace each `<Scaffold />` with the section's content, using
 * `Paragraphs`, `StarPointList`, `Banner`, `VideoBlock`, `Slideshow`,
 * `ProblemStatement` and the rest from `@/components/case`. Drop any section
 * that turns out not to apply, and take its entry out of SECTIONS below.
 * Read CASE_STUDY_DESIGN_SYSTEM.md first.
 * ──────────────────────────────────────────────────────────────────────────
 */

/**
 * This page's own rail; see CASE_STUDY_NAV_RULES.md.
 *
 * Eleven phases, not every heading. Key Findings sits inside the research phase
 * and gets no entry of its own — rule 3, UX research is always one item — and
 * Notifications, Workspace Collaboration and Control Plane Experience are the
 * three parts of Design Breakdown rather than three phases beside it. All four
 * keep their ids for deep links; an id does not earn a rail entry.
 */
const SECTIONS: SidebarEntry[] = [
  { id: "overview", label: "Overview" },
  { id: "project-context", label: "Project Context" },
  { id: "my-role", label: "My Role" },
  { id: "problem", label: "Problem" },
  { id: "user-research", label: "User Research" },
  { id: "design-goals", label: "Design Goals" },
  { id: "solution-overview", label: "Solution Overview" },
  { id: "design-breakdown", label: "Design Breakdown" },
  { id: "prototyping", label: "Prototyping" },
  { id: "impact", label: "Impact" },
  { id: "reflection", label: "Reflection" },
];

/** A section with its content still to come. Delete as each one is written. */
function Scaffold({ note }: { note: string }) {
  return <p className="ts-body w-full text-left text-light-grey">{note}</p>;
}

export function CaseStudy() {
  return (
    <CaseShell
      current="ibm-watsonx-builder-control-plane"
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
          category="Enterprise AI · UX Design"
          title="IBM watsonx Builder Control Plane"
          titleGap={20}
          description="Work completed during my IBM internship."
          /* Client is the one fact in hand. The rest are to be filled in; they
             are not guessed. Add `media={...}` here when there is hero artwork,
             and the header becomes the two-column shape Metro and Ryze use. */
          meta={[
            { label: "Client", value: "IBM" },
            { label: "Role", value: "To be added" },
            { label: "Team", value: "To be added" },
            { label: "Duration", value: "To be added" },
          ]}
        />
      </div>

      {/* The rule the other case studies draw under their heroes. */}
      <span className="h-px w-full bg-grey-100" aria-hidden />

      <div className="flex w-full flex-col gap-[90px]">
        <CaseSection id="overview" title="Overview">
          <Scaffold note="A short summary of the project and what it set out to do." />
        </CaseSection>

        <CaseSection id="project-context" title="Project context">
          <Scaffold note="Where this work sat: the product, the team around it, and why it was picked up." />
        </CaseSection>

        <CaseSection id="my-role" title="My role">
          <Scaffold note="What you owned, who you worked with, and what you actually made." />
        </CaseSection>

        <CaseSection id="problem" title="Problem & opportunity">
          <Scaffold note="The problem the work addressed, and the opening it created." />
        </CaseSection>

        {/* The research phase. One rail entry points at this section; the
            headings inside it are subsections, not phases. */}
        <CaseSection id="user-research" title="User research" gap={40}>
          <div className="flex w-full flex-col gap-10">
            <div className="flex w-full flex-col gap-2.5">
              <Scaffold note="How the research was run, with whom, and over what period." />
            </div>

            <div id="key-findings" className="flex w-full flex-col gap-2.5">
              <SubHeading title="Key findings" />
              <Scaffold note="What the research showed. Leave this empty rather than approximating it." />
            </div>
          </div>
        </CaseSection>

        <CaseSection id="design-goals" title="Design goals">
          <Scaffold note="The goals the findings pointed to, and how success was framed." />
        </CaseSection>

        <CaseSection id="solution-overview" title="Solution overview">
          <Scaffold note="The shape of the solution in one pass, before the detail below." />
        </CaseSection>

        {/* The three parts of the design work. Subsections of one phase. */}
        <CaseSection id="design-breakdown" title="Design breakdown" gap={40}>
          <div className="flex w-full flex-col gap-[90px]">
            <div id="notifications" className="flex w-full flex-col gap-2.5">
              <SubHeading title="Notifications" />
              <Scaffold note="The notification work: what it had to do and how it was designed." />
            </div>

            <div
              id="workspace-collaboration"
              className="flex w-full flex-col gap-2.5"
            >
              <SubHeading title="Workspace collaboration" />
              <Scaffold note="How people share and work alongside each other in a workspace." />
            </div>

            <div
              id="control-plane-experience"
              className="flex w-full flex-col gap-2.5"
            >
              <SubHeading title="Control plane experience" />
              <Scaffold note="The control plane itself: what it surfaces and how it is navigated." />
            </div>
          </div>
        </CaseSection>

        <CaseSection id="prototyping" title="Prototyping & implementation">
          <Scaffold note="What was prototyped, what was built, and how the two met." />
        </CaseSection>

        <CaseSection id="impact" title="Impact & outcome">
          <Scaffold note="What changed as a result. Only what can be stated and shared." />
        </CaseSection>

        <CaseSection id="reflection" title="Reflection">
          <Scaffold note="What you took from the project and what you would do differently." />
        </CaseSection>
      </div>
    </CaseShell>
  );
}
