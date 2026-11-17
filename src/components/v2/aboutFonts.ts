import { Delicious_Handrawn, Permanent_Marker } from "next/font/google";

/**
 * The two extra fonts the About me board uses in Framer: Permanent Marker for
 * the "friends" caption, Delicious Handrawn for the to-do title and name tag.
 * Not preloaded, since they only style a few words far down the page.
 */
const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const hand = Delicious_Handrawn({ weight: "400", subsets: ["latin"], display: "swap", preload: false });

export const markerFont = `${marker.style.fontFamily}, var(--font-mansalva)`;
export const handFont = `${hand.style.fontFamily}, var(--font-mansalva)`;
