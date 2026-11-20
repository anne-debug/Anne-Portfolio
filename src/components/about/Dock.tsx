"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/**
 * Framer component "Dock" with its "OverlayIcon" and "LinkIcon" children: a
 * frosted bar pinned near the bottom of the desktop. The first two icons open
 * panels, Mail copies Anne's email address (added 2026-11-20, her own icon
 * rather than Framer's), and the last opens LinkedIn in a new tab. Each lifts
 * and shows a tooltip on hover, as Framer's overlay icons do.
 */

interface DockButton {
  key: string;
  image: string;
  tooltip: string;
  href?: string;
  /** Text to put on the clipboard instead of opening anything. */
  copy?: string;
  /** Scale for art with empty space around it, so every icon reads as the same size. */
  zoom?: number;
  /** Draw the dock's divider to the left of this icon. */
  dividerBefore?: boolean;
}

const EMAIL = "annelin.yuen@gmail.com";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // older browsers, or a page without clipboard permission
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

const ICONS: DockButton[] = [
  {
    key: "about-me",
    image: "/about/Dsm5XfIQxbO5rMU6BOgDb5WqE.png",
    tooltip: "About Me",
    // the memoji fills 417 of the image's 529px height
    zoom: 1.27,
  },
  {
    key: "notes",
    image: "/about/4ar8CL6aUtjymV8jTsXrcPzXCM.svg",
    tooltip: "Notes",
  },
  {
    key: "mail",
    image: "/about/mail-icon.svg",
    tooltip: "Copy email",
    copy: EMAIL,
    dividerBefore: true,
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

export function Dock({
  onOpen,
  inline = false,
}: {
  onOpen: (key: string) => void;
  /** Sit in the page flow instead of on the desktop canvas. */
  inline?: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <div
      /* Framer sits the dock 100px up on phone, 40px on tablet, 19px on
         desktop. Inline, it is one of the About me cards. */
      className={`z-30 flex items-center gap-4 rounded-2xl border border-white/40 bg-white/35 p-3 backdrop-blur-md ${
        inline
          ? "relative w-fit self-start shadow-[0_0_0_1px_var(--v2-ring),0_6px_14px_rgba(0,0,0,0.06)]"
          : "absolute bottom-[100px] left-1/2 -translate-x-1/2 tablet:bottom-10 desktop:bottom-[19px]"
      }`}
      role="toolbar"
      aria-label="Dock"
    >
      {ICONS.map((icon) => {
        const content = (
          <>
            <Image
              src={icon.image}
              alt=""
              width={48}
              height={48}
              className="size-12 object-contain"
              style={icon.zoom ? { scale: icon.zoom } : undefined}
            />
            <Tooltip
              label={copied === icon.key ? "Copied email" : icon.tooltip}
              shown={hovered === icon.key || copied === icon.key}
            />
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
            {icon.dividerBefore ? (
              <span
                className={`h-8 w-px ${inline ? "bg-[var(--v2-ring)]" : "bg-white/50"}`}
                aria-hidden
              />
            ) : null}
            <motion.div
              whileHover={{ y: -6, scale: 1.08 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.3 }}
            >
              {icon.copy ? (
                <button
                  {...shared}
                  type="button"
                  aria-label={copied === icon.key ? `Copied ${icon.copy}` : `${icon.tooltip}: ${icon.copy}`}
                  onClick={async () => {
                    if (!(await copyText(icon.copy!))) return;
                    setCopied(icon.key);
                    window.setTimeout(() => setCopied((c) => (c === icon.key ? null : c)), 1800);
                  }}
                >
                  {content}
                  <span className="sr-only" aria-live="polite">
                    {copied === icon.key ? "Email copied" : ""}
                  </span>
                </button>
              ) : icon.href ? (
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
