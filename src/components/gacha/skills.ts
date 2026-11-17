/**
 * The capsules in the home page capsule machine: one skill each, and the place
 * Anne actually used it. Every line is drawn from her experience notes, so it
 * names what she designed, built or proposed and claims no result that was not
 * measured. DRAFT copy, for Anne to edit.
 */

export interface Capsule {
  skill: string;
  /** One or two sentences in Anne's voice. */
  story: string;
  /** Where it happened, shown as a small tag. */
  where: string;
  /** A case study on this site, when there is one. */
  href?: string;
  /** Top-half colour of the capsule. */
  color: string;
}

export const CAPSULES: Capsule[] = [
  {
    skill: "Information architecture",
    story:
      "I organized the Issues and Metrics views so builders could see an asset's owner, dependencies, status and errors in one place.",
    where: "IBM watsonx Orchestrate",
    href: "/projects/ibm-watsonx-builder-control-plane",
    color: "#7FB7E0",
  },
  {
    skill: "User research",
    story:
      "I interviewed 10 riders and found that earning points at special-event stations didn't fit how people actually commute.",
    where: "Taipei Metro hackathon",
    href: "/projects/taipei-metro-app",
    color: "#A8C49A",
  },
  {
    skill: "Interaction design",
    story:
      "I designed the Bell for a quick look at what's urgent, and the Notification Center to search, filter, assign and clear the rest.",
    where: "IBM watsonx Orchestrate",
    href: "/projects/ibm-watsonx-orchestrate-notification-experience",
    color: "#F4A97F",
  },
  {
    skill: "Mobile UX",
    story:
      "I designed one cart that compares the total cost across stores, with a live budget tracker and SNAP labels.",
    where: "BudgetCart",
    href: "/projects/budgetcart",
    color: "#F5D27A",
  },
  {
    skill: "Frontend development",
    story:
      "I built React and TypeScript screens for healthcare workflows, and worked on the frontend performance that brought a 30-second response down to about 3.",
    where: "JUBO Healthcare",
    href: "/projects/jubo-healthcare",
    color: "#F28C6B",
  },
  {
    skill: "Design to code",
    story:
      "I explored with Figma Make and AI tools, then opened pull requests to bring my designs into the team's interactive prototype.",
    where: "IBM watsonx Orchestrate",
    href: "/projects/ibm-watsonx-builder-control-plane",
    color: "#C6B5E8",
  },
  {
    skill: "Accessibility",
    story:
      "I fix contrast, alt text and iframe title issues while resolving tickets on the university's WordPress sites.",
    where: "U-M Student Life web team",
    color: "#9CC8E6",
  },
  {
    skill: "Talking to engineers",
    story:
      "As an associate PM on a screening system for 21 newborn diseases, I turned what doctors needed into requirements engineers could build.",
    where: "Neonatal screening system",
    color: "#F2AEBB",
  },
];
