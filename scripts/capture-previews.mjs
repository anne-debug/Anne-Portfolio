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
/** Background band around the hero, in CSS px. */
const MARGIN = 60;
/** The home page card frame. */
const TARGET_ASPECT = 1.4;
/** Width of the re-encoded phone animation. A card draws it about 125px wide. */
const SCREEN_WIDTH = 300;
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
  {
    slug: "taipei-metro-app",
    // The hero is the article's first section.
    hero: ["article > section:nth-of-type(1)"],
    widths: [810, 1199],
  },
  {
    slug: "budgetcart",
    hero: ["article > section:nth-of-type(1)"],
    widths: [810, 1199],
  },
  {
    slug: "ryze-coffee",
    // The header and the cover share one wrapper, which also clips the glow.
    hero: ["article > :nth-child(1)"],
    widths: [1000, 1440],
  },
  {
    slug: "little-chestnut-thief",
    // Header, then the banner that opens the page. The banner's wrapper also
    // holds the sections that follow, so the banner itself is the second half.
    hero: ["article > :nth-child(1)", "article > :nth-child(2) > :first-child"],
    widths: [1440, 1440],
  },
  {
    slug: "jubo-healthcare",
    // Header and banner are siblings, so the hero is the box around both. Its
    // column is capped at 1000px, which holds it near 1.1:1 at every width;
    // the cards anchor it to the top instead.
    hero: ["article > :nth-child(1)", "article > :nth-child(2)"],
    widths: [1440, 1440],
  },
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
    ({ box, margin }) => {
      const full = { w: box.width + margin * 2, h: box.height + margin * 2 };
      const frac = (rect) => ({
        left: (rect.left - box.x + margin) / full.w,
        top: (rect.top + window.scrollY - box.y + margin) / full.h,
        width: rect.width / full.w,
        height: rect.height / full.h,
      });

      return [...document.querySelectorAll("[data-preview-gif]")].map((img) => {
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
    },
    { box, margin: MARGIN },
  );
  const shot = await page.screenshot({
    clip: box,
    fullPage: true,
    animations: "disabled",
    caret: "hide",
  });
  await context.close();

  const pad = Math.round(MARGIN * SCALE);
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
    const file = path.join(ROOT, "public", decodeURIComponent(pick.src));
    const bytes = await sharp(await readFile(file), {
      animated: true,
      limitInputPixels: false,
    })
      .resize({ width: SCREEN_WIDTH })
      .webp({ quality: SCREEN_QUALITY, effort: 4 })
      .toBuffer();
    const name = `${project.slug}-screen.${digest(bytes)}.webp`;
    await writeFile(path.join(OUT_DIR, name), bytes);
    screen = {
      src: `/project-previews/${name}`,
      from: pick.src,
      bytes: bytes.length,
      ...pick.screen,
      clipTop: pick.clipTop,
      radius: pick.radius,
      fit: pick.fit,
      position: pick.position,
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
