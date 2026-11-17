import type { Metadata } from "next";
import Image from "next/image";


export const metadata: Metadata = {
  title: "Resume — Anne Lin",
  description: "Resume for Anne Lin, product and UX designer.",
};

/* Updated 2026-11-16 to Anne's "Enterprise_UX_Yu En Lin.pdf"; the image is its first page at 200 dpi. */
const RESUME_PDF = "/pages/yu-en-lin-resume.pdf";

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
            src="/pages/yu-en-lin-resume.png"
            alt="Resume for Yu En Lin (Anne): education at the University of Michigan, design internship at IBM watsonx Orchestrate, software engineering and product work at Orderble, the Taipei Metro hackathon project, and skills"
            width={1700}
            height={2200}
            sizes="(max-width: 810px) 90vw, 700px"
            priority
            className="h-auto w-full max-w-[700px] bg-white shadow-sm"
          />

          <a
            href={RESUME_PDF}
            download="Yu En Lin Resume.pdf"
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
