"use client";

import { motion, useReducedMotion } from "motion/react";

import { V2 } from "./palette";

/**
 * "What others say": no board behind it. The heading on top and two
 * testimonial blocks under it (thin outline, quote, then a round avatar with
 * name and role), the way Matt's "What people say" is laid out. Phones and
 * tablets stack the blocks.
 *
 * The quotes are LinkedIn recommendations Anne supplied. Clay Braxton's is
 * word for word. Steve Kim's is the shortened text Anne supplied on
 * 2026-11-16: his opening and closing sentences with a condensed middle, shown
 * as one plain quote. Do not reword either. Photos are in
 * /public/images/people.
 */

interface Words {
  /** a string is the person's own words; `{ summary }` is our condensed middle */
  quote: (string | { summary: string })[];
  name: string;
  role: string;
  /** optional third line under the role */
  relation?: string;
  photo?: string;
}

const WORDS: Words[] = [
  {
    quote: [
      "Anne (Yu En) is a stand out intern, and by that I mean she got feedback from her leads of her excellent performance and leadership that was worth making an extra note of it's efficacy. She has a quiet leadership (empathetic, supportive), but a definite presence backed by incredible skills. Her 5 person cohort was one of the top intern experiences I have been able to witness, and her strengths in design, detailed oriented work and collaboration helped that team reach mature outcomes with solid business value.",
    ],
    name: "Clay Braxton",
    role: "Program Director @ IBM, Professor @ Duke",
    photo: "/images/people/clay-braxton.jpg",
  },
  {
    quote: [
      "Yu En Lin spent her internship with our design team at IBM watsonx Orchestrate. Her work is still shaping the product. She brought research rigor and structural thinking to complex enterprise experiences, translating insights into thoughtful design decisions. She owned our notification work end to end, contributed to the Builder Control Plane, and implemented her own designs in code. Research rigor, structural thinking, and the ability to carry a design into code is not a common combination at any level. I would work with Yu En Lin again, and recommend her without reservation.",
    ],
    name: "Steve Kim",
    role: "Head of Design @ IBM | Digital Labor",
    photo: "/images/people/steve-kim.jpg",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

export function KindWords() {
  const reduce = useReducedMotion() ?? false;
  const sans = { fontFamily: "var(--font-dm-sans)" };

  return (
    <section aria-labelledby="words-title" className="relative w-full">
      <h2 id="words-title" className="ts-heading-2 text-deep-blue">
        What others say
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-5 desktop:grid-cols-[9fr_11fr]">
        {WORDS.map((w, i) => (
          <motion.figure
            key={w.name}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.1 }}
            className="flex flex-col justify-between gap-[18px] rounded-2xl border p-5 tablet:px-6 tablet:py-[22px]"
            style={{ borderColor: "var(--v2-quote-stroke)" }}
          >
            <blockquote className="flex flex-col gap-3 text-[15px] leading-[1.5]" style={{ ...sans, color: V2.ink }}>
              {w.quote.map((para) =>
                typeof para === "string" ? (
                  <p key={para.slice(0, 24)}>{para}</p>
                ) : (
                  <p key="summary" className="text-[15px] italic" style={{ color: V2.inkSoft }}>
                    [{para.summary}]
                  </p>
                ),
              )}
            </blockquote>
            <figcaption className="flex items-center gap-3.5">
              {w.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.photo} alt="" className="size-10 shrink-0 rounded-full object-cover" />
              ) : (
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-full text-[14px] font-medium"
                  style={{ ...sans, background: "var(--v2-avatar)", color: V2.ink }}
                >
                  {initials(w.name)}
                </span>
              )}
              <span className="text-[14px] leading-[1.35]" style={sans}>
                <span className="block font-medium" style={{ color: V2.ink }}>
                  {w.name}
                </span>
                <span className="block" style={{ color: V2.inkSoft }}>
                  {w.role}
                </span>
                {w.relation && (
                  <span className="block text-[13px]" style={{ color: V2.inkSoft }}>
                    {w.relation}
                  </span>
                )}
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
