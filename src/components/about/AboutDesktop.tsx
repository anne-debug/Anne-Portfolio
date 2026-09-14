"use client";

import Image from "next/image";
import { AnimatePresence } from "motion/react";
import { useRef, useState, type CSSProperties } from "react";

import { AboutMeCard, NotesContent } from "./AboutPanels";
import { Carousel } from "./Carousel";
import { DesktopIcon } from "./DesktopIcon";
import { DesktopWindow } from "./DesktopWindow";
import { Dock } from "./Dock";

/**
 * Framer's About page: a desktop metaphor. A wallpaper fills the viewport, six
 * shortcuts sit at their recorded anchor points, and each opens a window at 90%
 * by 80% of the desktop. The dock opens the profile card and the notes panel.
 *
 * Framer draws this page at three breakpoints and moves the shortcuts between
 * them, so each one carries both anchors. Framer pins some by a pixel offset
 * and others by a percentage of the desktop, and both are reproduced as written
 * rather than converted, because the two behave differently as the page widens.
 *
 * The shortcuts can also be dragged around the desktop, which Framer does not
 * do. Dragging is clamped to the desktop area, and the shortcut that was picked
 * up last stays on top.
 */

interface Folder {
  key: string;
  /** Framer's group name, kept so the mapping stays traceable. */
  group: string;
  icon: string;
  label: string;
  /** The window's title-bar text, from the instance's pageName control. */
  pageName: string;
  heading: string;
  body: string;
  carousels: { images: string[]; heading?: string; note?: string }[];
  /** The Phone frame's anchor, in that frame's own 390x613 pixels. */
  phone: { x: number; y: number };
  /**
   * The Desktop and Tablet frames' anchor. Framer pins three of the six by a
   * pixel offset and three by a percentage of the desktop. The percentages are
   * kept as written; the pixel offsets get a percentage floor so that past
   * Framer's 1200px design width the whole composition keeps spreading with the
   * canvas instead of crowding into its left half. Each floor is the Framer
   * pixel over 1200, so at 1200 and below the Framer value still wins.
   */
  wide: CSSProperties;
}

const img = (f: string) => `/about/${f}`;

const CENTRED = "translate(-50%, -50%)";

/**
 * How far down Framer's 390x613 phone canvas the shortcuts actually reach: the
 * lowest one ends at 477, and the rest of that canvas is the dock's band.
 */
const PHONE_REACH = 477;
/** The dock's band at the bottom: 100px up, 72px tall, plus clearance. */
const DOCK_BAND = 180;
/** The height the shortcuts actually get, which is what sets their scale. */
const ROOM = `(100svh - ${DOCK_BAND}px)`;

/**
 * Scale a Phone-frame value by the desktop, the way `.about-shortcut` expects.
 *
 * Framer's phone canvas is 390x613, so the factor is min(width/390, height/613)
 * and the cap is the tablet breakpoint. Writing it as a min() of three lengths
 * keeps it out of a transform, which matters because the shortcuts are
 * draggable and a scaled ancestor would make them outrun the pointer.
 */
const scaled = (v: number) =>
  `min(${(v / 3.9).toFixed(2)}vw, calc((100svh - ${DOCK_BAND}px) * ${(v / PHONE_REACH).toFixed(5)}))`;

/**
 * The same, with the composition centred across any slack.
 *
 * Framer's phone canvas is taller than it is wide, so on a screen that is
 * proportionally wider the height sets the scale and there is width left over.
 * Splitting it puts the shortcuts in the middle of the desktop rather than
 * leaving the whole remainder down one side.
 */
const scaledX = (v: number) =>
  `calc((100% - min(100%, ${ROOM} * ${(390 / PHONE_REACH).toFixed(5)})) / 2 + ${scaled(v)})`;

/**
 * The vertical anchor, with the composition centred in the room above the dock.
 *
 * Framer's phone canvas is 613px tall but its lowest shortcut ends at 477, and
 * the 136px below that is where the dock sits. Scaling by the full 613 let the
 * bottom shortcut land on the dock whenever height set the scale, so the room
 * above the dock is what the scale divides instead. Any room left over after
 * that is split, which stops the composition sitting in the upper half of a
 * tall screen, and the split clamps at zero.
 */
const scaledY = (v: number) =>
  `calc(max(0px, (${ROOM} - min(${(PHONE_REACH / 3.9).toFixed(2)}vw, ${ROOM})) / 2) + ${scaled(v)})`;

/** Both anchor sets for one shortcut, as the custom properties the class reads. */
function anchorsFor(f: Folder): CSSProperties {
  const prop = (o: CSSProperties, key: keyof CSSProperties) => {
    const v = o[key];
    return v === undefined ? undefined : typeof v === "number" ? `${v}px` : String(v);
  };
  return {
    "--x": scaledX(f.phone.x),
    "--y": scaledY(f.phone.y),
    "--x2": prop(f.wide, "left"),
    "--y2": prop(f.wide, "top"),
    "--r2": prop(f.wide, "right"),
    "--b2": prop(f.wide, "bottom"),
    "--tf2": prop(f.wide, "transform"),
  } as CSSProperties;
}

const FOLDERS: Folder[] = [
  {
    key: "painting",
    group: "Painting",
    icon: img("VVsSPk4h5MpYujgq9pNf5HqJ4c.jpg"),
    label: "My Sketchbook",
    pageName: "Description",
    heading: "My Sketchbook",
    body: "I’ve loved drawing and creating since I was a kid, and I enjoy all kinds of art, from sketching, crayon drawings, pottery, little handmade crafts, anything creative. It’s still one of my favorite ways to express myself and relax.",
    carousels: [
      {
        images: [
          "VmtT91sDF3asaxLGy86eSPkljNQ.jpg",
          "YhHrs4Cxcwc28zSxsWPKCEdOUbQ.jpg",
          "AmRC8hFi98DppvX9ayZJJSk.jpg",
          "auvT9AV2xZYbWYyERna1FZ8EGic.png",
          "VyAvkf0Ps8SOK3AIo5g6hFRNhw.jpg",
          "ZgcBzQNFISqHF4mz8mqTGJ0ZekE.jpg",
          "ircbrYojbaWNUJ82RiL1tGcAuU.jpg",
          "49unMfVFJpS2O90ULgL5C6YLXPM.jpg",
          "m42jSEI8H2cEqgQJMNcRDie0kvA.jpg",
          "lIxchvftvG3Id272ZFILwVxxY.jpg",
        ].map(img),
      },
    ],
    phone: { x: 60, y: 96 },
    wide: { left: "max(168px, 14%)", top: 96 },
  },
  {
    key: "traveling",
    group: "Traveling",
    icon: img("CSCLKHYYBu6e22OJ0ffTK4LaB8I.jpg"),
    label: "Miles & Memories",
    pageName: "Travel",
    heading: "Miles & Memories",
    body: "I’m definitely an adventurer at heart and always looking for my next trip. One of the craziest and most unforgettable things I’ve done was completing two Caminos, first walking across almost the entire north of Spain from east to west, then completing the Kumano Kodo pilgrimage in Japan the next year. I love exploring new places, meeting people from different cultures, and collecting memories along the way!",
    carousels: [
      {
        images: [
          "jxfv3FEzwRNktTSildq4R2WWc.jpg",
          "wDZw2bnS6IbFWKNWwlYEMWWCiSY.jpg",
          "CSCLKHYYBu6e22OJ0ffTK4LaB8I.jpg",
          "oZ4YxdcGUvB0juRswYv89znOTc.jpg",
          "YrWjpCsxBSUt4gNrJmrCSDplGvA.jpg",
          "aAdYfTSkoYlna6zt3IKQ5WeeE.jpg",
          "9483SZMv9ldUG9POaGKJR6FzEc.jpg",
          "vybE0WsZwQ1e64UsksG4p21N8.jpg",
          "GNmCoW4VRjRCjMWinfOx8OwaOaY.jpg",
        ].map(img),
      },
    ],
    phone: { x: 230, y: 400 },
    wide: { left: "max(228px, 19%)", bottom: 149.2 },
  },
  {
    key: "photo",
    group: "Photo",
    icon: img("asIuBI4nbW0KG3KxZDZ3EbBQsc.jpg"),
    label: "Olympus mju ii",
    pageName: "My timeline",
    heading: "Olympus mju ii",
    body: "I’m also really into photography 📸, honestly, probably 1/3 of my trips are just me taking photos everywhere. I love digital cameras, capturing street scenes, little details, and moments that make a place feel special to me❤️",
    carousels: [
      {
        images: [
          "10PUKnU1smWf4X2FImRV6lXOaTQ.jpg",
          "M2jG8LYvZ2W0Ukseau6fnAJ1Iw.jpg",
          "OC9ZGLCHGotMoabL0jkCUmJXbY.jpg",
          "M6AuvLpggY3zYHQBA87y5euToDI.jpg",
          "aK52d1BX8Iz6D2SAt5IhPaA5OC8.jpg",
          "6vrcLqYJUcr80ZVKjh8SBfvmVkc.jpg",
          "SNGpQ8nDqJTTEcA7vwHci25LY.jpg",
          "N15ZZbzDYd2nTQB7R44fZ7zRzk.jpg",
          "uVx983cAmhHTZ6yavwurNJPOVio.jpg",
        ].map(img),
      },
    ],
    phone: { x: 100, y: 200 },
    wide: { left: "43%", top: "49%", transform: CENTRED },
  },
  {
    key: "baking",
    group: "Baking",
    icon: img("dB0OAyz54foHDtSsGO7nZTOIvQ.jpg"),
    label: "Anne's Bakery",
    pageName: "Baking",
    heading: "Anne's Bakery",
    body: "I’m kind of obsessed with desserts 🍪, and I love baking for my friends and family. It’s my way of sharing love and happiness, and honestly also how I de-stress!",
    carousels: [
      {
        images: [
          "FmCe5RrLcI4jwEgpzBXYsSmVc.jpg",
          "XlbFAZxbWUjERZj1xGgHuoNSU.jpg",
          "K93eVCtTdlLdLSr5mpXu5jL98KQ.jpg",
          "iufIaUaIEGzJDESlV5tS7rSL4.jpg",
          "0QkioLSz2nNuMpO1GEFHjFZ3IU.jpg",
          "uBXGAvJrACwuZvixl6goL2L7U8.jpg",
          "tc3MR2bWEqtJb6G4ZHjPwkbqUo.jpg",
        ].map(img),
      },
    ],
    phone: { x: 50, y: 350 },
    wide: { left: "68%", top: "62%", transform: CENTRED },
  },
  {
    key: "dancing",
    group: "Dancing",
    icon: img("U7ehKUAEDGAkKiqPiYuoxurjE.jpg"),
    label: "Where I Found Myself",
    pageName: "Dance",
    heading: "Where I Found Myself",
    body: "Throughout elementary and middle school, I was a dance team leader, and in high school I advanced to the national stage of Taiwan’s National Student Dance Competition, receiving an Excellence Award. Dance taught me so much beyond performance, discipline, resilience, leadership, and how to keep pushing myself even when things were hard. It really shaped a huge part of who I am today.💪🏻",
    carousels: [
      {
        images: [
          "zL4aOvF3IhLYbNtt8H39EGAZ9w0.jpg",
          "U6XPfHV3V6aRBpJvBljIxEEGTY.jpg",
          "HV2ogO7YGkrRLDlUqjKOAySKA.jpg",
          "asA6qCnwYvrCHYZVuBjNpVGB8Y.jpg",
          "5IRniOp9ewMWuu1SRO0g6haBwc.jpg",
          "2e3MG2vuinzND4A4C7ZmuGYbVe8.jpg",
          "XxZLx2Xr6mJyBeHlNjG2JQCFy4.jpg",
          "hMhbbBNMkCqFXBNyEaDphWcjBY.jpg",
          "nXRczs3vyO1KlDEbG0tKdHl1Ss.jpg",
          "3zuqjvdDK5UBJTA8xnxauZmPfOk.jpg",
        ].map(img),
      },
    ],
    phone: { x: 233, y: 150 },
    wide: { left: "74%", top: "41%", transform: CENTRED },
  },
  {
    key: "events",
    group: "Events",
    icon: img("MenWByF33GoO6mK2Hk78fLkLpo.jpg"),
    label: "Design Diary",
    pageName: "Event",
    heading: "Design Diaries",
    body: "I really love going to UX and design events and meeting other people who are passionate about design too. So far I’ve attended events like Figma Converge 2026 and the A2UX Designer Meetup, and I always leave feeling super inspired by all the different ideas and creative energy. I also just genuinely enjoy learning new things and keeping up with design trends and what’s happening in the industry!🚀",
    carousels: [
      {
        heading: "Figma 2026 Converge",
        note: "5 hrs design hackathon!!! Take a look at our working timelapse🎥",
        images: [
          "NlxZCg6Je3EEYyA4ysjRMZtFL0.jpg",
          "pGZaQaJVr0KX6ZA8yqEaMfEVp4c.jpg",
          "J00NayEfAGwkOenKdnUarAAYG1A.jpg",
          "auvT9AV2xZYbWYyERna1FZ8EGic.png",
        ].map(img),
      },
      {
        heading: "A2UX Event",
        note: "This semester, I started going to A2UX monthly meetups with designers around Ann Arbor to meet new people, exchange ideas, and join fun hands-on design activities and workshops. It’s been super exciting getting to connect with people outside of school, hear about their experiences, and learn from so many different perspectives in design.",
        images: [
          "zFLS24OAlMEn5eAaqFIblSenZ0.jpg",
          "ErlJpeuCS5Th2NjhFonkjDJTeQ.jpg",
          "yLiG0e3E1jFH5JuHeu6FukslBeQ.jpg",
          "pPL76m0ERqdW93tAJV4YwhgqESM.jpg",
          "2SQYg179Ymo4ZSXPvcJytByWho.jpg",
          "A6TfgbAF3RR2dBgQymYs1Wi3wTY.jpg",
        ].map(img),
      },
    ],
    // Framer pins this one at left 1000, which is off the canvas on both the
    // Tablet and the Phone frame, so Design Diary cannot be opened there at
    // all. 82% lands within 16px of Framer's pixel at 1200 and keeps the
    // shortcut on the canvas, and well clear of the edge, at every other width.
    phone: { x: 240, y: 270 },
    wide: { left: "82%", top: 51 },
  },
];

export function AboutDesktop() {
  const [open, setOpen] = useState<string | null>(null);
  // The shortcut picked up last, so a dragged one passes over its neighbours.
  const [front, setFront] = useState<string | null>(null);
  const desk = useRef<HTMLDivElement>(null);
  const folder = FOLDERS.find((f) => f.key === open);

  // Full bleed: the wallpaper has to fill the viewport on every screen, so the
  // desktop is not held inside the 1200px reading column and carries no rounded
  // corner that would leave the page colour showing through.
  return (
    <section className="relative w-full overflow-hidden">
      {/* The visible headings all sit inside windows, so the document itself
          needs one. It is for assistive tech and search, not the layout. */}
      <h1 className="sr-only">About Anne Lin</h1>

      {/* Framer's wider composition needs about 645px of canvas before its 49%
          pin and its 149px bottom pin start to run into each other, so it keeps
          a floor under it on short screens. The phone composition wants the
          opposite: it scales off the viewport height, so the desktop has to be
          exactly that tall or the scale and the canvas disagree. */}
      <div ref={desk} className="relative h-[100svh] w-full tablet:min-h-[680px]">
        <Image
          src="/about/5AAAullhoa6AcTz5cyaQ5PRw.jpeg"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />

        {FOLDERS.map((f) => (
          <DesktopIcon
            key={f.key}
            image={f.icon}
            label={f.label}
            selected={open === f.key}
            onOpen={() => setOpen(f.key)}
            anchors={anchorsFor(f)}
            bounds={desk}
            zIndex={front === f.key ? 12 : 10}
            onPickUp={() => setFront(f.key)}
          />
        ))}

        {/* Framer's "Blur Gradient" is deliberately left out. It fades the
            wallpaper into the dock, but it also washes out any shortcut sitting
            in the bottom of the canvas, and the shortcuts here can be dragged
            anywhere. Readability wins over the fade. */}

        <Dock onOpen={setOpen} />

        <AnimatePresence>
          {folder ? (
            <DesktopWindow
              key={folder.key}
              pageName={folder.pageName}
              onClose={() => setOpen(null)}
            >
              <div className="flex flex-col gap-2.5">
                <h2 className="ts-heading-3">{folder.heading}</h2>
                <p className="ts-body">{folder.body}</p>
              </div>
              {folder.carousels.map((c, i) => (
                <div key={i} className="flex flex-col gap-2.5">
                  {c.heading ? (
                    <h3 className="ts-heading-6">{c.heading}</h3>
                  ) : null}
                  {c.note ? <p className="ts-body">{c.note}</p> : null}
                  <Carousel images={c.images} alt={c.heading ?? folder.heading} />
                </div>
              ))}
            </DesktopWindow>
          ) : null}

          {open === "about-me" ? (
            <DesktopWindow
              key="about-me"
              pageName="About Me"
              onClose={() => setOpen(null)}
              widthPercent={80}
              heightPercent={75}
            >
              <AboutMeCard />
            </DesktopWindow>
          ) : null}

          {open === "notes" ? (
            <DesktopWindow
              key="notes"
              pageName="Notes"
              onClose={() => setOpen(null)}
              widthPercent={78}
              heightPercent={70}
            >
              <NotesContent />
            </DesktopWindow>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
