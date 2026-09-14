import type { Metadata } from "next";

import { AboutDesktop } from "@/components/about/AboutDesktop";

export const metadata: Metadata = {
  title: "About — Anne Lin",
  description:
    "A UX designer with a background in engineering and product, turning complex systems into experiences that feel simple and enjoyable to use.",
};

/** Framer page "About" (/about). */
export default function AboutPage() {
  return <AboutDesktop />;
}
