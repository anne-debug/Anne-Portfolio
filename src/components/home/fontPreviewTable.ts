/**
 * TEMPORARY: the candidate handwritten fonts for the home hero, shared by the
 * `?font=` / `?accent=` switcher (FontPreview.tsx) and the /font-preview page.
 *
 * The six next/font families are declared with `preload: false`, so nothing is
 * downloaded until a page actually uses one. The rest are fetched from the
 * Google Fonts stylesheet on demand, one family at a time, by `loadRemote`.
 *
 * To remove the experiment, delete this file, FontPreview.tsx, its one use in
 * Hero.tsx, and src/app/font-preview.
 */

import {
  Covered_By_Your_Grace,
  Gaegu,
  Gochi_Hand,
  Nanum_Pen_Script,
  Reenie_Beanie,
  Rock_Salt,
} from "next/font/google";

const covered = Covered_By_Your_Grace({ weight: "400", subsets: ["latin"], preload: false, variable: "--fp-covered" });
const reenie = Reenie_Beanie({ weight: "400", subsets: ["latin"], preload: false, variable: "--fp-reenie" });
const nanum = Nanum_Pen_Script({ weight: "400", subsets: ["latin"], preload: false, variable: "--fp-nanum" });
const gaegu = Gaegu({ weight: "400", subsets: ["latin"], preload: false, variable: "--fp-gaegu" });
const gochi = Gochi_Hand({ weight: "400", subsets: ["latin"], preload: false, variable: "--fp-gochi" });
const rocksalt = Rock_Salt({ weight: "400", subsets: ["latin"], preload: false, variable: "--fp-rocksalt" });

/** Class names that define the six next/font CSS variables. */
export const FONT_VARIABLES = [covered, reenie, nanum, gaegu, gochi, rocksalt].map((f) => f.variable);

export interface Candidate {
  /** Display name. */
  name: string;
  /** CSS font-family value, without the fallback. */
  family: string;
  /** Zoom for the hero heading. */
  scale: number;
  spacing: string;
  /** Google Fonts family to fetch on demand; absent for next/font ones. */
  google?: string;
}

/** A family fetched from the Google Fonts stylesheet only when asked for. */
const remote = (google: string, scale: number): Candidate => ({
  name: google,
  family: `"${google}"`,
  scale,
  spacing: "0px",
  google,
});

/** Every candidate, by URL key, in the order they are shown. */
export const FONTS: Record<string, Candidate> = {
  covered: { name: "Covered By Your Grace", family: "var(--fp-covered)", scale: 1.05, spacing: "0px" },
  reenie: { name: "Reenie Beanie", family: "var(--fp-reenie)", scale: 1.2, spacing: "0px" },
  nanum: { name: "Nanum Pen Script", family: "var(--fp-nanum)", scale: 1.2, spacing: "0px" },
  gaegu: { name: "Gaegu", family: "var(--fp-gaegu)", scale: 1.05, spacing: "-1px" },
  gochi: { name: "Gochi Hand", family: "var(--fp-gochi)", scale: 1.0, spacing: "-1px" },
  rocksalt: { name: "Rock Salt", family: "var(--fp-rocksalt)", scale: 0.6, spacing: "-2px" },
  mansalva: { name: "Mansalva", family: "var(--font-mansalva)", scale: 1.0, spacing: "-1px" },

  caveat: remote("Caveat", 1.15),
  caveatbrush: remote("Caveat Brush", 1.1),
  shadows: remote("Shadows Into Light", 1.1),
  indie: remote("Indie Flower", 1.0),
  patrick: remote("Patrick Hand", 1.1),
  kalam: remote("Kalam", 1.0),
  marker: remote("Permanent Marker", 0.85),
  architects: remote("Architects Daughter", 0.95),
  homemade: remote("Homemade Apple", 0.8),
  nothing: remote("Nothing You Could Do", 0.85),
  justanother: remote("Just Another Hand", 1.3),
  gloria: remote("Gloria Hallelujah", 0.85),
  sueellen: remote("Sue Ellen Francisco", 1.3),
  girlnextdoor: remote("The Girl Next Door", 0.9),
  schoolbell: remote("Schoolbell", 1.0),
  sunrise: remote("Waiting for the Sunrise", 1.05),
  annie: remote("Annie Use Your Telescope", 1.05),
  comingsoon: remote("Coming Soon", 0.9),
  amatic: remote("Amatic SC", 1.25),
  sedgwick: remote("Sedgwick Ave", 1.1),
  zeyada: remote("Zeyada", 1.1),
  labelle: remote("La Belle Aurore", 0.85),
  dawning: remote("Dawning of a New Day", 1.0),
  squarepeg: remote("Square Peg", 1.25),
};

/** Adds one Google Fonts stylesheet for `family`, once. */
export function loadRemote(family: string) {
  const href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}&display=swap`;
  if (document.head.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.fontPreview = "";
  document.head.appendChild(link);
}
