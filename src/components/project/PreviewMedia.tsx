import Image from "next/image";

import type { ProjectPreview } from "@/lib/project-previews";
import { CARD_ASPECT } from "@/lib/thumbnails";

/** The card frame every preview sits in, as a number. */
const FRAME_ASPECT = (() => {
  const [w, h] = CARD_ASPECT.split("/").map(Number);
  return w / h;
})();

/**
 * The picture inside a project card, shared by the home page's Selected Work
 * and the rows on My Projects.
 *
 * It is a screenshot of the case study's own hero. Where that hero plays an
 * animation inside a handset, the card plays it too, so the interaction is
 * visible without opening the case study: the animation is laid back over
 * exactly the patch of the screenshot it came from, at coordinates the capture
 * script measured and wrote to the manifest.
 *
 * Every preview is laid out the same way, whichever project it belongs to: the
 * whole screenshot, sized to fit its card, centred in both directions, with no
 * crop and no per-project nudge. The captures carry a band of white around the
 * hero and the card frame is white too, so a picture whose shape is not quite
 * the frame's leaves a margin that cannot be seen.
 *
 * That, and keeping the animation still over a picture that is being resized,
 * both come from one box. The picture and the animation share a stage that
 * carries the picture's own aspect ratio: it takes the frame's full width when
 * the picture is the wider of the two, and otherwise only the share of that
 * width its own shape allows. Either way the stage is exactly the picture, so
 * anything inside can be placed as a percentage of it and stays put at every
 * width.
 *
 * The handset draws its Dynamic Island over the top of its screen, so the
 * animation starts at the island's lower edge. The strip above it is the
 * status bar, which does not move anyway.
 */
export function PreviewMedia({
  preview,
  alt,
  sizes,
  className = "",
}: {
  preview: ProjectPreview;
  alt: string;
  sizes: string;
  /** Applied to the picture, for the hover zoom the rows use. */
  className?: string;
}) {
  const { screen } = preview;

  /** Sized to fit the frame, centred in it, at the picture's own shape. */
  const stage = {
    aspectRatio: `${preview.width} / ${preview.height}`,
    width: `${Math.min(1, preview.width / preview.height / FRAME_ASPECT) * 100}%`,
  };

  if (!screen) {
    return (
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`}
        style={stage}
      >
        <Image src={preview.src} alt={alt} fill sizes={sizes} className="object-contain" />
      </div>
    );
  }

  const pct = (n: number) => `${n * 100}%`;
  /**
   * The screen's corner radius, which the manifest gives as a share of the
   * screen's width. A percentage border-radius would be measured against the
   * box's width and height separately and come out as an ellipse on a box this
   * tall, so it is written against the stage's width instead: the stage is a
   * container, one cqw is one percent of it, and the screen is a known share of
   * that.
   */
  const radius = `${(screen.radius * screen.width * 100).toFixed(3)}cqw`;

  return (
    <div
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={{ ...stage, containerType: "inline-size" }}
    >
      <Image src={preview.src} alt={alt} fill sizes={sizes} className="object-contain" />

      {/*
        The animation, laid over the still of its own first frame.

        The box is the whole screen, cornered exactly as the handset corners it,
        so the animation is clipped by the screen's shape rather than by a
        rectangle. Only then is the strip above the Dynamic Island cut away, as
        a straight edge that leaves those rounded corners intact. Sitting the
        box below the island instead, which is what this did before, gave it
        square top corners that reached past the screen's curve and printed the
        app over the bezel.
      */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: pct(screen.left),
          top: pct(screen.top),
          width: pct(screen.width),
          height: pct(screen.height),
          borderRadius: radius,
          clipPath: `inset(${(screen.clipTop * 100).toFixed(3)}% 0 0 0)`,
        }}
      >
        {/* Animated: Next's optimizer would flatten it to a single frame. It is
            fitted exactly as the page fits it, so it lands on the still rather
            than beside it. */}
        <Image
          src={screen.src}
          alt=""
          fill
          sizes={sizes}
          unoptimized
          style={{
            objectFit: screen.fit as "cover" | "contain",
            objectPosition: screen.position,
          }}
        />
      </div>
    </div>
  );
}
