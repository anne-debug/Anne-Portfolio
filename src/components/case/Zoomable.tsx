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

  /**
   * Opening a diagram wider than the screen used to leave it against its left
   * edge, which reads as stuck. It starts centred instead, so the pan runs both
   * ways from where the eye lands.
   */
  const panRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const centre = () => {
      node.scrollLeft = (node.scrollWidth - node.clientWidth) / 2;
      node.scrollTop = (node.scrollHeight - node.clientHeight) / 2;
    };
    centre();
    // Again once the picture has laid out, since its width decides the range.
    const img = node.querySelector("img");
    if (img && !img.complete) img.addEventListener("load", centre, { once: true });
    else requestAnimationFrame(centre);
  }, []);

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
                      that, fitting a 2800px diagram onto a phone gains nothing
                      over the column it came from, so it runs at full height
                      and is panned, which is the point of opening it. */}
                  <div
                    ref={panRef}
                    className="h-full w-full touch-pan-x touch-pan-y overflow-auto overscroll-contain tablet:hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Full height, but never past the file's own pixels. A
                        flow diagram 2800 wide and 320 tall would otherwise be
                        blown to seven thousand pixels to reach the height of a
                        phone, which is two and a half times its own resolution
                        and reads softer than the copy in the column. Capped, a
                        short wide picture opens at its natural size and a tall
                        one still fills the screen. */}
                    <Image
                      src={src}
                      alt={alt}
                      width={width}
                      height={height}
                      /* The drawn width here is the picture's own, not the
                         window's. Asking for `100vw` had the browser keep the
                         390px-wide variant it had already fetched for the
                         column and stretch that across 2800px, so opening a
                         diagram produced a blurrier picture than the one it
                         came from. */
                      sizes={`${width}px`}
                      className="h-full w-auto max-w-none"
                      style={{ maxWidth: width, maxHeight: height }}
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
