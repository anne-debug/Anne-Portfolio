"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/**
 * A case-study image that opens full screen when it is clicked.
 *
 * The breakdown diagrams are wide and detailed, and at the width of the column
 * they run in, the annotations on them are too small to read. This wraps one so
 * it can be opened over the page at whatever size the window allows.
 *
 * The open view is portalled to the body: the article sits in a stacking
 * context of its own, and the site's floating page nav is outside it, so an
 * overlay left in place would be painted under that nav whatever its z-index.
 *
 * Escape and a click anywhere close it. While it is open the page behind is
 * held still, the same way the case-study drawer holds it: the smooth-scroll
 * library drives the wheel, so stopping it covers the wheel, and `overflow`
 * covers touch and the scrollbar.
 */
export function Zoomable({
  children,
  src,
  alt,
  width,
  height,
}: {
  /** The image as it appears in the article. */
  children: ReactNode;
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  const [open, setOpen] = useState(false);
  /** The portal needs a document, so it waits for hydration. */
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    window.__lenis?.stop();
    document.body.style.overflow = "hidden";
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPad;
      window.__lenis?.start();
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Enlarge: ${alt}`}
        /* `zoom-in` rather than a badge: the image is the whole control. */
        className="block w-full cursor-zoom-in"
      >
        {children}
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  onClick={close}
                  role="dialog"
                  aria-modal="true"
                  aria-label={alt}
                  className="fixed inset-0 z-[70] flex cursor-zoom-out items-center justify-center bg-chestnut-bg p-4 tablet:p-10"
                >
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full text-dark-charcoal tablet:top-8 tablet:right-8"
                  >
                    <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden>
                      <path
                        d="m4 4 10 10M14 4 4 14"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  {/* Two modes, because one set of `auto` sizes cannot serve
                      both. From 810 the diagram is fitted to the window. Below
                      that, fitting a 2800x1200 diagram onto a phone gains
                      almost nothing over the column it came from, so it runs at
                      full height and pans sideways, which is what makes the
                      annotations readable. */}
                  <div
                    className="h-full w-full overflow-auto tablet:hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Image
                      src={src}
                      alt={alt}
                      width={width}
                      height={height}
                      sizes="100vw"
                      className="mx-auto h-full w-auto max-w-none"
                    />
                  </div>

                  <div
                    className="relative hidden h-full w-full tablet:block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Image src={src} alt={alt} fill sizes="100vw" className="object-contain" />
                  </div>

                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
