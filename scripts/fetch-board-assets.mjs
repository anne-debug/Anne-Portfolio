// Downloads the sticker images of the About me pegboard from Anne's Framer
// project into public/images/about/board. Run once: node scripts/fetch-board-assets.mjs
// AboutMe.tsx shows drawn stand-ins for any file that is missing.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "images", "about", "board");
const ASSETS = {
  "clip-wood": "7TVDc8C8WTgdmUGJgYrLsT0navc.png",
  "clip-binder": "XuevRUzJ43pPEq7fsrNchSNyl0.png",
  "clip-silver": "0EqvFxhjwdxlmBJcMzT8BEp60X8.png",
  "pin-round": "feNenySrivbXMnZkbaHSgS2dhIw.png",
  "clip-star": "RyhU7wXDtLWy3T5kNYXyRXay4.png",
  "jelly-frame": "iIMFs22UXBIck58AmePSSYZ6LrE.png",
  "keychain-clover": "wixH5db9wfaadyY4hbH8b6h1kMU.png",
  pencil: "sS7Q5DiGlepprBxkSz4G7120so.png",
  "year-2": "w7hsK1OaSnYxJVi81fjpD7TmDEE.png",
  "year-flower": "Krk6eZT67iZgqOS1xqXIURTv7hs.png",
  "year-6": "8gsgDiMwbp8Oq7FhXsJwVHRCjM.png",
  sun: "iGJDBfKVMFdHXNuMWHLewO80dzM.png",
  smiley: "NyNprm1yrXgaNwQ8Cx46FeV0.png",
  texture: "frT46H4O9hE2gghYTUSQjRja58.png",
  paper: "dNBEPbtfEUrh2WFhTqTeh9SH88.png",
};

await mkdir(OUT, { recursive: true });
let failed = 0;
for (const [name, file] of Object.entries(ASSETS)) {
  const url = `https://framerusercontent.com/images/${file}?scale-down-to=512`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(path.join(OUT, `${name}.png`), Buffer.from(await res.arrayBuffer()));
    console.log("saved", `${name}.png`);
  } catch (err) {
    failed += 1;
    console.error("FAILED", name, String(err));
  }
}
console.log(failed ? `${failed} file(s) failed` : "All board images saved to public/images/about/board");
process.exitCode = failed ? 1 : 0;
