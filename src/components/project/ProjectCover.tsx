import { BudgetCartCardArt } from "@/components/project/BudgetCartCardArt";
import { IbmControlPlaneArt } from "@/components/project/IbmControlPlaneArt";
import { MetroCardArt } from "@/components/project/MetroCardArt";
import { PreviewMedia } from "@/components/project/PreviewMedia";
import { projectPreview } from "@/lib/project-previews";

/**
 * Projects whose card picture is drawn rather than captured.
 *
 * Two reasons to be here. IBM is protected, so there is nothing safe to
 * photograph. Metro and BudgetCart are here because a card and a hero want
 * different compositions: a card is 480px wide at most and the hero has a
 * column to fill. While the previews were screenshots of the heroes the two
 * could not differ, and making the card better meant changing the page. Drawn
 * for the card, they are free of each other.
 */
const DRAWN: Record<string, typeof IbmControlPlaneArt | undefined> = {
  "ibm-watsonx-builder-control-plane": IbmControlPlaneArt,
  "taipei-metro-app": MetroCardArt,
  budgetcart: BudgetCartCardArt,
};

/**
 * What goes inside a project card's picture box.
 *
 * Normally the case study's own hero, captured by `npm run previews`. A
 * password-protected project has no capture on purpose — screenshotting its
 * hero would publish a picture of protected content at a guessable URL under
 * `public/`, which is the one thing the gate exists to prevent.
 *
 * Such a project can supply a drawn picture instead, built for the card and
 * holding nothing protected; see DRAWN. The plain padlock cover at the foot of
 * this file is what is left for one that supplies neither.
 *
 * The cover fills the same box at the same aspect ratio as any other picture.
 * The card around it is untouched: same frame, same radius, same copy, same
 * hover. Only what sits in the picture box differs, because for this project
 * there is no picture to show.
 */
export function ProjectCover({
  slug,
  title,
  sizes,
  className,
}: {
  slug: string;
  title: string;
  sizes: string;
  className?: string;
}) {
  const Drawn = DRAWN[slug];
  if (Drawn) return <Drawn title={title} className={className} />;

  const preview = projectPreview(slug);

  if (preview) {
    return (
      <PreviewMedia
        preview={preview}
        alt={title}
        sizes={sizes}
        className={className}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-light-grey-super/60 px-6">
      <LockGlyph />
      <span className="ts-body-small text-center text-light-grey">
        Password protected
      </span>
    </div>
  );
}

/** A small padlock, drawn to sit at the weight of the body text beside it. */
export function LockGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect
        x="3.75"
        y="8.75"
        width="12.5"
        height="8.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.75 8.75V6a3.25 3.25 0 0 1 6.5 0v2.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A project's status, laid over its picture while the card is under the
 * pointer — "In progress" and the like.
 *
 * It began as a chip in a corner and was too quiet to read against busy
 * artwork, so it is the whole frame now: a scrim dims the picture and the
 * label sits in the middle of it, which is the one place nothing else is
 * competing for attention and the one size that cannot be mistaken for part of
 * the image.
 *
 * Hidden by opacity rather than removed, so it costs the layout nothing on the
 * way in and screen readers hear it whether or not anyone is hovering. It
 * answers focus as well as the pointer, so a card reached by keyboard says the
 * same thing, and `prefers-reduced-motion` keeps the fade and drops nothing
 * else, because a fade is all there is.
 */
export function StatusOverlay({ label }: { label: string }) {
  return (
    <span
      /* `pointer-events-none` matters: the scrim covers the whole picture, and
         catching the pointer would mean hovering the card cancelled its own
         hover the moment this appeared, leaving it flickering.

         The dimming does the work and the blur only softens: at 2px the blur
         read as the picture being out of focus rather than deliberately set
         back, which on a 402px card is a lot of blur. */
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2.5 rounded-[inherit] bg-dark-charcoal/50 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-focus-visible:opacity-100 group-hover:opacity-100"
    >
      <span className="size-2.5 shrink-0 rounded-full bg-orange" aria-hidden />
      <span
        className="ts-body text-[22px] text-off-white"
        style={{ fontWeight: 600 }}
      >
        {label}
      </span>
    </span>
  );
}
