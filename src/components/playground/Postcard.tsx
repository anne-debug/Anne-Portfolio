"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { COZY, PAPER_GRAIN } from "@/components/cozy/texture";
import { Stamp, STAMPS } from "./stamps";

/**
 * Postcard playground: doodle on the front, flip it, write a note, pick a
 * stamp, and send it.
 *
 * "Send" in this first version stays on the visitor's device. The card gets a
 * postmark, flies off, and comes back as one PNG (front above back) that they
 * can download or hand to the system share sheet, plus a button to copy the
 * note. Nothing is uploaded and no email goes out.
 *
 * The front is a 1200x800 canvas drawn with a crayon brush: each stroke is laid
 * down as many small, slightly transparent, jittered dots, which gives the
 * waxy texture. The back is ordinary HTML so typing feels normal; for export it
 * is redrawn onto a canvas with the same layout.
 */

const CW = 1200;
const CH = 800;
const PAPER = "#FFF8EC";
const COLORS = ["#4E403A", "#E9687B", "#F4A97F", "#F5D27A", "#A8C49A", "#7FB7E0", "#C6B5E8"];
const SIZES = [6, 14, 28];
const STICKERS = ["heart", "star", "flower", "cloud", "sparkle"] as const;
type Sticker = (typeof STICKERS)[number];
type Tool = "crayon" | "eraser" | Sticker;

function rngSeed(seed: number) {
  let a = seed;
  return () => {
    a = (a * 1664525 + 1013904223) % 4294967296;
    return a / 4294967296;
  };
}

function paintPaper(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, CW, CH);
  const r = rngSeed(7);
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(120, 95, 70, ${0.03 + r() * 0.05})`;
    ctx.fillRect(r() * CW, r() * CH, 1.5 + r() * 2, 1.5 + r() * 2);
  }
}

function drawSticker(ctx: CanvasRenderingContext2D, kind: Sticker, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((Math.random() - 0.5) * 0.6);
  ctx.scale(size / 100, size / 100);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const p = new Path2D();
  if (kind === "heart") {
    p.moveTo(0, 38);
    p.bezierCurveTo(-60, 0, -40, -50, 0, -18);
    p.bezierCurveTo(40, -50, 60, 0, 0, 38);
    ctx.fill(p);
  } else if (kind === "star") {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 ? 20 : 46;
      if (i === 0) p.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      else p.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    p.closePath();
    ctx.lineWidth = 10;
    ctx.fill(p);
    ctx.stroke(p);
  } else if (kind === "flower") {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 24, Math.sin(a) * 24, 20, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#F5D27A";
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "cloud") {
    ctx.fillStyle = color === COLORS[0] ? "#9CC8E6" : color;
    for (const [cx, cy, r] of [
      [-28, 6, 22],
      [0, -10, 28],
      [28, 6, 22],
      [0, 14, 22],
    ]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.lineWidth = 9;
    for (const [a, b] of [
      [0, -44],
      [0, 44],
      [-44, 0],
      [44, 0],
    ]) {
      ctx.beginPath();
      ctx.moveTo(a * 0.25, b * 0.25);
      ctx.lineTo(a, b);
      ctx.stroke();
    }
    ctx.lineWidth = 6;
    for (const [a, b] of [
      [-24, -24],
      [24, 24],
      [-24, 24],
      [24, -24],
    ]) {
      ctx.beginPath();
      ctx.moveTo(a * 0.3, b * 0.3);
      ctx.lineTo(a, b);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function StickerIcon({ kind }: { kind: Sticker }) {
  const c = COZY.ink;
  return (
    <svg viewBox="-50 -50 100 100" width={22} height={22} aria-hidden>
      {kind === "heart" && <path d="M0,38 C-60,0 -40,-50 0,-18 C40,-50 60,0 0,38 Z" fill={COZY.pinkDeep} />}
      {kind === "star" && <path d="M0,-46 L12,-16 L44,-14 L19,6 L27,38 L0,20 L-27,38 L-19,6 L-44,-14 L-12,-16 Z" fill={COZY.butter} stroke={COZY.butter} strokeWidth={8} strokeLinejoin="round" />}
      {kind === "flower" && (
        <g fill={COZY.lilac}>
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={Math.round(Math.cos((i / 5) * Math.PI * 2) * 240) / 10} cy={Math.round(Math.sin((i / 5) * Math.PI * 2) * 240) / 10} r={20} />
          ))}
          <circle r={15} fill={COZY.butter} />
        </g>
      )}
      {kind === "cloud" && (
        <g fill={COZY.sky}>
          <circle cx={-28} cy={6} r={22} />
          <circle cx={0} cy={-10} r={28} />
          <circle cx={28} cy={6} r={22} />
          <circle cx={0} cy={14} r={22} />
        </g>
      )}
      {kind === "sparkle" && <path d="M0,-44 L0,44 M-44,0 L44,0 M-24,-24 L24,24 M-24,24 L24,-24" stroke={c} strokeWidth={9} strokeLinecap="round" />}
    </svg>
  );
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        out.push(line);
        line = word;
      } else line = test;
    }
    out.push(line);
  }
  return out;
}

function cssFont(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v =
    getComputedStyle(document.documentElement).getPropertyValue(varName).trim() ||
    getComputedStyle(document.body).getPropertyValue(varName).trim();
  return v || fallback;
}

function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const xml = new XMLSerializer().serializeToString(svg);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function drawPostmark(ctx: CanvasRenderingContext2D, x: number, y: number, date: string, family: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.2);
  ctx.strokeStyle = "rgba(52, 64, 94, 0.75)";
  ctx.fillStyle = "rgba(52, 64, 94, 0.75)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.font = `26px ${family}`;
  ctx.fillText("sent with love", 0, -6);
  ctx.font = `20px ui-monospace, Menlo, monospace`;
  ctx.fillText(date, 0, 26);
  ctx.lineWidth = 4;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    for (let k = 0; k <= 40; k++) {
      const px = 80 + k * 4;
      const py = -30 + i * 20 + Math.sin(k / 3) * 6;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

export function Postcard() {
  const reduce = useReducedMotion() ?? false;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stampRef = useRef<SVGSVGElement>(null);
  const drawing = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<ImageData[]>([]);

  const [side, setSide] = useState<"front" | "back">("front");
  const [tool, setTool] = useState<Tool>("crayon");
  const [color, setColor] = useState(COLORS[1]);
  const [size, setSize] = useState(SIZES[1]);
  const [blank, setBlank] = useState(true);
  const [message, setMessage] = useState("");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [stampIdx, setStampIdx] = useState(0);
  const [stage, setStage] = useState<"edit" | "sending" | "sent">("edit");
  const [result, setResult] = useState<{ url: string; blob: Blob } | null>(null);
  const [copied, setCopied] = useState(false);

  // Stamped on the postmark; set when the card is sent, never during render.
  const [today, setToday] = useState("");

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) paintPaper(ctx);
  }, []);

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url);
  }, [result]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * CW, y: ((e.clientY - r.top) / r.height) * CH };
  };

  const snapshot = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    history.current.push(ctx.getImageData(0, 0, CW, CH));
    if (history.current.length > 20) history.current.shift();
  };

  const stroke = useCallback(
    (a: { x: number; y: number }, b: { x: number; y: number }) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      if (tool === "eraser") {
        ctx.strokeStyle = PAPER;
        ctx.lineWidth = size * 2.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        return;
      }
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const steps = Math.max(1, Math.ceil(dist / 1.5));
      ctx.fillStyle = color;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        const n = Math.ceil(size / 2.2);
        for (let k = 0; k < n; k++) {
          const ang = Math.random() * Math.PI * 2;
          const rad = Math.random() * size * 0.5;
          ctx.globalAlpha = 0.18 + Math.random() * 0.35;
          ctx.fillRect(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad, 1.6 + Math.random() * 1.6, 1.6 + Math.random() * 1.6);
        }
      }
      ctx.globalAlpha = 1;
    },
    [tool, color, size],
  );

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (stage !== "edit") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    snapshot();
    const p = point(e);
    setBlank(false);
    if (tool !== "crayon" && tool !== "eraser") {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) drawSticker(ctx, tool, p.x, p.y, 70 + size * 2.5, color);
      return;
    }
    drawing.current = p;
    stroke(p, p);
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const p = point(e);
    stroke(drawing.current, p);
    drawing.current = p;
  }

  function onUp() {
    drawing.current = null;
  }

  function undo() {
    const ctx = canvasRef.current?.getContext("2d");
    const prev = history.current.pop();
    if (ctx && prev) ctx.putImageData(prev, 0, 0);
  }

  function clearFront() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    snapshot();
    paintPaper(ctx);
    setBlank(true);
  }

  async function buildImage(date: string): Promise<Blob | null> {
    const front = canvasRef.current;
    const stamp = stampRef.current;
    if (!front || !stamp) return null;
    const hand = cssFont("--font-mansalva", "cursive");
    await document.fonts.load(`32px ${hand}`).catch(() => undefined);

    const out = document.createElement("canvas");
    out.width = CW;
    out.height = CH * 2 + 40;
    const ctx = out.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#F1E6D6";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(front, 0, 0);

    // back
    const y0 = CH + 40;
    ctx.save();
    ctx.translate(0, y0);
    paintPaper(ctx);
    ctx.strokeStyle = "rgba(78,64,58,0.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CW * 0.58, 70);
    ctx.lineTo(CW * 0.58, CH - 70);
    ctx.stroke();

    ctx.fillStyle = COZY.ink;
    ctx.font = `42px ${hand}`;
    const lines = wrapLines(ctx, message || " ", CW * 0.58 - 140);
    lines.slice(0, 11).forEach((l, i) => ctx.fillText(l, 70, 130 + i * 56));

    const img = await svgToImage(stamp);
    ctx.save();
    ctx.shadowColor = "rgba(78,64,58,0.25)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.drawImage(img, CW - 230, 60, 160, 200);
    ctx.restore();
    drawPostmark(ctx, CW - 260, 230, date, hand);

    ctx.font = `36px ${hand}`;
    ctx.fillStyle = COZY.ink;
    ctx.fillText(`To: ${to}`, CW * 0.62, CH * 0.58);
    ctx.fillText(`From: ${from}`, CW * 0.62, CH * 0.58 + 110);
    ctx.strokeStyle = "rgba(78,64,58,0.35)";
    ctx.lineWidth = 2;
    for (const yy of [CH * 0.58 + 18, CH * 0.58 + 128]) {
      ctx.beginPath();
      ctx.moveTo(CW * 0.62, yy);
      ctx.lineTo(CW - 70, yy);
      ctx.stroke();
    }
    ctx.restore();

    return new Promise((resolve) => out.toBlob((b) => resolve(b), "image/png"));
  }

  async function send() {
    if (stage !== "edit") return;
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
    setToday(date);
    setSide("back");
    setStage("sending");
    const blob = await buildImage(date);
    await new Promise((r) => setTimeout(r, reduce ? 0 : 1900));
    if (blob) setResult({ blob, url: URL.createObjectURL(blob) });
    setStage("sent");
  }

  async function share() {
    if (!result) return;
    const file = new File([result.blob], "postcard.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "A postcard for you", text: message }).catch(() => undefined);
    } else {
      const a = document.createElement("a");
      a.href = result.url;
      a.download = "postcard.png";
      a.click();
    }
  }

  async function copyNote() {
    await navigator.clipboard?.writeText(`${to ? `To ${to},\n\n` : ""}${message}${from ? `\n\n${from}` : ""}`).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function again() {
    setStage("edit");
    setSide("front");
    setResult(null);
    setMessage("");
    setTo("");
    setFrom("");
    clearFront();
    history.current = [];
  }

  const chip = (active: boolean) => ({
    background: active ? COZY.ink : COZY.paper,
    color: active ? COZY.paper : COZY.ink,
    boxShadow: "0 2px 0 rgba(78,64,58,0.15)",
  });

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* steps */}
      <ol className="flex gap-2 text-[13px] text-dark-charcoal" style={{ fontFamily: "var(--font-dm-sans)" }}>
        {["1 · Doodle", "2 · Write & stamp", "3 · Send"].map((s, i) => {
          const on = (i === 0 && side === "front" && stage === "edit") || (i === 1 && side === "back" && stage === "edit") || (i === 2 && stage !== "edit");
          return (
            <li key={s} className={`rounded-full px-3 py-1 ${on ? "v2-paper" : ""}`} style={{ background: on ? COZY.butter : "transparent" }}>
              {s}
            </li>
          );
        })}
      </ol>

      {/* the card */}
      <div className="relative w-full max-w-[720px]" style={{ perspective: 1600 }}>
        <motion.div
          className="relative w-full"
          style={{ aspectRatio: "3 / 2", transformStyle: "preserve-3d" }}
          animate={
            stage === "sent" && !reduce
              ? { rotateY: 180, x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }
              : stage === "sending" && !reduce
                ? { rotateY: 180, x: [0, 0, 600], y: [0, 0, -260], scale: [1, 1, 0.3], rotate: [0, 0, 18], opacity: [1, 1, 0] }
                : { rotateY: side === "back" ? 180 : 0 }
          }
          transition={stage === "sending" ? { duration: 1.9, times: [0, 0.6, 1], ease: "easeIn" } : { type: "spring", stiffness: 120, damping: 18 }}
        >
          {/* FRONT */}
          <div className="absolute inset-0 overflow-hidden rounded-[10px]" style={{ backfaceVisibility: "hidden", boxShadow: "0 18px 40px rgba(120,90,60,0.18)" }}>
            <canvas
              ref={canvasRef}
              width={CW}
              height={CH}
              className="h-full w-full touch-none"
              style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              aria-label="Postcard front. Draw here."
            />
            {blank && (
              <span
                className="pointer-events-none absolute inset-0 grid place-items-center"
                style={{ fontFamily: "var(--font-mansalva)", fontSize: "clamp(20px, 4vw, 34px)", color: "rgba(78,64,58,0.35)" }}
              >
                doodle something for them ✎
              </span>
            )}
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 grid grid-cols-[58%_42%] overflow-hidden rounded-[10px]"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: `${PAPER_GRAIN}, ${PAPER}`, boxShadow: "0 18px 40px rgba(120,90,60,0.18)" }}
          >
            <div className="border-r-[1.5px] p-[5%]" style={{ borderColor: "rgba(78,64,58,0.3)" }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={360}
                disabled={stage !== "edit"}
                placeholder="Dear you, I miss…"
                aria-label="Your message"
                className="h-full w-full resize-none bg-transparent outline-none placeholder:opacity-40"
                style={{
                  fontFamily: "var(--font-mansalva)",
                  fontSize: "clamp(14px, 2.6vw, 22px)",
                  lineHeight: "1.65em",
                  color: COZY.ink,
                  backgroundImage: "repeating-linear-gradient(transparent, transparent calc(1.65em - 1px), rgba(78,64,58,0.18) calc(1.65em - 1px), rgba(78,64,58,0.18) 1.65em)",
                }}
              />
            </div>
            <div className="relative flex flex-col justify-between p-[5%]">
              <div className="relative self-end">
                <Stamp ref={stampRef} stamp={STAMPS[stampIdx]} width={88} className="w-[clamp(52px,11vw,88px)] h-auto" />
                <AnimatePresence>
                  {stage !== "edit" && (
                    <motion.svg
                      viewBox="-90 -90 260 180"
                      className="pointer-events-none absolute -left-[60%] top-[20%] w-[180%]"
                      initial={reduce ? { opacity: 1 } : { scale: 2.2, opacity: 0, rotate: -12 }}
                      animate={{ scale: 1, opacity: 1, rotate: -12 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.25 }}
                      aria-hidden
                    >
                      <circle r={60} fill="none" stroke="rgba(52,64,94,0.75)" strokeWidth={4} />
                      <text y={-2} textAnchor="middle" fontSize={22} fill="rgba(52,64,94,0.8)" style={{ fontFamily: "var(--font-mansalva)" }}>
                        sent with love
                      </text>
                      <text y={24} textAnchor="middle" fontSize={14} fill="rgba(52,64,94,0.8)" fontFamily="ui-monospace, Menlo, monospace">
                        {today}
                      </text>
                      {[0, 1, 2, 3].map((i) => (
                        <path key={i} d={`M68,${-28 + i * 18} q10,-6 20,0 t20,0 t20,0 t20,0`} fill="none" stroke="rgba(52,64,94,0.7)" strokeWidth={4} />
                      ))}
                    </motion.svg>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex flex-col gap-[8%]" style={{ fontFamily: "var(--font-mansalva)", color: COZY.ink, fontSize: "clamp(13px, 2.2vw, 19px)" }}>
                {[
                  ["To:", to, setTo, "someone I miss"],
                  ["From:", from, setFrom, "me"],
                ].map(([label, val, set, ph]) => (
                  <label key={label as string} className="flex items-baseline gap-2 border-b-[1.5px]" style={{ borderColor: "rgba(78,64,58,0.3)" }}>
                    <span>{label as string}</span>
                    <input
                      value={val as string}
                      onChange={(e) => (set as (v: string) => void)(e.target.value)}
                      maxLength={40}
                      disabled={stage !== "edit"}
                      placeholder={ph as string}
                      className="w-full min-w-0 bg-transparent outline-none placeholder:opacity-40"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* controls */}
      {stage === "edit" && side === "front" && (
        <div className="flex w-full max-w-[720px] flex-col items-center gap-3" style={{ fontFamily: "var(--font-dm-sans)", color: COZY.ink }}>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColor(c);
                  if (tool === "eraser") setTool("crayon");
                }}
                aria-label={`Crayon colour ${c}`}
                aria-pressed={color === c}
                className="size-8 rounded-full transition-transform hover:scale-110"
                style={{ background: c, outline: color === c ? `3px solid ${COZY.ink}` : "none", outlineOffset: 2 }}
              />
            ))}
            <span className="mx-1 h-6 w-px" style={{ background: COZY.inkSoft }} aria-hidden />
            {SIZES.map((s, i) => (
              <button key={s} type="button" onClick={() => setSize(s)} aria-label={["Thin", "Medium", "Thick"][i]} aria-pressed={size === s} className="grid size-8 place-items-center rounded-full" style={chip(size === s)}>
                <span className="rounded-full" style={{ width: 4 + i * 5, height: 4 + i * 5, background: size === s ? COZY.paper : COZY.ink }} />
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[14px]">
            <button type="button" onClick={() => setTool("crayon")} aria-pressed={tool === "crayon"} className="rounded-full px-3 py-1.5" style={chip(tool === "crayon")}>
              ✎ Crayon
            </button>
            {STICKERS.map((s) => (
              <button key={s} type="button" onClick={() => setTool(s)} aria-pressed={tool === s} aria-label={`${s} sticker`} className="grid size-9 place-items-center rounded-full" style={chip(tool === s)}>
                <StickerIcon kind={s} />
              </button>
            ))}
            <button type="button" onClick={() => setTool("eraser")} aria-pressed={tool === "eraser"} className="rounded-full px-3 py-1.5" style={chip(tool === "eraser")}>
              Eraser
            </button>
            <button type="button" onClick={undo} className="rounded-full px-3 py-1.5" style={chip(false)}>
              ↶ Undo
            </button>
            <button type="button" onClick={clearFront} className="rounded-full px-3 py-1.5" style={chip(false)}>
              Clear
            </button>
          </div>
          <button type="button" onClick={() => setSide("back")} className="mt-1 rounded-full px-5 py-2 text-[15px] font-medium transition-transform hover:-rotate-1 active:scale-95" style={{ background: COZY.butter, color: COZY.ink }}>
            Flip it over and write →
          </button>
        </div>
      )}

      {stage === "edit" && side === "back" && (
        <div className="flex w-full max-w-[720px] flex-col items-center gap-3" style={{ fontFamily: "var(--font-dm-sans)", color: COZY.ink }}>
          <span className="text-[14px]">Pick a stamp</span>
          <div className="flex flex-wrap justify-center gap-3">
            {STAMPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStampIdx(i)}
                aria-label={s.name}
                aria-pressed={stampIdx === i}
                className="transition-transform hover:-translate-y-1 hover:rotate-2"
                style={{ filter: stampIdx === i ? "drop-shadow(0 4px 0 rgba(78,64,58,0.35))" : "none", transform: stampIdx === i ? "translateY(-4px)" : undefined }}
              >
                <Stamp stamp={s} width={56} />
              </button>
            ))}
          </div>
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setSide("front")} className="rounded-full px-4 py-2 text-[15px]" style={chip(false)}>
              ← Back to the doodle
            </button>
            <button
              type="button"
              onClick={send}
              disabled={!message.trim()}
              className="rounded-full px-5 py-2 text-[15px] font-medium transition-transform hover:-rotate-1 active:scale-95 disabled:opacity-50"
              style={{ background: COZY.pink, color: COZY.ink }}
            >
              Seal & send ✉
            </button>
          </div>
          {!message.trim() && <span className="text-[13px] opacity-70">Write a little note first.</span>}
        </div>
      )}

      {stage === "sent" && result && (
        <motion.div
          className="flex w-full max-w-[720px] flex-col items-center gap-3 text-center"
          style={{ fontFamily: "var(--font-dm-sans)", color: COZY.ink }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span style={{ fontFamily: "var(--font-mansalva)", fontSize: 26 }}>Your postcard is ready to send ✦</span>
          <span className="text-[14px] opacity-80">Save it or share it straight to them. It never leaves your device unless you share it.</span>
          <div className="flex flex-wrap justify-center gap-2">
            <a href={result.url} download="postcard.png" className="rounded-full px-5 py-2 text-[15px] font-medium" style={{ background: COZY.butter, color: COZY.ink }}>
              ↓ Download postcard
            </a>
            <button type="button" onClick={share} className="rounded-full px-5 py-2 text-[15px] font-medium" style={{ background: COZY.pink, color: COZY.ink }}>
              Share…
            </button>
            <button type="button" onClick={copyNote} className="rounded-full px-5 py-2 text-[15px]" style={chip(false)}>
              {copied ? "Copied!" : "Copy the note"}
            </button>
            <button type="button" onClick={again} className="rounded-full px-5 py-2 text-[15px]" style={chip(false)}>
              Make another
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
