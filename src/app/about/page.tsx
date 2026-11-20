import type { Metadata } from "next";

import { AboutFolders } from "@/components/about/AboutFolders";
import { AboutMeFull } from "@/components/about/AboutMeFull";

export const metadata: Metadata = {
  title: "About — Anne Lin",
  description:
    "A UX designer with a background in engineering and product, turning complex systems into experiences that feel simple and enjoyable to use.",
};

/**
 * Framer page "About" (/about): the home page's original About me section
 * with its pinboard. The folder desktop is gone (2026-11-20); its dock sits
 * among the About me cards and its folders open over the page. `v2-home` gives the section
 * the same heading size it had on the home page.
 */
export default function AboutPage() {
  return (
    <>
      <h1 className="sr-only">About Anne Lin</h1>
      {/* top padding clears the floating nav pill */}
      <div className="v2-home flex w-full justify-center">
        <div className="w-full max-w-[1280px] px-5 pb-[100px] pt-[110px] tablet:px-10">
          <AboutMeFull />
          <AboutFolders />
        </div>
      </div>
    </>
  );
}
