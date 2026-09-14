"use client";

import Image from "next/image";

/**
 * The two panels the dock opens: Framer's "AboutMeCard" and "NotesWindow".
 *
 * NotesWindow has a second variant called "Experience", but it still holds the
 * template's placeholder CV (agencies and roles that are not Anne's) and is
 * hidden on the Framer page, so only the About note is ported. See
 * README-port.md.
 */

const FACTS: [string, string][] = [
  ["Name", "Anne"],
  ["Degree", "Computer Science B.S. & UCAD (UX+SDE) M.S."],
  ["School", "University of Michigan '27"],
  ["Location", "Ann Arbor "],
  ["Contact", "annelin.yuen@gmail.com"],
];

export function AboutMeCard() {
  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto tablet:flex-row">
      <div className="flex w-full shrink-0 flex-col gap-4 tablet:w-[280px]">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl">
          <Image
            src="/about/qA91tsWqu6oxlpIBtUXYYpHfY.jpg"
            alt="Anne Lin"
            fill
            sizes="280px"
            className="object-cover"
          />
        </div>
        <dl className="flex flex-col gap-2">
          {FACTS.map(([label, value]) => (
            <div key={label} className="flex flex-col">
              <dt className="ts-body-small-light">{label}</dt>
              <dd className="ts-body-small">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <h2 className="ts-heading-3">About me</h2>
        <p className="ts-body">Hi, I’m Anne!</p>
        <p className="ts-body">
          I’m a UX designer with a background in engineering and product, and I love
          turning complex systems into experiences that feel simple, intuitive, and
          enjoyable to use. My past work spans urban transit apps, geospatial
          dashboards, healthcare platforms, and e-commerce experiences, the kinds of
          products with lots of moving pieces behind the scenes that I genuinely love
          untangling.
        </p>
        <p className="ts-body">
          I originally came from a more technical background, but I then realized I
          was always the most excited about the human side of technology such as
          understanding behaviors, simplifying confusing workflows, and designing
          products that people actually enjoy interacting with. That curiosity is what
          led me into UX, and now I love working at the intersection of technology,
          design, and human behavior to turn messy problems into thoughtful digital
          experiences.
        </p>
        <p className="ts-body">
          Outside of design, I’m usually experimenting with baking, painting, dancing
          (Traditional Chinese Dance, Ballet &amp; Contemporary), taking way too many
          photos on my digital camera, or planning my next travel adventure!
        </p>
        <p className="ts-body">
          <strong className="font-semibold">3 words to describe me</strong>: Curious👀.
          Adventurous🥾. Thoughtful💓.
        </p>

        {/* Framer's "Contact Button" inside the card, opening a mail client */}
        <a
          href="mailto:annelin.yuen@gmail.com"
          className="mt-1 inline-flex w-fit items-center justify-center rounded-full bg-dark-charcoal px-6 py-2.5 text-off-white transition hover:brightness-125"
        >
          <span className="ts-button text-off-white">Contact me</span>
        </a>
      </div>
    </div>
  );
}

export function NotesContent() {
  return (
    <div className="flex h-full w-full flex-col gap-3 overflow-y-auto">
      <p className="ts-body-small-light text-center">May 10, 2026 at 11:35 AM</p>
      <h2 className="ts-heading-3">My Design Philosophy</h2>
      <p className="ts-body">
        I love designing products that make complicated systems feel clear and
        approachable. A lot of the projects I’ve worked on involve dense information,
        messy workflows, or high-pressure situations, like healthcare platforms, GIS
        systems, and transit apps and I enjoy figuring out how to simplify those
        experiences without losing important details.
      </p>
      <p className="ts-body">
        My background in CS also changed the way I think about design. I care a lot
        about feasibility, collaboration, and understanding how products actually work
        behind the scenes, not just how they look visually.
      </p>
      <p className="ts-body">
        For me, good design is usually about reducing confusion, helping people feel
        confident, and creating small moments that feel thoughtful and human. I pay a
        lot of attention to how people naturally think, what information they actually
        need, and where frustration starts to happen in a flow.
      </p>
      <p className="ts-body">
        I also love products with personality. I think digital experiences can still
        feel warm, playful, and emotional while being functional at the same time.
      </p>
    </div>
  );
}
