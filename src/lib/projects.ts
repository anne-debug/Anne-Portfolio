export interface Project {
  /**
   * The last segment of the project's route, and the key its preview picture is
   * filed under. Not every slug has a picture — see `projectPreview` — so this
   * is a plain string rather than a key of the preview manifest.
   */
  slug: string;
  href: string;
  category: string;
  title: string;
  description: string;
  /** Framer stores four tool slots and stops rendering at the first empty one. */
  tools: string[];
  /**
   * Whether the case study sits behind the password screen.
   *
   * It changes two things and nothing else: the card carries a quiet lock, and
   * the preview capture skips the project so its hero never becomes a public
   * image. Everything else — ordering, card layout, the closing strip — treats
   * it as an ordinary project.
   */
  locked?: boolean;
  /**
   * Where the work stands, when it is worth saying — "Currently in progress"
   * and the like. The cards show it on hover, over the picture.
   *
   * A string rather than a flag, so the next project to need one can say its
   * own thing without a new field.
   */
  status?: string;
}

/**
 * Every case study, in the order My Projects lists them.
 *
 * The one place that order lives. My Projects renders straight from it and each
 * case study's closing strip filters it, so the two cannot drift and a project
 * added here appears in both without touching a page.
 */
export const PROJECTS: Project[] = [
  {
    slug: "taipei-metro-app",
    href: "/projects/taipei-metro-app",
    category: "UI/UX Design",
    title: "Taipei Metro Point Redesign",
    description:
      "Reimagining Metro Points to make rewards visible, understandable, and part of everyday commuting",
    tools: ["Figma ", "", "Javascript", "Typescript"],
  },
  {
    slug: "budgetcart",
    href: "/projects/budgetcart",
    category: "UI/UX Design",
    title: "BudgetCart",
    description:
      "An online grocery app that eliminates checkout anxiety for budget-constrained shoppers",
    tools: ["Figma ", "", "Javascript", "Typescript"],
  },
  {
    slug: "ryze-coffee",
    href: "/projects/ryze-coffee",
    category: "UI/UX Design",
    title: "Ryze Coffee Redesign",
    description:
      "Redesigning with user trust and autonomy for long-term retention",
    tools: ["Figma", "", "", ""],
  },
  {
    slug: "ibm-watsonx-builder-control-plane",
    href: "/projects/ibm-watsonx-builder-control-plane",
    category: "Enterprise AI · UX Design",
    title: "IBM watsonx Builder Control Plane",
    description:
      "Control plane experience for IBM watsonx Builder, completed during my IBM internship.",
    /* Left empty on purpose: the tools have not been confirmed, and the card
       renders no chips rather than guessed ones. */
    tools: [],
    locked: true,
    status: "In progress",
  },
  {
    slug: "jubo-healthcare",
    href: "/projects/jubo-healthcare",
    category: "Web Development",
    title: "Jubo Healthcare Platform",
    description:
      "Designed frontend modules for a senior care platform to streamline medical record input and improve patient data visibility across devices.",
    tools: ["HTML", "CSS", "Javascript", "Typescript"],
  },
];

/**
 * The projects a case study closes with: the canonical order with the page you
 * are on taken out of it, and the rest left exactly where they were.
 *
 * Not a rotation. Removing the current project must not reshuffle what remains
 * — on BudgetCart the strip is Taipei then Ryze, the same pair in the same
 * order as on Ryze itself, rather than starting from whatever follows.
 *
 * A page the list does not hold — Little Chestnut Thief is indexed elsewhere —
 * simply gets the first of them.
 */
export function moreProjects(slug: string, count = 2): Project[] {
  return PROJECTS.filter((p) => p.slug !== slug).slice(0, count);
}
