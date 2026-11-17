import { forwardRef } from "react";

import { COZY } from "@/components/cozy/texture";

/**
 * Original postage stamps for the postcard playground. Each is an 80x100 SVG
 * with a perforated edge (a mask of small bites along the border) and a small
 * painted scene inside. They are plain SVG with no external references, so a
 * stamp can be serialised and drawn onto the exported postcard image.
 */

export interface StampDef {
  id: string;
  name: string;
  bg: string;
  value: string;
  art: React.ReactNode;
}

const W = 80;
const H = 100;

function Perforated({ id, children }: { id: string; children: React.ReactNode }) {
  const bites: React.ReactNode[] = [];
  for (let x = 4; x <= W - 4; x += 8) {
    bites.push(<circle key={`t${x}`} cx={x} cy={0} r={2.6} fill="#000" />);
    bites.push(<circle key={`b${x}`} cx={x} cy={H} r={2.6} fill="#000" />);
  }
  for (let y = 4; y <= H - 4; y += 8) {
    bites.push(<circle key={`l${y}`} cx={0} cy={y} r={2.6} fill="#000" />);
    bites.push(<circle key={`r${y}`} cx={W} cy={y} r={2.6} fill="#000" />);
  }
  return (
    <>
      <defs>
        <mask id={id}>
          <rect width={W} height={H} fill="#fff" />
          {bites}
        </mask>
      </defs>
      <g mask={`url(#${id})`}>{children}</g>
    </>
  );
}

const ink = COZY.ink;

export const STAMPS: StampDef[] = [
  {
    id: "didi",
    name: "Didi the cat",
    bg: "#F6C9CF",
    value: "1st",
    art: (
      <g>
        <path d="M22,62 C20,44 28,36 32,34 C36,36 40,42 42,46 Z" fill="#A6ABB3" />
        <path d="M58,62 C60,44 52,36 48,34 C44,36 40,42 38,46 Z" fill="#A6ABB3" />
        <ellipse cx={40} cy={62} rx={24} ry={19} fill="#A6ABB3" />
        <circle cx={32} cy={60} r={2.6} fill={ink} />
        <circle cx={48} cy={60} r={2.6} fill={ink} />
        <ellipse cx={27} cy={67} rx={4} ry={2.4} fill={COZY.blush} />
        <ellipse cx={53} cy={67} rx={4} ry={2.4} fill={COZY.blush} />
        <path d="M37,66 Q40,64 43,66 Q40,69 37,66 Z" fill="#E7949F" />
        <path d="M36,70 Q38,72 40,70 Q42,72 44,70" stroke={ink} strokeWidth={1.2} fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "candle",
    name: "Cozy candle",
    bg: "#3E4B6B",
    value: "2¢",
    art: (
      <g>
        {[
          [20, 30], [60, 26], [16, 70], [64, 66], [40, 22],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.6} fill={COZY.cream} />
        ))}
        <rect x={26} y={50} width={28} height={32} rx={4} fill={COZY.pink} />
        <ellipse cx={40} cy={50} rx={14} ry={4} fill={COZY.cream} />
        <path d="M40,48 L40,42" stroke={ink} strokeWidth={1.6} />
        <path d="M40,28 C45,34 46,38 45,41 C44,44 42,45 40,45 C38,45 36,44 35,41 C34,38 35,34 40,28 Z" fill="#FFC65C" />
      </g>
    ),
  },
  {
    id: "gumball",
    name: "Happy gumball",
    bg: COZY.butter,
    value: "5¢",
    art: (
      <g>
        <circle cx={40} cy={52} r={22} fill="#F28C6B" />
        <path d="M27,44 A15,15 0 0 1 35,36" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
        <circle cx={33} cy={52} r={2.6} fill={ink} />
        <circle cx={47} cy={52} r={2.6} fill={ink} />
        <path d="M34,59 Q40,65 46,59" stroke={ink} strokeWidth={2} fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "berry",
    name: "Strawberry",
    bg: "#CFE2C4",
    value: "3¢",
    art: (
      <g>
        <path d="M40,80 C24,70 20,52 26,44 C32,38 48,38 54,44 C60,52 56,70 40,80 Z" fill="#EE6F72" />
        <path d="M30,42 L36,34 L40,40 L44,34 L50,42 Z" fill="#7FA36E" />
        {[
          [34, 52], [46, 52], [40, 60], [32, 64], [48, 64], [40, 70],
        ].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={1.3} ry={2} fill={COZY.cream} />
        ))}
      </g>
    ),
  },
  {
    id: "cocoa",
    name: "Cocoa mug",
    bg: COZY.sky,
    value: "4¢",
    art: (
      <g>
        <path d="M34,40 C30,34 38,30 34,24" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.9} />
        <path d="M46,40 C42,34 50,30 46,24" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.9} />
        <path d="M24,44 L56,44 L53,74 Q52,80 46,80 L34,80 Q28,80 27,74 Z" fill="#E9687B" />
        <path d="M55,50 C66,50 66,66 54,66" stroke="#E9687B" strokeWidth={5} fill="none" />
        <path d="M33,58 C33,54 39,54 40,58 C41,54 47,54 47,58 C47,63 40,67 40,67 C40,67 33,63 33,58 Z" fill={COZY.cream} />
      </g>
    ),
  },
  {
    id: "sun",
    name: "Hello sun",
    bg: "#F7D9C4",
    value: "1st",
    art: (
      <g>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const f = (n: number) => Math.round(n * 10) / 10;
          return <path key={i} d={`M${f(40 + Math.cos(a) * 20)},${f(54 + Math.sin(a) * 20)} L${f(40 + Math.cos(a) * 28)},${f(54 + Math.sin(a) * 28)}`} stroke="#F2A94E" strokeWidth={4} strokeLinecap="round" />;
        })}
        <circle cx={40} cy={54} r={16} fill={COZY.butter} />
        <circle cx={35} cy={52} r={2} fill={ink} />
        <circle cx={45} cy={52} r={2} fill={ink} />
        <path d="M35,58 Q40,62 45,58" stroke={ink} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      </g>
    ),
  },
];

export const Stamp = forwardRef<SVGSVGElement, { stamp: StampDef; width?: number; className?: string }>(function Stamp(
  { stamp, width = 80, className },
  ref,
) {
  const maskId = `perf-${stamp.id}`;
  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden>
      <Perforated id={maskId}>
        <rect width={W} height={H} fill={COZY.paper} />
        <rect x={6} y={6} width={W - 12} height={H - 12} rx={2} fill={stamp.bg} />
        {stamp.art}
        <text x={11} y={20} fontSize={10} fontWeight={700} fill={stamp.bg === "#3E4B6B" ? COZY.cream : COZY.ink} fontFamily="ui-monospace, Menlo, monospace">
          {stamp.value}
        </text>
      </Perforated>
    </svg>
  );
});
