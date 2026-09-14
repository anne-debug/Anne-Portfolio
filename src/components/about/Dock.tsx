"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/**
 * Framer component "Dock" with its "OverlayIcon" and "LinkIcon" children: a
 * frosted bar pinned near the bottom of the desktop. The first two icons open
 * panels, the last opens LinkedIn in a new tab. Each lifts and shows a tooltip
 * on hover, as Framer's overlay icons do.
 */

interface DockButton {
  key: string;
  image: string;
  tooltip: string;
  href?: string;
}

const ICONS: DockButton[] = [
  {
    key: "about-me",
    image: "/about/Dsm5XfIQxbO5rMU6BOgDb5WqE.png",
    tooltip: "About Me",
  },
  {
    key: "notes",
    image: "/about/4ar8CL6aUtjymV8jTsXrcPzXCM.svg",
    tooltip: "Notes",
  },
  {
    key: "linkedin",
    image: "/about/Ynn1qcNhr4uDvHP0e2UI9Wdzq8.png",
    tooltip: "LinkedIn",
    href: "https://www.linkedin.com/in/annelin0513/",
  },
];

function Tooltip({ label, shown }: { label: string; shown: boolean }) {
  return (
    <AnimatePresence>
      {shown ? (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-dark-charcoal px-2 py-1 whitespace-nowrap text-off-white"
          style={{ fontFamily: "var(--font-inter)", fontSize: "13px" }}
        >
          {label}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

export function Dock({ onOpen }: { onOpen: (key: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      /* Framer sits the dock 100px up on phone, 40px on tablet, 19px on desktop */
      className="absolute bottom-[100px] left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-white/40 bg-white/35 p-3 backdrop-blur-md tablet:bottom-10 desktop:bottom-[19px]"
      role="toolbar"
      aria-label="Dock"
    >
      {ICONS.map((icon, i) => {
        const content = (
          <>
            <Image
              src={icon.image}
              alt=""
              width={48}
              height={48}
              className="size-12 object-contain"
            />
            <Tooltip label={icon.tooltip} shown={hovered === icon.key} />
          </>
        );

        const shared = {
          className: "relative flex items-center justify-center",
          onMouseEnter: () => setHovered(icon.key),
          onMouseLeave: () => setHovered(null),
          onFocus: () => setHovered(icon.key),
          onBlur: () => setHovered(null),
          "aria-label": icon.tooltip,
        };

        return (
          <div key={icon.key} className="flex items-center gap-4">
            {i === ICONS.length - 1 ? (
              <span className="h-8 w-px bg-white/50" aria-hidden />
            ) : null}
            <motion.div
              whileHover={{ y: -6, scale: 1.08 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.3 }}
            >
              {icon.href ? (
                <a
                  {...shared}
                  href={icon.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {content}
                </a>
              ) : (
                <button {...shared} type="button" onClick={() => onOpen(icon.key)}>
                  {content}
                </button>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
