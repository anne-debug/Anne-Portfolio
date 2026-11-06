import sharp from "sharp";

/**
 * Builds the IBM case study's opening animation from the Eye-Bee-M source.
 *
 * The motion is not ours and is not re-timed: every frame of the source is
 * kept, in order, at its own 40ms, so what plays is the original animation.
 * Three things are done to it, and nothing else.
 *
 * 1. **The sheet goes dark.** The source is drawn on white. Each pixel's
 *    distance from white becomes a mix between the hero's charcoal and one
 *    blue, so the page's own background is what the symbols sit on instead of
 *    a white card dropped into a dark page. Both ends of that ramp are the
 *    page's colours: if the hero's ground ever changes, `BASE` changes with
 *    it, or the animation arrives as a card of the old colour.
 *
 * 2. **One colour.** Carbon Blue 50 for all three symbols, the same blue the
 *    hero's text and its field already use. The mix keeps the source's own
 *    tones as steps between charcoal and blue rather than flattening them,
 *    which is what holds the bee's stripes, the eye's iris and the M's bars
 *    together — a threshold would have turned all three into silhouettes.
 *    `GAMMA` lifts the middle of that ramp, because a straight mix leaves the
 *    iris and the wings too close to the background to read.
 *
 * 3. **The tail is cut.** The source runs 162 frames: the bee leaves the
 *    frame at 156, 157 is empty, and 158 to 161 are the logo streaking back
 *    in, blurred. The last four are what this drops. Cutting at 157 leaves
 *    one empty frame at the end, which is the beat the page fades up on — no
 *    held last frame, no ghost, and `loop: 1` so it never runs twice.
 *
 * Output is a GIF rather than an animated WebP because an encoder writes an
 * animation as one tall image and WebP's dimension limit stops at 16383px:
 * 158 frames do not fit at any useful size. GIF's limit is 65535, which is
 * what sets the frame size below — 414 is the tallest 158 frames can be.
 *
 *   node scripts/ibm-intro-frames.mjs <source.gif>
 */

/** Where the asset is written. The page points `IbmIntro` at this path. */
const OUT = "public/ibm-intro/eye-bee-m.gif";

/** The last source frame kept. 158 to 161 are the blurred logo returning. */
const LAST = 157;

/** Frame size. 414 is `floor(65535 / 158)`; the width follows the crop. */
const W = 552;
const H = 414;

/**
 * The window taken from each source frame, in source pixels.
 *
 * The source is 1600x1200 and the action uses x 272-1600, y 64-1048 — the
 * bee's whole flight, measured over every frame. This trims most of what is
 * left over, which is what buys the symbols their size back; the right edge
 * stays where it is because that is where the bee leaves.
 */
const CROP = { left: 240, top: 48, width: 1360, height: 1020 };

/** 40ms a frame, as the source holds them. */
const DELAY = 40;

/** Carbon Blue 50, and the hero's charcoal underneath it. */
const BLUE = [0x45, 0x89, 0xff];
const BASE = [0x16, 0x16, 0x16];

/** The source sheet is not quite white; this much ink is background. */
const FLOOR = 10;
/** Below 1, which lifts the mid tones. See 2 above. */
const GAMMA = 0.82;

const source = process.argv[2];
if (!source) {
  console.error("usage: node scripts/ibm-intro-frames.mjs <source.gif>");
  process.exit(1);
}

const frames = [];
for (let page = 0; page <= LAST; page++) {
  const { data } = await sharp(source, {
    animated: true,
    limitInputPixels: false,
    page,
    pages: 1,
  })
    .extract(CROP)
    .resize(W, H, { kernel: "lanczos3" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const frame = Buffer.allocUnsafe(W * H * 3);
  for (let src = 0, out = 0; out < frame.length; src += 3, out += 3) {
    const ink = 255 - Math.min(data[src], data[src + 1], data[src + 2]);
    const t = ink <= FLOOR ? 0 : Math.pow((ink - FLOOR) / (255 - FLOOR), GAMMA);
    for (let c = 0; c < 3; c++) {
      frame[out + c] = Math.round(BASE[c] + (BLUE[c] - BASE[c]) * t);
    }
  }
  frames.push(frame);
}

await sharp(Buffer.concat(frames), {
  raw: { width: W, height: H * frames.length, channels: 3, pageHeight: H },
})
  .gif({
    loop: 1,
    delay: frames.map(() => DELAY),
    colours: 64,
    effort: 8,
    // Merges frames the eye cannot tell apart and adds their delays together,
    // which is most of the file size on an animation that holds still for the
    // first two seconds. The total duration is unchanged.
    interFrameMaxError: 2,
  })
  .toFile(OUT);

console.log(
  `${OUT}: ${frames.length} frames, ${(frames.length * DELAY) / 1000}s`,
);
