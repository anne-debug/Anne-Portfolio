/**
 * Colours for the v2 home page, all taken from the site's own tokens in
 * globals.css: flat, saturated fills with no outlines or grain. The text
 * and surface colours are CSS variables so they follow the page's dark mode
 * (see the v2 block at the end of globals.css); use them in `style`, not in
 * SVG presentation attributes.
 */
export const V2 = {
  page: "var(--color-chestnut-bg)",
  surface: "var(--color-light-grey-super)",
  ink: "var(--color-dark-charcoal)",
  inkSoft: "var(--color-light-grey)",
  red: "#FF2244",
  orange: "#FF5900",
  blue: "#001666",
  green: "#0BDE66",
  sky: "#CADCFC",
  pink: "#FFEDF3",
  butter: "#FFE08A",
  white: "#FFFFFF",
} as const;
