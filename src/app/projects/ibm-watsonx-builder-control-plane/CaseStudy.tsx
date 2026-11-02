import Image from "next/image";

import { Reveal } from "@/components/case/CaseExtras";
import {
  ResearchInsights,
  type ResearchInsight,
} from "@/components/case/ResearchInsights";
import {
  ResearchSnapshot,
  type ResearchStat,
} from "@/components/case/ResearchSnapshot";
import {
  DesignIterationShowcase,
  type DesignArea,
} from "@/components/case/DesignIterationShowcase";
import {
  CaseSection,
  CategoryBadge,
  Paragraphs,
  SubHeading,
} from "@/components/case/CaseParts";
import { CaseShell } from "@/components/case/CaseShell";
import { IbmHeroArt } from "@/components/case/IbmHeroArt";
import { ProblemStatement } from "@/components/case/ProblemStatement";
import { SidebarNav, type SidebarEntry } from "@/components/case/SidebarNav";
import {
  StickyStepShowcase,
  type ShowcaseStep,
} from "@/components/case/StickyStepShowcase";
import { Zoomable } from "@/components/case/Zoomable";
import { AppearEffect } from "@/lib/framer-effects";

/**
 * The IBM case study itself, rendered only once the server has granted access.
 *
 * It is a separate module from the route for a reason: `page.tsx` returns the
 * password screen without ever calling this, so nothing below reaches a visitor
 * who has not passed the gate.
 *
 * ── Scope ─────────────────────────────────────────────────────────────────
 * Hero through Solution Overview. Research, Design Iteration, Final Design and
 * Outcomes come in a later phase, and the rail lists only what the page has —
 * CASE_STUDY_NAV_RULES.md, rule 4.
 *
 * ── Copy ──────────────────────────────────────────────────────────────────
 * Every sentence of visible prose on this page is the text Anne supplied,
 * verbatim. The brief allowed refining it; she then asked for her own words
 * instead, so nothing here is paraphrased, condensed or merged. Section and
 * sub-section headings are her headings. The only strings written here are the
 * ones a reader never reads as prose: image `alt` text and the figure captions
 * that mark the screenshots as fictional sample data.
 *
 * Keep it that way. If a line reads long or repeats, that is a question for
 * her, not an edit to make here.
 *
 * ── Accuracy ──────────────────────────────────────────────────────────────
 * Six weeks, five designers, an interactive prototype. It did not ship. Every
 * number, name and metric in the screenshots is the prototype's own fictional
 * sample data, which the captions say out loud. Nothing on this page claims
 * deployment, adoption, error reduction, task-completion improvement or
 * business impact, because none of that was measured. The five builder needs
 * come from the research playback (pp.11–16); no finding has been added to
 * them.
 *
 * ── Confidentiality (development note, not page copy) ─────────────────────
 * The screenshots are unreleased IBM UI. The route is password-gated and
 * `noindex`, but the image files themselves sit under `public/`, which is
 * served without the gate — an unlinked URL is not an access control. Anyone
 * holding a file path can fetch it. If that is not acceptable the assets need
 * to move behind an access-checked route or out of the repository; see
 * README-port.md.
 */

/**
 * IBM's interactive blue, which this page uses where the portfolio would
 * otherwise use its orange: the section rail, and nothing else. The site's own
 * nav pill stays orange, because it belongs to the site rather than to this
 * case study.
 */
const IBM_BLUE = "#0F62FE";

/**
 * This page's own rail; see CASE_STUDY_NAV_RULES.md.
 *
 * Five entries for the five headed sections, labelled with those headings.
 *
 * Three blocks on the page carry an id and no entry, which is the same rule
 * three times over: an id is for linking, a heading is what earns a line in
 * the rail. "Five Key Builder Needs" sits inside The Problem and "My Design
 * Ownership" inside My Role — blocks within a phase, not phases. The design
 * challenge is the third: it lost its heading, so it lost its entry, because
 * the entry would have named something no longer on the page.
 */
const SECTIONS: SidebarEntry[] = [
  { id: "overview", label: "Project Overview" },
  { id: "project-context", label: "Project Context" },
  { id: "problem", label: "The Problem" },
  { id: "my-role", label: "My Role" },
  { id: "solution-overview", label: "Solution Overview" },
  { id: "research", label: "Research" },
  { id: "design-iteration", label: "Design Process" },
];

/**
 * The facts under the title. Client leads: it is the one a reader scanning the
 * page wants first, and it names the product every other section talks about.
 *
 * Four of them, so they fall into a 2x2 block with Team's four names getting a
 * column of their own rather than one long line.
 */
const META: [string, string][] = [
  ["Client", "IBM watsonx Orchestrate"],
  ["Duration", "6 weeks"],
  ["Team", "Matt Golonka, Eden McPeek, Samika Agarwal, Sahithi Lingampalli"],
  ["My Role", "Product Designer & UX Researcher"],
];

/**
 * The Workflow Builder screenshot in Project Context.
 *
 * This is the shipping product, not the prototype — the one picture on the
 * page that is not the team's own work, which is why it carries a label.
 *
 * Cropped from the capture Anne supplied: the clipped window chrome at the
 * top, the minimap, the screen-recording bar and the empty canvas to their
 * left are all gone; the Flow nodes panel and the whole graph are not. The
 * capture it came from is kept whole beside it as `workflow-builder-full`.
 *
 * The top cut is row 40, not row 38. Rows 38 and 39 are the last two of the
 * dark window chrome, and at 2160px wide they drew a near-black hairline along
 * the top of the picture that ran straight past the rounded corners and read
 * as a stray frame stroke. The first row of the file is now pure white.
 *
 * `w` and `h` are the file's own pixels, so nothing is stretched.
 */
const WORKFLOW_BUILDER = {
  src: "/images/ibm/product/workflow-builder.f039db18.png",
  w: 2160,
  h: 1715,
  alt: "The watsonx Orchestrate Workflow Builder: a Flow nodes panel listing activities such as Decision, Logic block and User activity beside a canvas where a travel approval flow runs from a start node through a logic block into a branch, one path calling a Google Drive tool and both converging on a nested form sub-flow.",
};

/**
 * The needs the research surfaced, in the order the playback gives them.
 *
 * Deliberately not feature cards. These are what builders said they were
 * trying to do, and the layout keeps them as a read-down list with the number
 * and the need on the left and the plain statement on the right.
 */
const BUILDER_NEEDS: { number: string; title: string; body: string }[] = [
  {
    number: "01",
    title: "Return to Ongoing Work",
    body: "Quickly access recent agents, workflows, and tools.",
  },
  {
    number: "02",
    title: "Identify What Needs Attention",
    body: "See issues affecting the artifacts builders maintain.",
  },
  {
    number: "03",
    title: "Understand Failures",
    body: "Access execution details and error context to investigate problems.",
  },
  {
    number: "04",
    title: "Trace Artifact Relationships",
    body: "Understand dependencies across agents, workflows, and tools.",
  },
  {
    number: "05",
    title: "Interpret Performance",
    body: "View artifact-specific metrics and trends to identify potential issues.",
  },
];

/**
 * What Anne owned, and what the team made together.
 *
 * All three surfaces are listed now, Home included. It used to sit in a lede
 * above two cards for the other two, which left the one surface she did not
 * lead as the only one without a line of its own; as a third row the division
 * of labour reads off the list itself.
 *
 * Copy is Anne's, verbatim. One line each — the second sentence that used to
 * qualify the Metrics claim is not in the text she supplied for this pass.
 */
const OWNERSHIP: { area: string; body: string }[] = [
  {
    area: "Issues",
    body: "Led the exploration of how builders identify issues, understand their context, and investigate affected artifacts.",
  },
  {
    area: "Metrics",
    body: "Proposed and designed the final artifact-centric experience, introducing hierarchical navigation and search to help builders investigate related assets and monitor performance.",
  },
  {
    area: "Home",
    body: "Collaborated with the team on the Home experience.",
  },
];

/**
 * The three destinations the prototype came to, as the showcase's data.
 *
 * Order is Home, Issues, Metrics because that is the order the brief lists
 * them and the order they were built, not because a builder has to walk them
 * in sequence — the closing line under the showcase says so, and the control
 * is a tab list precisely so any one of them can be reached first.
 *
 * No pictures on this branch. Each step carried a capture of the prototype —
 * two screen recordings and a still — and `ShowcaseStep` still accepts them,
 * so restoring one is a matter of putting `imageSrc` and its dimensions back.
 * With none set the showcase drops its picture frame and the three steps are
 * read as copy; see `StickyStepShowcase`.
 */
const SHOWCASE: ShowcaseStep[] = [
  {
    id: "home",
    number: "01",
    title: "Home",
    subtitle: "Return to Work",
    description:
      "A starting point for recent work, shortcuts, and items needing attention.",
  },
  {
    id: "issues",
    number: "02",
    title: "Issues",
    subtitle: "Investigate Problems",
    description:
      "An investigation hub connecting issue severity, affected artifacts, execution details, and next steps.",
  },
  {
    id: "metrics",
    number: "03",
    title: "Metrics",
    subtitle: "Understand Performance",
    description:
      "An artifact-centric view of runs, error rates, latency, token use, and related assets.",
  },
];

/* -------------------------------------------------------------------------- */
/* Research                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Who the work was for.
 *
 * Two sentences and a persona, and deliberately no more. The persona slide
 * already carries the role, the responsibilities, the needs and the pain
 * points; setting the same material again as copy beside it would have the
 * reader read it twice and the page claim it twice.
 */
const TARGET_USER = [
  "Our primary users were builders who create, test, and maintain AI agents, workflows, tools, and other artifacts in watsonx Orchestrate.",
  "As their work becomes more interconnected, builders need to understand how artifacts relate to one another, investigate unexpected behavior, and monitor performance.",
];

/**
 * Betty the Builder, from IBM's Design Playback.
 *
 * Not in the repo yet — the file has not been supplied — so `TargetUser`
 * renders its copy on its own and takes the persona the moment one is passed.
 * It is a persona standing for the role, not somebody who was interviewed,
 * and nothing on the page should present her as a participant.
 *
 * To turn it on: put the slide under `public/images/ibm/research/` with the
 * content hash this repo names files by, then pass it to `<TargetUser />`.
 */
export interface PersonaAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/** What the study set out to learn, above the figures. */
const RESEARCH_OBJECTIVE =
  "Understanding how builders navigate, investigate, and monitor interconnected AI artifacts.";

/**
 * The two methods, as figures.
 *
 * Builders lead each breakdown because they are the subject of the project;
 * admins follow because the scope narrowed away from them, which the copy
 * underneath says in words.
 */
const RESEARCH_STATS: ResearchStat[] = [
  {
    value: "10",
    label: "Semi-structured Interviews",
    parts: [
      { label: "Builder", count: 8 },
      { label: "Admin", count: 2 },
    ],
  },
  {
    value: "13",
    label: "Survey Responses",
    parts: [
      { label: "Builder", count: 12 },
      { label: "Admin", count: 1 },
    ],
  },
];

/** What the study went looking for: the figures above in words. */
const RESEARCH_EXPLORED =
  "We explored how builders navigate their work, investigate failures, interpret performance data, and understand relationships between interconnected AI artifacts.";

/**
 * How wide the study was drawn, against how narrow the project became.
 *
 * Still plain body copy — a qualification, not an announcement, and a callout
 * would give it more voice than the findings it qualifies — but set in
 * `light-grey` so it reads as the aside it is. Not `grey-150`, which is the
 * small-label colour: at 16px on this background that is about 3:1 and short
 * of readable. `light-grey` comes out near 5.4:1, which is secondary and still
 * passes.
 */
const RESEARCH_SCOPE_NOTE =
  "Our research initially included both builders and administrators before the project narrowed its focus to the builder experience.";

/**
 * The three findings, in the order they build on each other: find the problem,
 * understand what happened, then see how it all fits together. Each carries
 * what was seen and what it asked the design to do — the second being the
 * reason the section is here at all.
 */
const RESEARCH_INSIGHT_LIST: ResearchInsight[] = [
  {
    id: "navigation",
    number: "01",
    theme: "Navigation",
    finding:
      "Builders need a clear path from issue detection to investigation.",
    body: [
      "Builders wanted to understand what went wrong, locate the affected artifact, and determine where to investigate next. Moving between disconnected views made it harder to maintain context.",
      "They needed to move naturally from identifying an issue \u2192 understanding its context \u2192 locating the affected artifact \u2192 taking action without piecing information together across disconnected views.",
    ],
    implication:
      "Connect issues, execution details, and affected artifacts so builders can investigate problems without losing context.",
  },
  {
    id: "reasoning",
    number: "02",
    theme: "Reasoning",
    finding: "Builders need to understand why agents behave the way they do.",
    body: [
      "Builders needed visibility into how agents reason, act, and collaborate to understand unexpected outcomes, validate behavior, and troubleshoot failures.",
      "For agentic systems, the result is only part of the story. Builders also need enough context about what happened along the way.",
    ],
    implication:
      "Surface execution traces and agent behavior alongside issue details to support troubleshooting.",
  },
  {
    id: "organization",
    number: "03",
    theme: "Organization",
    finding: "Complex agentic systems need an understandable structure.",
    body: [
      "Agentic work rarely happens within a single isolated artifact. Agents can interact with other agents, invoke tools, and participate in workflows. As these relationships become more complex, builders can lose sight of how execution moves through the system.",
      "Builders needed a clearer way to understand what is connected, what happened where, and how one component may have affected another.",
    ],
    implication:
      "Organize information around artifact relationships and execution paths so builders can navigate connected components.",
  },
];

/* -------------------------------------------------------------------------- */
/* Design Process & Iteration                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Three areas, three versions each, as they were actually drawn.
 *
 * No screenshots on this branch. Each version carried a capture of the
 * prototype and the Metrics V2.5 round carried four; the files are all still
 * under each area's `Iteration` folder, and `DesignIteration` still accepts
 * `imageSrc`, `shots` and `details`, so a version gets its picture back by
 * being given one. With none set the showcase renders the version's title and
 * reasoning and no frame.
 *
 * Copy is Anne's, kept as supplied — Home and Issues are her approved final
 * wording, Metrics is still the earlier draft and is being rewritten.
 *
 * The Metrics final carried a line saying the direction had not had usability
 * validation of its own. Anne took it out. Nothing left in the section claims
 * it was validated — `note` is still on `DesignIteration` if a qualification
 * is wanted on any version later.
 */
const DESIGN_AREAS: DesignArea[] = [
  {
    id: "home",
    label: "Home",
    subtitle: "From Fleet-Level Monitoring to Daily Workflows",
    iterations: [
      {
        id: "v1",
        version: "V1",
        title: "Fleet-Level Starting Point",
        description: [
          "Our initial concept assumed that builders needed an overview of their agents and other artifacts to monitor performance and identify potential issues.",
          "We brought fleet health, aggregate metrics, and artifact information together on the landing page to explore whether a centralized overview could help builders understand the overall state of their work.",
        ],
      },
      {
        id: "v2",
        version: "V2",
        title: "Refocusing on Daily Workflows",
        description: [
          "Usability testing revealed that builders wanted more control over their landing page and quicker access to their daily work.",
          "We introduced Quick Actions, allowing builders to pin workflows and tools for easier access. We also moved recent artifacts higher on the page to prioritize builders' daily work.",
          "The original Fleet Overview provided only high-level health indicators, offering limited insight into artifact performance. We expanded it with more detailed metrics and visualizations to help builders better understand fleet health and performance.",
        ],
      },
      {
        id: "final",
        version: "Final",
        title: "A Task-Oriented Home",
        description: [
          "Further feedback showed that the welcome message was too generic to help builders understand what needed attention. We made the number of critical issues more prominent so builders could immediately see how many problems required attention.",
          "Builders also preferred information about individual artifacts, while the fleet-wide metrics felt redundant with the dedicated Metrics page. We removed the Fleet Overview from the landing page and consolidated performance monitoring under Metrics.",
          "Finally, we renamed Overview to Home to reflect its new purpose as a starting point for daily work. The final design prioritizes pinned shortcuts, recent artifacts, and actionable issues, helping builders quickly return to their work and identify what needs attention.",
        ],
      },
    ],
  },
  {
    id: "issues",
    label: "Issues",
    subtitle: "From Alerts and Tickets to Issue Investigation",
    iterations: [
      {
        id: "v1",
        version: "V1",
        title: "Ticket-Oriented Investigation",
        description: [
          "Early research showed that builders needed to identify failures, understand affected artifacts, and investigate problems across interconnected agents and workflows.",
          "We initially explored a centralized view that combined issue monitoring with ticket-style work items. We included assignment functionality to help builders clarify ownership, track problems, and move toward resolution.",
        ],
      },
      {
        id: "v2",
        version: "V2",
        title: "Simplifying Issue Management",
        description: [
          "Usability testing revealed that builders were unsure where the tickets originated, such as GitHub, Jira, Monday, or ServiceNow. The separate ticket section also made the page feel overwhelming.",
          "To simplify the experience, we removed the standalone Tickets section and integrated its assignment functionality directly into the issue list. We also renamed Alerts to Issues, shifting the focus from system notifications to investigating and managing problems. This reduced clutter and brought issue investigation and ownership into one place.",
        ],
      },
      {
        id: "final",
        version: "Final",
        title: "Connecting Issues with Affected Artifacts",
        description: [
          "Testing showed that Issues and Impacted Assets felt disconnected, making it harder for builders to understand how problems related to affected artifacts.",
          "We combined them into a unified experience and introduced tabs to organize the supporting information, without overwhelming builders. We also added issue IDs and timestamps to provide more context during investigation.",
          "The final design brings issue details, execution information, and affected artifacts closer together, helping builders follow a clearer path from identifying a problem to investigating its impact.",
        ],
      },
    ],
  },
  {
    id: "metrics",
    label: "Metrics",
    subtitle: "From Distributed Metrics to Artifact-Centric Exploration",
    iterations: [
      {
        id: "v1",
        version: "V1",
        title: "Initial Metrics Distribution",
        description: [
          "Our initial design separated metrics based on their purpose. We placed artifact health and operational metrics across the Overview page, while a dedicated Metrics page focused on broader usage and business performance, such as token consumption, KPIs, and cost.",
          "This reflected our early assumption that builders would primarily monitor artifact performance through Overview, while more detailed reporting could support users with administrative responsibilities.",
        ],
      },
      {
        id: "v2",
        version: "V2",
        title: "Consolidated Fleet Overview",
        description: [
          'Feedback revealed that metrics felt scattered and repetitive across the experience. Builders found the amount of information overwhelming and expressed interest in organizing metrics through tabs. Additionally, the label "Health" did not clearly communicate what the section contained.',
          "To reduce fragmentation and redundancy, we merged Fleet Overview and Health into a single tabbed Fleet Overview, allowing builders to explore metrics by artifact type.",
        ],
      },
      {
        id: "v2-5",
        version: "V2.5",
        title: "Exploring Artifact-Specific Metrics",
        description: [
          "This round of testing focused on identifying which metrics builders found most valuable.",
          "Builders showed particular interest in actionable metrics and expressed a preference for dynamic visualizations, contextual tooltips, and actions embedded directly within the metrics.",
          "Most importantly, builders wanted to drill down into individual artifacts to understand their performance, rather than relying solely on fleet-level summaries.",
          "Based on this feedback, we explored organizing artifact-specific metrics into different categories of cards, combining performance statistics with actionable insights.",
        ],
      },
      {
        id: "final",
        version: "Final",
        title: "Artifact-Centric Metrics Experience",
        description: [
          "During our design exploration, we realized that the number of possible metric cards would make the experience difficult to scale. The limited space within each card also restricted how much detail we could display in graphs and visualizations.",
          "This led us to explore a larger, artifact-focused view where builders could examine relevant metrics in context without displaying everything at once. We moved fleet-level performance monitoring from Home into a dedicated Metrics experience.",
          "I proposed a hierarchical artifact tree and quick search to help builders find the artifacts they wanted to investigate and navigate their related assets. This approach was intended to support both quick access and deeper drilldowns. Our team then developed this direction by combining the Fleet Overview metrics with the Artifact Library model.",
          "We organized the experience into distinct views, including Overview and Dependencies. Overview provides a summary of the selected artifact's performance, while Dependencies helps builders understand its relationships with other artifacts and investigate potential issues. We also explored interactive metrics, such as error rate and runtime, supported by dynamic graphs, contextual information, and actions for deeper investigation.",
          "We removed pinned metrics because it was unclear whether they should apply across all artifacts or only to the selected artifact. Feedback suggested that builders valued customization, but pinning individual metrics was not necessarily the best way to support that need.",
          "This final concept has not yet been usability tested. Future testing would need to validate artifact relationships, metric organization, and the usefulness of interactions and drilldowns.",
        ],
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Local pieces                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The Target User block: the copy, and the persona slide beside it.
 *
 * Two columns from 810 and a stack below, which is the shape the brief asks
 * for. Without a persona it is the copy on its own at a readable measure
 * rather than an empty column beside it — the section still says who the work
 * was for, which is its job.
 *
 * The slide is a slide: dense, and smaller in half a column than it was in the
 * deck. It opens, so the small type in it can actually be read, and it pinches
 * on a phone the way the prototype screens do.
 */
function TargetUser({ persona }: { persona?: PersonaAsset }) {
  const copy = <Paragraphs items={TARGET_USER} />;

  if (!persona) return <div className="w-full max-w-[760px]">{copy}</div>;

  return (
    <div className="grid w-full grid-cols-1 items-start gap-x-10 gap-y-6 tablet:grid-cols-2">
      {copy}
      <Zoomable
        src={persona.src}
        alt={persona.alt}
        width={persona.width}
        height={persona.height}
        panOnDesktop
        pinchZoom
      >
        {/* No frame around it. A slide carries its own edge, and a container
            drawn outside that edge is the double border this page already
            spent a round removing. */}
        <Image
          src={persona.src}
          alt={persona.alt}
          width={persona.width}
          height={persona.height}
          sizes="(width < 810px) 92vw, 460px"
          className="h-auto w-full"
        />
      </Zoomable>
    </div>
  );
}

/**
 * A screenshot that can be opened full size.
 *
 * `Zoomable` already makes the picture a real `<button>` with `cursor-zoom-in`,
 * Escape to close and a focus ring, so the behaviour exists; what was missing
 * was any sign of it before the pointer arrives. The frame answers now: the
 * border takes IBM blue and the picture creeps up 1.02 inside it.
 *
 * The scale lives on the image and the radius and `overflow-hidden` live on
 * the wrapper, so the growth is clipped by the frame instead of pushing the
 * column around — the figure's box never changes and nothing below it moves.
 * That also puts the border on its own element rather than on the `<img>`,
 * which is what keeps the corner a single clean curve.
 *
 * `duration-500` and `scale-[1.03]` are what `MoreProjects` already uses for
 * the same gesture; this is a touch gentler because the picture is far larger.
 */
function ExpandableShot({
  src,
  alt,
  width,
  height,
  sizes,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
}) {
  return (
    <Zoomable src={src} alt={alt} width={width} height={height} panOnDesktop>
      {/*
        No wrapper. The frame that used to sit here — a rounded, bordered,
        `overflow-hidden` box — drew a second corner outside each screen's own
        baked-in one, which is the double border this had. The crop the picture
        shows is what the file holds, and that is all that is drawn now.

        The scale-on-hover went with it: it only looked right because the box
        clipped it, and the box is what had to go. `Zoomable` still makes the
        picture a button with `cursor-zoom-in`, so the lightbox is as
        reachable as it was.
      */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className="h-auto w-full"
      />
    </Zoomable>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export function CaseStudy() {
  return (
    <CaseShell
      current="ibm-watsonx-builder-control-plane"
      sidebar={<SidebarNav entries={SECTIONS} accent={IBM_BLUE} />}
      moreVariant="compact"
      canvasWidth={1200}
      bodyWidth={1200}
      bodyGap={90}
      pageTop={60}
      bodyPad={120}
      bodyPadX={40}
      moreBottom={120}
      collapsibleSidebar
    >
      {/* ---- Hero ------------------------------------------------------ */}
      {/*
        Stacked rather than the two-column header Metro and BudgetCart use.
        Beside the words, the artwork gets 64% of a 951px column — about 609px
        — and a browser window drawn 609px wide is a thumbnail. The words here
        are also heavier than those pages carry: a subtitle, an internship line
        and four team names. Giving each the full column lets the facts sit
        two across and the product read as a product.
      */}
      <section className="relative flex w-full flex-col items-start gap-10">
        <div className="flex w-full flex-col items-start gap-5">
          <CategoryBadge label="Enterprise AI · UX Design" variant="solid" />

          <div className="flex w-full flex-col gap-5">
            <h1 className="ts-heading-2 w-full text-left text-grey-200">
              Builder Control Plane
            </h1>
            {/*
              `normal-case` undoes the `text-transform: capitalize` that Framer
              baked into every Body Large class. It is harmless on a four-word
              lede; on a full sentence with three commas in it, CSS capitalizes
              "A", "For", "To" and "And" as well, which reads as a bug rather
              than as a style. The size and colour still come from the class.
            */}
            <p className="ts-body-large-fluid max-w-[760px] text-left normal-case">
              Designing a centralized starting point for builders to navigate,
              monitor, and troubleshoot their agentic work.
            </p>
            <p className="ts-body-small-light text-left">
              IBM Software Design Internship · Summer 2026
            </p>
          </div>
        </div>

        {/* Two across at every width, so the facts read as a block rather than
            a long list on a phone. The same grid Metro's hero uses. */}
        <dl className="grid w-full grid-cols-2 gap-x-[6px] gap-y-5">
          {META.map(([label, value]) => (
            <div key={label} className="flex flex-col">
              <dt className="ts-body font-semibold">{label}</dt>
              <dd className="ts-body max-w-[600px]">{value}</dd>
            </div>
          ))}
        </dl>

        <IbmHeroArt />
      </section>

      {/* The rule the other case studies draw under their heroes. */}
      <span className="h-px w-full bg-grey-100" aria-hidden />

      <div className="flex w-full flex-col gap-[90px]">
        {/* ---- Project Overview ---------------------------------------- */}
        <CaseSection id="overview" title="Project Overview" gap={10}>
          <Reveal className="w-full">
            <Paragraphs
              items={[
                "I worked with a team of five designers to explore a new Builder Control Plane for IBM watsonx Orchestrate, a dedicated landing experience for builders creating and maintaining agents, workflows, tools, and other AI artifacts.",
                "At the time, builders primarily accessed their work through a chatbot interface. Our team was tasked with envisioning a future Control Plane that would help builders return to ongoing work, identify issues, and understand the performance of interconnected AI artifacts.",
                "The project initially explored both builder and administrator needs, but later narrowed its focus to the Builder Control Plane. This is why our early research included administrators, even though the final prototype focused on builders.",
                "Over six weeks, we developed an interactive prototype covering Home, Issues, and Metrics.",
                "This was a design exploration, not a shipped product.",
              ]}
            />
          </Reveal>
        </CaseSection>

        {/* ---- Project Context ----------------------------------------- */}
        {/*
          One screenshot carries this section. It replaces a bullet list of
          artifact types and a pair of drawn relationship trees: a reader who
          has never opened an agent platform learns more from one look at the
          real canvas — nodes, branches, a sub-flow, connectors — than from a
          diagram of the same idea, and it costs the page no invented UI.

          Intro, picture, caption, close. No card around it and nothing else
          competing with it.
        */}
        <CaseSection id="project-context" title="Project Context" gap={10}>
          <div className="flex w-full flex-col gap-10">
            <div className="flex w-full flex-col gap-2.5">
              <SubHeading
                size="sub-heading"
                title="What is watsonx Orchestrate?"
              />
              <Paragraphs
                items={[
                  "IBM watsonx Orchestrate is an AI platform where builders create and manage agents, workflows, and tools to automate business processes. These artifacts can be connected to support complex tasks.",
                ]}
              />
            </div>

            <Reveal className="w-full">
              <figure className="m-0 flex w-full flex-col gap-2.5">
                <ExpandableShot
                  src={WORKFLOW_BUILDER.src}
                  alt={WORKFLOW_BUILDER.alt}
                  width={WORKFLOW_BUILDER.w}
                  height={WORKFLOW_BUILDER.h}
                  sizes="(width < 810px) 92vw, 951px"
                />

                {/*
                  Plain caption, no pill. The sentence names the Workflow
                  Builder, which is the shipping product rather than the
                  Builder Control Plane the rest of the page is about, so it
                  already draws the line the label was drawing a second time.
                */}
                <figcaption className="ts-body w-full text-center italic text-light-grey">
                  An example of the watsonx Orchestrate Workflow Builder, where
                  builders connect agents, tools, and logic to automate
                  multi-step processes.
                </figcaption>
              </figure>
            </Reveal>

            <Paragraphs
              items={[
                "As builders create more interconnected artifacts, they need to navigate dependencies, monitor performance, and troubleshoot issues across their work.",
              ]}
            />
          </div>
        </CaseSection>

        {/* ---- The Problem --------------------------------------------- */}
        <CaseSection id="problem" title="The Problem" gap={10}>
          {/* 70px between the statement and the needs, which is what Metro
              puts between the two blocks of its own Problem section. */}
          <div className="flex w-full flex-col gap-[70px]">
            <div className="flex w-full flex-col gap-5">
              {/* An h3, the way Metro sets its own problem statement — a
                  heading for the block of copy under it, not a loose
                  paragraph in a bigger size. */}
              <h3 className="ts-heading-6 max-w-[760px] text-left text-grey-200">
                Builders had no dedicated place to start their work.
              </h3>
              <Paragraphs
                items={[
                  "At the time of this project, watsonx Orchestrate had no dedicated landing page for builders.",
                  "Managing interconnected agents, workflows, and tools required navigating through the chatbot and different parts of the platform, making it difficult to access relevant work, identify issues, and monitor performance.",
                ]}
              />
            </div>

            <div id="builder-needs" className="flex w-full flex-col gap-5">
              <SubHeading
                size="sub-heading"
                title="Five Key Builder Needs"
                lede="Our research identified five recurring needs that shaped the direction of the Builder Control Plane."
              />

              {/*
                A read-down list with rules, not a grid of cards. These are
                things people said they were trying to do; cards would dress
                them up as shipped features.

                The number and the need sit in a fixed left column from tablet
                up so the five titles align, and the list collapses to a stack
                below that rather than squeezing two columns onto a phone.
              */}
              <ul className="flex w-full flex-col">
                {BUILDER_NEEDS.map((need, i) => (
                  <li
                    key={need.number}
                    className={i === 0 ? "" : "border-t border-grey-100"}
                  >
                    {/*
                      Staggered 0.08s apart so the five read down rather than
                      landing as one block. Same spring `MoreProjects` uses for
                      its cards, which stagger on `index * 0.1`; tighter here
                      because there are five of them and the run should be over
                      before it is noticed.

                      The delay is on the row's contents, never on the `<li>`:
                      the rules and the row heights are laid out either way, so
                      nothing reflows as the text arrives.
                    */}
                    <AppearEffect
                      enter={{
                        opacity: 0,
                        y: 16,
                        transition: `spring-duration 0.5s 0 ${i * 0.08}s`,
                      }}
                      trigger="onInView"
                      threshold={0.1}
                      className="flex w-full flex-col gap-2.5 py-6 tablet:flex-row tablet:items-baseline tablet:gap-10"
                    >
                      <div className="flex shrink-0 items-baseline gap-4 tablet:w-[320px]">
                        <span className="ts-body font-semibold text-light-grey">
                          {need.number}
                        </span>
                        <h4 className="ts-body font-semibold text-left">
                          {need.title}
                        </h4>
                      </div>
                      <p className="ts-body flex-1 text-left">{need.body}</p>
                    </AppearEffect>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CaseSection>

        {/* ---- The design challenge ------------------------------------ */}
        {/*
          No heading of its own any more, by request: not a "Design Challenge"
          section with a "How Might We" sub-heading over it, but a line of copy
          and the card it introduces. The turn from problem to proposal now
          happens in the reading rather than being announced twice.

          It keeps `id="design-challenge"` so any link already pointing here
          still lands, but it no longer earns a rail entry —
          CASE_STUDY_NAV_RULES.md 1.3 allows a link only for a section that
          actually exists, and with the heading gone the entry would name
          something the reader cannot see on the page.
        */}
        <CaseSection id="design-challenge">
          <div className="flex w-full flex-col gap-5">
            <Paragraphs
              items={["The problem statement that guided this project was:"]}
            />
            <Reveal className="w-full">
              <ProblemStatement stars>
                How might we help builders return to their work, identify what
                needs attention, and investigate performance and issues across
                interconnected AI artifacts?
              </ProblemStatement>
            </Reveal>
          </div>
        </CaseSection>

        {/* ---- My Role ------------------------------------------------- */}
        {/*
          One section, no cards. Two bordered panels for two of the three
          surfaces cost most of a screen and gave a recruiter two boxes to
          enter before reading three short lines; the same three lines read in
          about a second as a list.
        */}
        <CaseSection id="my-role" title="My Role" gap={10}>
          <div className="flex w-full flex-col gap-10">
            <Paragraphs
              items={[
                "As one of five designers, I contributed to user interviews, research synthesis, information architecture, prototyping, and usability testing.",
              ]}
            />

            <div id="design-ownership" className="flex w-full flex-col gap-5">
              {/* The one rule in the section, between the role and the
                  ownership under it. The same hairline the hero draws. */}
              <span className="h-px w-full bg-grey-100" aria-hidden />

              <SubHeading size="sub-heading" title="Design Ownership" />

              {/*
                A description list, which is what a column of labels against a
                column of definitions actually is — and it tells a screen
                reader that "Issues" names the sentence beside it rather than
                being another line of copy.

                No markers: `dl` draws none, so there is nothing to strip.
                14px between rows, inside the 12-16px asked for.
              */}
              <dl className="m-0 flex w-full flex-col gap-3.5">
                {OWNERSHIP.map((item) => (
                  <div
                    key={item.area}
                    className="flex w-full flex-col gap-1 tablet:flex-row tablet:gap-6"
                  >
                    {/* A fixed column from 810 so the three sentences start on
                        one edge. `shrink-0` keeps it there when a definition
                        runs long; below 810 the label sits over its own line
                        instead, where 120px of the column would be most of
                        it. */}
                    <dt className="ts-body font-semibold tablet:w-[108px] tablet:shrink-0">
                      {item.area}
                    </dt>
                    {/* `m-0` undoes the 40px indent a `dd` carries by
                        default, which would have put the definitions off the
                        grid the rest of the page sits on. */}
                    <dd className="ts-body m-0 flex-1">{item.body}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </CaseSection>

        {/* ---- Solution Overview --------------------------------------- */}
        {/*
          A walkthrough rather than three screenshots stacked down the page.
          The three areas are siblings, not chapters, and a tab list says that
          where a column of headings said the opposite — a reader can open
          Metrics first and nothing about the layout argues with them.

          It also buys back about two screens of scrolling, and each picture
          is larger than it was when all three had to share the column.
        */}
        <CaseSection id="solution-overview" title="Solution Overview" gap={10}>
          <Reveal className="w-full">
            <StickyStepShowcase
              steps={SHOWCASE}
              accent={IBM_BLUE}
              /* Sits directly under the screen name now, inside the figure,
                 rather than at the foot of the section. */
              note="Concept prototype. All names, agents, and performance data are fictional."
            />
          </Reveal>
        </CaseSection>

        {/* ---- Research ------------------------------------------------ */}
        {/*
          Who the work was for, how it was studied, and what came back — in
          that order, because each answers a question the one before it
          raises.

          70px between the three blocks, which is what The Problem puts
          between its own two and what Metro puts between blocks inside a
          section. No block here is a phase of the project, so none of them
          takes a line in the rail; `Research` does.
        */}
        <CaseSection id="research" title="Research" gap={10}>
          <div className="flex w-full flex-col gap-[70px]">
            <div id="target-user" className="flex w-full flex-col gap-5">
              <SubHeading size="sub-heading" title="Target User" />
              <Reveal className="w-full">
                <TargetUser />
              </Reveal>
            </div>

            <div id="research-methods" className="flex w-full flex-col gap-5">
              <SubHeading size="sub-heading" title="Research Methods" />
              <Reveal className="w-full">
                <ResearchSnapshot
                  objective={RESEARCH_OBJECTIVE}
                  stats={RESEARCH_STATS}
                  accent={IBM_BLUE}
                />
              </Reveal>
              {/* The one rule in the block, and the only thing dividing
                  anything: the figures above it, the prose about them below.
                  The same hairline My Role draws between its two halves. */}
              <span className="h-px w-full bg-grey-100" aria-hidden />

              <Reveal className="w-full">
                <div className="flex w-full flex-col gap-2.5">
                  <Paragraphs items={[RESEARCH_EXPLORED]} />
                  <Paragraphs
                    items={[RESEARCH_SCOPE_NOTE]}
                    className="text-light-grey"
                  />
                </div>
              </Reveal>
            </div>

            <div id="research-insights" className="flex w-full flex-col gap-5">
              <SubHeading
                size="sub-heading"
                title="Key Research Insights"
                lede="Our research revealed three recurring needs that shaped how we approached the Builder Control Plane."
              />
              <ResearchInsights
                insights={RESEARCH_INSIGHT_LIST}
                accent={IBM_BLUE}
              />
            </div>
          </div>
        </CaseSection>

        {/* ---- Design Process & Iteration ------------------------------ */}
        {/*
          What the research changed. Three areas down the page, each with its
          own row of versions — the showcase carries all of it, so there is no
          sub-block under the heading and nothing between the intro and Home.

          The areas were tabs until this round. Tabs kept two thirds of the
          decisions behind a control a reader can walk past, and squeezed the
          reasoning into a column too narrow to read it in; see the note at
          the top of `DesignIterationShowcase`.
        */}
        <CaseSection
          id="design-iteration"
          title="Design Process & Iteration"
          gap={10}
        >
          <div className="flex w-full flex-col gap-8">
            <Paragraphs
              items={[
                "We refined the Builder Control Plane through iterative prototyping and usability feedback, shifting from fleet-level monitoring toward builders' daily workflows and artifact-specific needs.",
              ]}
            />
            <Reveal className="w-full">
              <DesignIterationShowcase
                areas={DESIGN_AREAS}
                accent={IBM_BLUE}
                note="Concept prototype. All names, agents, and performance data are fictional."
              />
            </Reveal>
          </div>
        </CaseSection>
      </div>
    </CaseShell>
  );
}
