"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

import { COZY, CozyFilters } from "./texture";

/**
 * A jar candle that can be blown out.
 *
 * Three ways to blow: tap the candle, swipe the pointer fast across the flame,
 * or turn on the microphone and actually blow. Moving the pointer gently near
 * the flame makes it lean away, so the swipe feels like wind. Blowing it out
 * bends the flame over, lets three curls of smoke and a few embers drift up,
 * and dims the warm glow behind it; tapping again relights it.
 *
 * The microphone is only opened after the visitor asks for it, is read through
 * an AnalyserNode for loudness, and is closed as soon as the candle goes out.
 */

const VB_W = 240;
const VB_H = 300;
const FLAME = { x: 120, y: 70 };

/** Loudness (RMS, 0..1) that counts as a blow, and for how many frames. */
const BLOW_RMS = 0.16;
const BLOW_FRAMES = 4;
/** Pointer speed, in px per ms, that counts as a gust when crossing the flame. */
const GUST_SPEED = 1.6;

type MicState = "off" | "asking" | "listening" | "denied";

/** `bare` drops the caption and the microphone button, leaving only the candle. */
export function Candle({ onLitChange, bare = false }: { onLitChange?: (lit: boolean) => void; bare?: boolean } = {}) {
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, "");
  const [lit, setLit] = useState(true);
  const [blowCount, setBlowCount] = useState(0);
  const [mic, setMic] = useState<MicState>("off");

  const boxRef = useRef<HTMLDivElement>(null);
  const last = useRef<{ x: number; y: number; t: number } | null>(null);
  const micStop = useRef<(() => void) | null>(null);

  // How far the flame leans, from pointer wind (-1 left .. 1 right).
  const leanRaw = useMotionValue(0);
  const lean = useSpring(leanRaw, { stiffness: 120, damping: 10 });
  const skew = useTransform(lean, (v) => v * -24);

  const blowOut = useCallback(() => {
    setLit((was) => {
      if (was) setBlowCount((n) => n + 1);
      return false;
    });
    onLitChange?.(false);
    micStop.current?.();
  }, [onLitChange]);

  const toggle = () => {
    if (lit) return blowOut();
    setLit(true);
    onLitChange?.(true);
  };

  function onPointerMove(e: React.PointerEvent) {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    const now = performance.now();
    const x = e.clientX;
    const y = e.clientY;
    const prev = last.current;
    last.current = { x, y, t: now };
    if (!prev || !lit) return;

    const dt = Math.max(1, now - prev.t);
    const vx = (x - prev.x) / dt;
    const speed = Math.hypot(x - prev.x, y - prev.y) / dt;
    const fx = box.left + (FLAME.x / VB_W) * box.width;
    const fy = box.top + (FLAME.y / VB_H) * box.height;
    const near = Math.hypot(x - fx, y - fy) < box.width * 0.35;

    if (near && speed > GUST_SPEED) {
      blowOut();
      return;
    }
    // A gentle breeze: lean away from the direction of travel, near the flame.
    leanRaw.set(near ? Math.max(-1, Math.min(1, vx * 0.9)) : 0);
  }

  async function startMic() {
    if (mic === "listening" || mic === "asking") {
      micStop.current?.();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMic("denied");
      return;
    }
    setMic("asking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      let loud = 0;
      let raf = 0;
      const tick = () => {
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += v * v;
        const rms = Math.sqrt(sum / buf.length);
        leanRaw.set(Math.min(1, rms * 4));
        loud = rms > BLOW_RMS ? loud + 1 : 0;
        if (loud >= BLOW_FRAMES) {
          blowOut();
          return;
        }
        raf = requestAnimationFrame(tick);
      };
      micStop.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
        leanRaw.set(0);
        micStop.current = null;
        setMic("off");
      };
      setMic("listening");
      raf = requestAnimationFrame(tick);
    } catch {
      setMic("denied");
    }
  }

  useEffect(() => () => micStop.current?.(), []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={boxRef}
        className="relative w-full max-w-[240px]"
        style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          last.current = null;
          leanRaw.set(0);
        }}
      >
        {/* warm glow behind the candle */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[23%] aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255, 196, 120, 0.55) 0%, rgba(255, 196, 120, 0.18) 35%, rgba(255, 196, 120, 0) 65%)" }}
          animate={lit ? (reduce ? { opacity: 1 } : { opacity: [0.85, 1, 0.9, 1], scale: [1, 1.03, 0.99, 1] }) : { opacity: 0, scale: 0.8 }}
          transition={lit && !reduce ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.8 }}
        />

        <button
          type="button"
          onClick={toggle}
          aria-label={lit ? "Blow out the candle" : "Light the candle again"}
          className="absolute inset-0 cursor-pointer rounded-[24px]"
        >
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="h-full w-full overflow-visible" aria-hidden>
            <CozyFilters id={uid} />
            <defs>
              <radialGradient id={`${uid}-flame`} cx="50%" cy="70%" r="60%">
                <stop offset="0%" stopColor="#FFF3C4" />
                <stop offset="45%" stopColor="#FFC65C" />
                <stop offset="100%" stopColor="#F07A3E" />
              </radialGradient>
            </defs>

            <g filter={`url(#${uid}-crayon)`}>
              {/* jar */}
              <path d="M34,112 C34,100 206,100 206,112 L210,262 C210,284 30,284 30,262 Z" fill={COZY.navy} />
              {/* glass rim and wax */}
              <ellipse cx={120} cy={110} rx={88} ry={17} fill="#FFFFFF" />
                            {/* label */}
              <rect x={62} y={170} width={116} height={60} rx={4} fill="#FFFFFF" />
              {/* stars */}
              {[
                [56, 140], [96, 142], [146, 138], [186, 146], [50, 246], [92, 254], [150, 256], [190, 238], [188, 196], [48, 196],
              ].map(([x, y], i) => (
                <path
                  key={i}
                  d={`M${x},${y - 7} L${x + 2},${y - 2} L${x + 7},${y} L${x + 2},${y + 2} L${x},${y + 7} L${x - 2},${y + 2} L${x - 7},${y} L${x - 2},${y - 2} Z`}
                  fill="#FFFFFF"
                  opacity={0.9}
                />
              ))}
            </g>
            <text x={120} y={196} textAnchor="middle" fontSize={19} fill={COZY.navy} style={{ fontFamily: "var(--font-mansalva)" }}>
              make a
            </text>
            <text x={120} y={219} textAnchor="middle" fontSize={22} fill={COZY.navy} style={{ fontFamily: "var(--font-mansalva)" }}>
              wish ✦
            </text>

            {/* wick */}
            <path d="M120,104 C119,96 121,92 120,86" stroke={COZY.ink} strokeWidth={3} strokeLinecap="round" fill="none" />

            {/* flame */}
            <AnimatePresence>
              {lit && (
                <motion.g
                  key="flame"
                  style={{ originX: "120px", originY: "88px", skewX: skew }}
                  initial={reduce ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { scaleY: 0.2, scaleX: 0.4, x: 18, opacity: 0, skewX: -40, transition: { duration: 0.3, ease: "easeIn" } }}
                  transition={{ type: "spring", stiffness: 300, damping: 12 }}
                >
                  <motion.g
                    style={{ originX: "120px", originY: "88px" }}
                    animate={reduce ? undefined : { scaleY: [1, 1.08, 0.95, 1.05, 1], scaleX: [1, 0.96, 1.03, 0.98, 1], rotate: [0, -2, 1.5, -1, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path d="M120,34 C132,52 140,64 138,76 C136,88 128,92 120,92 C112,92 104,88 102,76 C100,64 108,52 120,34 Z" fill={`url(#${uid}-flame)`} filter={`url(#${uid}-soft)`} />
                    <path d="M120,60 C126,68 128,74 127,80 C126,86 123,88 120,88 C117,88 114,86 113,80 C112,74 114,68 120,60 Z" fill="#FFF6D6" opacity={0.85} />
                  </motion.g>
                </motion.g>
              )}
            </AnimatePresence>

            {/* smoke and embers after blowing out */}
            <AnimatePresence>
              {!lit && !reduce && (
                <motion.g key={`smoke-${blowCount}`} exit={{ opacity: 0 }}>
                  {[
                    "M120,86 C110,70 132,60 120,44 C108,28 130,18 122,0",
                    "M120,86 C130,72 112,62 124,48 C134,36 116,26 128,10",
                    "M120,86 C116,74 126,68 118,56 C110,46 122,36 114,24",
                  ].map((d, i) => (
                    <motion.path
                      key={i}
                      d={d}
                      fill="none"
                      stroke="rgba(120, 112, 110, 0.55)"
                      strokeWidth={4 - i}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0.9, y: 0 }}
                      animate={{ pathLength: 1, opacity: 0, y: -26 }}
                      transition={{ duration: 2.2 + i * 0.4, delay: 0.1 + i * 0.15, ease: "easeOut" }}
                    />
                  ))}
                  {[-14, 6, 16, -4].map((dx, i) => (
                    <motion.circle
                      key={`e${i}`}
                      cx={120}
                      cy={84}
                      r={2.2}
                      fill="#FFB25C"
                      initial={{ opacity: 1, x: 0, y: 0 }}
                      animate={{ opacity: 0, x: dx, y: -40 - i * 10 }}
                      transition={{ duration: 1.2 + i * 0.2, ease: "easeOut" }}
                    />
                  ))}
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </button>

        <AnimatePresence>
          {!lit && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -right-[18%] top-[2%] whitespace-nowrap"
              style={{ fontFamily: "var(--font-mansalva)", fontSize: 20, color: COZY.ink }}
              initial={{ opacity: 0, y: 8, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: -6 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              wish made ✦
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {!bare && (
      <>
      <p className="max-w-[260px] text-center text-[14px] leading-[1.4]" style={{ fontFamily: "var(--font-dm-sans)", color: COZY.ink }} aria-live="polite">
        {lit ? "Tap the candle or swipe fast across the flame to blow it out." : "Tap the candle to light it again."}
      </p>
      <button
          type="button"
          onClick={startMic}
          disabled={!lit}
          className="rounded-full px-4 py-1.5 text-[13px] transition-transform active:scale-95"
          style={{ visibility: lit ? "visible" : "hidden", fontFamily: "var(--font-dm-sans)", background: mic === "listening" ? COZY.peach : COZY.paper, color: COZY.ink, boxShadow: "0 2px 0 rgba(78,64,58,0.15)" }}
        >
          {mic === "listening"
            ? "Listening… blow now! (tap to stop)"
            : mic === "asking"
              ? "Waiting for the mic…"
              : mic === "denied"
                ? "Mic not available, tap the candle instead"
                : "🎤 Or blow into your mic"}
        </button>
      </>
      )}
    </div>
  );
}
