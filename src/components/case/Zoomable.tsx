"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
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
/** How far in a pinch may go, as a multiple of the fitted picture. */
const MAX_SCALE = 5;
/** What a double tap jumps to, and what counts as "not fitted" on the way back. */
const TAP_SCALE = 2.5;
/** Milliseconds between two taps for them to be one gesture. */
const TAP_WINDOW = 300;

/** A wheel notch's worth of zoom. Exponential, so it feels the same in and out. */
const WHEEL_RATE = 0.0015;
/** What the + and − buttons do per press. */
const STEP = 1.4;

/**
 * The opened picture: fitted to the window, then zoomed and panned.
 *
 * It replaces a container that showed the file at its own pixels and let the
 * browser scroll it. That panned, but it could not zoom: a 1292px screenshot
 * arrived on a 390px phone at three and a half times the width of the window
 * with no way to see the whole of it, and no way to go closer either. Fitting
 * it first and handing the zoom to the reader is the other way round.
 *
 * Pinch, drag and double-tap on a touch screen; wheel or trackpad, drag and
 * double-click with a pointer; and, for anyone with neither gesture to hand,
 * the buttons under it.
 *
 * Why the gestures are handled here rather than left to the browser: a scroll
 * container needs `touch-action` to allow panning, and once the browser owns
 * the touch it keeps the second finger too, so the pinch never arrives. Taking
 * `touch-action: none` means both gestures have to be written out, but they
 * are both available.
 */
function ZoomStage({
  children,
  className,
  controls = false,
}: {
  children: ReactNode;
  /** Which widths the stage is for; the default is every width. */
  className?: string;
  /** Draw the zoom buttons. Off where the stage is the phone-only fallback. */
  controls?: boolean;
}) {
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  /* State drives the transform; the ref is what the handlers read, because a
     pointer stream fires far faster than React re-renders and each move has
     to start from where the last one left off, not from a stale render. */
  const viewRef = useRef(view);
  const apply = useCallback((v: { s: number; x: number; y: number }) => {
    viewRef.current = v;
    setView(v);
  }, []);

  const box = useRef<HTMLDivElement | null>(null);
  /** Live pointers, by id: one is a drag, two are a pinch. */
  const pts = useRef(new Map<number, { x: number; y: number }>());
  /** Where a pinch began, so the whole gesture is measured from one origin. */
  const pinch = useRef<{
    dist: number;
    s: number;
    x: number;
    y: number;
    mx: number;
    my: number;
  } | null>(null);
  const dragged = useRef(false);
  const lastTap = useRef(0);

  /**
   * Hold the picture against the window.
   *
   * At the fitted size there is nothing to pan to, so the offsets collapse to
   * zero and the picture snaps back to the middle. Zoomed in, it may travel
   * by half of whatever now hangs outside the window, which is what stops a
   * reader flicking the picture off the screen and being left with nothing.
   */
  const clamp = useCallback((s: number, x: number, y: number) => {
    const el = box.current;
    const img = el?.querySelector("img");
    if (!el || !img) return { s, x, y };
    const mx = Math.max(0, (img.offsetWidth * s - el.clientWidth) / 2);
    const my = Math.max(0, (img.offsetHeight * s - el.clientHeight) / 2);
    return {
      s,
      x: Math.min(mx, Math.max(-mx, x)),
      y: Math.min(my, Math.max(-my, y)),
    };
  }, []);

  const onDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    /* Track the pointer first, and never let the capture take the gesture
       down with it. `setPointerCapture` throws if the browser no longer has
       an active pointer with this id — a touch that ended between the event
       being queued and the handler running, and anything synthesising events
       — and a throw here used to abort the handler before the pointer was
       recorded, so the finger existed for the browser and not for us. The
       capture only keeps the stream coming if a finger leaves the picture;
       losing it degrades the gesture, it does not break it. */
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* no capture; the gesture still runs on the events that do arrive */
    }
    dragged.current = false;
    if (pts.current.size === 2) {
      const [a, b] = [...pts.current.values()];
      const v = viewRef.current;
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        s: v.s,
        x: v.x,
        y: v.y,
        mx: (a.x + b.x) / 2,
        my: (a.y + b.y) / 2,
      };
    }
  }, []);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const prev = pts.current.get(e.pointerId);
      if (!prev) return;
      pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const v = viewRef.current;

      if (pts.current.size === 1) {
        if (v.s <= 1.001) return; // fitted: nothing to pan to
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) dragged.current = true;
        apply(clamp(v.s, v.x + dx, v.y + dy));
        return;
      }

      const g = pinch.current;
      if (pts.current.size !== 2 || !g || !g.dist || !box.current) return;
      const [a, b] = [...pts.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (!dist) return;
      dragged.current = true;
      const s = Math.min(MAX_SCALE, Math.max(1, (g.s * dist) / g.dist));
      /* Keep whatever is under the fingers under the fingers. With the origin
         at the centre, the offset that does it is
         `m - (m - T) * s'/s`, where `m` is the midpoint measured from that
         centre. Without it the picture slides away from the pinch. */
      const r = box.current.getBoundingClientRect();
      const mx = g.mx - (r.left + r.width / 2);
      const my = g.my - (r.top + r.height / 2);
      const k = s / g.s;
      apply(clamp(s, mx - (mx - g.x) * k, my - (my - g.y) * k));
    },
    [apply, clamp],
  );

  const onUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      pts.current.delete(e.pointerId);
      if (pts.current.size < 2) pinch.current = null;
      if (dragged.current || pts.current.size !== 0) return;
      const now = Date.now();
      if (now - lastTap.current < TAP_WINDOW) {
        const v = viewRef.current;
        apply(v.s > 1.05 ? { s: 1, x: 0, y: 0 } : clamp(TAP_SCALE, 0, 0));
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    },
    [apply, clamp],
  );

  /**
   * Zoom about a point, wherever that point came from — two fingers, the
   * cursor under a wheel, or the middle of the stage for a button. Keeping
   * what is under that point under it is `m - (m - T) * s'/s`, with `m`
   * measured from the stage's centre, which is where the transform's origin
   * is.
   */
  const zoomAbout = useCallback(
    (next: number, cx?: number, cy?: number) => {
      const el = box.current;
      if (!el) return;
      const v = viewRef.current;
      const s = Math.min(MAX_SCALE, Math.max(1, next));
      if (s === v.s) return;
      const r = el.getBoundingClientRect();
      const mx = cx === undefined ? 0 : cx - (r.left + r.width / 2);
      const my = cy === undefined ? 0 : cy - (r.top + r.height / 2);
      const k = s / v.s;
      apply(clamp(s, mx - (mx - v.x) * k, my - (my - v.y) * k));
    },
    [apply, clamp],
  );

  /*
    A native listener, and not React's `onWheel`: React registers wheel at
    the root as passive, so `preventDefault` from a handler there does
    nothing and the page would scroll behind the picture as it zoomed.

    It is on the element and bubbles, so it runs before Lenis's own listener
    on the window — which is stopped while the lightbox is open in any case.
  */
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAbout(
        viewRef.current.s * Math.exp(-e.deltaY * WHEEL_RATE),
        e.clientX,
        e.clientY,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAbout]);

  const zoomed = view.s > 1.001;

  return (
    <div
      ref={box}
      /* The picture swallows its own taps: a tap on it is a zoom gesture,
         and clicking away from it is one of the three ways out of here. */
      onClick={(e) => e.stopPropagation()}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className={`relative h-full w-full touch-none overflow-hidden overscroll-contain ${
        zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      } ${className ?? "tablet:hidden"}`}
    >
      <div
        className="absolute inset-0 flex items-center justify-center will-change-transform"
        style={{
          transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})`,
        }}
      >
        {children}
      </div>

      {/*
        The zoom, said out loud. The gestures are there for whoever reaches
        for them, but a reader who does not know a picture can be pinched or
        double-clicked has nothing to go on, and a mouse with a notched wheel
        is a coarse way to find 140%.
      */}
      {controls ? (
        <div
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-grey-100 bg-[var(--color-off-white)]/95 px-1 py-1 tablet:bottom-8"
          /* A click on the buttons is not a click on the picture. */
          onPointerDown={(e) => e.stopPropagation()}
        >
          <StageButton
            label="Zoom out"
            onClick={() => zoomAbout(viewRef.current.s / STEP)}
            disabled={!zoomed}
          >
            <path d="M5 11h12" />
          </StageButton>
          <span
            aria-hidden
            className="ts-body-small-light min-w-[52px] text-center tabular-nums"
          >
            {Math.round(view.s * 100)}%
          </span>
          <StageButton
            label="Zoom in"
            onClick={() => zoomAbout(viewRef.current.s * STEP)}
            disabled={view.s >= MAX_SCALE - 0.001}
          >
            <path d="M11 5v12M5 11h12" />
          </StageButton>
        </div>
      ) : null}
    </div>
  );
}

/** One of the zoom buttons: a 44px target around a 22px glyph. */
function StageButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-11 cursor-pointer items-center justify-center rounded-full text-dark-charcoal transition-opacity duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default disabled:opacity-35"
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          {children}
        </g>
      </svg>
    </button>
  );
}

export function Zoomable({
  children,
  src,
  alt,
  width,
  height,
  cornerRadius,
  triggerClassName,
  panOnDesktop = false,
  pinchZoom = false,
  fitZoom = false,
}: {
  /** The image as it appears in the article. */
  children: ReactNode;
  src: string;
  alt: string;
  width: number;
  height: number;
  /**
   * The corner the opened picture is clipped to, as a CSS `border-radius`.
   *
   * The copy in the article may be clipped to a corner shared with the
   * pictures beside it; opening it should not hand back the file's own
   * instead. Give it as a percentage pair rather than pixels — the opened
   * picture is the file's own size on a desktop and the window's height on a
   * phone, and a share holds the same corner at both.
   *
   * Omitted, nothing is clipped and the file presents exactly as it is, which
   * is what Metro and BudgetCart want.
   */
  cornerRadius?: string;
  /**
   * Extra classes for the trigger — the button wrapping the picture in the
   * article, not anything in the lightbox.
   *
   * It exists for one case: a caller whose picture is laid into a box of a
   * definite height. The button is `block w-full` with its height left to its
   * content, so a child asking for `h-full` inside it resolves against
   * nothing and collapses. Passing `h-full` here puts the height back in the
   * chain.
   */
  triggerClassName?: string;
  /**
   * On a touch screen, open the picture fitted to the window and let it be
   * pinched and dragged, instead of showing it at the file's own pixels in a
   * scroll container.
   *
   * Off by default, and the default is what Metro and BudgetCart keep. The
   * two behaviours are genuinely different — one starts whole and goes
   * closer, the other starts close and moves around — and switching those
   * pages over is a change to how they read, not a fix, so it is asked for
   * rather than assumed.
   */
  pinchZoom?: boolean;
  /**
   * Open at the file's own pixels on a desktop and pan, instead of fitting the
   * whole picture to the window.
   *
   * Off by default, which is what Metro and BudgetCart want: a flow diagram
   * 2800px wide is opened to be seen whole, and showing it at 1:1 would just
   * be the column again behind a scrollbar. A product screenshot is the other
   * case — it is opened to read the small type in it, and fitting a 1292px
   * screen into an 820px-tall window throws away a tenth of the resolution
   * the file actually has.
   */
  panOnDesktop?: boolean;
  /**
   * One behaviour at every width: the whole picture fitted to the window,
   * then zoomed and panned from there. It supersedes `pinchZoom` and
   * `panOnDesktop`, which it exists because of.
   *
   * `panOnDesktop` opens at the file's own pixels, which is right for a
   * screenshot of a 1292px screen and wrong for a full-page capture: Home V1
   * is 2160x3517, so opening it put a reader a third of the way into an image
   * three times the height of their window with no way out but the scrollbar.
   * Fitting first answers "what am I looking at" before "what does that say",
   * and the zoom is still there for the second question.
   */
  fitZoom?: boolean;
}) {
  /* An animation has to reach the browser as the file it is. Run through the
     image optimizer a GIF comes back as one still frame, so the picture that
     moves in the article would stop the moment it was opened. */
  const animated = /\.gif$/i.test(src);

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
    if (img && !img.complete)
      img.addEventListener("load", centre, { once: true });
    else requestAnimationFrame(centre);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Enlarge: ${alt}`}
        /* `zoom-in` rather than a badge: the image is the whole control. */
        className={`block w-full cursor-zoom-in ${triggerClassName ?? ""}`}
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
                    /* `z-[1]`, because the picture below is a later sibling
                       and without it paints over this button — the control
                       was visible and unclickable. */
                    /* `size-11` is 44px, the touch target, and the ring is
                       drawn in `currentColor` so it follows the glyph. */
                    className="absolute top-4 right-4 z-[1] flex size-11 cursor-pointer items-center justify-center rounded-full text-dark-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 tablet:top-8 tablet:right-8"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 18 18"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="m4 4 10 10M14 4 4 14"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  {/* One stage at every width, fitted and then zoomed. */}
                  {fitZoom ? (
                    <ZoomStage className="h-full w-full" controls>
                      <Image
                        unoptimized={animated}
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        /* The file's own width, not the window's: the picture
                           is drawn fitted and then scaled up, so the bitmap
                           behind it has to be the full one or zooming in
                           finds nothing to show. */
                        sizes={`${width}px`}
                        style={{ borderRadius: cornerRadius }}
                        className="h-auto max-h-full w-auto max-w-full object-contain"
                      />
                    </ZoomStage>
                  ) : null}

                  {/* Two modes, because one set of `auto` sizes cannot serve
                      both. From 810 the diagram is fitted to the window. Below
                      that, fitting a 2800px diagram onto a phone gains nothing
                      over the column it came from, so it runs at full height
                      and is panned, which is the point of opening it. */}
                  {fitZoom ? null : pinchZoom ? (
                    <ZoomStage>
                      <Image
                        unoptimized={animated}
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        /* The file's own width, not the window's: the picture
                           is drawn small and then scaled up by a pinch, so
                           the bitmap behind it has to be the full one or
                           zooming in finds nothing to show. */
                        sizes={`${width}px`}
                        style={{ borderRadius: cornerRadius }}
                        className="h-auto max-h-full w-auto max-w-full object-contain"
                      />
                    </ZoomStage>
                  ) : (
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
                        unoptimized={animated}
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        /* The drawn width here is the picture's own, not the
                           window's. Asking for `100vw` had the browser keep
                           the 390px-wide variant it had already fetched for
                           the column and stretch that across 2800px, so
                           opening a diagram produced a blurrier picture than
                           the one it came from. */
                        sizes={`${width}px`}
                        className="h-full w-auto max-w-none"
                        style={{
                          maxWidth: width,
                          maxHeight: height,
                          borderRadius: cornerRadius,
                        }}
                      />
                    </div>
                  )}

                  {/*
                    The picture itself is the thing that swallows the click,
                    not a box around it. A full-size `div` holding a `fill`
                    image covered the whole window, so the empty space beside a
                    letterboxed picture counted as "on the picture" and a click
                    there did nothing, when clicking away from it is one of the
                    three ways out of here.
                  */}
                  {fitZoom ? null : panOnDesktop ? (
                    <div
                      ref={panRef}
                      className="hidden h-full w-full overflow-auto overscroll-contain tablet:block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* At its own pixels, centred by `panRef`, panned when
                          the window is smaller. */}
                      <Image
                        unoptimized={animated}
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        sizes={`${width}px`}
                        className="max-w-none"
                        style={{ width, height, borderRadius: cornerRadius }}
                      />
                    </div>
                  ) : (
                    <Image
                      unoptimized={animated}
                      src={src}
                      alt={alt}
                      width={width}
                      height={height}
                      sizes="100vw"
                      onClick={(e) => e.stopPropagation()}
                      style={{ borderRadius: cornerRadius }}
                      className="hidden h-auto max-h-full w-auto max-w-full object-contain tablet:block"
                    />
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
