import { LampBoard } from "@/components/v2/LampBoard";

import { AboutDock } from "./AboutFolders";
const mansalva = { fontFamily: "var(--font-mansalva)" };
const sans = { fontFamily: "var(--font-dm-sans)" };

/**
 * The home page's original About me section, pinboard included, as it was at
 * the tag v2.0-before-simplify. Anne moved it to /about (2026-11-20) so the
 * home page's About me can be redesigned without losing it.
 */
export function AboutMeFull() {
  return (
    <section aria-labelledby="about-title" className="flex w-full flex-col gap-6">
      <div>
        <p className="inline-block -rotate-[4deg] text-[22px] leading-[1.2] text-orange" style={mansalva}>
          A little more about me
        </p>
        <h2 id="about-title" className="ts-heading-2 mt-1 text-deep-blue">
          I’m Anne.
        </h2>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 desktop:grid-cols-[minmax(0,1fr)_clamp(300px,27%,330px)]">
        {/* the whole board scales with the column at every width, phones included */}
        <div className="desktop:relative desktop:aspect-[800/480]">
          <div className="w-full desktop:absolute desktop:inset-0 desktop:h-full">
            <LampBoard />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2 desktop:flex desktop:flex-col">
          <div className="flex flex-col gap-3 rounded-[20px] bg-[var(--about-card)] p-6 desktop:flex-1">
            <p className="text-[13px] font-bold leading-none tracking-[0.08em] text-[var(--about-label)]" style={sans}>
              Yu En Lin (Anne)
            </p>
            <p className="text-[28px] leading-[1.1] text-deep-blue" style={{ fontFamily: "var(--font-instrument)" }}>
              M.S. in UX @UMICH ’27
            </p>
            <div className="flex flex-col gap-4 text-[15px] leading-[1.5] text-dark-charcoal" style={sans}>
              <p>My path through frontend development and product management shapes how I design: seeing the bigger picture, asking thoughtful questions, and caring about the details.</p>
              <p>Now studying UX at Michigan, I’m bringing research, design, and code together to turn ideas into thoughtful experiences.</p>
              <p>Open to product and UX design roles starting June 2027</p>
            </div>
          </div>

          {/* the dock (profile, notes, LinkedIn) takes the resume note's place (Anne, 2026-11-20) */}
          <AboutDock />
        </div>
      </div>
    </section>
  );
}
