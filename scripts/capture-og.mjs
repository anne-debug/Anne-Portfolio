#!/usr/bin/env node
/**
 * Recaptures the link-preview image from the home page's own hero.
 *
 *   npm run dev      # in one terminal
 *   npm run og       # in another
 *
 * Writes src/app/opengraph-image.png and twitter-image.png, which Next serves
 * and tags automatically. Rerun after changing the home page hero, or the
 * preview will keep showing the old one.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";

// 1200x630 is the Open Graph standard. Render the hero at 2x into that shape.
const W = 1200,
  H = 630;
const b = await chromium.launch();
const page = await b.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 2,
});
await page.goto("http://localhost:3000/", {
  waitUntil: "load",
  timeout: 60000,
});
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2500);
// chrome is not part of the picture: the nav pill, the cursor, the dev badge
await page.addStyleTag({
  content: `
  nextjs-portal, [aria-label="Open section menu"] { visibility: hidden !important; }
`,
});
await page.evaluate(() => {
  for (const el of document.querySelectorAll("body *")) {
    if (getComputedStyle(el).position === "fixed")
      el.style.visibility = "hidden";
  }
});
await page.waitForTimeout(600);
const shot = await page.screenshot({
  clip: { x: 0, y: 0, width: W, height: H },
});
await sharp(shot)
  .resize(W, H)
  .png({ compressionLevel: 9 })
  .toFile("src/app/opengraph-image.png");
fs.copyFileSync("src/app/opengraph-image.png", "src/app/twitter-image.png");
const meta = await sharp("src/app/opengraph-image.png").metadata();
console.log(
  `wrote src/app/opengraph-image.png and twitter-image.png ` +
    `${meta.width}x${meta.height}, ${(fs.statSync("src/app/opengraph-image.png").size / 1024).toFixed(0)} KB`,
);
await b.close();
