/**
 * The project card picture for IBM watsonx Orchestrate Notification Experience.
 *
 * A sibling of `IbmControlPlaneArt`, and built to the same rules: same 1120x800
 * canvas, same IBM blues, watsonx top left, IBM signing bottom right, drawn
 * straight into the card rather than photographed. What differs is the subject.
 * The control plane card is about one surface standing for many systems; this
 * one is about many events arriving in one place and a person deciding which
 * of them is worth looking at.
 *
 * The work is under NDA, so nothing here is taken from, traced over or
 * reconstructed from the real product, and there is not one word of text in it:
 * every row is a placeholder bar, a state dot or an abstract glyph. Grep this
 * file for `<text>` and there are none. What it communicates is the shape of
 * the problem, not what IBM's answer to it looks like.
 */

/** The card frame's shape, so the drawing fills it. */
const VIEW = { w: 1120, h: 800 };

/** IBM's own palette, the same values the control plane card uses. */
const BLUE = "#0F62FE";
const CYAN = "#08BDBA";
const PURPLE = "#8A3FFC";
const NAVY = "#0A1F44";
/** IBM's alert colours, for the one thing a notification has to say: how urgent. */
const RED = "#DA1E28";
const AMBER = "#F1C21B";
const GREEN = "#24A148";

/**
 * The notification list.
 *
 * Four rows, not identical: one unread and pulled forward, the rest settled.
 * The left edge of each carries its severity, which is the single piece of
 * information a notification surface exists to convey before anything is read.
 */
const ROWS = [
  { y: 262, tone: RED, line: 232, sub: 150, unread: true },
  { y: 352, tone: AMBER, line: 196, sub: 124, unread: false },
  { y: 442, tone: BLUE, line: 248, sub: 166, unread: false },
  { y: 532, tone: GREEN, line: 180, sub: 112, unread: false },
];

/** Agents upstream, each sending into the one surface. */
const SOURCES: { cy: number; glyph: "agent" | "flow" | "clock" }[] = [
  { cy: 250, glyph: "agent" },
  { cy: 400, glyph: "flow" },
  { cy: 550, glyph: "clock" },
];

export function IbmNotificationsArt({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute inset-0 isolate overflow-hidden ${className}`}
      role="img"
      aria-label={`${title} — an abstract notification surface collecting events from several agents`}
    >
      <svg
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        className="h-full w-full"
        aria-hidden
      >
        <defs>
          {/* Kept close to white, as the control plane card is, so the two sit
              at the same weight beside each other on My Projects. */}
          <linearGradient id="nx-bg" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F3F7FD" />
          </linearGradient>
          <radialGradient id="nx-glow-blue">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.085" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nx-glow-purple">
            <stop offset="0%" stopColor={PURPLE} stopOpacity="0.065" />
            <stop offset="100%" stopColor={PURPLE} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="nx-stack" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.4" />
            <stop offset="100%" stopColor={CYAN} stopOpacity="0.32" />
          </linearGradient>
          <linearGradient id="nx-chip" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={BLUE} />
            <stop offset="100%" stopColor={CYAN} />
          </linearGradient>
          <filter id="nx-lift" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow
              dx="0"
              dy="10"
              stdDeviation="16"
              floodColor={NAVY}
              floodOpacity="0.1"
            />
          </filter>
          <filter id="nx-lift-sm" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="7"
              floodColor={NAVY}
              floodOpacity="0.11"
            />
          </filter>
        </defs>

        <rect width={VIEW.w} height={VIEW.h} fill="url(#nx-bg)" />
        <ellipse
          cx="300"
          cy="150"
          rx="330"
          ry="240"
          fill="url(#nx-glow-blue)"
        />
        <ellipse
          cx="900"
          cy="650"
          rx="300"
          ry="220"
          fill="url(#nx-glow-purple)"
        />

        {/* watsonx, the supplied file, placed and scaled and nothing else. */}
        <image
          href="/images/ibm/card/watsonx-mark.a98aad79.png"
          x="62"
          y="54"
          width="116"
          height="116"
        />

        {/* Three agents upstream, wired into the one surface. The control plane
            card runs its paths outward to the systems it governs; here they run
            inward, because that is the direction a notification travels. */}
        <g
          stroke="#8FABD6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1 11"
          fill="none"
          opacity="0.85"
        >
          <path d="M126 258 C 180 262, 220 268, 268 276" />
          <path d="M126 400 C 190 400, 230 400, 268 400" />
          <path d="M126 542 C 180 538, 220 532, 268 524" />
        </g>
        {SOURCES.map((s) => (
          <SourceNode key={s.cy} cy={s.cy} glyph={s.glyph} />
        ))}

        {/* The surface itself, with two more behind it: a notification centre is
            never one list, it is the latest of many. */}
        <rect
          x="330"
          y="150"
          width="668"
          height="110"
          rx="16"
          fill="url(#nx-stack)"
          opacity="0.32"
        />
        <rect
          x="312"
          y="168"
          width="704"
          height="110"
          rx="18"
          fill="url(#nx-stack)"
          opacity="0.5"
        />

        <g filter="url(#nx-lift)">
          <rect
            x="294"
            y="186"
            width="740"
            height="446"
            rx="20"
            fill="#FFFFFF"
            stroke="#E2E9F5"
            strokeWidth="1.5"
          />
        </g>

        {/* The header of the list: a bell with a count, and two quiet controls
            standing in for filters. */}
        <g transform="translate(330 214)">
          <Bell />
          <circle cx="26" cy="4" r="11" fill={RED} />
        </g>
        <rect x="898" y="214" width="52" height="14" rx="7" fill="#E8EEF9" />
        <rect x="958" y="214" width="40" height="14" rx="7" fill="#E8EEF9" />
        <line
          x1="330"
          y1="248"
          x2="998"
          y2="248"
          stroke="#EDF1F9"
          strokeWidth="2"
        />

        {ROWS.map((row) => (
          <Row key={row.y} {...row} />
        ))}

        {/* One notification lifted out of the list and brought forward: the
            moment the surface is actually for.

            It sits at 548 rather than 596 because at 596 its foot ran to 716
            and the IBM signature, fixed at 687 to match the Builder card, was
            printing across it. The signature's place is the constant here; the
            toast moved. */}
        <g filter="url(#nx-lift)" transform="translate(636 548)">
          <rect
            width="372"
            height="120"
            rx="16"
            fill="#FFFFFF"
            stroke="#DCE6F4"
            strokeWidth="1.5"
          />
          <rect x="0" y="16" width="5" height="88" rx="2.5" fill={RED} />
          <rect
            x="26"
            y="26"
            width="34"
            height="34"
            rx="10"
            fill="url(#nx-chip)"
          />
          <path
            d="M43 33 l7.4 4.3 v8.6 l-7.4 4.3 l-7.4 -4.3 v-8.6 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <circle cx="43" cy="43" r="2.4" fill="#FFFFFF" />
          <rect x="76" y="30" width="188" height="10" rx="5" fill="#D5E0F1" />
          <rect x="76" y="48" width="124" height="8" rx="4" fill="#E7EDF8" />
          <rect x="26" y="78" width="96" height="24" rx="12" fill={BLUE} />
          <rect x="134" y="78" width="78" height="24" rx="12" fill="#EEF3FB" />
        </g>

        {/* The signature, last and quietest, smaller than watsonx above. */}
        <image
          href="/images/ibm/card/ibm-logo.85026a1f.png"
          x="902"
          y="687"
          width="156"
          height="62"
        />
      </svg>
    </div>
  );
}

/** One row of the list: severity, source, two placeholder lines, a state. */
function Row({
  y,
  tone,
  line,
  sub,
  unread,
}: {
  y: number;
  tone: string;
  line: number;
  sub: number;
  unread: boolean;
}) {
  return (
    <g>
      <rect
        x="330"
        y={y}
        width="668"
        height="72"
        rx="12"
        fill={unread ? "#F1F6FF" : "#F8FAFE"}
        stroke={unread ? "#A9C7FF" : "#E6EDF8"}
        strokeWidth={unread ? 2 : 1.5}
      />
      {/* Severity down the left edge — the thing read before anything else. */}
      <rect x="330" y={y + 14} width="5" height="44" rx="2.5" fill={tone} />
      <rect
        x={356}
        y={y + 19}
        width="34"
        height="34"
        rx="10"
        fill="url(#nx-chip)"
      />
      <path
        d={`M373 ${y + 26} l7.4 4.3 v8.6 l-7.4 4.3 l-7.4 -4.3 v-8.6 Z`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx={373} cy={y + 36} r="2.4" fill="#FFFFFF" />
      <rect x="408" y={y + 22} width={line} height="10" rx="5" fill="#D5E0F1" />
      <rect x="408" y={y + 42} width={sub} height="8" rx="4" fill="#E7EDF8" />
      {unread ? (
        <circle cx="970" cy={y + 36} r="6.5" fill={BLUE} />
      ) : (
        <rect x="930" y={y + 31} width="46" height="10" rx="5" fill="#E7EDF8" />
      )}
    </g>
  );
}

/** A bell, drawn rather than imported: the one glyph this subject needs. */
function Bell() {
  return (
    <g
      fill="none"
      stroke={NAVY}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 20 h28 a3 3 0 0 0 2.2 -5 c-2.6 -2.8 -3.4 -5.6 -3.4 -9.4 a12.8 12.8 0 0 0 -25.6 0 c0 3.8 -0.8 6.6 -3.4 9.4 A3 3 0 0 0 2 20 Z" />
      <path d="M12 26 a4 4 0 0 0 8 0" />
    </g>
  );
}

/** An agent upstream of the surface, reduced to the kind of thing it is. */
function SourceNode({
  cy,
  glyph,
}: {
  cy: number;
  glyph: "agent" | "flow" | "clock";
}) {
  const cx = 96;
  return (
    <g filter="url(#nx-lift-sm)">
      <circle
        cx={cx}
        cy={cy}
        r="30"
        fill="#FFFFFF"
        stroke="#DEE7F4"
        strokeWidth="1.5"
      />
      {glyph === "agent" ? (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r="11"
            fill="none"
            stroke={BLUE}
            strokeWidth="3.4"
          />
          <circle cx={cx} cy={cy} r="3.6" fill={CYAN} />
        </g>
      ) : glyph === "flow" ? (
        <g stroke={BLUE} strokeWidth="3.2" strokeLinecap="round" fill="none">
          <circle cx={cx - 9} cy={cy} r="4" fill={BLUE} stroke="none" />
          <path d={`M${cx - 4} ${cy} H${cx + 5}`} />
          <circle cx={cx + 10} cy={cy} r="4" fill={CYAN} stroke="none" />
        </g>
      ) : (
        <g stroke={BLUE} strokeWidth="3.2" strokeLinecap="round" fill="none">
          <circle cx={cx} cy={cy} r="11" />
          <path d={`M${cx} ${cy - 6} V${cy} H${cx + 6}`} />
        </g>
      )}
    </g>
  );
}
