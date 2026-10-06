#!/usr/bin/env node
/**
 * Regenerates the project-card previews from the case studies' own hero
 * sections.
 *
 *   npm run dev                  # in one terminal, if it is not already up
 *   npm run previews             # in another
 *
 * It finds the dev server on whichever of the usual ports is answering.
 * PREVIEW_BASE_URL points it somewhere else, and
 * PREVIEW_ONLY=budgetcart,ryze-coffee limits it to some projects.
 *
 * For each project it renders the real page in Chromium, finds the hero by its
 * DOM box, screenshots exactly that box at 2x, and writes
 * public/project-previews/<slug>.<hash>.webp plus a manifest the cards read
 * their pixel sizes from. The hash is of the picture itself, so regenerating
 * one changes its URL and no browser can go on showing the picture it had
 * before; the old file for that project is deleted. Nothing about the pages is changed on disk; the few
 * adjustments below exist only inside the headless browser for the capture.
 *
 * How the box is chosen
 * ---------------------
 * Every card frame on the home page is 1.4:1, and the My Projects frames sit
 * between 1.26 and 1.54. A hero captured at 1440 is 1.65 wide for Taipei and
 * BudgetCart, so filling a 1.4 frame would cut into the title or the collage.
 * These heroes are responsive, though, and at some real window width their own
 * layout is 1.4:1. The script measures the hero across a range of widths and
 * captures it at the one whose shape, margin included, is closest to the
 * target, so the preview is the page as it genuinely renders there rather than
 * a crop or a re-layout of it.
 *
 * Around the hero it adds a band of background. Frames that are not exactly the
 * capture's shape trim a little off two edges, and the band is wide enough that
 * what they trim is background, never the hero.
 *
 * The background, the hero's own and the band's, is forced to white for the
 * capture. On the page the hero sits on the site's off-white, and a preview
 * carrying that colour disappeared into the pages the cards sit on, which are
 * the same off-white. White makes the card's picture read as a picture.
 *
 * What is hidden for the capture
 * ------------------------------
 * Anything fixed to the window, which is chrome rather than hero: the floating
 * nav pill, the butterfly cursor, the Next.js dev badge, and the page grain.
 * The grain is also on the pages the cards sit on, so baking it into the
 * picture would double it. The section rail's toggle is hidden for the same
 * reason.
 *
 * Animated phone screens
 * ----------------------
 * Two heroes play a GIF inside the handset, and the cards play it too, so the
 * interaction is visible without opening the case study.
 *
 * The still is taken with each GIF pinned to its own first frame, so reruns come
 * out identical, and the card lays the animation back over exactly that patch of
 * the picture. Where the patch sits is measured here, as a fraction of the
 * finished image, and written to the manifest along with the corner radius the
 * handset clips its screen to.
 *
 * The animation itself is re-encoded to the size a card actually draws it. The
 * source GIFs are 400px wide and several megabytes; a card shows the screen
 * about 150px wide, so each one is written out as an animated WebP at 2x that.
 */

import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORTS = [3000, 3001, 4321];
let BASE_URL = process.env.PREVIEW_BASE_URL ?? "";
const OUT_DIR = path.join(ROOT, "public", "project-previews");
const MANIFEST = path.join(ROOT, "src", "lib", "project-previews.json");

/** Pixel density of the capture. The largest card draws its cover at about
 *  530 CSS px, so every preview comes out at well over twice that. */
const SCALE = 2;
/**
 * Background band around the artwork, in CSS px.
 *
 * Smaller than it was. At 60 it was sized for a whole hero section 950px wide;
 * around an artwork column half that, the same band was a wide empty border.
 */
const MARGIN = 28;
/**
 * A project can ask for none of it.
 *
 * The band exists so a frame that is not quite the capture's shape trims
 * background rather than artwork. Art that already carries its own panel and
 * its own padding — Taipei Metro's — needs no second one, and the band only
 * shrinks the picture inside the card: 28px each side is 9% of the width, and
 * that 9% comes straight off the demo.
 */
const marginFor = (project) => project.margin ?? MARGIN;
/** The home page card frame. */
const TARGET_ASPECT = 1.4;
/** For the foreground layer, which must carry nothing but its subjects. */
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
/** Width of the re-encoded phone animation. A card draws it about 125px wide. */
const SCREEN_WIDTH = 300;
/**
 * Width of a re-encoded hero video. A card draws a laptop screen about 290px
 * wide, so this is 2x that.
 *
 * Ryze's hero plays a 2558x1820 mp4 weighing 4.6MB, which is the page's asset
 * and far more than a card needs. Re-encoded here it comes to about half a
 * megabyte — less than either of the GIF-derived animations.
 */
const SCREEN_VIDEO_WIDTH = 580;
/**
 * Kept high on purpose. WebP compresses an animation by describing each frame
 * as a change from the one before, and below about 80 that guess goes wrong on
 * these recordings: blocks of an earlier frame are left behind, and the phone
 * fills with pale rectangles where the app should be. The whole range from 80
 * up is clean, so this sits just inside it.
 */
const SCREEN_QUALITY = 80;

/** Eight characters of the content's hash, enough to make a URL unique. */
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex").slice(0, 8);

const PROJECTS = [
  /*
   * Each `hero` is the hero's ARTWORK, not the whole hero.
   *
   * The previews used to be the whole hero section, which meant every card
   * printed the project's title, its one-line description and its four facts —
   * all of which the card already sets in type beside the picture. The card was
   * saying everything twice, once as text and once as a screenshot of text too
   * small to read. These selectors take only the column the artwork lives in,
   * so the picture is the design and nothing else.
   *
   * The widths are fixed rather than searched. The old script swept a range
   * looking for the window width where the hero happened to be 1.4:1, the card
   * frame's shape; the artwork columns have fixed aspect ratios of their own
   * (Metro's stage is 550/594, Ryze's 760/387) that no window width changes, so
   * there is nothing to search for. `PreviewMedia` sizes each picture to its own
   * shape and centres it in the frame, so a tall one keeps its proportions
   * rather than being cropped to fit.
   */
  {
    slug: "ryze-coffee",
    // CaseHeader's media column: bag, laptop, beans, character.
    hero: ["article > div:nth-child(1) > header > div:nth-child(2)"],
    hide: ["article > div:nth-child(1) > header > div:nth-child(1)"],
    widths: [1280, 1280],
  },
  {
    slug: "jubo-healthcare",
    // CaseHeader's media column: the dashboard in its laptop.
    hero: ["article > header > div:nth-child(2)"],
    hide: ["article > header > div:nth-child(1)"],
    widths: [1280, 1280],
  },
  {
    slug: "little-chestnut-thief",
    // This header carries no artwork at all — the page opens on a banner
    // underneath it, and that banner is the design this card should show.
    hero: ["article > div:nth-child(2) > div:nth-child(1)"],
    widths: [1440, 1440],
  },

  // taipei-metro-app and budgetcart are absent too, for a different reason:
  // their cards are drawn rather than photographed. A card is 480px wide at
  // most and a hero has a column to fill, so the two want different
  // compositions, and while the previews were screenshots of the heroes they
  // could not differ — improving the card meant editing the case study. They
  // are React now, in src/components/project, and wired up through
  // ProjectCover. This script must not start capturing them again: it would
  // put the card's composition back on the page.
  //
  // ibm-watsonx-builder-control-plane is deliberately absent, and must stay
  // absent while it is password protected. Capturing it would write a picture
  // of protected content to public/project-previews/, served to anyone who
  // asks for the URL, which is precisely what the password screen exists to
  // prevent. Its cards draw a plain cover instead; see ProjectCover.
];

/** The background the heroes are captured on, and the band around them. */
const BACKGROUND = { r: 255, g: 255, b: 255 };

/** Applied only inside the capture: hides chrome and whitens the page. */
const CAPTURE_CSS = `
  nextjs-portal,
  [aria-label="Open section menu"],
  #case-sections { visibility: hidden !important; }
  html, body { background: #fff !important; }
`;

async function heroBox(page, selectors) {
  return page.evaluate((selectors) => {
    const boxes = selectors.map((s) => {
      const el = document.querySelector(s);
      if (!el) throw new Error(`hero selector matched nothing: ${s}`);
      return el.getBoundingClientRect();
    });
    const left = Math.min(...boxes.map((b) => b.left));
    const top = Math.min(...boxes.map((b) => b.top)) + window.scrollY;
    const right = Math.max(...boxes.map((b) => b.right));
    const bottom = Math.max(...boxes.map((b) => b.bottom)) + window.scrollY;
    return { x: left, y: top, width: right - left, height: bottom - top };
  }, selectors);
}

const shape = (box) => (box.width + MARGIN * 2) / (box.height + MARGIN * 2);

/** The window width at which this hero, margin included, is closest to 1.4:1. */
async function pickWidth(browser, project) {
  const [from, to] = project.widths;
  let best = null;
  for (let width = from; width <= to; width += 10) {
    const page = await browser.newPage({ viewport: { width, height: 1200 } });
    await page.goto(`${BASE_URL}/projects/${project.slug}`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const box = await heroBox(page, project.hero);
    await page.close();
    const miss = Math.abs(shape(box) - TARGET_ASPECT);
    // Ties go to the wider window, which is closer to the desktop layout.
    if (!best || miss <= best.miss) best = { width, miss, aspect: shape(box) };
    if (from === to) break;
  }
  return best;
}

/** Waits until everything in the hero has loaded and stopped moving. */
async function settle(page, selectors) {
  await page.evaluate(() => document.fonts.ready);
  // Only the hero's own images matter; lazy ones further down never load.
  await page.waitForFunction(
    (selectors) =>
      selectors
        .flatMap((s) => [...document.querySelector(s).querySelectorAll("img")])
        .every((img) => img.complete && img.naturalWidth > 0),
    selectors,
    { timeout: 30_000 },
  );
  // Entrance effects run on springs rather than CSS animations, so there is
  // nothing to await. Instead poll the hero's box and its opacities until
  // three consecutive reads a quarter second apart agree.
  let last = "";
  let steady = 0;
  for (let i = 0; i < 60 && steady < 3; i++) {
    await page.waitForTimeout(250);
    const now = await page.evaluate((selectors) => {
      const parts = [];
      for (const s of selectors) {
        const root = document.querySelector(s);
        for (const el of [root, ...root.querySelectorAll("*")]) {
          const r = el.getBoundingClientRect();
          parts.push(r.x.toFixed(1), r.y.toFixed(1), getComputedStyle(el).opacity);
        }
      }
      return parts.join(",");
    }, selectors);
    steady = now === last ? steady + 1 : 0;
    last = now;
  }
}

async function capture(browser, project, width) {
  const context = await browser.newContext({
    viewport: { width, height: 1200 },
    deviceScaleFactor: SCALE,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/projects/${project.slug}`, { waitUntil: "load" });
  await page.addStyleTag({ content: CAPTURE_CSS });
  await page.evaluate((selectors) => {
    for (const s of selectors) {
      for (const img of document.querySelector(s).querySelectorAll("img")) img.loading = "eager";
    }
  }, project.hero);

  // Hide everything pinned to the window.
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      if (getComputedStyle(el).position === "fixed") el.style.visibility = "hidden";
    }
  });

  /*
   * And the hero's words.
   *
   * `visibility` rather than `display`, so the column keeps its space and the
   * artwork stays exactly where the page puts it. Without this a composition
   * that reaches back over its neighbour prints that neighbour's text into the
   * card, which is the thing these previews are meant to stop showing.
   */
  if (project.hide?.length) {
    await page.evaluate((selectors) => {
      for (const s of selectors) {
        for (const el of document.querySelectorAll(s)) el.style.visibility = "hidden";
      }
    }, project.hide);
  }

  // Pin every animated GIF in the hero to its first frame.
  const gifs = await page.evaluate((selectors) => {
    const found = new Set();
    for (const s of selectors) {
      for (const img of document.querySelector(s).querySelectorAll("img")) {
        const src = img.currentSrc || img.src;
        const url = new URL(src, location.href);
        const original = url.searchParams.get("url") ?? url.pathname;
        if (/\.gif$/i.test(original)) found.add(original);
      }
    }
    return [...found];
  }, project.hero);

  for (const gif of gifs) {
    const file = path.join(ROOT, "public", decodeURIComponent(gif));
    const still = await sharp(await readFile(file), { page: 0 }).png().toBuffer();
    const dataUrl = `data:image/png;base64,${still.toString("base64")}`;
    await page.evaluate(
      ({ selectors, gif, dataUrl }) => {
        for (const s of selectors) {
          for (const img of document.querySelector(s).querySelectorAll("img")) {
            const url = new URL(img.currentSrc || img.src, location.href);
            const original = url.searchParams.get("url") ?? url.pathname;
            if (original === gif) {
              img.removeAttribute("srcset");
              img.src = dataUrl;
              img.dataset.previewGif = gif;
            }
          }
        }
      },
      { selectors: project.hero, gif, dataUrl },
    );
  }

  /*
   * Pin every hero video to its first frame, and remember where it came from.
   *
   * Same reason as the GIFs: the still has to be the same picture on every run,
   * and the card lays the moving version back over exactly that patch. Without
   * this the screenshot caught whatever frame the video happened to be on.
   */
  await page.evaluate(async (selectors) => {
    const seen = [];
    for (const s of selectors) {
      for (const v of document.querySelector(s).querySelectorAll("video")) {
        v.dataset.previewVideo = new URL(v.currentSrc || v.src, location.href).pathname;
        v.pause();
        if (v.currentTime !== 0) {
          const seeked = new Promise((r) => v.addEventListener("seeked", r, { once: true }));
          v.currentTime = 0;
          seen.push(seeked);
        }
      }
    }
    await Promise.all(seen);
  }, project.hero);

  await settle(page, project.hero);
  const box = await heroBox(page, project.hero);

  /**
   * Where each animation sits in the finished picture, as a fraction of it.
   *
   * The handset clips its screen to a rounded box and draws the Dynamic Island
   * over the top of it, so the card replays the screen from the island's lower
   * edge down. The strip above it is the status bar, which does not move.
   */
  const screens = await page.evaluate(
    ({ box, margin, s0 }) => {
      const full = { w: box.width + margin * 2, h: box.height + margin * 2 };
      const frac = (rect) => ({
        left: (rect.left - box.x + margin) / full.w,
        top: (rect.top + window.scrollY - box.y + margin) / full.h,
        width: rect.width / full.w,
        height: rect.height / full.h,
      });

      const gifScreens = [...document.querySelectorAll("[data-preview-gif]")].map((img) => {
        // The screen is the box that clips the picture; the shell holds both it
        // and the island.
        const clip = img.parentElement;
        const shell = clip.parentElement;
        const clipRect = clip.getBoundingClientRect();
        const shellRect = shell.getBoundingClientRect();

        // The island is the shell's other child, centred near its top.
        const island = [...shell.children]
          .filter((el) => el !== clip)
          .map((el) => el.getBoundingClientRect())
          .filter(
            (r) =>
              r.top - shellRect.top < shellRect.height * 0.2 &&
              Math.abs((r.left + r.right) / 2 - (shellRect.left + shellRect.right) / 2) <
                shellRect.width * 0.1,
          )
          .sort((a, b) => b.width * b.height - a.width * a.height)[0];

        const style = getComputedStyle(clip);
        const imgStyle = getComputedStyle(img);
        return {
          kind: "gif",
          src: img.dataset.previewGif,
          screen: frac(clipRect),
          // However the page fits the recording into the screen, the card has
          // to fit it the same way or the animation will not sit on the still.
          fit: imgStyle.objectFit,
          position: imgStyle.objectPosition,
          // How far down the screen the animation starts.
          clipTop: island ? (island.bottom - clipRect.top) / clipRect.height : 0,
          // Corner radius as a fraction of the screen's width.
          radius: parseFloat(style.borderBottomLeftRadius) / clipRect.width,
        };
      });

      /*
       * A video is simpler than a handset: the element is its own screen, so
       * there is no island to start below and no shell to measure a radius
       * against beyond its own. What it does share is the fit — the page sizes
       * the recording into the screen with object-fit, and the card has to do
       * the same or the moving version lands beside the still rather than on
       * it.
       */
      const videos = [...document.querySelectorAll("[data-preview-video]")].map((v) => {
        const rect = v.getBoundingClientRect();
        const style = getComputedStyle(v);

        /*
         * Anything the hero paints IN FRONT of this screen.
         *
         * The card lays the moving version over the still, which repaints the
         * screen's rectangle — and on Ryze the character stands on the laptop,
         * inside that rectangle. Overlaid flat, the card lost the character.
         *
         * These are marked here and then photographed on their own, against
         * nothing, so the card can lay them back over the moving version. The
         * first attempt punched holes in the video instead, which worked but
         * showed a frozen rectangle of the first frame around the character,
         * because a bounding box is not a cut-out.
         *
         * "In front" is read by walking up from the video and, at each step,
         * looking at that node's own siblings: a sibling that overlaps and
         * paints later — higher z-index, or the same and further down the
         * document — is in front of it. Looking only at the hero's top-level
         * children missed it, because the hero's root here is the media column
         * and its single child is the whole canvas.
         */
        const root = document.querySelector(s0);
        const order = (el) => {
          const z = parseInt(getComputedStyle(el).zIndex, 10);
          return Number.isNaN(z) ? 0 : z;
        };
        const front = [];
        for (let node = v; node && node !== root; node = node.parentElement) {
          const parent = node.parentElement;
          if (!parent) break;
          for (const sib of parent.children) {
            if (sib === node) continue;
            const later =
              order(sib) > order(node) ||
              (order(sib) === order(node) &&
                node.compareDocumentPosition(sib) & Node.DOCUMENT_POSITION_FOLLOWING);
            if (later) front.push(sib);
          }
        }

        for (const el of front) {
          const r = el.getBoundingClientRect();
          const overlaps =
            r.width > 0 &&
            r.right > rect.left &&
            r.left < rect.right &&
            r.bottom > rect.top &&
            r.top < rect.bottom;
          if (overlaps) el.dataset.previewFront = "";
        }

        return {
          kind: "video",
          src: v.dataset.previewVideo,
          screen: frac(rect),
          fit: style.objectFit,
          position: style.objectPosition,
          clipTop: 0,
          radius: parseFloat(style.borderBottomLeftRadius) / rect.width,
          front: document.querySelectorAll("[data-preview-front]").length > 0,
        };
      });

      return [...gifScreens, ...videos];
    },
    { box, margin: marginFor(project), s0: project.hero[0] },
  );
  const shot = await page.screenshot({
    clip: box,
    fullPage: true,
    animations: "disabled",
    caret: "hide",
  });
  /*
   * The foreground, photographed on its own against nothing.
   *
   * Everything in the hero is hidden and only the marked elements — and the
   * ancestors that position them — are shown again, so what comes back is the
   * character and its neighbours on transparency, in exactly the place they
   * occupy in the still. The card lays this over the moving version, and the
   * things standing in front of the screen survive it.
   */
  let frontShot = null;
  if (screens.some((s) => s.kind === "video" && s.front)) {
    await page.evaluate((selector) => {
      const root = document.querySelector(selector);

      /*
       * The white this capture forces everywhere has to come off first.
       * `omitBackground` drops only the page's default background, not a
       * background something actually paints, so the layer came back opaque
       * white and hid the picture it was meant to sit on. A hidden element
       * paints nothing at all, so only the root and what encloses it matter.
       */
      const clear = (el) => {
        // The capture stylesheet sets the page white with `!important`, so an
        // ordinary inline style loses to it.
        el.style.setProperty("background", "transparent", "important");
        el.style.setProperty("background-color", "transparent", "important");
      };
      clear(document.documentElement);
      clear(document.body);
      for (let up = root; up; up = up.parentElement) clear(up);

      for (const el of root.querySelectorAll("*")) el.style.visibility = "hidden";
      for (const el of root.querySelectorAll("[data-preview-front]")) {
        el.style.visibility = "visible";
        for (let up = el.parentElement; up && up !== root; up = up.parentElement) {
          up.style.visibility = "visible";
        }
      }
    }, project.hero[0]);
    frontShot = await page.screenshot({
      clip: box,
      fullPage: true,
      omitBackground: true,
      animations: "disabled",
      caret: "hide",
    });
  }

  /*
   * Re-encode a hero video at the size a card draws it, before the context
   * closes, because this is done by the browser rather than by sharp: sharp
   * can re-encode an animation it can read, but it cannot author one from
   * frames, and there is no ffmpeg here. Chromium can, so a canvas is fed the
   * video frame by frame and MediaRecorder writes the result out as WebM.
   */
  const videoScreen = screens.find((s) => s.kind === "video");
  let recorded = null;
  if (videoScreen) {
    const b64 = await page.evaluate(
      async ({ src, width }) => {
        const v = document.createElement("video");
        v.src = src;
        v.muted = true;
        v.playsInline = true;
        await new Promise((res, rej) => {
          v.onloadeddata = res;
          v.onerror = () => rej(new Error(`cannot load ${src}`));
        });

        const canvas = document.createElement("canvas");
        canvas.width = width;
        // Even height: some encoders refuse an odd one.
        canvas.height = Math.round((v.videoHeight / v.videoWidth) * width / 2) * 2;
        const ctx = canvas.getContext("2d");

        const type = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm;codecs=vp8";
        const rec = new MediaRecorder(canvas.captureStream(24), {
          mimeType: type,
          videoBitsPerSecond: 900000,
        });
        const chunks = [];
        rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
        const stopped = new Promise((r) => (rec.onstop = r));

        rec.start();
        v.currentTime = 0;
        await v.play();
        await new Promise((done) => {
          const tick = () => {
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            if (!v.ended && v.currentTime < v.duration - 0.06) requestAnimationFrame(tick);
            else done();
          };
          tick();
        });
        rec.stop();
        await stopped;

        const bytes = new Uint8Array(await new Blob(chunks).arrayBuffer());
        let binary = "";
        for (let i = 0; i < bytes.length; i += 0x8000) {
          binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        }
        return btoa(binary);
      },
      { src: videoScreen.src, width: SCREEN_VIDEO_WIDTH },
    );
    recorded = Buffer.from(b64, "base64");
  }

  await context.close();

  const pad = Math.round(marginFor(project) * SCALE);
  const image = sharp(shot).extend({
    top: pad,
    bottom: pad,
    left: pad,
    right: pad,
    background: { ...BACKGROUND, alpha: 1 },
  });

  // Lossless: these are mostly type and flat colour, which lossy WebP softens.
  const { data: stillBytes, info } = await image
    .webp({ lossless: true, effort: 6 })
    .toBuffer({ resolveWithObject: true });
  const stillName = `${project.slug}.${digest(stillBytes)}.webp`;
  await writeFile(path.join(OUT_DIR, stillName), stillBytes);

  // Re-encode each animation at the size a card draws it. The sources are
  // 400px wide and several megabytes, which is far more than a card needs.
  let screen = null;
  if (screens.length) {
    // One handset per hero; if that ever changes, the largest one is the one
    // the card is showing.
    const pick = [...screens].sort((a, b) => b.screen.width - a.screen.width)[0];
    /* A video is already encoded, above, by the browser. A GIF is re-encoded
       here by sharp, which can do it because the input is itself an
       animation. Either way what comes out is one file sized for a card. */
    let bytes;
    let name;
    if (pick.kind === "video") {
      bytes = recorded;
      name = `${project.slug}-screen.${digest(bytes)}.webm`;
    } else {
      const file = path.join(ROOT, "public", decodeURIComponent(pick.src));
      bytes = await sharp(await readFile(file), {
        animated: true,
        limitInputPixels: false,
      })
        .resize({ width: SCREEN_WIDTH })
        .webp({ quality: SCREEN_QUALITY, effort: 4 })
        .toBuffer();
      name = `${project.slug}-screen.${digest(bytes)}.webp`;
    }
    await writeFile(path.join(OUT_DIR, name), bytes);

    let frontName = null;
    if (frontShot) {
      const frontBytes = await sharp(frontShot)
        .extend({ top: pad, bottom: pad, left: pad, right: pad, background: TRANSPARENT })
        .webp({ lossless: true, effort: 6 })
        .toBuffer();
      frontName = `${project.slug}-front.${digest(frontBytes)}.webp`;
      await writeFile(path.join(OUT_DIR, frontName), frontBytes);
    }

    screen = {
      src: `/project-previews/${name}`,
      from: pick.src,
      bytes: bytes.length,
      ...pick.screen,
      clipTop: pick.clipTop,
      radius: pick.radius,
      fit: pick.fit,
      position: pick.position,
      ...(frontName ? { front: `/project-previews/${frontName}` } : {}),
    };
  }

  // Whatever this project wrote last time is now unreachable.
  const keep = new Set([stillName, screen?.src.split("/").pop()].filter(Boolean));
  for (const file of await readdir(OUT_DIR)) {
    if (file.startsWith(`${project.slug}.`) || file.startsWith(`${project.slug}-screen.`)) {
      if (!keep.has(file)) await unlink(path.join(OUT_DIR, file));
    }
  }

  return {
    src: `/project-previews/${stillName}`,
    width: info.width,
    height: info.height,
    bytes: stillBytes.length,
    gifs,
    screen,
  };
}

async function main() {
  const only = process.env.PREVIEW_ONLY?.split(",").map((s) => s.trim());
  const projects = only ? PROJECTS.filter((p) => only.includes(p.slug)) : PROJECTS;

  const candidates = BASE_URL ? [BASE_URL] : PORTS.map((p) => `http://localhost:${p}`);
  BASE_URL = "";
  // A dev server wins over a production one. `next start` serves only the
  // public files that existed when it was built and the pages as they were
  // then, so capturing from it quietly produces stale pictures.
  let fallback = "";
  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) continue;
      const dev = (await res.text()).includes("next-devtools");
      if (dev) {
        BASE_URL = candidate;
        break;
      }
      fallback ||= candidate;
    } catch {
      // Try the next one.
    }
  }
  if (!BASE_URL && fallback) {
    BASE_URL = fallback;
    console.warn(
      `Warning: ${fallback} looks like a production server, so the pages and ` +
        "the pictures may be from an older build. Run \"npm run dev\" for the current one.",
    );
  }
  if (!BASE_URL) {
    console.error(
      `No app answered on ${candidates.join(", ")}. Start it with "npm run dev", ` +
        "or set PREVIEW_BASE_URL.",
    );
    process.exit(1);
  }
  console.log(`Capturing from ${BASE_URL}`);

  await mkdir(OUT_DIR, { recursive: true });
  let manifest = {};
  try {
    manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
  } catch {
    // First run.
  }

  const browser = await chromium.launch();
  try {
    for (const project of projects) {
      const pick = await pickWidth(browser, project);
      const result = await capture(browser, project, pick.width);
      manifest[project.slug] = {
        src: result.src,
        width: result.width,
        height: result.height,
        capturedAt: { windowWidth: pick.width, scale: SCALE },
        ...(result.screen
          ? {
              screen: {
                src: result.screen.src,
                left: +result.screen.left.toFixed(5),
                top: +result.screen.top.toFixed(5),
                width: +result.screen.width.toFixed(5),
                height: +result.screen.height.toFixed(5),
                clipTop: +result.screen.clipTop.toFixed(5),
                radius: +result.screen.radius.toFixed(5),
                fit: result.screen.fit,
                position: result.screen.position,
                /* What the hero stands in front of the screen, for the card
                   to punch holes for. */
                ...(result.screen.front ? { front: result.screen.front } : {}),
              },
            }
          : {}),
      };
      console.log(
        `${project.slug.padEnd(18)} window ${pick.width}px  ` +
          `${result.width}x${result.height} (${(result.width / result.height).toFixed(2)}:1)  ` +
          `${Math.round(result.bytes / 1024)} KB` +
          (result.screen
            ? `\n${" ".repeat(19)}animation ${result.screen.from} -> ` +
              `${result.screen.src} (${Math.round(result.screen.bytes / 1024)} KB)`
            : ""),
      );
    }
  } finally {
    await browser.close();
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
