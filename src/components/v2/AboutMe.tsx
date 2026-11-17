import Link from "next/link";
import { LampBoard } from "./LampBoard";
const mansalva = { fontFamily: "var(--font-mansalva)" };
const sans = { fontFamily: "var(--font-dm-sans)" };

export function AboutMe() {
  return (
    <section aria-labelledby="about-title" className="flex w-full flex-col gap-6">
      <div>
        <p className="inline-block -rotate-[4deg] text-[22px] leading-[1.2] text-orange" style={mansalva}>
          hi again ✎
        </p>
        <h2 id="about-title" className="ts-heading-2 mt-1 text-deep-blue">
          About me
        </h2>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 desktop:grid-cols-[minmax(0,1fr)_clamp(300px,27%,330px)]">
        {/* phones: the board keeps a readable size and scrolls sideways */}
        <div className="-mx-5 overflow-x-auto px-5 pb-2 tablet:mx-0 tablet:overflow-visible tablet:px-0 tablet:pb-0 desktop:relative desktop:aspect-[800/480]">
          <div className="w-[640px] tablet:w-full desktop:absolute desktop:inset-0 desktop:h-full">
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

          <Link
            href="/resume"
            className="flex -rotate-[1.5deg] flex-col gap-2 self-start rounded-[20px] bg-[var(--about-note)] px-6 py-[22px] transition-transform duration-300 hover:scale-[1.03] tablet:self-start desktop:self-auto"
            style={{ boxShadow: "0 0 0 1px var(--v2-ring), 0 1px 2px rgba(0,0,0,0.10), 0 6px 14px rgba(0,0,0,0.06)" }}
          >
            <span className="text-[24px] leading-[1.2] text-deep-blue" style={mansalva}>
              the short version
            </span>
            <span className="text-[15px] font-medium text-dark-charcoal" style={sans}>
              Read my resume →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
