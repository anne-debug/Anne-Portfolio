import manifest from "./project-previews.json";

/**
 * The one preview image per case study, shared by every card that shows it:
 * Selected Work on the home page and the rows on My Projects.
 *
 * The pictures are screenshots of each case study's own hero section, taken by
 * `npm run previews` (scripts/capture-previews.mjs), which also writes the
 * pixel sizes into project-previews.json. Rerun it after changing a hero and
 * both pages pick the new picture up.
 */

/** A slug the capture script has actually written a picture for. */
export type ProjectSlug = keyof typeof manifest;

/** Where a hero's handset animation sits, as fractions of the picture. */
export interface PreviewScreen {
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  /** How far down the screen the animation starts, below the Dynamic Island. */
  clipTop: number;
  /** Corner radius as a share of the screen's width. */
  radius: number;
  /** How the page fits the recording into the screen, mirrored by the card. */
  fit: string;
  position: string;
}

export interface ProjectPreview {
  src: string;
  width: number;
  height: number;
  /** Present only for the heroes that play an animation. */
  screen?: PreviewScreen;
}


/**
 * The picture for a slug, or null when there is not one.
 *
 * Null is not an error. A password-protected case study is deliberately left
 * out of the manifest: capturing its hero would write a public image of
 * protected content into `public/project-previews/`, reachable by anyone who
 * guesses the URL, which is the one thing the gate exists to stop. Those cards
 * draw a plain cover instead; see `ProjectCover`.
 */
/* Overloaded so the two kinds of caller get the two different answers. A
   literal the manifest holds — the home page names its three — resolves to the
   non-null signature and needs no check. A slug that is only known to be a
   string resolves to the nullable one and has to handle a missing picture. */
export function projectPreview(slug: ProjectSlug): ProjectPreview;
export function projectPreview(slug: string): ProjectPreview | null;
export function projectPreview(slug: string): ProjectPreview | null {
  if (!(slug in manifest)) return null;
  const entry = manifest[slug as ProjectSlug];
  const screen = "screen" in entry ? entry.screen : undefined;
  return { src: entry.src, width: entry.width, height: entry.height, screen };
}
