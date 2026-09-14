"use client";

/**
 * Runtime equivalents of the effects Framer attaches to canvas nodes.
 *
 * Framer serialises each effect as an attribute on the node, e.g.
 *
 *   appearEffect:   { threshold, trigger, enter: { opacity, x, y, scale, rotate, transition } }
 *   parallaxEffect: { speed }
 *   dragEffect:     { freeform, snapBack, momentum, transition }
 *   textEffect:     { trigger, tokenization, delay, style: { ..., transition } }
 *
 * The components below take those shapes more or less verbatim so a node can be
 * translated without reshaping its data.
 */

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type TargetAndTransition,
  type Transition,
} from "motion/react";
import { useRef, type CSSProperties, type ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/* Transition parsing                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Framer writes transitions as a single string. The forms that appear in this
 * project are:
 *
 *   "spring-duration <duration>s <bounce> <delay>s"
 *   "spring-physics <stiffness> <damping> <mass> <delay>s"
 *   "tween <easing> <duration>s <delay>s"
 *   "inertia <power> <timeConstant>"
 *
 * The two spring spellings are easy to confuse: the numbers in a physics spring
 * are stiffness and damping, not seconds, so reading one as the other yields a
 * transition hundreds of seconds long. Anything unrecognised falls back to a
 * short ease rather than a number lifted from the wrong slot.
 */
export function parseTransition(input?: string): Transition {
  if (!input) return { duration: 0.4, ease: "easeOut" };

  const parts = input.trim().split(/\s+/);
  const kind = parts[0];
  const num = (i: number, fallback: number) => {
    const raw = parts[i];
    if (raw === undefined) return fallback;
    const n = Number.parseFloat(raw);
    return Number.isNaN(n) ? fallback : n;
  };

  if (kind === "spring-duration" || kind === "spring") {
    return {
      type: "spring",
      duration: num(1, 0.6),
      bounce: num(2, 0),
      delay: num(3, 0),
    };
  }

  if (kind === "spring-physics") {
    return {
      type: "spring",
      stiffness: num(1, 400),
      damping: num(2, 30),
      mass: num(3, 1),
      delay: num(4, 0),
    };
  }

  if (kind === "inertia") {
    return {
      type: "inertia",
      power: num(1, 0.8),
      timeConstant: num(2, 700),
    };
  }

  if (kind === "tween") {
    // "tween <easing> <duration>s <delay>s"; the easing token is a bezier list.
    return { duration: num(2, 0.4), delay: num(3, 0), ease: "easeOut" };
  }

  return { duration: 0.4, ease: "easeOut" };
}

/**
 * The delay Framer packs into a transition string. Its slot differs by format,
 * so the kind has to be read first rather than assuming position three.
 */
export function transitionDelay(input?: string): number {
  if (!input) return 0;
  const parts = input.trim().split(/\s+/);
  const slot = parts[0] === "spring-physics" ? 4 : 3;
  const n = Number.parseFloat(parts[slot] ?? "");
  return Number.isNaN(n) ? 0 : n;
}

/* -------------------------------------------------------------------------- */
/* Appear                                                                      */
/* -------------------------------------------------------------------------- */

export interface EnterState {
  opacity?: number;
  x?: number | string;
  y?: number | string;
  scale?: number;
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  skewX?: number;
  skewY?: number;
  blur?: string;
  transition?: string;
}

export interface AppearEffectProps {
  /** The state the element animates *from*. Mirrors Framer's `enter` object. */
  enter?: EnterState;
  /** "onMount" plays immediately; anything else waits until scrolled into view. */
  trigger?: string;
  /** Fraction of the element that must be visible for the in-view trigger. */
  threshold?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Framer's Appear effect. The node is rendered in `enter` state and animates to
 * its resting state, either on mount or the first time it scrolls into view.
 */
export function AppearEffect({
  enter,
  trigger = "onMount",
  threshold = 0.5,
  className,
  style,
  children,
}: AppearEffectProps) {
  const reduceMotion = useReducedMotion();

  if (!enter || reduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const { transition, blur, ...rest } = enter;
  const from = { ...rest } as TargetAndTransition;
  if (blur) from.filter = `blur(${blur})`;

  const to: Record<string, unknown> = {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    skewX: 0,
    skewY: 0,
  };
  if (blur) to.filter = "blur(0px)";

  // Only animate the properties the effect actually sets, so we do not stomp on
  // transforms the layer already carries.
  const animatedKeys = Object.keys(from);
  const target = Object.fromEntries(
    animatedKeys.map((k) => [k, to[k] ?? 0]),
  ) as unknown as TargetAndTransition;

  const common = {
    initial: from,
    transition: parseTransition(transition),
    className,
    style,
  };

  return trigger === "onMount" ? (
    <motion.div {...common} animate={target}>
      {children}
    </motion.div>
  ) : (
    <motion.div
      {...common}
      whileInView={target}
      viewport={{ once: true, amount: threshold }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Parallax                                                                    */
/* -------------------------------------------------------------------------- */

export interface ParallaxProps {
  /**
   * Framer's parallax speed, where 100 tracks the page exactly. Below 100 the
   * layer lags behind the scroll, above 100 it runs ahead.
   */
  speed?: number;
  /** How far, in pixels, a speed of 0 would displace the layer over one screen. */
  distance?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Parallax({
  speed = 100,
  distance = 300,
  className,
  style,
  children,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const factor = (speed - 100) / 100;
  const shift = useTransform(
    scrollYProgress,
    [0, 1],
    [distance * factor, -distance * factor],
  );
  const y = useSpring(shift, { stiffness: 120, damping: 30, mass: 0.4 });

  if (reduceMotion) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={className} style={{ ...style, y }}>
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Drag                                                                        */
/* -------------------------------------------------------------------------- */

export interface DragFloatProps {
  /** Framer's freeform drag: the layer moves on both axes. */
  freeform?: boolean;
  /** Whether the layer springs back to its origin on release. */
  snapBack?: boolean;
  momentum?: boolean;
  /** Framer's inertia string, e.g. "inertia 866 100". */
  transition?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Makes a layer draggable the way Framer's Drag effect does. The decorative
 * hero images use this with snapBack enabled, so they return home on release.
 */
export function DragFloat({
  freeform = true,
  snapBack = true,
  momentum = false,
  transition,
  className,
  style,
  children,
}: DragFloatProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      drag={freeform ? true : "x"}
      dragSnapToOrigin={snapBack}
      dragMomentum={momentum}
      dragElastic={0.6}
      dragTransition={
        momentum
          ? (parseTransition(transition) as { power?: number })
          : undefined
      }
      whileDrag={{ cursor: "grabbing", zIndex: 50 }}
      style={{ ...style, x, y, touchAction: "none" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Loop                                                                        */
/* -------------------------------------------------------------------------- */

export interface LoopEffectProps {
  /** Framer's loop target, e.g. a scale of 1.02 for a slow breathing motion. */
  to?: EnterState;
  /** "mirror" plays the animation forwards then backwards. */
  repeatType?: "loop" | "mirror" | "reverse";
  /** Pause between repeats, e.g. "2s". */
  repeatDelay?: string;
  transition?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Framer's Loop effect. The decorative hero images use it to breathe gently in
 * and out while they sit on the page.
 */
export function LoopEffect({
  to,
  repeatType = "mirror",
  repeatDelay,
  transition,
  className,
  style,
  children,
}: LoopEffectProps) {
  const reduceMotion = useReducedMotion();

  if (!to || reduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const { transition: inner, blur, ...rest } = to;
  const target = { ...rest } as TargetAndTransition;
  if (blur) target.filter = `blur(${blur})`;

  const spring = parseTransition(inner ?? transition);
  const delay = Number.parseFloat(repeatDelay ?? "0");

  return (
    <motion.div
      className={className}
      style={style}
      animate={target}
      transition={{
        ...spring,
        repeat: Infinity,
        repeatType,
        repeatDelay: Number.isNaN(delay) ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Text reveal                                                                 */
/* -------------------------------------------------------------------------- */

export interface TextEffectProps {
  text: string;
  /** Framer splits by "word", "line" or "character". */
  tokenization?: "word" | "line" | "character";
  /** Delay before the first token animates, e.g. "0.2s". */
  delay?: string;
  /** The per-token state to animate from. */
  style?: EnterState;
  trigger?: string;
  threshold?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Per-breakpoint overrides Framer stores on the text layer itself. */
  textStyle?: CSSProperties;
}

function seconds(value?: string): number {
  if (!value) return 0;
  const n = Number.parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Framer's Text effect, which reveals a string token by token. The stagger
 * between tokens is the delay slot of the transition string.
 */
export function TextEffect({
  text,
  tokenization = "word",
  delay,
  style,
  trigger = "onMount",
  threshold = 0.5,
  className,
  as: Tag = "span",
  textStyle,
}: TextEffectProps) {
  const reduceMotion = useReducedMotion();

  if (!style || reduceMotion) {
    return (
      <Tag className={className} style={textStyle}>
        {text}
      </Tag>
    );
  }

  // "line" reveals the paragraph as one unit, so it must still wrap normally.
  // Word and character tokens are inline-blocks that hold their own spacing.
  const wraps = tokenization === "line";
  const tokens = wraps
    ? [text]
    : tokenization === "character"
      ? Array.from(text)
      : text.split(/(\s+)/).filter((t) => t.length > 0);

  const { transition, blur, ...rest } = style;
  const from = { ...rest } as TargetAndTransition;
  if (blur) from.filter = `blur(${blur})`;

  const to: Record<string, unknown> = {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    skewX: 0,
    skewY: 0,
  };
  if (blur) to.filter = "blur(0px)";

  const target = Object.fromEntries(
    Object.keys(from).map((k) => [k, to[k] ?? 0]),
  ) as unknown as TargetAndTransition;

  const base = seconds(delay);
  const stagger = transitionDelay(transition);
  // The parsed delay is the per-token stagger here, not a fixed offset, so it
  // is dropped from the spring and re-applied per token below.
  const springRest: Transition = { ...parseTransition(transition) };
  delete (springRest as { delay?: number }).delay;

  const inViewProps =
    trigger === "onMount"
      ? { animate: target }
      : {
          whileInView: target,
          viewport: { once: true, amount: threshold } as const,
        };

  return (
    <Tag className={className} style={textStyle}>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
        return (
          <motion.span
            key={i}
            initial={from}
            {...inViewProps}
            transition={{ ...springRest, delay: base + i * stagger }}
            style={
              wraps
                ? { display: "block" }
                : { display: "inline-block", whiteSpace: "pre" }
            }
          >
            {token}
          </motion.span>
        );
      })}
    </Tag>
  );
}
