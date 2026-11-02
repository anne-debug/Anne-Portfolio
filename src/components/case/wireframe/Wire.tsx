import type { ReactNode } from "react";

/**
 * The grayscale wireframe kit the IBM case study is illustrated with.
 *
 * The case study used to show the team's own prototype captures. They are
 * unreleased IBM UI, so they came off the site; these drawings take their
 * place. They are not the screenshots redrawn — nothing here was traced,
 * cropped or blurred from a capture. They are the ordinary dashboard patterns
 * the project is built out of — a rail, a tab row, cards, a list, a table, a
 * chart — composed to show the one decision each version of the case study is
 * talking about. Everything in them is fictional: the names, the figures, the
 * issue text, the IDs and the timestamps.
 *
 * ── Why DOM and SVG rather than exported pictures ────────────────────────
 * A PNG of a wireframe is a fixed thing: it needs a file per version, it is
 * heavy for what it carries, its text is unsearchable and unselectable, and at
 * a phone's width it is a grey smudge. Built as elements, each drawing is a
 * few kB of markup, every label is real text that stays crisp at any zoom, and
 * a composition can simplify itself at a narrow width instead of being scaled
 * into illegibility. The charts are hand-written SVG for the same reason.
 *
 * ── The palette ───────────────────────────────────────────────────────────
 * Five greys and white, declared once on `WireFigure` and inherited by
 * everything inside it, so no piece carries its own colours. IBM blue appears
 * only where the real product would mark a choice — the open rail item, the
 * active tab, a link. It is never used to decorate.
 *
 * Nothing here animates. These sit inside a version switcher that already
 * crossfades, and a wireframe that moves on its own reads as a demo rather
 * than as a drawing.
 */

/* -------------------------------------------------------------------------- */
/* Tokens                                                                     */
/* -------------------------------------------------------------------------- */

const TOKENS = {
  "--wf-screen": "#ffffff",
  "--wf-surface": "#f5f5f5",
  "--wf-surface-2": "#fafafa",
  "--wf-line": "#e3e3e3",
  "--wf-line-strong": "#cdcdcd",
  "--wf-ink": "#3d3d3d",
  "--wf-ink-soft": "#6f6f6f",
  "--wf-ink-faint": "#9b9b9b",
  "--wf-fill": "#e6e6e6",
  "--wf-fill-soft": "#efefef",
  "--wf-accent": "#0f62fe",
} as React.CSSProperties;

/** How loud a mark is. Severity is told by weight here, never by hue. */
export type Tone = "ink" | "soft" | "faint" | "fill";

const TONE: Record<Tone, string> = {
  ink: "var(--wf-ink)",
  soft: "var(--wf-ink-soft)",
  faint: "var(--wf-ink-faint)",
  fill: "var(--wf-fill)",
};

/* -------------------------------------------------------------------------- */
/* The frame                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The box a drawing lives in, and the only thing that sets its height.
 *
 * Every version of an area gets the same height at the same width, so the page
 * below a version switcher does not move when a reader presses V2. The
 * compositions inside are built to fill it: regions take `flex-1` and absorb
 * whatever is left rather than leaving a gap at the bottom.
 *
 * `role="img"` with a written description, because the labels inside are
 * scenery. Read out one by one they are a heap of fragments — "Quick actions",
 * "92%", "Agent" — that tell a screen reader nothing about what the drawing is
 * for. One sentence does.
 */
export function WireFigure({
  children,
  alt,
  size = "screen",
  scroll,
  interactive,
  className,
}: {
  children: ReactNode;
  /** One sentence: what this drawing shows and what it is there to say. */
  alt: string;
  /** `screen` for a whole page, `study` for a single panel or card. */
  size?: "screen" | "compact" | "study" | "hero" | "hug";
  /**
   * A preview window rather than a frame: the drawing keeps its own natural
   * height and the box scrolls.
   *
   * The Home versions run to four sections and well over a thousand pixels.
   * Squeezed into a fixed frame they would either be scaled down to an
   * unreadable smudge or have two sections clipped off for good. A window with
   * a scrollbar keeps the page compact, keeps the type at the size it was
   * drawn at, and keeps every section reachable.
   */
  scroll?: boolean;
  /**
   * The drawing contains real controls — the final Metrics version has working
   * tabs — so it is a group rather than a picture. `role="img"` would hide
   * everything inside it from assistive technology, including the tabs.
   */
  interactive?: boolean;
  className?: string;
}) {
  const height =
    size === "screen"
      ? "h-[420px] tablet:h-[480px] desktop:h-[520px]"
      : size === "compact"
        ? "h-[380px] tablet:h-[430px] desktop:h-[450px]"
        : size === "study"
          ? "h-[270px] tablet:h-[330px] desktop:h-[345px]"
          : size === "hug"
            ? ""
            : "h-full";

  if (scroll && size !== "hug")
    return (
      /*
        `tabIndex`, because a scroll container that only answers the wheel is
        unreachable without a pointer. With it, the box takes focus and the
        arrow keys, Page Up/Down, Home and End all work on it.

        `data-wire-scroll` is how the version switcher finds this box to put it
        back to the top when a reader presses V2; nothing else reads it.

        `overscroll-contain` is deliberately *not* set: Lenis yields the wheel
        to a nested scroller only while that scroller can still move the way
        the wheel asked, and it reads `overscroll-behavior` to decide. Left at
        `auto`, reaching the bottom of a drawing hands the page back rather
        than trapping the reader inside it.
      */
      <div
        role={interactive ? "group" : "img"}
        aria-label={alt}
        tabIndex={0}
        data-wire-scroll=""
        style={{ ...TOKENS, fontFamily: "var(--font-dm-sans)" }}
        className={`wire-scroll w-full overflow-x-hidden overflow-y-auto rounded-[6px] border border-[var(--wf-line)] bg-[var(--wf-screen)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wf-accent)] ${size === "compact" ? PREVIEW_COMPACT : PREVIEW} ${className ?? ""}`}
      >
        {children}
      </div>
    );

  return (
    <div
      role="img"
      aria-label={alt}
      style={{ ...TOKENS, fontFamily: "var(--font-dm-sans)" }}
      className={`w-full ${height} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

/**
 * How tall a scrolling preview may get.
 *
 * A *maximum*, not a height. A drawing shorter than this takes its own height
 * and the box hugs it, so nothing is framed in blank; a taller one stops here
 * and scrolls, with the scrollbar `.wire-scroll` keeps on screen to say so.
 * The cap is tall enough on a desktop to hold a section and the start of the
 * next, which is what tells a reader there is more below.
 */
const PREVIEW = "max-h-[440px] tablet:max-h-[540px] desktop:max-h-[580px]";

/**
 * The shorter window Solution Overview uses.
 *
 * Its three drawings are one step each of the same section, and a visitor
 * switching between them should not have the page move under their hand. The
 * Issues one is a fixed `compact` frame; the other two scroll, so they take
 * the same heights rather than the taller ones a Design Process drawing wants.
 *
 * A fixed height here on purpose rather than the cap above: these three must
 * not change size when a reader moves between them.
 */
const PREVIEW_COMPACT = "h-[380px] tablet:h-[430px] desktop:h-[450px]";

/* -------------------------------------------------------------------------- */
/* Chrome                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The application window: a rail down the left, a slim header, and the page.
 *
 * `rail` and `header` are optional because not every drawing is a whole page —
 * the close-up studies are one panel, and giving those a rail would claim they
 * are a screen they are not.
 */
export function WireScreen({
  children,
  rail = true,
  header = true,
  railActive = 0,
  /**
   * `grow` fills the frame it is given and lets its regions share the space —
   * right for a drawing of one screenful. `natural` is as tall as its content,
   * which is what a page inside a scrolling preview has to be.
   */
  height = "grow",
  framed,
  className,
}: {
  children: ReactNode;
  rail?: boolean;
  header?: boolean;
  /** Which rail item is open. Blue, the one place the drawing uses colour. */
  railActive?: number;
  height?: "grow" | "natural";
  /**
   * Draw the window's own edge.
   *
   * A growing screen always does; a natural one usually sits inside a
   * scrolling preview that has already drawn one, and a second would be a
   * double border. A natural screen with nothing around it — a page drawn at
   * its own height — asks for it here.
   */
  framed?: boolean;
  className?: string;
}) {
  const grow = height === "grow";
  const edge = grow || framed;
  return (
    <div
      className={`flex w-full ${grow ? "h-full" : "min-h-full"} ${edge ? "overflow-hidden rounded-[6px] border" : ""} bg-[var(--wf-screen)] ${className ?? ""}`}
      style={edge ? { borderColor: "var(--wf-line)" } : undefined}
    >
      {rail ? <WireRail active={railActive} grow={grow} /> : null}
      <div className="flex min-w-0 flex-1 flex-col">
        {header ? <WireHeader /> : null}
        {/* `flex-1` in both modes. Growing, it shares the frame between its
            regions; natural, it is at least as tall as the preview window, so
            a short drawing can fill it instead of leaving a hole underneath. */}
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-3 tablet:gap-3 tablet:p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

function WireRail({ active, grow = true }: { active: number; grow?: boolean }) {
  return (
    <div
      className={`hidden w-9 shrink-0 flex-col items-center gap-3 border-r py-3 tablet:flex ${grow ? "" : "sticky top-0 self-stretch"}`}
      style={{
        borderColor: "var(--wf-line)",
        background: "var(--wf-surface-2)",
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className="block size-4 rounded-[3px]"
          style={{
            background: i === active ? "var(--wf-accent)" : "var(--wf-fill)",
            opacity: i === active ? 0.9 : 1,
          }}
        />
      ))}
    </div>
  );
}

function WireHeader() {
  return (
    <div
      className="flex h-7 shrink-0 items-center gap-2 border-b px-3"
      style={{ borderColor: "var(--wf-line)" }}
    >
      <span
        className="block h-2 w-14 rounded-full"
        style={{ background: "var(--wf-fill)" }}
      />
      <span className="flex-1" />
      <span
        className="block size-3 rounded-full"
        style={{ background: "var(--wf-fill)" }}
      />
      <span
        className="block size-3 rounded-full"
        style={{ background: "var(--wf-fill)" }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Type                                                                       */
/* -------------------------------------------------------------------------- */

/** A heading inside the drawing. 11px, because a wireframe is not a poster. */
export function WireTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`block text-[11px] leading-tight font-semibold tablet:text-[12px] ${className ?? ""}`}
      style={{ color: "var(--wf-ink)" }}
    >
      {children}
    </span>
  );
}

export function WireText({
  children,
  tone = "soft",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`block text-[10px] leading-snug tablet:text-[11px] ${className ?? ""}`}
      style={{ color: TONE[tone] }}
    >
      {children}
    </span>
  );
}

/** A placeholder, for the secondary matter a wireframe does not spell out. */
export function WireBar({
  w = "100%",
  h = 6,
  tone = "fill",
  className,
}: {
  w?: string | number;
  h?: number;
  tone?: "fill" | "soft";
  className?: string;
}) {
  return (
    <span
      className={`block rounded-full ${className ?? ""}`}
      style={{
        width: typeof w === "number" ? `${w}px` : w,
        height: `${h}px`,
        background: tone === "soft" ? "var(--wf-fill-soft)" : "var(--wf-fill)",
      }}
    />
  );
}

/** Two or three placeholder lines, the last one short, the way prose ends. */
export function WireLines({
  n = 2,
  className,
}: {
  n?: number;
  className?: string;
}) {
  const widths = ["100%", "92%", "68%", "84%"];
  return (
    <span className={`flex flex-col gap-1 ${className ?? ""}`}>
      {Array.from({ length: n }).map((_, i) => (
        <WireBar key={i} w={widths[i % widths.length]} h={5} tone="soft" />
      ))}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Controls                                                                   */
/* -------------------------------------------------------------------------- */

export function WireTabs({
  items,
  active = 0,
  className,
}: {
  items: string[];
  active?: number;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-end gap-3 border-b tablet:gap-4 ${className ?? ""}`}
      style={{ borderColor: "var(--wf-line)" }}
    >
      {items.map((label, i) => (
        <span
          key={label}
          className="relative block pb-1.5 text-[10px] leading-none tablet:text-[11px]"
          style={{
            color: i === active ? "var(--wf-ink)" : "var(--wf-ink-faint)",
            fontWeight: i === active ? 600 : 400,
          }}
        >
          {label}
          {i === active ? (
            <span
              className="absolute inset-x-0 -bottom-px block h-[1.5px]"
              style={{ background: "var(--wf-accent)" }}
            />
          ) : null}
        </span>
      ))}
    </div>
  );
}

export function WireButton({
  children,
  variant = "ghost",
  icon,
  className,
}: {
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost";
  icon?: IconName;
  className?: string;
}) {
  const style =
    variant === "solid"
      ? {
          background: "var(--wf-ink)",
          color: "#fff",
          borderColor: "var(--wf-ink)",
        }
      : variant === "outline"
        ? {
            background: "transparent",
            color: "var(--wf-ink)",
            borderColor: "var(--wf-line-strong)",
          }
        : {
            background: "var(--wf-surface)",
            color: "var(--wf-ink-soft)",
            borderColor: "var(--wf-line)",
          };

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-[3px] border px-1.5 py-1 text-[9px] leading-none whitespace-nowrap tablet:px-2 tablet:text-[10px] ${className ?? ""}`}
      style={style}
    >
      {icon ? <WireIcon name={icon} /> : null}
      {children}
    </span>
  );
}

export function WireSearch({
  placeholder = "Search artifacts",
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded-[3px] border px-2 py-1.5 ${className ?? ""}`}
      style={{
        borderColor: "var(--wf-line)",
        background: "var(--wf-surface-2)",
      }}
    >
      <WireIcon name="search" />
      <span
        className="block truncate text-[9px] leading-none tablet:text-[10px]"
        style={{ color: "var(--wf-ink-faint)" }}
      >
        {placeholder}
      </span>
    </span>
  );
}

export function WireSelect({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-[3px] border px-1.5 py-1 text-[9px] leading-none tablet:text-[10px] ${className ?? ""}`}
      style={{
        borderColor: "var(--wf-line-strong)",
        color: "var(--wf-ink-soft)",
      }}
    >
      {children}
      <WireIcon name="chevron" />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Surfaces                                                                   */
/* -------------------------------------------------------------------------- */

export function WireCard({
  title,
  icon,
  action,
  children,
  tone = "plain",
  className,
}: {
  title?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
  children?: ReactNode;
  /** `filled` for the cards a real page would tint; `plain` for panels. */
  tone?: "plain" | "filled";
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-0 min-w-0 flex-col gap-1.5 rounded-[4px] border p-2 tablet:gap-2 tablet:p-2.5 ${className ?? ""}`}
      style={{
        borderColor: "var(--wf-line)",
        background:
          tone === "filled" ? "var(--wf-surface)" : "var(--wf-screen)",
      }}
    >
      {title || action ? (
        <div className="flex min-w-0 items-center gap-1.5">
          {icon ? <WireIcon name={icon} /> : null}
          {title ? <WireTitle className="truncate">{title}</WireTitle> : null}
          <span className="flex-1" />
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/** A number with a word under it: the unit a dashboard is counted in. */
export function WireStat({
  label,
  value,
  note,
  className,
}: {
  label: string;
  value: string;
  note?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-0.5 rounded-[4px] border p-2 ${className ?? ""}`}
      style={{
        borderColor: "var(--wf-line)",
        background: "var(--wf-surface-2)",
      }}
    >
      <span
        className="truncate text-[9px] leading-none tablet:text-[10px]"
        style={{ color: "var(--wf-ink-faint)" }}
      >
        {label}
      </span>
      <span
        className="text-[15px] leading-none font-semibold tablet:text-[17px]"
        style={{ color: "var(--wf-ink)" }}
      >
        {value}
      </span>
      {note ? (
        <span
          className="truncate text-[9px] leading-none"
          style={{ color: "var(--wf-ink-faint)" }}
        >
          {note}
        </span>
      ) : null}
    </div>
  );
}

export function WireBadge({
  children,
  tone = "faint",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-[2px] px-1 py-0.5 text-[8px] leading-none whitespace-nowrap tablet:text-[9px]"
      style={{
        background: tone === "ink" ? "var(--wf-ink)" : "var(--wf-surface)",
        color: tone === "ink" ? "#fff" : TONE[tone],
        border: tone === "ink" ? "none" : "1px solid var(--wf-line)",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Severity, as a mark rather than a colour.
 *
 * A real console paints these red, amber and grey. A grayscale drawing cannot,
 * and tinting one dot blue would say "selected" rather than "critical". Three
 * plain dots read as three weights but not as three *kinds*, so these are
 * glyphs: a filled circle for critical, an open triangle for warning, an
 * outlined circle for information.
 *
 * Deliberately not the product's own set, which is a slashed circle, a solid
 * triangle and a filled square. These only have to say the same three things
 * in their own hand, and shape rather than fill does the work, so nothing
 * depends on telling two greys apart.
 */
export function WireDot({
  level = "info",
}: {
  level?: "critical" | "warning" | "info";
}) {
  if (level === "critical")
    return (
      <svg
        viewBox="0 0 12 12"
        className="block size-[11px] shrink-0"
        aria-hidden
      >
        <circle cx="6" cy="6" r="5.2" fill="var(--wf-ink)" />
        <path
          d="M6 3.5v2.9"
          stroke="#fff"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="6" cy="8.6" r="0.78" fill="#fff" />
      </svg>
    );

  if (level === "warning")
    return (
      <svg
        viewBox="0 0 12 12"
        className="block size-[11px] shrink-0"
        aria-hidden
      >
        <path
          d="M6 1.5 11.3 10.5H0.7z"
          fill="none"
          stroke="var(--wf-ink-soft)"
          strokeWidth="1.15"
          strokeLinejoin="round"
        />
        <path
          d="M6 5.1v2.1"
          stroke="var(--wf-ink-soft)"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
        <circle cx="6" cy="8.9" r="0.68" fill="var(--wf-ink-soft)" />
      </svg>
    );

  return (
    <svg viewBox="0 0 12 12" className="block size-[11px] shrink-0" aria-hidden>
      <circle
        cx="6"
        cy="6"
        r="4.8"
        fill="none"
        stroke="var(--wf-line-strong)"
        strokeWidth="1.15"
      />
      <path
        d="M6 5.7v2.7"
        stroke="var(--wf-ink-faint)"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <circle cx="6" cy="3.8" r="0.68" fill="var(--wf-ink-faint)" />
    </svg>
  );
}

/**
 * A segmented control: `Personal | Team`, `24hr | 7d | 30d | 60d`.
 *
 * The chosen segment is filled rather than tinted, so the control reads at a
 * glance without spending the one accent the drawing allows on it.
 */
export function WireSegmented({
  items,
  active = 0,
  className,
}: {
  items: string[];
  active?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-[3px] border ${className ?? ""}`}
      style={{ borderColor: "var(--wf-line-strong)" }}
    >
      {items.map((label, i) => (
        <span
          key={label}
          className="px-1.5 py-1 text-[9px] leading-none whitespace-nowrap tablet:px-2 tablet:text-[10px]"
          style={
            i === active
              ? { background: "var(--wf-ink)", color: "#fff", fontWeight: 600 }
              : { color: "var(--wf-ink-soft)" }
          }
        >
          {label}
        </span>
      ))}
    </span>
  );
}

/** An unfilled shortcut: the slot the product offers you to pin something to. */
export function WireSlot({
  label = "Create shortcut",
  active,
  className,
}: {
  label?: string;
  /** The slot the pointer is on, as the product marks it before a press. */
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[64px] min-w-0 flex-col items-center justify-center gap-1 rounded-[4px] border border-dashed ${className ?? ""}`}
      style={{
        borderColor: active ? "var(--wf-accent)" : "var(--wf-line-strong)",
        background: active ? "var(--wf-surface-2)" : undefined,
      }}
    >
      <WireIcon name="pin" tone={active ? "ink" : "faint"} />
      <span
        className="text-[9px] leading-none tablet:text-[10px]"
        style={{ color: "var(--wf-ink-faint)" }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * A pinned shortcut: the thing it points at, and the way in.
 *
 * Deliberately only that. Shortcuts matter to the case study because V2
 * introduced them and the final version kept them; whether one happens to be
 * live, how many runs it has had and who owns it are details of a product, not
 * of the decision.
 */
export function WireShortcut({
  title,
  icon,
  body,
  action,
  className,
}: {
  title: string;
  icon: IconName;
  body: string;
  action: string;
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-1.5 rounded-[4px] border p-2 tablet:p-2.5 ${className ?? ""}`}
      style={{ borderColor: "var(--wf-line)", background: "var(--wf-screen)" }}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <WireIcon name={icon} />
        <WireTitle className="truncate">{title}</WireTitle>
      </span>
      <WireText className="line-clamp-2">{body}</WireText>
      <span className="flex items-center gap-1">
        <span
          className="text-[9px] leading-none tablet:text-[10px]"
          style={{ color: "var(--wf-accent)" }}
        >
          {action}
        </span>
        <WireIcon name="open" tone="faint" />
      </span>
    </div>
  );
}

/** A recent artifact: what it is, and when it was last touched. */
export function WireRecent({
  title,
  type,
  modified,
  className,
}: {
  title: string;
  type: string;
  modified: string;
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-1.5 rounded-[4px] border p-2 tablet:p-2.5 ${className ?? ""}`}
      style={{ borderColor: "var(--wf-line)", background: "var(--wf-screen)" }}
    >
      <WireTitle className="truncate">{title}</WireTitle>
      <span className="flex items-center gap-1.5">
        <WireBadge>{type}</WireBadge>
      </span>
      <span
        className="mt-0.5 border-t pt-1.5"
        style={{ borderColor: "var(--wf-line)" }}
      >
        <WireText tone="faint">{modified}</WireText>
      </span>
    </div>
  );
}

/**
 * A card with no reading on it.
 *
 * The monitoring blocks are in these drawings because their size and their
 * place on the page are the decision — V1 led with them, V2 grew them, the
 * final version deleted them. What any one of them actually measured is not,
 * and spelling it out would be reconstructing a product rather than explaining
 * a choice. So they are drawn as what a wireframe calls them: a label and a
 * figure, neither of which says anything.
 */
export function WireBlankStat({ className }: { className?: string }) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-1.5 rounded-[4px] border p-2 ${className ?? ""}`}
      style={{
        borderColor: "var(--wf-line)",
        background: "var(--wf-surface-2)",
      }}
    >
      <WireBar w="58%" h={4} tone="soft" />
      <WireBar w="38%" h={9} />
    </div>
  );
}

/**
 * An abstract mark standing in for a chart.
 *
 * Three shapes, because a page of six identical boxes reads as unfinished
 * rather than as abstracted: a ring, a short run of bars, and a divided bar.
 * None of them is plotted from anything.
 */
export function WireShape({
  kind = "ring",
  className,
}: {
  kind?: "ring" | "bars" | "split";
  className?: string;
}) {
  if (kind === "ring")
    return <WireDonut pct={64} className={`size-10 ${className ?? ""}`} />;

  if (kind === "bars")
    return (
      <span
        aria-hidden
        className={`flex h-8 w-full items-end gap-[3px] ${className ?? ""}`}
      >
        {[40, 62, 48, 74, 56].map((v, i) => (
          <span
            key={i}
            className="block max-w-[10px] flex-1 rounded-[1px]"
            style={{ height: `${v}%`, background: "var(--wf-fill)" }}
          />
        ))}
      </span>
    );

  return (
    <span
      aria-hidden
      className={`flex h-2 w-full overflow-hidden rounded-full ${className ?? ""}`}
    >
      {[52, 30, 18].map((w, i) => (
        <span
          key={i}
          style={{
            width: `${w}%`,
            background: [
              "var(--wf-fill)",
              "var(--wf-ink-faint)",
              "var(--wf-ink)",
            ][i],
          }}
        />
      ))}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Lists and tables                                                           */
/* -------------------------------------------------------------------------- */

export function WireRow({
  level,
  title,
  meta,
  right,
  selected,
  className,
}: {
  level?: "critical" | "warning" | "info";
  title: string;
  meta?: string;
  right?: ReactNode;
  selected?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 border-b px-2 py-1.5 last:border-b-0 ${className ?? ""}`}
      style={{
        borderColor: "var(--wf-line)",
        background: selected ? "var(--wf-surface)" : "transparent",
        boxShadow: selected ? "inset 2px 0 0 var(--wf-accent)" : undefined,
      }}
    >
      {level ? <WireDot level={level} /> : null}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span
          className="truncate text-[10px] leading-tight font-medium tablet:text-[11px]"
          style={{ color: "var(--wf-ink)" }}
        >
          {title}
        </span>
        {meta ? (
          <span
            className="truncate text-[9px] leading-tight tablet:text-[10px]"
            style={{ color: "var(--wf-ink-faint)" }}
          >
            {meta}
          </span>
        ) : null}
      </span>
      <span className="flex-1" />
      {right}
    </div>
  );
}

export function WireTable({
  head,
  rows,
  more,
  className,
}: {
  head: string[];
  /** Each cell is text or a drawn thing — a badge, a button, a dot. */
  rows: ReactNode[][];
  /** Rows a phone does not have the height for. */
  more?: ReactNode[][];
  className?: string;
}) {
  const cols = `repeat(${head.length}, minmax(0, 1fr))`;
  return (
    <div className={`flex min-h-0 min-w-0 flex-col ${className ?? ""}`}>
      <div
        className="grid shrink-0 items-center gap-2 border-b px-2 pb-1"
        style={{
          gridTemplateColumns: cols,
          borderColor: "var(--wf-line-strong)",
        }}
      >
        {head.map((h) => (
          <span
            key={h}
            className="truncate text-[9px] leading-none font-semibold tablet:text-[10px]"
            style={{ color: "var(--wf-ink-soft)" }}
          >
            {h}
          </span>
        ))}
      </div>
      {[...rows, ...(more ?? [])].map((row, i) => (
        <div
          key={i}
          className={`grid min-w-0 items-center gap-2 border-b px-2 py-1.5 last:border-b-0 ${i >= rows.length ? "hidden tablet:grid" : ""}`}
          style={{ gridTemplateColumns: cols, borderColor: "var(--wf-line)" }}
        >
          {row.map((cell, j) => (
            <span
              key={j}
              className="flex min-w-0 items-center text-[9px] leading-tight tablet:text-[10px]"
              style={{
                color: j === 0 ? "var(--wf-ink)" : "var(--wf-ink-soft)",
              }}
            >
              {typeof cell === "string" ? (
                <span className="truncate">{cell}</span>
              ) : (
                cell
              )}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Charts                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The charts are drawn, not plotted: the numbers are made up and the shapes are
 * the shapes these measures have — a weekly bar run, a latency curve, a split.
 * `preserveAspectRatio="none"` so each one fills whatever box it is given,
 * which is what a wireframe's chart does.
 */
/**
 * A chart is given a height, not a share of what is left.
 *
 * Dropped into a `flex-1` these grew to whatever the frame had spare — a
 * seven-bar chart 300px tall, which reads as the subject of the page rather
 * than as a figure on it. Fixed here, the slack falls to the list or table
 * below, which is where a dashboard actually wants it.
 */
export function WireChartBox({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`h-[34px] shrink-0 tablet:h-[54px] ${className ?? ""}`}>
      {children}
    </div>
  );
}

export function WireBars({
  values = [52, 38, 64, 47, 72, 58, 80, 44, 66, 51, 74, 60],
  className,
}: {
  values?: number[];
  className?: string;
}) {
  /* Elements rather than SVG. A stretched `<rect>` fills whatever box it is
     given, so a seven-bar chart in a wide card came out as seven slabs; a
     flex row with a cap on each bar's width stays a chart at any size. */
  return (
    <span
      className={`flex h-full w-full items-end gap-[2px] tablet:gap-[3px] ${className ?? ""}`}
      aria-hidden
    >
      {values.map((v, i) => (
        <span
          key={i}
          className="block max-w-[11px] min-w-[3px] flex-1 rounded-[1px]"
          style={{ height: `${Math.max(v, 6)}%`, background: "var(--wf-fill)" }}
        />
      ))}
    </span>
  );
}

export function WireLineChart({
  points = [28, 22, 30, 18, 24, 12, 16, 9],
  className,
}: {
  points?: number[];
  className?: string;
}) {
  const step = 100 / (points.length - 1);
  const d = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(40 - (p / 40) * 34).toFixed(1)}`,
    )
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className={`block h-full w-full ${className ?? ""}`}
      aria-hidden
    >
      <path d={`${d} L100,40 L0,40 Z`} fill="var(--wf-fill-soft)" />
      <path
        d={d}
        fill="none"
        stroke="var(--wf-line-strong)"
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** A split bar: how a total divides, without a legend of colours to decode. */
export function WireSplit({
  parts = [34, 46, 20],
  className,
}: {
  parts?: number[];
  className?: string;
}) {
  const total = parts.reduce((a, b) => a + b, 0) || 1;
  const shades = ["var(--wf-ink)", "var(--wf-ink-faint)", "var(--wf-fill)"];
  return (
    <span
      className={`flex h-1.5 w-full overflow-hidden rounded-full ${className ?? ""}`}
    >
      {parts.map((p, i) => (
        <span
          key={i}
          style={{
            width: `${(p / total) * 100}%`,
            background: shades[i % shades.length],
          }}
        />
      ))}
    </span>
  );
}

export function WireDonut({
  pct = 72,
  className,
}: {
  pct?: number;
  className?: string;
}) {
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 40 40" className={`block ${className ?? ""}`} aria-hidden>
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="var(--wf-fill)"
        strokeWidth="6"
      />
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="var(--wf-ink-faint)"
        strokeWidth="6"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform="rotate(-90 20 20)"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

export type IconName =
  | "plus"
  | "folder"
  | "agent"
  | "flow"
  | "tool"
  | "book"
  | "server"
  | "alert"
  | "chart"
  | "search"
  | "link"
  | "clock"
  | "user"
  | "chevron"
  | "pin"
  | "open";

const PATHS: Record<IconName, string> = {
  plus: "M6 2.4v7.2M2.4 6h7.2",
  folder: "M1.8 3.2h2.6l1 1.2h4.8v5.2H1.8z",
  agent: "M3 4.2h6v4.6H3zM4.6 2.2v2M7.4 2.2v2",
  flow: "M2.2 3.4h3v2.2h-3zM6.8 6.4h3v2.2h-3zM5.2 4.5h1.6v2.9",
  tool: "M7.4 2.6a2.2 2.2 0 0 1 2.3 3.3L9 5.2l-1.3.4-.4-1.3zM7.1 5.8 2.6 10.3M3.9 9 2.3 7.4",
  book: "M2.2 2.6h3.3v6.8H3.4a1.2 1.2 0 0 1-1.2-1.2zM5.5 2.6h3.3v5.6a1.2 1.2 0 0 1-1.2 1.2H5.5z",
  server: "M2.2 2.8h7.6v2.6H2.2zM2.2 6.6h7.6v2.6H2.2z",
  alert: "M6 2.2 10 9.4H2zM6 5.2v1.9M6 8.1v.1",
  chart: "M2.4 9.6V5.8M6 9.6V2.8M9.6 9.6V6.9",
  search: "M5.4 2.4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM7.8 7.8 10 10",
  link: "M4.8 7.2 7.2 4.8M4.2 5.4 3 6.6a1.7 1.7 0 0 0 2.4 2.4l1.2-1.2M7.8 6.6 9 5.4A1.7 1.7 0 0 0 6.6 3L5.4 4.2",
  clock: "M6 2.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2zM6 4.2V6l1.4 1",
  user: "M6 2.6a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4zM2.8 9.6c0-1.8 1.4-2.8 3.2-2.8s3.2 1 3.2 2.8",
  chevron: "M3.6 4.8 6 7.2l2.4-2.4",
  pin: "M6 7.2v2.6M3.9 2.4h4.2l-.7 2.4 1 2.4H3.6l1-2.4z",
  open: "M5.2 2.6H2.4v7h7V6.8M7 2.4h2.6V5M9.6 2.4 5.8 6.2",
};

export function WireIcon({
  name,
  tone = "soft",
  className,
}: {
  name: IconName;
  tone?: Tone;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`block size-3 shrink-0 ${className ?? ""}`}
      fill="none"
      stroke={TONE[tone]}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Composites used by more than one screen                                    */
/* -------------------------------------------------------------------------- */

/**
 * The welcome message, which every Home version keeps and none keeps the same
 * way: it is the one element the three iterations are arguing about.
 */
export function WireGreeting({
  title,
  note,
  strong,
  actions,
}: {
  title: string;
  /** The line under it. */
  note?: ReactNode;
  /** Draws the note darker, for the version where it carries the alert. */
  strong?: boolean;
  actions?: ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-end gap-x-3 gap-y-1.5">
      <div className="flex min-w-0 flex-col gap-1">
        <span
          className="text-[14px] leading-none font-semibold tablet:text-[16px]"
          style={{ color: "var(--wf-ink)" }}
        >
          {title}
        </span>
        {note ? (
          <span
            className="text-[10px] leading-tight tablet:text-[11px]"
            style={{
              color: strong ? "var(--wf-ink)" : "var(--wf-ink-faint)",
              fontWeight: strong ? 600 : 400,
            }}
          >
            {note}
          </span>
        ) : null}
      </div>
      <span className="flex-1" />
      {actions}
    </div>
  );
}

/** A small labelled tile: a quick action, a pinned shortcut, a recent file. */
export function WireTile({
  label,
  meta,
  icon,
  className,
}: {
  label: string;
  meta?: string;
  icon: IconName;
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-1 rounded-[4px] border p-1.5 tablet:p-2 ${className ?? ""}`}
      style={{
        borderColor: "var(--wf-line)",
        background: "var(--wf-surface-2)",
      }}
    >
      <WireIcon name={icon} />
      <span
        className="truncate text-[9px] leading-tight font-medium tablet:text-[10px]"
        style={{ color: "var(--wf-ink)" }}
      >
        {label}
      </span>
      {meta ? (
        <span
          className="truncate text-[8px] leading-tight tablet:text-[9px]"
          style={{ color: "var(--wf-ink-faint)" }}
        >
          {meta}
        </span>
      ) : null}
    </div>
  );
}

/** The section heading inside a page: a word, and sometimes a control. */
export function WireSection({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-h-0 min-w-0 flex-col gap-1.5 ${className ?? ""}`}>
      <div className="flex shrink-0 items-center gap-2">
        <WireTitle>{title}</WireTitle>
        <span className="flex-1" />
        {action}
      </div>
      {children}
    </div>
  );
}

/** A bordered box for a list, so rows read as one panel rather than as rules. */
export function WirePanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[4px] border ${className ?? ""}`}
      style={{ borderColor: "var(--wf-line)" }}
    >
      {children}
    </div>
  );
}
