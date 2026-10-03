import Image from "next/image";

/**
 * A screen seated in the laptop Framer draws the Ryze hero in — a recording or
 * a still, whichever the page has.
 *
 * The frame is Framer's own export, which has a screenshot of the page baked
 * into its screen. The recording is laid over exactly that screen, the way
 * `PreviewMedia` lays an animation over the still it was captured from, so the
 * artwork underneath is covered rather than removed — there is no empty frame
 * to export and nothing new to draw.
 *
 * Every figure below was measured off the file. The screen sits at 10.016% from
 * the left and 3.175% from the top of a 1248x756 frame, 79.968% wide and
 * 85.847% tall, and the notch hangs 3.24% of that screen's height into its top
 * edge, 12.22% wide, starting 43.89% across. Holding the frame at its own
 * aspect ratio makes those shares exact at any size, so the recording stays in
 * its screen from a phone to a desktop.
 */

const FRAME = { width: 1248, height: 756 };
/** The screen, as a share of the frame. */
const SCREEN = { left: 10.016, top: 3.175, width: 79.968, height: 85.847 };
/** The notch, as a share of the screen it hangs into. */
const NOTCH = { left: 43.89, width: 12.22, height: 3.24 };

export function LaptopMockup({
  screen,
  alt,
  sizes = "967px",
  priority = false,
}: {
  /** What plays or sits in the screen: a video file, or a picture. */
  screen: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
}) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(screen);
  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: `${FRAME.width} / ${FRAME.height}` }}
    >
      <Image
        src="/case/TgcH0WP5wCamtgc6Wja3z3NQVE.png"
        alt=""
        fill
        sizes={sizes}
        className="object-contain"
        priority={priority}
      />

      <div
        className="absolute overflow-hidden"
        style={{
          left: `${SCREEN.left}%`,
          top: `${SCREEN.top}%`,
          width: `${SCREEN.width}%`,
          height: `${SCREEN.height}%`,
        }}
      >
        {/* Both the recording and the stills are a touch wider than the
            1.538:1 screen, so they fill from the top: the page's own header
            stays put and what goes is a little of the foot of the frame,
            rather than the picture being stretched to fit. */}
        {isVideo ? (
          <video
            src={screen}
            autoPlay
            loop
            muted
            playsInline
            aria-label={alt}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <Image
            src={screen}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover object-top"
          />
        )}
        {/* Framer's notch, redrawn over the recording: it hangs into the screen
            rather than sitting in the bezel, so covering the screen covers it
            too. */}
        <span
          aria-hidden
          className="absolute top-0 rounded-b-[6px] bg-black"
          style={{
            left: `${NOTCH.left}%`,
            width: `${NOTCH.width}%`,
            height: `${NOTCH.height}%`,
          }}
        />
      </div>
    </div>
  );
}
