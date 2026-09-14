/**
 * Intrinsic sizes of the project-card thumbnails.
 *
 * Every card frame on the site fills with `object-cover`, so the frame has to be
 * close to the shape of the artwork or the crop eats into it: these boards carry
 * the project title along their top edge, and a frame much wider than the board
 * takes that title off. Giving each frame its own artwork's aspect ratio means
 * the picture fills it exactly, with nothing cropped and no empty margin.
 *
 * These boards are trimmed to the artwork itself. They arrived with a band of
 * page-coloured margin around them, which read as a frame once the board sat on
 * a card, so the margin is cropped off and each file is matted onto pure white:
 * the edge of the picture is now the same white as its inside, and the join
 * between picture and frame is invisible.
 *
 * The numbers are the files' own pixel sizes. They are listed here rather than
 * measured at runtime so the frame is the right shape on the first paint and
 * nothing shifts once the image arrives.
 */
const SIZES: Record<string, [number, number]> = {
  // Home page "Selected Work"
  "/images/3ERWzAf6UfkLtaIEjZLUSpUyAU.jpg": [748, 568],
  "/images/lKiiHwCIn6KBdznWwKf5t8dwA.jpg": [690, 547],
  "/images/oinVOiv5zYxKrorv88du9ze5iwQ.png": [1280, 832],
  // "My Projects" rows
  "/pages/HJx3zAPx9dMFv6Krt8lKlh5oew4.jpg": [749, 568],
  "/pages/HDZF8LdEMPMB2bBzoQG4sBfLB2E.jpg": [690, 547],
  "/case/OWmpqKnvk6IiDk3SNIkMzaYwrw.jpg": [1195, 840],
};

/** A 4:3 board, which is the shape all of these thumbnails sit closest to. */
const FALLBACK: [number, number] = [4, 3];

/** The CSS `aspect-ratio` for a thumbnail's own frame. */
export function thumbnailAspect(src: string): string {
  const [w, h] = SIZES[src] ?? FALLBACK;
  return `${w} / ${h}`;
}

/**
 * The one frame every project card uses.
 *
 * Cards that sit beside each other have to be the same size, so they cannot
 * each take their own artwork's shape. The boards run from 1.30 to 1.54 wide,
 * and 1.40 is the shape that fills for all of them without cutting anything:
 * the two near-square boards lose about 3.6% off the top and bottom, well clear
 * of their titles, and the Ryze banner loses 9% off one side, which
 * `object-position: left` puts on the right so its logo survives.
 */
export const CARD_ASPECT = "1.4 / 1";
