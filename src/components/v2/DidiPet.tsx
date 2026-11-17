"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useReducedMotion } from "motion/react";

/**
 * Didi, Anne's chubby grey British Shorthair, as a little desktop pet.
 *
 * She lives on top of the page (fixed position) and:
 * - follow mode: walks after the pointer, and when she catches up she sits,
 *   then grooms, then curls up for a nap if you leave her alone;
 * - shy mode: scoots away when the pointer comes close;
 * - tapping her makes her happy and sends up hearts.
 *
 * Drawn originally in flat shapes: one soft grey body, no outlines, big round
 * white eyes. Poses are separate SVG drawings swapped by state; walking legs
 * and the tail move with CSS keyframes so the frame loop only moves her.
 */

export type DidiMode = "follow" | "shy" | "stay";
type Pose = "sit" | "walk" | "groom" | "sleep" | "happy";

const W = 120;
const H = 96;
const FUR = "#959BA4";
const FUR_DARK = "#7E848D";
const BELLY = "#ADB2BA";
const EYE = "#1F2122";

function Eyes({ cx, cy, closed, happy, gap = 21 }: { cx: number; cy: number; closed?: boolean; happy?: boolean; gap?: number }) {
  const xs = [cx - gap / 2, cx + gap / 2];
  if (closed || happy)
    return (
      <g fill="none" stroke={EYE} strokeWidth={2.6} strokeLinecap="round">
        {xs.map((x) => (
          <path key={x} d={happy ? `M${x - 5},${cy + 2} Q${x},${cy - 5} ${x + 5},${cy + 2}` : `M${x - 5},${cy} Q${x},${cy + 4} ${x + 5},${cy}`} />
        ))}
      </g>
    );
  return (
    <g>
      {xs.map((x) => (
        <g key={x}>
          <circle cx={x} cy={cy} r={8.5} fill="#fff" />
          <circle cx={x + 1.6} cy={cy + 0.6} r={4} fill={EYE} />
        </g>
      ))}
    </g>
  );
}

function Ears({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <g fill={FUR}>
      <path d={`M${x1 - 10},${y + 12} Q${x1 - 9},${y - 12} ${x1 - 2},${y - 13} Q${x1 + 6},${y - 6} ${x1 + 12},${y + 4} Z`} />
      <path d={`M${x2 + 10},${y + 12} Q${x2 + 9},${y - 12} ${x2 + 2},${y - 13} Q${x2 - 6},${y - 6} ${x2 - 12},${y + 4} Z`} />
    </g>
  );
}

function DidiDrawing({ pose }: { pose: Pose }) {
  if (pose === "walk")
    return (
      <g>
        <path className="didi-tail" d="M28,52 C14,46 10,30 16,16" stroke={FUR_DARK} strokeWidth={10} strokeLinecap="round" fill="none" />
        <g className="didi-legs-b">
          <rect x={34} y={64} width={13} height={26} rx={6.5} fill={FUR_DARK} />
          <rect x={78} y={64} width={13} height={26} rx={6.5} fill={FUR_DARK} />
        </g>
        <ellipse cx={60} cy={60} rx={40} ry={25} fill={FUR} />
        <g className="didi-legs-a">
          <rect x={44} y={66} width={13} height={25} rx={6.5} fill={FUR} />
          <rect x={88} y={66} width={13} height={25} rx={6.5} fill={FUR} />
        </g>
        <Ears x1={88} x2={110} y={30} />
        <circle cx={99} cy={44} r={21} fill={FUR} />
        <Eyes cx={100} cy={44} gap={17} />
      </g>
    );

  if (pose === "sleep")
    return (
      <g>
        <ellipse cx={58} cy={74} rx={46} ry={20} fill={FUR} />
        <path d="M18,80 C24,94 72,96 96,86" stroke={FUR_DARK} strokeWidth={10} strokeLinecap="round" fill="none" />
        <Ears x1={82} x2={102} y={56} />
        <ellipse cx={92} cy={70} rx={21} ry={18} fill={FUR} />
        <Eyes cx={92} cy={70} gap={15} closed />
      </g>
    );

  const happy = pose === "happy";
  const groom = pose === "groom";
  return (
    <g>
      <path className="didi-tail-sit" d="M86,84 C110,86 114,66 104,56" stroke={FUR_DARK} strokeWidth={10} strokeLinecap="round" fill="none" />
      <ellipse cx={60} cy={66} rx={34} ry={27} fill={FUR} />
      <ellipse cx={60} cy={74} rx={18} ry={14} fill={BELLY} />
      <Ears x1={46} x2={74} y={20} />
      <circle cx={60} cy={38} r={26} fill={FUR} />
      <Eyes cx={60} cy={38} closed={groom} happy={happy} />
      <ellipse cx={48} cy={90} rx={9} ry={5.5} fill={FUR_DARK} />
      {groom ? (
        <ellipse className="didi-lick" cx={76} cy={48} rx={8} ry={10} fill={FUR_DARK} />
      ) : (
        <ellipse cx={72} cy={90} rx={9} ry={5.5} fill={FUR_DARK} />
      )}
    </g>
  );
}

const CSS = `
@keyframes didi-step { 0%,100% { transform: rotate(14deg) } 50% { transform: rotate(-14deg) } }
@keyframes didi-wag { 0%,100% { transform: rotate(-6deg) } 50% { transform: rotate(10deg) } }
@keyframes didi-lick { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
.didi-legs-a rect { transform-box: fill-box; transform-origin: 50% 0; animation: didi-step .32s linear infinite }
.didi-legs-b rect { transform-box: fill-box; transform-origin: 50% 0; animation: didi-step .32s linear infinite reverse }
.didi-tail, .didi-tail-sit { transform-box: fill-box; transform-origin: 0% 100%; animation: didi-wag 1.6s ease-in-out infinite }
.didi-lick { animation: didi-lick .5s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) { .didi-legs-a rect, .didi-legs-b rect, .didi-tail, .didi-tail-sit, .didi-lick { animation: none } }
`;

export function DidiPet({ mode = "follow" }: { mode?: DidiMode }) {
  const reduce = useReducedMotion() ?? false;
  const x = useMotionValue(40);
  const y = useMotionValue(400);
  const [pose, setPose] = useState<Pose>("sit");
  const [facing, setFacing] = useState(1);
  const [hearts, setHearts] = useState<number[]>([]);
  const target = useRef<{ x: number; y: number } | null>(null);
  const idle = useRef(0);
  const happyUntil = useRef(0);
  const poseRef = useRef<Pose>("sit");
  const faceRef = useRef(1);

  useEffect(() => {
    y.set(window.innerHeight - H - 24);
    const onMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
    };
  }, [y]);

  function show(p: Pose) {
    if (poseRef.current !== p) {
      poseRef.current = p;
      setPose(p);
    }
  }
  function face(d: number) {
    if (faceRef.current !== d) {
      faceRef.current = d;
      setFacing(d);
    }
  }

  useAnimationFrame((time, delta) => {
    const dt = Math.min(delta, 50) / 1000;
    if (time < happyUntil.current) return show("happy");
    const t = target.current;
    const cx = x.get() + W / 2;
    const cy = y.get() + H / 2;
    let moving = false;

    if (t && !reduce && mode !== "stay") {
      const dx = t.x - cx;
      const dy = t.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      if (mode === "follow" && dist > (poseRef.current === "walk" ? 78 : 110)) {
        const step = Math.min(dist - 74, 190 * dt);
        x.set(x.get() + (dx / dist) * step);
        y.set(y.get() + (dy / dist) * step);
        face(dx >= 0 ? 1 : -1);
        moving = true;
      } else if (mode === "shy" && dist < 200) {
        const step = 280 * dt;
        x.set(x.get() - (dx / dist) * step);
        y.set(y.get() - (dy / dist) * step);
        face(dx >= 0 ? -1 : 1);
        moving = true;
      }
      x.set(Math.max(4, Math.min(window.innerWidth - W - 4, x.get())));
      y.set(Math.max(70, Math.min(window.innerHeight - H - 4, y.get())));
    }

    if (moving) {
      idle.current = 0;
      return show("walk");
    }
    idle.current += dt;
    show(idle.current < 3 ? "sit" : idle.current < 6.5 ? "groom" : "sleep");
  });

  function pet() {
    happyUntil.current = performance.now() + 1400;
    idle.current = 0;
    const id = Date.now();
    setHearts((h) => [...h, id, id + 1, id + 2]);
    window.setTimeout(() => setHearts((h) => h.filter((v) => v < id || v > id + 2)), 1300);
  }

  return (
    <motion.div className="pointer-events-none fixed left-0 top-0 z-40" style={{ x, y, width: W, height: H }}>
      <style>{CSS}</style>
      <button
        type="button"
        onClick={pet}
        aria-label="Pet Didi"
        className="pointer-events-auto absolute inset-0 cursor-pointer"
        style={{ transform: `scaleX(${facing})` }}
      >
        <svg viewBox={`0 0 ${W} ${H + 4}`} className="h-full w-full overflow-visible" aria-hidden>
          <ellipse cx={60} cy={96} rx={36} ry={4} fill="rgba(42,49,50,0.12)" />
          <DidiDrawing pose={pose} />
        </svg>
      </button>
      <AnimatePresence>
        {pose === "sleep" && (
          <motion.span
            key="z"
            className="absolute -top-3 right-0 text-[16px] font-semibold"
            style={{ fontFamily: "var(--font-dm-sans)", color: "#7E848D" }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            z z
          </motion.span>
        )}
        {hearts.map((h, i) => (
          <motion.svg
            key={h}
            viewBox="0 0 20 18"
            className="absolute left-1/2 top-0 w-[18px]"
            initial={{ opacity: 1, x: -9, y: 0, scale: 0.6 }}
            animate={{ opacity: 0, x: -9 + ((i % 3) - 1) * 26, y: -60 - (i % 3) * 10, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            aria-hidden
          >
            <path d="M10,17 C3,12 0,8 0,5 A5,5 0 0 1 10,3 A5,5 0 0 1 20,5 C20,8 17,12 10,17 Z" fill="#FF2244" />
          </motion.svg>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

/** A still Didi for buttons and headers. */
export function DidiStill({ pose = "sit", className }: { pose?: Pose; className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H + 4}`} className={className} aria-hidden>
      <DidiDrawing pose={pose} />
    </svg>
  );
}
