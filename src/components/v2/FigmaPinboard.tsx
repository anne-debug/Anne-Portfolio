/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { handFont, markerFont } from "./aboutFonts";
import { PreviousPinboardClock } from "./PreviousPinboardClock";
import { WeatherCard } from "./WeatherCard";
import { FairyLights } from "./FairyLights";

const imgClipBrwon1 = "/images/about/figma/db18c.png";
const imgDNbePbtfEUrh2WFhTqTeh9Sh88Png = "/images/about/figma/b1b11.png";
const imgClip1 = "/images/about/figma/097cd.png";
const imgClip2 = "/images/about/figma/62121.png";
const imgClip3 = "/images/about/figma/a8f63.png";
const imgIImFs22UxbIck58AmePssyz6LrEPng = "/images/about/figma/cd5dd.png";
const imgChainClip = "/images/about/figma/b35e0.png";
const imgCAyHBde2ZJo13Y7GNEfyDe1AWlsPng = "/images/about/figma/c6f9f.png";

/* Anne's own photos (2026-11-16): from her About page folders and the IBM
   internship. Re-encoded without location data in public/images/about/mine. */
const mine = (f: string) => `/images/about/mine/${f}.jpg`;

/* Photos on the board open the matching folder on the About page's desktop
   below (Anne, 2026-11-20). AboutDesktop listens for this event. */
export const OPEN_FOLDER_EVENT = "about:open-folder";
function openFolder(key: string) {
  window.dispatchEvent(new CustomEvent(OPEN_FOLDER_EVENT, { detail: key }));
}
/** Props that make a board item open a folder by tap, click or keyboard. A
 *  mouse click arrives through the drag handler instead (see `end`), because
 *  the board captures the pointer while it decides whether you are dragging. */
function folderLink(key: string, label: string) {
  return {
    "data-folder": key,
    role: "button",
    tabIndex: 0,
    "aria-label": `Open ${label}`,
    onClick: () => openFolder(key),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFolder(key);
      }
    },
  } as const;
}
const linkRing = "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]";

function PinboardArt() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-node-id="194:107" data-name="Pinboard wrap">
      <div className="content-stretch flex flex-col h-full items-start justify-center relative shrink-0 w-[800px]" data-node-id="194:108" data-name="Pinboard">
        <div className="flex-[1_0_0] min-h-px relative w-full" data-node-id="194:109" data-name="Variant 1">
          <div className="absolute inset-0 rounded-[22.4px] transition-colors duration-500" style={{ background: "var(--v2-board)", boxShadow: "1.6px 4px 8px rgba(153,153,153,0.25)" }} data-node-id="194:110" data-name="Previous pegboard">
            {Array.from({ length: 19 }, (_, i) => 33 + i * 51).flatMap((x) =>
              [33, 114, 195, 276, 357, 438, 519, 588].map((y) => (
                <span key={`${x}-${y}`} className="absolute h-[31.2px] w-[14.4px] rounded-full transition-colors duration-500"
                  style={{ left: `${x / 10}%`, top: `${y / 6.5}%`, background: "var(--v2-board-hole)", boxShadow: "inset 0.8px 1.6px 2.4px rgba(0,0,0,0.14)" }} />
              )),
            )}
            <FairyLights />
          </div>
          <div className={`absolute h-[200px] left-[292px] overflow-clip top-[101.59px] w-[140.8px] rounded-[6px] ${linkRing}`} data-node-id="194:129" data-name="div.framer-gaeb7p" {...folderLink("dancing", "Where I Found Myself")}>
            {/* was the to-do list (Anne, 2026-11-16): her dance photo now hangs from the same clip */}
            <div className="absolute bottom-0 left-0 right-0 h-[152.8px] rounded-[6px] bg-white p-[4px] shadow-[0px_1.4px_1.4px_-2.5px_rgba(0,0,0,0.16),0px_6px_6px_-3.75px_rgba(0,0,0,0.1)]" data-name="Dance photo">
              <img alt="Anne dancing with rainbow silk wings" className="size-full rounded-[3px] object-cover" src={mine("rainbow-dance")} />
            </div>
            <div className="-translate-x-1/2 absolute h-[60.31px] left-1/2 top-0 w-[41.6px]" data-node-id="194:195" data-name="Clip brwon1">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute h-full left-[-0.97%] max-w-none top-0 w-[101.94%]" src={imgClipBrwon1} />
              </div>
            </div>
          </div>
          <div className={`absolute content-stretch flex flex-col h-[127.2px] items-center justify-center left-[22.4px] pb-[36px] pt-[4px] px-[4px] rounded-[var(--corner-radius\/4,4px)] top-[42.4px] w-[91.2px] ${linkRing}`} style={{ scale: "1.35", transformOrigin: "0 0" }} data-node-id="194:218" data-name="Polaroid 1" {...folderLink("events", "Design Diary")}>
            <div className="absolute bg-[var(--color\/white\/-0_2\%,rgba(255,255,255,0))] h-[127.2px] left-0 rounded-[var(--corner-radius\/4,4px)] shadow-[0px_0.361px_0.361px_-1.25px_rgba(0,0,0,0.18),0px_1.373px_1.373px_-2.5px_rgba(0,0,0,0.16),0px_6px_6px_-3.75px_rgba(0,0,0,0.06)] top-0 w-[91.2px]" data-node-id="194:219" data-name="Polaroid 1:shadow" />
            <div className="absolute inset-0 rounded-[var(--corner-radius\/4,4px)]" data-node-id="194:222" data-name="dNBEPbtfEUrh2WFhTqTeh9SH88.png">
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[var(--corner-radius\/4,4px)]">
                <img alt="" className="absolute h-full left-[-77.98%] max-w-none top-0 w-[255.95%]" src={imgDNbePbtfEUrh2WFhTqTeh9Sh88Png} />
              </div>
            </div>
            <div className="flex-[1_0_0] min-h-px relative rounded-[var(--corner-radius\/2,2px)] w-full" data-node-id="194:223" data-name="CwlhVKk1Fx19DRYw2wLuEH1pm8.jpg">
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[var(--corner-radius\/2,2px)]">
                <img alt="" className="absolute inset-0 size-full max-w-none object-cover" src={mine("figma-converge")} />
              </div>
            </div>
            <div className="absolute bottom-[4.12px] flex h-[31.069px] items-center justify-center left-[4.54px] w-[89.4px]" data-node-id="194:225">
              <div className="-rotate-4 flex-none">
                <div className="content-stretch flex flex-col items-start relative w-[87.87px]" data-name="div.framer-1tbwfa7">
                  <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="194:226" data-name="p.framer-text">
                    <div className="[word-break:break-word] flex flex-col font-[family-name:var(--font-family\/font-3,var(--font-inter),sans-serif)] font-[var(--font-weight\/400,400)] justify-center leading-[0] not-italic relative shrink-0 text-[19.8px] text-[color:var(--token\/ffb0ff11-cab3-40ad-af6c-69f4ede46c1e,black)] w-full" data-node-id="194:227">
                      <p className="text-center leading-[1.2]" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px" }}>Figma Converge 2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute h-[58.19px] left-[18.4px] top-[-34.4px] w-[27.2px]" data-node-id="194:230" data-name="Clip 1">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgClip1} />
              </div>
            </div>
          </div>
          <div className="absolute bg-[var(--color\/grey\/99,#fffcfc)] bottom-[43.2px] content-stretch flex flex-col h-[143.2px] items-center justify-center left-[18.4px] rounded-[var(--corner-radius\/4,4px)] w-[201.6px]" style={{ scale: "1", transformOrigin: "0 100%" }} data-node-id="194:232" data-name="Drawing">
            <div className="absolute bg-[var(--color\/white\/-0_2\%,rgba(255,255,255,0))] bottom-0 h-[143.2px] left-0 rounded-[var(--corner-radius\/4,4px)] shadow-[0px_0.361px_0.361px_-1.25px_rgba(0,0,0,0.18),0px_1.373px_1.373px_-2.5px_rgba(0,0,0,0.16),0px_6px_6px_-3.75px_rgba(0,0,0,0.06)] w-[201.6px]" data-node-id="194:235" data-name="Drawing:shadow" />
            <div className="flex-[1_0_0] min-h-px relative rounded-[var(--corner-radius\/2,2px)] w-full" data-node-id="194:236" data-name="wmkQG6iNPvPDEsrQ7EtmlvsBhs.jpg">
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[var(--corner-radius\/2,2px)]">
                <img alt="Anne at the IBM ATX light-up letters" className="absolute inset-0 size-full max-w-none object-cover" src={mine("ibm-atx")} />
              </div>
            </div>
            <div className="absolute h-[51.34px] left-[67.2px] top-[-29.6px] w-[24px]" data-node-id="194:237" data-name="Clip 1">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute h-[119.77%] left-0 max-w-none top-[-9.88%] w-full" src={imgClip2} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[173px] items-center justify-center left-[133px] top-[33.87px] w-[97.734px]" style={{ scale: "1.25", transformOrigin: "0 0" }} data-node-id="194:239">
            <div className="-rotate-5 flex-none">
              <div className="bg-[var(--color\/grey\/12-2,#1f1f1f)] content-stretch flex flex-col gap-[var(--item-spacing\/3_2,3.2px)] items-center justify-center pb-[32px] pt-[4px] px-[4px] relative rounded-[var(--corner-radius\/4,4px)] w-[77.6px]" data-name="Polaroid 2">
                <div className="absolute bg-[var(--color\/white\/-0_2\%,rgba(255,255,255,0))] bottom-0 left-0 rounded-[var(--corner-radius\/4,4px)] shadow-[0px_0.361px_0.361px_-1.25px_rgba(0,0,0,0.18),0px_1.373px_1.373px_-2.5px_rgba(0,0,0,0.16),0px_6px_6px_-3.75px_rgba(0,0,0,0.06)] top-0 w-[77.605px]" data-node-id="194:243" data-name="Polaroid 2:shadow" />
                <div className="h-[63.993px] overflow-clip relative rounded-[var(--corner-radius\/2,2px)] shrink-0 w-full" data-node-id="194:244" data-name="div.framer-1s5do21">
                  <div className="absolute inset-0 rounded-[var(--corner-radius\/2,2px)]" data-node-id="194:245" data-name="9y2IMia4NBvByIp44nbmCPedp0c.jpg">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[var(--corner-radius\/2,2px)]">
                      <img alt="" className="absolute inset-0 size-full max-w-none object-cover" src={mine("ibm-team")} />
                    </div>
                  </div>
                </div>
                <div className="h-[64.004px] overflow-clip relative rounded-[var(--corner-radius\/2,2px)] shrink-0 w-full" data-node-id="194:246" data-name="div.framer-1pkt3db">
                  <div className="absolute inset-[0_-0.01px_0_0] rounded-[var(--corner-radius\/2,2px)]" data-node-id="194:247" data-name="l4ow4EaQECb6QpdsD3hfNZLLDI.jpg">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[var(--corner-radius\/2,2px)]">
                      <img alt="" className="absolute inset-0 size-full max-w-none object-cover" src={mine("event-badges")} />
                    </div>
                  </div>
                </div>
                <div className="absolute h-[19.996px] left-[27.99px] top-[-10.4px] w-[20.799px]" data-node-id="194:250" data-name="Clip 1">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-full left-[-1.92%] max-w-none top-0 w-[103.85%]" src={imgClip3} />
                  </div>
                </div>
                <div className="absolute bottom-[4.56px] flex h-[23.695px] items-center justify-center left-[13.69px] w-[54.934px]" data-node-id="194:252">
                  <div className="-rotate-4 flex-none">
                    <div className="content-stretch flex flex-col items-start relative w-[53.67px]" data-name="div.framer-ar9rfx">
                      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="194:253" data-name="p.framer-text">
                        <div className="[word-break:break-word] flex flex-col font-[family-name:var(--font-family\/font-5,var(--pinboard-marker))] justify-center leading-[0] not-italic relative shrink-0 text-[color:var(--token\/20608b9f-0145-4a1e-b971-ee948ebbb015,white)] text-[length:var(--font-size\/16,16px)] w-full" data-node-id="194:254">
                          <p className="leading-[var(--line-height\/19_2,19.2px)]">friends</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute h-[77.6px] left-[262px] top-[26.4px] w-[172.8px]" data-node-id="194:296" data-name="Live clock">
            <PreviousPinboardClock />
          </div>
          <div className="absolute h-[118.4px] left-[468px] top-[60px] w-[80px]" data-node-id="194:367" data-name="keychain">
            <div className="absolute h-[96.8px] left-[10.8px] overflow-clip top-[11.6px] w-[58.4px]" data-node-id="194:368" data-name="div.framer-l3qhko">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute inset-0 size-full max-w-none object-cover" src={mine("beanie")} />
              </div>
            </div>
            <div className="absolute aspect-[79.38999938964844/118.38999938964844] bottom-[0.01px] left-[0.31px] overflow-clip rounded-[var(--corner-radius\/4,4px)] top-0" data-node-id="194:370" data-name="Jelly frame">
              <div className="absolute inset-0 rounded-[var(--corner-radius\/4,4px)]" data-node-id="194:371" data-name="iIMFs22UXBIck58AmePSSYZ6LrE.png">
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[var(--corner-radius\/4,4px)]">
                  <img alt="" className="absolute h-full left-[-0.02%] max-w-none top-0 w-[100.03%]" src={imgIImFs22UxbIck58AmePssyz6LrEPng} />
                </div>
              </div>
            </div>
            <div className="-translate-x-1/2 absolute h-[41.44px] left-1/2 top-[-32.8px] w-[29.6px]" data-node-id="194:372" data-name="chain clip">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute h-full left-[-0.14%] max-w-none top-0 w-[100.27%]" src={imgChainClip} />
              </div>
            </div>
            <div className="absolute content-stretch flex flex-col h-[78.997px] items-start justify-center left-[4.8px] top-[-3.2px] w-[36px]" data-node-id="194:374" data-name="div.framer-tr3gtv-container">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px relative w-full" data-node-id="194:375" data-name="Variant 1">
                <div className="flex h-[78.847px] items-center justify-center relative shrink-0 w-[45.514px]" data-node-id="194:376">
                  <div className="flex-none rotate-15">
                    <div className="h-[74.34px] relative w-[27.2px]" data-name="Apple chain">
                      <div className="absolute inset-[0_-0.01px_0.01px_0]" data-node-id="194:377" data-name="cAyHBde2ZJo13Y7gNEfyDE1aWls.png">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <img alt="" className="absolute h-full left-[-2.15%] max-w-none top-0 w-[104.31%]" src={imgCAyHBde2ZJo13Y7GNEfyDe1AWlsPng} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* typed weather line, right-aligned above the kitchen photos */}
          <div className="absolute right-[20px] top-[188px] w-[260px]" data-name="Weather">
            <WeatherCard />
          </div>
          {/* the clear folder and its maple photo are gone (Anne, 2026-11-20); the
              tufting photo stays on its own where the folder stood */}
          <div className="absolute bottom-[40px] left-[492px] h-[178px] w-[140px] rotate-2 rounded-[6px] bg-white p-[4px] shadow-[0px_1.4px_1.4px_-2.5px_rgba(0,0,0,0.16),0px_6px_6px_-3.75px_rgba(0,0,0,0.1)]" data-name="Tufting photo">
            <img alt="Anne tufting a rug" className="size-full rounded-[3px] object-cover" src={mine("tufting")} />
            <div className="absolute left-1/2 top-[-22px] h-[46px] w-[21.5px] -translate-x-1/2">
              <img alt="" className="size-full" src={imgClip2} />
            </div>
          </div>
          {/* added 2026-11-20: snow photo opens Miles & Memories */}
          <div className={`absolute left-[592px] top-[22px] h-[150px] w-[118px] rotate-3 rounded-[6px] bg-white p-[4px] shadow-[0px_1.4px_1.4px_-2.5px_rgba(0,0,0,0.16),0px_6px_6px_-3.75px_rgba(0,0,0,0.1)] ${linkRing}`} data-name="Snow photo" {...folderLink("traveling", "Miles & Memories")}>
            <img alt="Anne pointing at the sky on a snowy mountain" className="size-full rounded-[3px] object-cover" src="/about/YrWjpCsxBSUt4gNrJmrCSDplGvA.jpg" />
            <div className="absolute left-1/2 top-[-26px] h-[48px] w-[26px] -translate-x-1/2">
              <img alt="" className="size-full object-contain" src={imgClip3} />
            </div>
          </div>
          {/* added 2026-11-20: cookie photo opens Anne's Bakery */}
          <div className={`absolute bottom-[52px] left-[650px] h-[132px] w-[132px] -rotate-3 rounded-[6px] bg-white p-[4px] shadow-[0px_1.4px_1.4px_-2.5px_rgba(0,0,0,0.16),0px_6px_6px_-3.75px_rgba(0,0,0,0.1)] ${linkRing}`} data-name="Cookie photo" {...folderLink("baking", "Anne's Bakery")}>
            <img alt="Chocolate cookies topped with toasted marshmallow on a baking tray" className="size-full rounded-[3px] object-cover" src="/about/K93eVCtTdlLdLSr5mpXu5jL98KQ.jpg" />
            <div className="absolute left-1/2 top-[-24px] h-[46px] w-[21px] -translate-x-1/2">
              <img alt="" className="size-full" src={imgClip1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
/** Figma 194:107, 800 wide; made 480 tall (from 407.2) to fit the weather note. Scale the complete composition together. */
/** Dark mode comes from the pull cord in LampBoard: the board and its peg holes take their colours from CSS variables; the pinned things keep their own colours. */
export function FigmaPinboard() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 480 });
  const scale = size.width / 800;
  const drag = useRef<{ el: HTMLElement; x: number; y: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setSize({ width: el.clientWidth, height: el.clientHeight }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  function start(e: PointerEvent<HTMLDivElement>) {
    // Keep native touch scrolling available on the horizontally scrollable board.
    if (e.button !== 0 || e.pointerType === "touch" || drag.current) return;
    const board = e.currentTarget.querySelector('[data-node-id="194:109"]');
    let el = e.target as HTMLElement;
    while (el.parentElement && el.parentElement !== board) el = el.parentElement;
    if (el.parentElement !== board || !el.classList.contains("absolute") || el.dataset.nodeId === "194:110") return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { el, x: e.clientX, y: e.clientY };
    el.style.transition = "none";
    el.style.zIndex = "30";
  }
  function move(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (d) d.el.style.translate = `${(e.clientX-d.x)/scale}px ${(e.clientY-d.y)/scale}px`;
  }
  function end(e?: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    // a press that barely moved is a click: open the item's folder, if it has one
    const folder = d.el.dataset.folder;
    if (folder && e && e.type === "pointerup" && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) openFolder(folder);
    d.el.style.transition = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "none" : "translate 350ms ease-out";
    d.el.style.translate = "0px 0px";
    d.el.style.zIndex = "";
    drag.current = null;
  }
  return (
    <div ref={ref} className="relative w-full aspect-[800/480] desktop:h-full desktop:aspect-auto" style={{
      "--pinboard-hand": handFont, "--pinboard-marker": markerFont } as React.CSSProperties}
      aria-label="Anne’s pinboard: personal photos and keepsakes; some photos open a folder below"
      onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}>
      <div className="absolute left-0 top-0 origin-top-left select-none [&_img]:pointer-events-none"
        style={{ width: 800, height: size.height / scale, transform: `scale(${scale})` }}>
        <PinboardArt />
      </div>
    </div>
  );
}

