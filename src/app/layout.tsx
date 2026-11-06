import type { Metadata } from "next";
import {
  Antonio,
  Chonburi,
  DM_Sans,
  Instrument_Serif,
  Inter,
  Libre_Baskerville,
  Mansalva,
} from "next/font/google";
import "./globals.css";

import { ButterflyCursor } from "@/components/case/ButterflyCursor";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { NoiseBackground } from "@/components/site/NoiseBackground";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

// Libre Baskerville ships only 400 and 700. The Framer style "Heading 3b"
// asks for 600, which maps to 700 here.
const libreBaskerville = Libre_Baskerville({
  variable: "--font-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const chonburi = Chonburi({
  variable: "--font-chonburi",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const mansalva = Mansalva({
  variable: "--font-mansalva",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const SITE = "https://www.annelinyuen.com";
const TAGLINE =
  "I'm a Product designer with tech BG, passionate about transforming complexity into clear, useful products that spark moments of delight and connection";

/**
 * What a link to this site unfurls as.
 *
 * Without any of this, a scraper has nothing to go on and picks an image off
 * the page itself — which on the home page meant a frame of a case study's
 * phone recording. A portfolio link was previewing as somebody else's app.
 *
 * `opengraph-image.png` and `twitter-image.png` sit beside this file, which is
 * all Next needs: it serves them, works out their size and type, and writes
 * the tags. They are the home page's own hero, captured at 1200x630. Recapture
 * with `npm run og` after changing the hero.
 *
 * `metadataBase` is what makes those tags absolute. Relative URLs are ignored
 * by most scrapers, so without it the image would be advertised and then not
 * fetched.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Anne Lin — Product Designer",
    template: "%s",
  },
  description: TAGLINE,
  openGraph: {
    type: "website",
    siteName: "Anne Lin",
    title: "Anne Lin — Product Designer",
    description: TAGLINE,
    url: SITE,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anne Lin — Product Designer",
    description: TAGLINE,
  },
};

const fontVariables = [
  dmSans.variable,
  inter.variable,
  antonio.variable,
  instrumentSerif.variable,
  libreBaskerville.variable,
  mansalva.variable,
  chonburi.variable,
].join(" ");

/**
 * Mirrors the Framer layout template "Main": grain background, pinned nav,
 * page content, then the footer.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="relative flex min-h-full flex-col bg-chestnut-bg">
        <NoiseBackground />
        <ButterflyCursor />
        <Nav />
        {/*
          `overflow-x-clip` is what lets a page bleed a background to the
          edges of the window. A full-bleed layer has to be wider than the
          column it belongs to, and the only width a child can name that
          reaches both edges is one measured against the window — which on a
          platform with classic scrollbars is wider than the page, and would
          hand the whole site a horizontal scrollbar. Clipping here, on the
          one box that is exactly the page's width, takes that slack back.

          `clip` rather than `hidden`: `hidden` would make this a scroll
          container and the sticky section rails inside it would start
          sticking to this box instead of to the window. `clip` only clips.
        */}
        <div className="relative z-[1] flex w-full flex-1 flex-col items-center overflow-x-clip">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
