/**
 * Artwork for the peel board's stickers, each drawn on a 300 x 300 canvas.
 *
 * Every design returns:
 * - `cut`: the die-cut silhouette, drawn with a thick stroke in the cut colour
 *   underneath the art, so the visible white margin is half the stroke;
 * - `art`: what is printed on the sticker;
 * - `sil`: the bare silhouette (no stroke), used to clip gloss, grain and
 *   wear overlays, and to draw the sticker's backing when it peels.
 *
 * Drawn for this site to match the sticker set Anne placed in her Framer
 * project (same designs, colours and proportions). Tool marks are simplified
 * drawings used to name the tools she works with.
 */

import type { ReactElement } from "react";

export type Material = "paper" | "vinyl" | "foil";

export interface PeelDesign {
  /** Silhouette elements, in 300 x 300 space. */
  shape: (props: { fill: string; stroke?: string; strokeWidth?: number }) => ReactElement;
  /** Width of the white cut stroke (visible margin is half). */
  cut: number;
  cutColor: string;
  art: ReactElement;
  /** Rough box of the artwork, for choosing which corner peels. */
  box: [number, number, number, number];
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

const FRAMER_PTS = ["74,27 226,27 226,103 150,103", "74,103 150,103 226,179 74,179", "74,179 150,179 150,255"];

const FIGMA = {
  tl: "M108,24 H150 V108 H108 A42,42 0 0 1 108,24 Z",
  tr: "M150,24 H192 A42,42 0 0 1 192,108 H150 Z",
  ml: "M108,108 H150 V192 H108 A42,42 0 0 1 108,108 Z",
  bl: "M108,192 H150 V234 A42,42 0 0 1 108,276 A42,42 0 0 1 108,192 Z",
};

const CURSOR = "46,24 252,166 168,181 209,258 171,278 128,199 72,260";

function asteriskPath() {
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const tipL = a - 0.105;
    const tipR = a + 0.105;
    const mid = a + Math.PI / 8;
    pts.push(`${round(150 + Math.cos(tipL) * 132)},${round(150 + Math.sin(tipL) * 132)}`);
    pts.push(`${round(150 + Math.cos(tipR) * 132)},${round(150 + Math.sin(tipR) * 132)}`);
    pts.push(`${round(150 + Math.cos(mid) * 55)},${round(150 + Math.sin(mid) * 55)}`);
  }
  return `M${pts.join(" L")} Z`;
}
const ASTERISK = asteriskPath();

function sparklePath() {
  // Twelve tapered rays of slightly different lengths around a small hub.
  const lens = [112, 96, 118, 92, 110, 100, 116, 94, 108, 98, 120, 90];
  const pts: string[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6 - Math.PI / 2;
    const w = 0.13;
    pts.push(`${round(150 + Math.cos(a - Math.PI / 12) * 26)},${round(150 + Math.sin(a - Math.PI / 12) * 26)}`);
    pts.push(`${round(150 + Math.cos(a - w) * lens[i])},${round(150 + Math.sin(a - w) * lens[i])}`);
    pts.push(`${round(150 + Math.cos(a + w * 0.4) * (lens[i] + 4))},${round(150 + Math.sin(a + w * 0.4) * (lens[i] + 4))}`);
  }
  return `M${pts.join(" L")} Z`;
}
const SPARKLE = sparklePath();

/** Deterministic speckles for the paper stickers. */
function speckles(n: number, seed: number, r: number) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  return Array.from({ length: n }, () => {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * r;
    return { x: round(150 + Math.cos(a) * d), y: round(150 + Math.sin(a) * d), o: rand() < 0.5 ? 0.045 : 0.09, s: round(0.8 + rand() * 1.4) };
  });
}
const CLAUDE_SPECKS = speckles(76, 7, 100);

/** A six-petal knot in the spirit of the ChatGPT mark. */
function knotPetals() {
  return Array.from({ length: 6 }, (_, i) => i * 60);
}

export const DESIGNS: Record<string, PeelDesign> = {
  framer: {
    cut: 16,
    cutColor: "#FFFFFF",
    box: [74, 27, 226, 255],
    shape: (p) => (
      <g fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinejoin="round">
        {FRAMER_PTS.map((pts) => (
          <polygon key={pts} points={pts} />
        ))}
      </g>
    ),
    art: (
      <g>
        <g fill="#090909">
          {FRAMER_PTS.map((pts) => (
            <polygon key={pts} points={pts} />
          ))}
        </g>
        <path d="M75 22H223 M69 111V174" stroke="#fff" strokeWidth={2} opacity={0.9} />
      </g>
    ),
  },
  figma: {
    cut: 18,
    cutColor: "#FFFFFF",
    box: [66, 24, 234, 276],
    shape: (p) => (
      <g fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinejoin="round">
        <path d={FIGMA.tl} />
        <path d={FIGMA.tr} />
        <path d={FIGMA.ml} />
        <circle cx={192} cy={150} r={42} />
        <path d={FIGMA.bl} />
      </g>
    ),
    art: (
      <g>
        <path d={FIGMA.tl} fill="#FF3737" />
        <path d={FIGMA.tr} fill="#FF7237" />
        <path d={FIGMA.ml} fill="#874FFF" />
        <circle cx={192} cy={150} r={42} fill="#00B6FF" />
        <path d={FIGMA.bl} fill="#24CB71" />
      </g>
    ),
  },
  notion: {
    cut: 7,
    cutColor: "#FFFFFF",
    box: [31, 33, 271, 266],
    shape: (p) => <path d="M60,33 L246,40 Q271,42 271,68 L268,238 Q267,266 240,266 L58,262 Q31,261 31,234 L33,62 Q34,32 60,33 Z" fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinejoin="round" />,
    art: (
      <g>
        <path d="M60,33 L246,40 Q271,42 271,68 L268,238 Q267,266 240,266 L58,262 Q31,261 31,234 L33,62 Q34,32 60,33 Z" fill="#FFFFFF" />
        <path d="M60,33 L246,40 Q271,42 271,68 L268,238 Q267,266 240,266 L58,262 Q31,261 31,234 L33,62 Q34,32 60,33 Z" fill="none" stroke="#111" strokeWidth={13} strokeLinejoin="round" />
        <path d="M92,84 L124,84 L190,186 L190,92 L176,88 L176,80 L222,80 L222,88 L208,92 L208,222 L184,222 L114,116 L114,206 L130,212 L130,220 L84,220 L84,212 L98,206 L98,96 L84,90 Z" fill="#111" />
      </g>
    ),
  },
  react: {
    cut: 30,
    cutColor: "#FFFDF7",
    box: [30, 42, 270, 258],
    shape: (p) => (
      <g fill="none" stroke={p.stroke ?? p.fill} strokeWidth={(p.strokeWidth ?? 0) + 18}>
        {[0, 60, 120].map((r) => (
          <ellipse key={r} cx={150} cy={150} rx={120} ry={46} transform={`rotate(${r} 150 150)`} />
        ))}
        <circle cx={150} cy={150} r={22} fill={p.stroke ?? p.fill} />
      </g>
    ),
    art: (
      <g fill="none" stroke="#61DAFB" strokeWidth={14}>
        {[0, 60, 120].map((r) => (
          <ellipse key={r} cx={150} cy={150} rx={120} ry={46} transform={`rotate(${r} 150 150)`} />
        ))}
        <circle cx={150} cy={150} r={21} fill="#61DAFB" stroke="none" />
      </g>
    ),
  },
  claude: {
    cut: 6,
    cutColor: "#FFFDF7",
    box: [30, 30, 270, 270],
    shape: (p) => <path d={SPARKLE} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinejoin="round" />,
    art: (
      <g>
        <path d={SPARKLE} fill="#D97757" />
        {CLAUDE_SPECKS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#3F382C" opacity={s.o} />
        ))}
      </g>
    ),
  },
  cursor: {
    cut: 14,
    cutColor: "#FFFFFF",
    box: [46, 24, 252, 278],
    shape: (p) => <polygon points={CURSOR} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinejoin="round" />,
    art: (
      <g>
        <polygon points={CURSOR} fill="#214DE7" strokeLinejoin="round" />
        <path d="M58 47L228 164L154 178" stroke="#90A7FF" strokeWidth={2} opacity={0.68} fill="none" />
        <path d="M174 261L187 254" stroke="#102C9A" strokeWidth={3} opacity={0.45} />
      </g>
    ),
  },
  asterisk: {
    cut: 10,
    cutColor: "#FFFFFF",
    box: [18, 18, 282, 282],
    shape: (p) => <path d={ASTERISK} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinejoin="round" />,
    art: (
      <g>
        <defs>
          <linearGradient id="peel-silver" x1="0" y1="0" x2="1" y2="1">
            {["#EFF2F0", "#A6B0B8", "#F9FAF6", "#BAC6D1", "#DFDDE6", "#929DA6"].map((c, i) => (
              <stop key={c} offset={i / 5} stopColor={c} />
            ))}
          </linearGradient>
          <linearGradient id="peel-prism" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#8FA8D8" />
            <stop offset="1" stopColor="#F0DFB4" />
          </linearGradient>
        </defs>
        <path d={ASTERISK} fill="url(#peel-silver)" />
        <path d={ASTERISK} fill="url(#peel-prism)" opacity={0.32} />
        <path d="M60,90 L210,240 M90,60 L240,210 M120,40 L250,170" stroke="#fff" strokeWidth={1} opacity={0.45} />
        <circle cx={150} cy={150} r={41} fill="none" stroke="#fff" strokeWidth={2} opacity={0.65} />
        <path d={ASTERISK} fill="none" stroke="#A7ADB3" strokeWidth={0.8} />
        <circle cx={150} cy={150} r={8} fill="none" stroke="#293242" strokeWidth={2} opacity={0.55} />
        <circle cx={150} cy={150} r={2} fill="#293242" opacity={0.7} />
      </g>
    ),
  },
  save: {
    cut: 12,
    cutColor: "#FFFFFF",
    box: [31, 31, 268, 269],
    shape: (p) => <polygon points="51,31 219,31 268,80 268,255 256,269 44,269 31,256 31,45" fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinejoin="round" />,
    art: (
      <g>
        <polygon points="51,31 219,31 268,80 268,255 256,269 44,269 31,256 31,45" fill="#F36B38" stroke="#D95427" strokeWidth={1} />
        <path d="M80,31 H214 V116 Q214,128 202,128 H92 Q80,128 80,116 Z" fill="#FBE4C6" />
        <rect x={166} y={45} width={31} height={66} rx={3} fill="#382518" />
        <rect x={65} y={162} width={169} height={106} rx={6} fill="#FFF5DF" />
        <path d="M65,194 H234 M65,245 H234" stroke="#D8BBA0" strokeWidth={1.5} />
        <text x={80} y={185} fontSize={11} fill="#382518" style={{ fontFamily: "'Courier New', ui-monospace, monospace", letterSpacing: 1.5 }}>
          v.03
        </text>
        <text x={149} y={232} textAnchor="middle" fontSize={35} fontWeight={800} fill="#382518" style={{ fontFamily: "Arial, Helvetica, sans-serif", letterSpacing: -1.5 }}>
          SAVE
        </text>
        <rect x={44} y={237} width={8} height={15} rx={1.5} fill="#382518" opacity={0.65} />
        <rect x={247} y={237} width={8} height={15} rx={1.5} fill="#382518" opacity={0.65} />
        <path d="M222,40 L258,76 M90,40 H150" stroke="#FFD2AD" strokeWidth={2} opacity={0.8} />
      </g>
    ),
  },
  chatgpt: {
    cut: 21,
    cutColor: "#FFFFFF",
    box: [34, 34, 266, 266],
    shape: (p) => (
      <g fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinejoin="round">
        {knotPetals().map((r) => (
          <rect key={r} x={126} y={36} width={60} height={136} rx={30} transform={`rotate(${r} 150 150)`} />
        ))}
        <circle cx={150} cy={150} r={70} />
      </g>
    ),
    art: (
      <g>
        <g fill="#111111">
          {knotPetals().map((r) => (
            <rect key={r} x={126} y={36} width={60} height={136} rx={30} transform={`rotate(${r} 150 150)`} />
          ))}
          <circle cx={150} cy={150} r={70} />
        </g>
        <g fill="none" stroke="#FFFDF7" strokeWidth={9} strokeLinecap="round">
          {knotPetals().map((r) => (
            <path key={r} d="M150,64 Q182,64 186,96 L186,148" transform={`rotate(${r} 150 150)`} />
          ))}
        </g>
        <circle cx={150} cy={150} r={20} fill="#111111" />
      </g>
    ),
  },
};
