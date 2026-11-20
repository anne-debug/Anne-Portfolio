import type { Metadata } from "next";

import { AboutDesktop } from "@/components/about/AboutDesktop";
import { AboutMeFull } from "@/components/about/AboutMeFull";

export const metadata: Metadata = {
  title: "About — Anne Lin",
  description:
    "A UX designer with a background in engineering and product, turning complex systems into experiences that feel simple and enjoyable to use.",
};

/**
 * Framer page "About" (/about): the home page's original About me section
 * with its pinboard first, then the folder desktop. `v2-home` gives the section
 * the same heading size it had on the home page.
 */
export default function AboutPage() {
  return (
    <>
      {/* top padding clears the floating nav pill */}
      <div className="v2-home flex w-full justify-center">
        <div className="w-full max-w-[1280px] px-5 pb-[80px] pt-[110px] tablet:px-10">
          <AboutMeFull />
        </div>
      </div>
      <AboutDesktop />
    </>
  );
}
