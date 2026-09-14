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

export const metadata: Metadata = {
  title: "Anne Lin",
  description:
    "I'm a Product designer with tech BG, passionate about transforming complexity into clear, useful products that spark moments of delight and connection",
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
        <div className="relative z-[1] flex w-full flex-1 flex-col items-center">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
