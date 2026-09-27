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


export function projectPreview(slug: ProjectSlug): ProjectPreview {
  const entry = manifest[slug];
  const screen = "screen" in entry ? entry.screen : undefined;
  return { src: entry.src, width: entry.width, height: entry.height, screen };
}
