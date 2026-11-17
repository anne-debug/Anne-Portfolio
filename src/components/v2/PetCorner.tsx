"use client";

import { useState } from "react";

import { DidiPet, DidiStill, type DidiMode } from "./DidiPet";
import { V2 } from "./palette";

/**
 * The top of the playground: an intro to Didi and the switch for how she
 * behaves. Didi herself roams the whole page from here.
 */

const MODES: { id: DidiMode; label: string; hint: string }[] = [
  { id: "follow", label: "Follow me", hint: "She walks after your cursor, then sits, grooms and naps when you stop." },
  { id: "shy", label: "Shy", hint: "She scoots away when your cursor gets close." },
  { id: "stay", label: "Stay", hint: "She stays put. Tap her for a cuddle." },
];

export function PetCorner() {
  const [mode, setMode] = useState<DidiMode>("follow");
  const current = MODES.find((m) => m.id === mode)!;

  return (
    <section aria-labelledby="didi-title" className="flex w-full flex-col items-center gap-5 text-center">
      <DidiStill pose="sit" className="w-[96px]" />
      <h1 id="didi-title" className="text-[44px] leading-[1.05] text-deep-blue tablet:text-[60px]" style={{ fontFamily: "var(--font-mansalva)" }}>
        Didi&apos;s playground
      </h1>
      <p className="max-w-[460px] text-[16px]" style={{ fontFamily: "var(--font-dm-sans)", color: V2.ink }}>
        This is Didi, my chubby grey British Shorthair. She&apos;s loose on this page. Tap her and see what happens.
      </p>
      <div role="radiogroup" aria-label="How Didi behaves" className="flex gap-1.5 rounded-full bg-white p-1.5" style={{ boxShadow: "0 0 0 1px rgba(42,49,50,0.1)" }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={mode === m.id}
            onClick={() => setMode(m.id)}
            className="rounded-full px-4 py-2 text-[14px] font-medium transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)", background: mode === m.id ? V2.ink : "transparent", color: mode === m.id ? V2.white : V2.ink }}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-[14px]" style={{ fontFamily: "var(--font-dm-sans)", color: V2.inkSoft }}>
        {current.hint}
      </p>
      <DidiPet mode={mode} />
    </section>
  );
}
