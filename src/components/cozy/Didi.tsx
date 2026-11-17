"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { COZY, CozyFilters } from "./texture";

/**
 * Didi, Anne's chubby grey British Shorthair, as something to play with.
 *
 * - Her eyes follow the pointer (or the toy, when there is one).
 * - "Give a treat" drops a fish biscuit into her mouth; she chews, and a row of
 *   five fish fills up. Five treats in, she is full and naps for a few seconds.
 * - "Wand toy" swaps the pointer for a feather on a string that trails behind
 *   it. Bring it close and move it, and she swats at it with the nearer paw.
 * - Tapping her (without the wand) gets a purr.
 *
 * Everything is drawn in one 320x280 SVG; overlays (treat, hearts, z's) are
 * positioned in percentages of that box, so she scales as one piece.
 */

const VB_W = 320;
const VB_H = 280;
const HEAD = { x: 160, y: 118 };
const MOUTH = { x: 160, y: 141 };
const FULL = 5;
const FUR = "#C9CCD1";
const FUR_LIGHT = "#E2E4E7";
const FUR_DARK = "#AEB2B8";
const INNER_EAR = "#E9B9BC";

type Swat = "left" | "right" | null;

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

function Heart({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute text-[18px]"
      style={{ left: pct(x, VB_W), top: pct(y, VB_H), color: COZY.pinkDeep }}
      initial={{ opacity: 0, y: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0], y: -40, scale: 1 }}
      transition={{ duration: 1.3, delay, ease: "easeOut" }}
    >
      ♥
    </motion.span>
  );
}

function Fish({ size = 22, faded = false }: { size?: number; faded?: boolean }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 40 24" aria-hidden style={{ opacity: faded ? 0.3 : 1 }}>
      <path d="M4,12 C10,2 24,2 30,12 C24,22 10,22 4,12 Z" fill={COZY.peach} />
      <path d="M29,12 L38,4 L36,12 L38,20 Z" fill={COZY.peach} />
      <circle cx={11} cy={10.5} r={1.8} fill={COZY.ink} />
      <path d="M17,8 Q19,12 17,16" stroke="#E0875D" strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Didi() {
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, "");
  const boxRef = useRef<HTMLDivElement>(null);

  const [wand, setWand] = useState(false);
  const [tummy, setTummy] = useState(0);
  const [eating, setEating] = useState(false);
  const [treatKey, setTreatKey] = useState(0);
  const [treatFalling, setTreatFalling] = useState(false);
  const [napping, setNapping] = useState(false);
  const [purring, setPurring] = useState(false);
  const [swat, setSwat] = useState<Swat>(null);
  const [plays, setPlays] = useState(0);
  const [blink, setBlink] = useState(false);
  const [hearts, setHearts] = useState(0);
  const lastSwat = useRef(0);
  const lastMove = useRef<{ x: number; y: number; t: number } | null>(null);

  // Pupils and head follow a target, in viewBox units relative to the head.
  const eyeX = useSpring(0, { stiffness: 300, damping: 25 });
  const eyeY = useSpring(0, { stiffness: 300, damping: 25 });
  const tilt = useSpring(0, { stiffness: 120, damping: 14 });

  // The wand: the hand is the pointer, the feather trails on a spring.
  const handX = useMotionValue(250);
  const handY = useMotionValue(40);
  const featherX = useSpring(handX, { stiffness: 90, damping: 9, mass: 0.8 });
  const featherY = useSpring(useTransform(handY, (v) => v + 55), { stiffness: 90, damping: 9, mass: 0.8 });
  const stringPath = useTransform(
    [handX, handY, featherX, featherY],
    ([hx, hy, fx, fy]: number[]) => `M${hx},${hy} Q${(hx + fx) / 2},${Math.max(hy, fy) + 14} ${fx},${fy}`,
  );
  const stickPath = useTransform([handX, handY], ([hx, hy]: number[]) => `M${hx},${hy} L${hx + 34},${hy - 30}`);

  const asleep = napping;
  const happyEyes = purring || eating || asleep;

  // Idle blinking.
  useEffect(() => {
    if (reduce) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        loop();
      }, 2800 + Math.random() * 2400);
    };
    loop();
    return () => clearTimeout(t);
  }, [reduce]);

  function toLocal(e: React.PointerEvent) {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return null;
    return { x: ((e.clientX - r.left) / r.width) * VB_W, y: ((e.clientY - r.top) / r.height) * VB_H };
  }

  function look(x: number, y: number) {
    const dx = x - HEAD.x;
    const dy = y - HEAD.y;
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 120) * 4.5;
    eyeX.set((dx / d) * k);
    eyeY.set((dy / d) * k);
    tilt.set(Math.max(-7, Math.min(7, dx / 25)));
  }

  function onPointerMove(e: React.PointerEvent) {
    const p = toLocal(e);
    if (!p || asleep) return;
    if (!wand) {
      look(p.x, p.y);
      return;
    }
    handX.set(p.x);
    handY.set(p.y);
    look(featherX.get(), featherY.get());

    const now = performance.now();
    const prev = lastMove.current;
    lastMove.current = { ...p, t: now };
    if (!prev || eating) return;
    const speed = Math.hypot(p.x - prev.x, p.y - prev.y) / Math.max(1, now - prev.t);
    const fx = featherX.get();
    const fy = featherY.get();
    const close = Math.hypot(fx - HEAD.x, fy - (HEAD.y + 60)) < 130;
    if (close && speed > 0.25 && now - lastSwat.current > 650) {
      lastSwat.current = now;
      setSwat(fx < HEAD.x ? "left" : "right");
      setPlays((n) => {
        if ((n + 1) % 5 === 0) setHearts((h) => h + 1);
        return n + 1;
      });
      setTimeout(() => setSwat(null), 380);
    }
  }

  function giveTreat() {
    if (eating || asleep || treatFalling) return;
    setTreatKey((k) => k + 1);
    setTreatFalling(true);
    setTimeout(
      () => {
        setTreatFalling(false);
        setEating(true);
        setTummy((t) => t + 1);
        setHearts((h) => h + 1);
      },
      reduce ? 0 : 650,
    );
    setTimeout(
      () => {
        setEating(false);
        setTummy((t) => {
          if (t >= FULL) {
            setNapping(true);
            setWand(false);
            setTimeout(() => {
              setNapping(false);
              setTummy(0);
            }, 7000);
          }
          return t;
        });
      },
      reduce ? 300 : 1700,
    );
  }

  function pet() {
    if (wand || asleep || eating) return;
    setPurring(true);
    setHearts((h) => h + 1);
    setTimeout(() => setPurring(false), 1600);
  }

  const paw = (side: "left" | "right") => {
    const raised = swat === side;
    const cx = side === "left" ? 124 : 196;
    return (
      <motion.ellipse
        cx={cx}
        cy={250}
        rx={22}
        ry={13}
        fill={FUR_LIGHT}
        style={{ originX: `${cx}px`, originY: "250px" }}
        animate={raised ? { y: -78, x: side === "left" ? -14 : 14, rotate: side === "left" ? 20 : -20 } : { y: 0, x: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 520, damping: 16 }}
      />
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={boxRef}
        className="relative w-full max-w-[340px] select-none"
        style={{ aspectRatio: `${VB_W} / ${VB_H}`, cursor: wand ? "none" : "default", touchAction: wand ? "none" : "auto" }}
        onPointerMove={onPointerMove}
        onPointerDown={wand ? onPointerMove : undefined}
      >
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <CozyFilters id={uid} />
          <ellipse cx={160} cy={264} rx={118} ry={10} fill="rgba(78,64,58,0.1)" />

          <motion.g
            style={{ originX: "160px", originY: "260px" }}
            animate={
              reduce
                ? undefined
                : purring
                  ? { x: [0, -1.2, 1.2, -1.2, 0] }
                  : { scaleY: asleep ? [1, 1.035, 1] : [1, 1.018, 1] }
            }
            transition={purring ? { duration: 0.18, repeat: Infinity } : { duration: asleep ? 3 : 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <g filter={`url(#${uid}-crayon)`}>
              {/* tail */}
              <motion.path
                d="M246,238 C286,236 300,206 286,182 C280,172 268,176 272,186 C280,204 268,222 240,222 Z"
                fill={FUR_DARK}
                style={{ originX: "246px", originY: "232px" }}
                animate={reduce || asleep ? { rotate: 0 } : { rotate: wand ? [0, 14, -6, 0] : [0, 6, 0] }}
                transition={{ duration: wand ? 0.9 : 2.8, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* body */}
              <path d="M58,244 C46,176 98,146 160,146 C222,146 274,176 262,244 C258,266 62,266 58,244 Z" fill={FUR} />
              <ellipse cx={160} cy={216} rx={54} ry={34} fill={FUR_LIGHT} />
              {paw("left")}
              {paw("right")}
            </g>

            {/* head */}
            <motion.g style={{ originX: `${HEAD.x}px`, originY: "170px", rotate: tilt }}>
              <g filter={`url(#${uid}-crayon)`}>
                <path d="M92,98 C88,62 98,44 110,42 C124,46 138,62 146,74 Z" fill={FUR} />
                <path d="M228,98 C232,62 222,44 210,42 C196,46 182,62 174,74 Z" fill={FUR} />
                <path d="M102,84 C102,64 108,56 113,55 C121,60 128,68 132,74 Z" fill={INNER_EAR} />
                <path d="M218,84 C218,64 212,56 207,55 C199,60 192,68 188,74 Z" fill={INNER_EAR} />
                <ellipse cx={HEAD.x} cy={HEAD.y} rx={84} ry={63} fill={FUR} />
                <ellipse cx={HEAD.x} cy={140} rx={40} ry={22} fill={FUR_LIGHT} />
              </g>

              {/* face */}
              <g filter={`url(#${uid}-soft)`}>
                <ellipse cx={110} cy={138} rx={15} ry={8} fill={COZY.blush} />
                <ellipse cx={210} cy={138} rx={15} ry={8} fill={COZY.blush} />

                {happyEyes || blink ? (
                  <>
                    <path d="M118,116 Q128,106 138,116" stroke={COZY.ink} strokeWidth={3.2} fill="none" strokeLinecap="round" />
                    <path d="M182,116 Q192,106 202,116" stroke={COZY.ink} strokeWidth={3.2} fill="none" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <motion.g style={{ x: eyeX, y: eyeY }}>
                      <circle cx={128} cy={113} r={7.5} fill={COZY.ink} />
                      <circle cx={130.5} cy={110.5} r={2.2} fill="#fff" />
                    </motion.g>
                    <motion.g style={{ x: eyeX, y: eyeY }}>
                      <circle cx={192} cy={113} r={7.5} fill={COZY.ink} />
                      <circle cx={194.5} cy={110.5} r={2.2} fill="#fff" />
                    </motion.g>
                  </>
                )}

                <path d="M154,127 Q160,123 166,127 Q163,134 160,135 Q157,134 154,127 Z" fill="#E7949F" />
                {eating ? (
                  <motion.ellipse
                    cx={MOUTH.x}
                    cy={MOUTH.y + 2}
                    rx={6}
                    fill="#C9737F"
                    animate={reduce ? { ry: 4 } : { ry: [5, 1.5, 5, 1.5, 4] }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />
                ) : (
                  <path d="M150,138 Q155,144 160,138 Q165,144 170,138" stroke={COZY.ink} strokeWidth={2.2} fill="none" strokeLinecap="round" />
                )}
                <g stroke={COZY.inkSoft} strokeWidth={1.6} strokeLinecap="round">
                  <path d="M104,132 L72,126" />
                  <path d="M104,140 L72,145" />
                  <path d="M216,132 L248,126" />
                  <path d="M216,140 L248,145" />
                </g>
              </g>
            </motion.g>
          </motion.g>

          {/* the wand */}
          {wand && (
            <g>
              <motion.path d={stickPath} stroke="#C49A6C" strokeWidth={5} strokeLinecap="round" />
              <motion.path d={stringPath} stroke={COZY.inkSoft} strokeWidth={1.4} fill="none" />
              <motion.g style={{ x: featherX, y: featherY }}>
                <g filter={`url(#${uid}-soft)`}>
                  <ellipse cx={0} cy={6} rx={7} ry={14} fill={COZY.pink} transform="rotate(-18)" />
                  <ellipse cx={5} cy={8} rx={6} ry={13} fill={COZY.sky} transform="rotate(22)" />
                  <circle cx={0} cy={0} r={5} fill={COZY.butter} />
                </g>
              </motion.g>
            </g>
          )}
        </svg>

        {/* tap to pet */}
        {!wand && (
          <button
            type="button"
            onClick={pet}
            aria-label="Pet Didi"
            className="absolute rounded-full"
            style={{ left: pct(70, VB_W), top: pct(48, VB_H), width: pct(180, VB_W), height: pct(210, VB_H) }}
          />
        )}

        {/* falling treat */}
        <AnimatePresence>
          {treatFalling && (
            <motion.div
              key={treatKey}
              aria-hidden
              className="pointer-events-none absolute -translate-x-1/2"
              style={{ left: pct(MOUTH.x, VB_W), top: pct(MOUTH.y - 8, VB_H) }}
              initial={reduce ? { opacity: 0 } : { y: -150, rotate: -40, opacity: 1 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.2, opacity: 0, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <Fish size={30} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* hearts */}
        <AnimatePresence>
          {hearts > 0 && !reduce && (
            <motion.div key={`h${hearts}`} className="pointer-events-none absolute inset-0" exit={{ opacity: 0 }}>
              <Heart x={92} y={60} />
              <Heart x={214} y={52} delay={0.15} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* chewing / purring / napping notes */}
        <AnimatePresence>
          {(eating || purring || asleep) && (
            <motion.span
              key={eating ? "nom" : purring ? "purr" : "zzz"}
              aria-hidden
              className="pointer-events-none absolute whitespace-nowrap"
              style={{ left: pct(232, VB_W), top: pct(30, VB_H), fontFamily: "var(--font-mansalva)", fontSize: 20, color: COZY.ink }}
              initial={{ opacity: 0, y: 6, rotate: 6 }}
              animate={asleep && !reduce ? { opacity: [0.4, 1, 0.4], y: [0, -6, 0], rotate: 6 } : { opacity: 1, y: 0, rotate: 6 }}
              exit={{ opacity: 0 }}
              transition={asleep ? { duration: 2, repeat: Infinity } : { duration: 0.2 }}
            >
              {eating ? "nom nom" : purring ? "purrr~" : "z z z"}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* controls */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-1" aria-label={`Didi's tummy: ${tummy} of ${FULL} treats`} role="img">
          {Array.from({ length: FULL }, (_, i) => (
            <Fish key={i} faded={i >= tummy} />
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={giveTreat}
            disabled={eating || asleep || treatFalling}
            className="rounded-full px-4 py-2 text-[14px] font-medium transition-transform hover:-rotate-2 active:scale-95 disabled:opacity-50"
            style={{ fontFamily: "var(--font-dm-sans)", background: COZY.butter, color: COZY.ink }}
          >
            🐟 Give a treat
          </button>
          <button
            type="button"
            onClick={() => setWand((w) => !w)}
            disabled={asleep}
            aria-pressed={wand}
            className="rounded-full px-4 py-2 text-[14px] font-medium transition-transform hover:rotate-2 active:scale-95 disabled:opacity-50"
            style={{ fontFamily: "var(--font-dm-sans)", background: wand ? COZY.pink : COZY.paper, color: COZY.ink, boxShadow: "0 2px 0 rgba(78,64,58,0.15)" }}
          >
            🪶 {wand ? "Put the wand away" : "Wand toy"}
          </button>
        </div>
        <p className="text-center text-[14px]" style={{ fontFamily: "var(--font-dm-sans)", color: COZY.ink }} aria-live="polite">
          {asleep
            ? "Didi is full. Nap time, back in a moment."
            : wand
              ? `Wiggle the feather near her. Swats so far: ${plays}`
              : "Tap Didi to pet her."}
        </p>
      </div>
    </div>
  );
}
