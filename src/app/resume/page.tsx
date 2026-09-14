import type { Metadata } from "next";
import Image from "next/image";


export const metadata: Metadata = {
  title: "Resume — Anne Lin",
  description: "Resume for Anne Lin, product and UX designer.",
};

const RESUME_PDF = "/pages/H1DEVza38BrAaI7V9cAQdQlwPg.pdf";

/**
 * Framer page "Resume" (/resume): the resume as an image inside a soft panel,
 * with a download button beneath it wired to the uploaded PDF.
 */
export default function ResumePage() {
  return (
    <>
      <main className="flex w-full max-w-[1440px] flex-col items-center px-5 pt-[160px] pb-[100px]">
        {/* The resume itself is an image, so the document needs a heading. */}
        <h1 className="sr-only">Resume</h1>
        <div className="flex w-full max-w-[960px] flex-col items-center gap-[30px] rounded-[40px] bg-light-grey-super/60 p-6 tablet:p-12">
          <Image
            src="/pages/KwUF07RfRlZCfgIGK1OjP3BCZGs.png"
            alt="Resume for Anne Lin, covering education, UI/UX projects, professional experience and skills"
            width={1700}
            height={2200}
            sizes="(max-width: 810px) 90vw, 700px"
            priority
            className="h-auto w-full max-w-[700px] bg-white shadow-sm"
          />

          <a
            href={RESUME_PDF}
            download
            className="flex items-center justify-center rounded-lg bg-dark-charcoal px-6 py-3 text-white transition hover:brightness-110"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "16px",
              lineHeight: "1em",
            }}
          >
            Download
          </a>
        </div>
      </main>
    </>
  );
}
