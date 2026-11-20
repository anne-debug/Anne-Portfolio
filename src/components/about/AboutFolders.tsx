"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

import { OPEN_FOLDER_EVENT } from "@/components/v2/FigmaPinboard";

import { FOLDERS } from "./AboutDesktop";
import { AboutMeCard, NotesContent } from "./AboutPanels";
import { Carousel } from "./Carousel";
import { DesktopWindow } from "./DesktopWindow";
import { Dock } from "./Dock";

/**
 * What is left of the About page's folder desktop once Anne took the desktop
 * itself out (2026-11-20): the dock, pinned to the bottom of the screen, and
 * the folder windows, which now open over the page. The pinboard's photos
 * open a folder through OPEN_FOLDER_EVENT; the dock opens the profile card
 * and the notes. The desktop and its data still live in AboutDesktop.tsx.
 */
export function AboutFolders() {
  const [open, setOpen] = useState<string | null>(null);
  const folder = FOLDERS.find((f) => f.key === open);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const key = (e as CustomEvent<string>).detail;
      if (FOLDERS.some((f) => f.key === key)) setOpen(key);
    };
    window.addEventListener(OPEN_FOLDER_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_FOLDER_EVENT, onOpen);
  }, []);

  return (
    <>
      <Dock onOpen={setOpen} pinned />
      {/* windows open over the page, sized against the screen */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <AnimatePresence>
          {folder ? (
            <DesktopWindow key={folder.key} pageName={folder.pageName} onClose={() => setOpen(null)}>
              <div className="flex flex-col gap-2.5">
                <h2 className="ts-heading-3">{folder.heading}</h2>
                <p className="ts-body">{folder.body}</p>
              </div>
              {folder.carousels.map((c, i) => (
                <div key={i} className="flex flex-col gap-2.5">
                  {c.heading ? <h3 className="ts-heading-6">{c.heading}</h3> : null}
                  {c.note ? <p className="ts-body">{c.note}</p> : null}
                  <Carousel images={c.images} alt={c.heading ?? folder.heading} />
                </div>
              ))}
            </DesktopWindow>
          ) : null}

          {open === "about-me" ? (
            <DesktopWindow key="about-me" pageName="About Me" onClose={() => setOpen(null)} widthPercent={80} heightPercent={75}>
              <AboutMeCard />
            </DesktopWindow>
          ) : null}

          {open === "notes" ? (
            <DesktopWindow key="notes" pageName="Notes" onClose={() => setOpen(null)} widthPercent={78} heightPercent={70}>
              <NotesContent />
            </DesktopWindow>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}
