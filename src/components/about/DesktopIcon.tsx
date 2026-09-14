"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useRef, type CSSProperties, type RefObject } from "react";

/**
 * Framer component "IconText": a desktop shortcut. A thumbnail sits in a
 * bordered card with the label underneath, and selecting it tints the card,
 * which is Framer's second Desktop variant. Framer halves the thumbnail and
 * drops the label to 12px on its Phone frame.
 *
 * Framer positions each shortcut by the left edge of the group, which is as
 * wide as its widest child, so the card is centred over the label. Both sets of
 * anchors arrive as custom properties on `anchors`; `.about-shortcut` in
 * globals.css picks the right set per breakpoint and sizes the card from
 * --thumb, --pad, --gap and --label so it scales with the desktop.
 *
 * The shortcut can also be dragged anywhere on the desktop. Dragging is a
 * transform on an inner element, so it never fights the positioning classes on
 * the wrapper, and a drag is not allowed to fire the click that opens a folder.
 */
export function DesktopIcon({
  image,
  label,
  selected,
  onOpen,
  anchors,
  bounds,
  zIndex,
  onPickUp,
}: {
  image: string;
  label: string;
  selected: boolean;
  onOpen: () => void;
  /** Both anchor sets, as the custom properties `.about-shortcut` reads. */
  anchors: CSSProperties;
  /** The desktop area a shortcut may be dragged around in. */
  bounds: RefObject<HTMLDivElement | null>;
  /** Raised while dragging so the shortcut passes over its neighbours. */
  zIndex: number;
  onPickUp: () => void;
}) {
  // A drag ends with a click event on the button, which must not open a folder.
  const dragged = useRef(false);

  return (
    <div className="about-shortcut" style={{ ...anchors, zIndex }}>
      <motion.div
        drag
        dragConstraints={bounds}
        dragMomentum={false}
        dragElastic={0.05}
        onDragStart={() => {
          dragged.current = true;
          onPickUp();
        }}
        whileDrag={{ scale: 1.06, cursor: "grabbing" }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
        className="cursor-grab touch-none active:cursor-grabbing"
      >
        <button
          type="button"
          aria-label={`Open ${label}`}
          onClick={() => {
            if (dragged.current) {
              dragged.current = false;
              return;
            }
            onOpen();
          }}
          className="flex w-auto flex-col items-center text-center"
          style={{ gap: "var(--gap)" }}
        >
          <span
            className={`flex flex-col items-center justify-center rounded-lg transition-colors ${
              selected
                ? "border-2 border-white/70 bg-white/25"
                : "border-2 border-white/30 bg-white/10"
            }`}
            style={{ padding: "var(--pad)" }}
          >
            <span
              className="relative block overflow-hidden rounded-lg border border-white/40"
              style={{ width: "var(--thumb)", height: "var(--thumb)" }}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="(width < 810px) 80px, 80px"
                className="object-cover"
                draggable={false}
              />
            </span>
          </span>
          <span
            className={`rounded px-1 text-off-white ${selected ? "bg-white/25" : ""}`}
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 400,
              fontSize: "var(--label)",
              letterSpacing: "-0.04em",
              lineHeight: "1.4em",
              textShadow: "0 1px 3px rgba(0,0,0,0.45)",
            }}
          >
            {label}
          </span>
        </button>
      </motion.div>
    </div>
  );
}
