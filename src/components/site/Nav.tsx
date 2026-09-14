"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { useEffect, useState } from "react";

import { NavLink } from "./NavLink";
import { SecondaryButton } from "./SecondaryButton";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/my-projects", label: "Projects" },
];

/** Framer's "spring-physics 500 60 1 0s". */
const NAV_SPRING = {
  type: "spring" as const,
  stiffness: 500,
  damping: 60,
  mass: 1,
};

function AvailabilityDot() {
  return (
    <span className="relative flex size-1.5">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange opacity-50" />
      <span className="relative inline-flex size-1.5 rounded-full bg-orange" />
    </span>
  );
}

/**
 * Framer component "Navigation/Nav", pinned by the Main layout template.
 *
 * Two variants, as in Framer. Framer keeps its compact "Tablet & Phone" variant
 * all the way up to the desktop frame, so the switch is at 1200 and not at the
 * tablet breakpoint: every Framer tablet render shows the compact pill.
 *
 * On desktop, scrolling down collapses the pill:
 * the links and the Resume button fold away and the avatar expands to show
 * availability, then scrolling up reopens it. Below the tablet breakpoint the
 * pill uses Framer's "Tablet & Phone" variant instead, where a toggle button
 * reveals the links, because the full row does not fit a phone.
 */
export function Nav() {
  const [open, setOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (current < 80) {
      setOpen(true);
      return;
    }
    if (current > previous + 2) setOpen(false);
    else if (current < previous - 2) setOpen(true);
  });

  // Close the phone menu on Escape, and whenever the viewport grows past tablet.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const mq = window.matchMedia("(min-width: 810px)");
    const onChange = () => setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <>
      {/* ---- Desktop and tablet pill --------------------------------- */}
      <motion.nav
        aria-label="Main"
        className="fixed top-5 left-1/2 z-10 hidden items-center overflow-hidden rounded-[28px] border border-nav-border bg-nav-bg py-2 desktop:flex"
        style={{ x: "-50%", backdropFilter: "blur(5px)" }}
        animate={{
          gap: open ? 40 : 0,
          paddingLeft: 10,
          paddingRight: open ? 10 : 20,
        }}
        transition={NAV_SPRING}
      >
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/avatar.jpg"
            alt="Portfolio Creator Avatar"
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full object-cover"
            priority
          />
          <motion.div
            className="flex items-center gap-2.5 overflow-hidden whitespace-nowrap"
            initial={false}
            animate={{ width: open ? 0 : "auto", opacity: open ? 0 : 1 }}
            transition={NAV_SPRING}
          >
            <span className="ts-body text-light-grey">Open to opportunities</span>
            <AvailabilityDot />
          </motion.div>
        </div>

        <motion.div
          className="flex items-center gap-10 overflow-hidden"
          style={{ transformOrigin: "0% 50%" }}
          initial={false}
          animate={{ width: open ? "auto" : 1, opacity: open ? 1 : 0 }}
          transition={NAV_SPRING}
        >
          <div className="flex items-center gap-5">
            {LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </div>
          <SecondaryButton href="/resume" label="Resume" className="h-10" />
        </motion.div>
      </motion.nav>

      {/* ---- Phone pill ---------------------------------------------- */}
      <nav
        aria-label="Main"
        className="fixed top-5 left-1/2 z-10 flex w-[calc(100vw-32px)] max-w-[360px] -translate-x-1/2 flex-col desktop:hidden"
      >
        <div
          className="flex items-center gap-2.5 rounded-[28px] border border-nav-border bg-nav-bg py-2 pr-2 pl-2.5"
          style={{ backdropFilter: "blur(5px)" }}
        >
          <Image
            src="/images/avatar.jpg"
            alt="Portfolio Creator Avatar"
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full object-cover"
            priority
          />
          <span className="ts-body min-w-0 flex-1 truncate text-light-grey">
            Open to opportunities
          </span>
          <AvailabilityDot />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange text-white"
          >
            <motion.span
              animate={{ rotate: menuOpen ? 90 : 0 }}
              transition={NAV_SPRING}
              className="flex flex-col items-center justify-center gap-[5px]"
            >
              <span className="block h-0.5 w-3 rounded-full bg-white" />
              <span className="block h-0.5 w-3 rounded-full bg-white" />
            </motion.span>
          </button>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={NAV_SPRING}
              className="mt-2.5 flex flex-col gap-4 rounded-3xl border border-nav-border bg-nav-bg p-5"
              style={{ backdropFilter: "blur(5px)" }}
            >
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="ts-body text-light-grey transition-colors hover:text-orange"
                >
                  {link.label}
                </Link>
              ))}
              <SecondaryButton
                href="/resume"
                label="Resume"
                className="h-10 self-start"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>
    </>
  );
}
