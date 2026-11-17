/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { handFont, markerFont } from "./aboutFonts";
import { PreviousPinboardClock } from "./PreviousPinboardClock";
import { WeatherCard } from "./WeatherCard";
import { FairyLights } from "./FairyLights";
import { Zoomable } from "@/components/case/Zoomable";

const imgClipBrwon1 = "/images/about/figma/db18c.png";
const imgFrT46H4O9HE2GghYtusQjRja58Png = "/images/about/figma/0f176.png";
const imgSticker2 = "/images/about/figma/d5246.png";
const imgDNbePbtfEUrh2WFhTqTeh9Sh88Png = "/images/about/figma/b1b11.png";
const imgClip1 = "/images/about/figma/097cd.png";
const imgClip2 = "/images/about/figma/62121.png";
const imgClip3 = "/images/about/figma/a8f63.png";
const imgKeychain2 = "/images/about/figma/13287.png";
const imgW7HsK1OaSnYxJVi81FjpD7TmDeePng = "/images/about/figma/ae1c1.png";
const imgFlower = "/images/about/figma/1c6ad.png";
const img8GsgDiMwbp8Oq7FhXsJwVhrCjMPng = "/images/about/figma/0fb31.png";
const imgIImFs22UxbIck58AmePssyz6LrEPng = "/images/about/figma/cd5dd.png";
const imgChainClip = "/images/about/figma/b35e0.png";
const imgCAyHBde2ZJo13Y7GNEfyDe1AWlsPng = "/images/about/figma/c6f9f.png";
const imgHi661NDih1RBaIcc4A0Qp5Cd18Png = "/images/about/figma/831cb.png";
const imgMinimalistWhitePencil1 = "/images/about/figma/e85bd.png";
const imgSticker1 = "/images/about/figma/bc03b.png";
const imgGroup2 = "/images/about/figma/135e8.svg";
const imgGroup3 = "/images/about/figma/43ed3.svg";
const imgSvg15895522381237A1928Z = "/images/about/figma/a5f18.svg";

/* Anne's own photos (2026-11-16): from her About page folders and the IBM
   internship. Re-encoded without location data in public/images/about/mine. */
const mine = (f: string) => `/images/about/mine/${f}.jpg`;

/* The clear folder fans its photos up when tapped. Each entry is how far the
   photo travels from where it rests, in board units, and its final tilt. */
const FAN = {
  tree: { x: -46, y: -172, r: -9 },
  tufting: { x: 14, y: -164, r: 8 },
} as const;

function fan(open: boolean, k: keyof typeof FAN, i: number) {
  const f = FAN[k];
  return {
    transform: open ? `translate(${f.x}px, ${f.y}px) rotate(${f.r}deg) scale(0.86)` : undefined,
    transition: "transform 520ms cubic-bezier(0.2, 0.9, 0.3, 1.15), opacity 300ms ease",
    transitionDelay: `${open ? i * 60 : (1 - i) * 40}ms`,
  };
}

function PinboardArt() {
  const [folderOpen, setFolderOpen] = useState(false);
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
          <div className="absolute h-[200px] left-[292px] overflow-clip top-[101.59px] w-[140.8px]" data-node-id="194:129" data-name="div.framer-gaeb7p">
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
          <div className="absolute bg-[var(--color\/red\/20,#5e0a0a)] content-stretch flex flex-col gap-[var(--item-spacing\/8,8px)] h-[80.8px] items-center justify-end overflow-clip pb-[4.8px] px-[4.8px] right-[18.4px] rounded-[var(--opacity\/12,12px)] top-[78.4px] w-[142.4px]" data-node-id="194:197" data-name="Name Tag">
            <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="194:201" data-name="div.framer-11w6wyu">
              <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="194:202" data-name="p.framer-text">
                <div className="[word-break:break-word] flex flex-col font-[family-name:var(--font-family\/font-3,var(--font-inter),sans-serif)] font-[var(--font-weight\/700,700)] justify-center leading-[0] not-italic relative shrink-0 text-[12.8px] text-[color:var(--color\/grey\/91,#f7ecda)] whitespace-nowrap" data-node-id="194:203">
                  <p className="leading-[var(--line-height\/15_36,15.36px)]">MY NAME TAG</p>
                </div>
              </div>
            </div>
            <div className="h-[44.8px] overflow-clip relative rounded-[var(--corner-radius\/4,4px)] shrink-0 w-full" data-node-id="194:208" data-name="div.framer-1lm9r66">
              <div className="absolute inset-0 rounded-[var(--corner-radius\/4,4px)]" data-node-id="194:210" data-name="frT46H4O9hE2gghYTUSQjRja58.png">
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[var(--corner-radius\/4,4px)]">
                  <img alt="" className="absolute h-[161.69%] left-0 max-w-none top-0 w-full" src={imgFrT46H4O9HE2GghYtusQjRja58Png} />
                </div>
              </div>
              <div className="absolute content-stretch flex flex-col inset-[7.3%_29.82%_9.29%_29.83%] items-start" data-node-id="194:211" data-name="div.framer-q9no3s">
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="194:212" data-name="p.framer-text">
                  <div className="[word-break:break-word] flex flex-col font-[family-name:var(--font-family\/font-4,var(--pinboard-hand))] justify-center leading-[0] not-italic relative shrink-0 text-[30.4px] text-[color:var(--token\/ffb0ff11-cab3-40ad-af6c-69f4ede46c1e,black)] w-full" data-node-id="194:213">
                    <p className="leading-[var(--line-height\/36_48,36.48px)]">ANNE</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-[0.37px] flex h-[25.339px] items-center justify-center left-[110.5px] w-[22.199px]" data-node-id="194:216">
                <div className="flex-none rotate-8">
                  <div className="h-[22.89px] relative w-[19.2px]" data-name="Sticker 2">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <img alt="" className="absolute h-full left-[-0.02%] max-w-none top-0 w-[100.03%]" src={imgSticker2} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute content-stretch flex flex-col h-[127.2px] items-center justify-center left-[22.4px] pb-[36px] pt-[4px] px-[4px] rounded-[var(--corner-radius\/4,4px)] top-[42.4px] w-[91.2px]" style={{ scale: "1.35", transformOrigin: "0 0" }} data-node-id="194:218" data-name="Polaroid 1">
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
          <div className="absolute bottom-[4.8px] h-[132.49px] left-[337.6px] w-[118.4px]" data-node-id="194:274" data-name="Keychain 2">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[100.01%] left-0 max-w-none top-[-0.01%] w-full" src={imgKeychain2} />
            </div>
            <div className="absolute content-stretch flex flex-col h-[19.2px] items-start justify-center left-[60px] top-[9.6px] w-[6.4px]" data-node-id="194:276" data-name="div.framer-vib21s">
              <div className="flex-[1_0_0] min-h-px relative w-full" data-node-id="194:278" data-name="Frame">
                <div className="absolute inset-0 opacity-[calc(var(--opacity\/100,100)/100)] overflow-clip" data-node-id="194:279" data-name="svg-1810177694_1237">
                  <div className="absolute contents inset-[-56.7%_-195%_-56.6%_-195%]" data-node-id="194:280" data-name="Group">
                    <div className="absolute contents inset-[-56.7%_-195%_-56.6%_-195%]" data-node-id="194:286" data-name="Mask group">
                      <div className="absolute inset-0 mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-position-[-12.48px_-10.886px] mask-size-[31.36px_40.954px] opacity-[calc(var(--opacity\/100,100)/100)]" data-node-id="194:281" style={{ maskImage: `url("${imgGroup2}")` }} data-name="Group">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup3} />
                      </div>
                    </div>
                    <div className="absolute inset-0 opacity-[calc(var(--opacity\/100,100)/100)]" data-node-id="194:287" data-name="svg-1810177694_1237_a1936z">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvg15895522381237A1928Z} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[70.925px] items-center justify-center right-[136.37px] top-[4.6px] w-[55.254px]" data-node-id="194:288">
            <div className="flex-none rotate-10">
              <div className="h-[64.12px] relative w-[44.8px]" data-name="2">
                <div className="absolute inset-[0_0_-0.01px_0]" data-node-id="194:289" data-name="w7hsK1OaSnYxJVi81fjpD7TmDEE.png">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[100.06%] left-0 max-w-none top-[-0.03%] w-full" src={imgW7HsK1OaSnYxJVi81FjpD7TmDeePng} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[64.79px] items-center justify-center right-[59.35px] top-[13.15px] w-[48.512px]" data-node-id="194:290">
            <div className="-rotate-6 flex-none">
              <div className="h-[60.69px] relative w-[42.4px]" data-name="2">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[100.06%] left-0 max-w-none top-[-0.03%] w-full" src={imgW7HsK1OaSnYxJVi81FjpD7TmDeePng} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute h-[60.92px] right-[96px] top-[12.8px] w-[56.8px]" data-node-id="194:292" data-name="Flower">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-full left-[-0.01%] max-w-none top-0 w-[100.03%]" src={imgFlower} />
            </div>
          </div>
          <div className="absolute flex h-[72.452px] items-center justify-center right-[8.99px] top-[7.7px] w-[63.618px]" data-node-id="194:294">
            <div className="flex-none rotate-19">
              <div className="h-[60.65px] relative w-[46.4px]" data-name="6">
                <div className="absolute inset-[0_0_-0.01px_0]" data-node-id="194:295" data-name="8gsgDiMwbp8Oq7FhXsJwVHRCjM.png">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[100.04%] left-0 max-w-none top-[-0.02%] w-full" src={img8GsgDiMwbp8Oq7FhXsJwVhrCjMPng} />
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
          <div className="absolute bottom-[127.36px] flex h-[114.621px] items-center justify-center right-[313.01px] w-[83.578px]" data-node-id="194:378">
            <div className="flex-none rotate-5">
              <div className="h-[108.55px] relative w-[74.4px]" data-name="soft toy">
                <div className="absolute inset-[0_0_0.01px_0]" data-node-id="194:379" data-name="hi661NDih1rBAIcc4a0Qp5CD18.png">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[100.02%] left-0 max-w-none top-[-0.01%] w-full" src={imgHi661NDih1RBaIcc4A0Qp5Cd18Png} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* typed weather line, right-aligned in the gap under the name tag and above the kitchen photos */}
          <div className="absolute right-[20px] top-[188px] w-[260px]" data-name="Weather">
            <WeatherCard />
          </div>
          <div
            className="absolute bottom-[37.6px] h-[207.2px] left-[482.4px] w-[297.6px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-orange)] rounded-[6px]"
            style={{ zIndex: folderOpen ? 25 : undefined }}
            role="button"
            tabIndex={0}
            aria-expanded={folderOpen}
            aria-label={folderOpen ? "Put the photos back in the folder" : "Open the folder of photos"}
            onClick={(e) => {
              const t = e.target as HTMLElement;
              if (!e.currentTarget.contains(t) || t.closest("button")) return;
              setFolderOpen((o) => !o);
            }}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setFolderOpen((o) => !o);
              }
              if (e.key === "Escape") setFolderOpen(false);
            }}
            data-node-id="194:380"
            data-name="Book Shelf"
          >
            <div className="absolute flex h-[196.326px] items-center justify-center left-[8.08px] top-[0.23px] w-[161.44px] motion-reduce:transition-none" style={fan(folderOpen, "tree", 0)} data-node-id="194:381">
              <div className="-rotate-4 flex-none">
                <div className="h-[186.4px] overflow-clip relative rounded-br-[var(--opacity\/12,12px)] rounded-tr-[var(--opacity\/12,12px)] w-[148.8px]" data-name="Book Cover 3">
                  <div className="absolute inset-[0_0_0.01px_0] rounded-br-[var(--opacity\/12,12px)] rounded-tr-[var(--opacity\/12,12px)]" data-node-id="194:382" data-name="JOvNpWCzZ89UyoMOJ76OuSM6T8.jpg">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-br-[var(--opacity\/12,12px)] rounded-tr-[var(--opacity\/12,12px)]">
                      <Zoomable
                        src={mine("orange-tree")}
                        alt="An orange maple by a lake in Ann Arbor"
                        width={1600}
                        height={1200}
                        pinchZoom
                        triggerClassName={`pointer-events-auto absolute inset-0 h-full ${folderOpen ? "" : "!pointer-events-none"}`}
                      >
                        <img alt="An orange maple by a lake in Ann Arbor" className="size-full max-w-none object-cover" src={mine("orange-tree")} />
                      </Zoomable>
                    </div>
                  </div>
                  <div className="absolute bottom-[0.01px] left-0 pointer-events-none shadow-[0.301px_0.602px_0.673px_-1.25px_rgba(0,0,0,0.18),1.144px_2.289px_2.559px_-2.5px_rgba(0,0,0,0.16),5px_10px_11.18px_-3.75px_rgba(0,0,0,0.06),2px_3px_13px_-5px_rgba(0,0,0,0.25)] top-0 w-[15.999px]" data-node-id="194:383" data-name="Cover shadow">
                    <div aria-hidden className="absolute bg-[var(--color\/grey\/31-28\%,rgba(79,79,79,0.28))] inset-0" />
                    <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0.301px_0.602px_0.673px_-1.25px_rgba(0,0,0,0.18),inset_1.144px_2.289px_2.559px_-2.5px_rgba(0,0,0,0.16),inset_5px_10px_11.18px_-3.75px_rgba(0,0,0,0.06)]" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute flex h-[191.479px] items-center justify-center left-[128.79px] top-[4.26px] w-[155.215px] motion-reduce:transition-none" style={fan(folderOpen, "tufting", 1)} data-node-id="194:386">
              <div className="flex-none rotate-2">
                <div className="h-[186.4px] overflow-clip relative rounded-br-[var(--opacity\/12,12px)] rounded-tr-[var(--opacity\/12,12px)] w-[148.8px]" data-name="Book Cover 2">
                  <div className="absolute inset-0 rounded-br-[var(--opacity\/12,12px)] rounded-tr-[var(--opacity\/12,12px)]" data-node-id="194:387" data-name="iaOgJY0s2qtwyiqdTs0IbsGasI.jpg">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-br-[var(--opacity\/12,12px)] rounded-tr-[var(--opacity\/12,12px)]">
                      <Zoomable
                        src={mine("tufting")}
                        alt="Anne tufting a rug"
                        width={1200}
                        height={1600}
                        pinchZoom
                        triggerClassName={`pointer-events-auto absolute inset-0 h-full ${folderOpen ? "" : "!pointer-events-none"}`}
                      >
                        <img alt="Anne tufting a rug" className="size-full max-w-none object-cover" src={mine("tufting")} />
                      </Zoomable>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 pointer-events-none shadow-[0.301px_0.602px_0.673px_-1.25px_rgba(0,0,0,0.18),1.144px_2.289px_2.559px_-2.5px_rgba(0,0,0,0.16),5px_10px_11.18px_-3.75px_rgba(0,0,0,0.06),2px_3px_13px_-5px_rgba(0,0,0,0.25)] top-0 w-[16px]" data-node-id="194:388" data-name="Cover shadow">
                    <div aria-hidden className="absolute bg-[var(--color\/grey\/31-28\%,rgba(79,79,79,0.28))] inset-0" />
                    <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0.301px_0.602px_0.673px_-1.25px_rgba(0,0,0,0.18),inset_1.144px_2.289px_2.559px_-2.5px_rgba(0,0,0,0.16),inset_5px_10px_11.18px_-3.75px_rgba(0,0,0,0.06)]" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute flex h-[185.948px] items-center justify-center left-[173.26px] top-[10.63px] w-[68.664px]" data-node-id="194:392">
              <div className="flex-none rotate-12">
                <div className="h-[183.47px] relative w-[31.2px]" data-name="Minimalist White Pencil 1">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[100.01%] left-0 max-w-none top-0 w-full" src={imgMinimalistWhitePencil1} />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute backdrop-blur-[5px] bg-[var(--color\/grey\/94-57\%,rgba(230,240,250,0.57))] bottom-0 h-[83.2px] left-0 right-0 rounded-[var(--corner-radius\/6,6px)]" data-node-id="194:394" data-name="shelf">
              <div className="absolute flex items-center justify-center left-[180.29px] size-[69.824px] top-[2.53px]" data-node-id="194:399">
                <div className="flex-none rotate-14">
                  <div className="drop-shadow-[3px_2px_2px_rgba(0,0,0,0.25)] relative size-[57.6px]" data-name="Sticker 1">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgSticker1} />
                    </div>
                  </div>
                </div>
              </div>
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
    if (el.parentElement !== board || !el.classList.contains("absolute") || el.dataset.nodeId === "194:110" || el.dataset.name === "Book Shelf") return;
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
  function end() {
    const d = drag.current;
    if (!d) return;
    d.el.style.transition = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "none" : "translate 350ms ease-out";
    d.el.style.translate = "0px 0px";
    d.el.style.zIndex = "";
    drag.current = null;
  }
  return (
    <div ref={ref} className="relative w-full aspect-[800/480] desktop:h-full desktop:aspect-auto" style={{
      "--pinboard-hand": handFont, "--pinboard-marker": markerFont } as React.CSSProperties}
      aria-label="Anne’s pinboard: personal photos, to-do list, keepsakes and books"
      onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}>
      <div className="absolute left-0 top-0 origin-top-left select-none [&_img]:pointer-events-none"
        style={{ width: 800, height: size.height / scale, transform: `scale(${scale})` }}>
        <PinboardArt />
      </div>
    </div>
  );
}

