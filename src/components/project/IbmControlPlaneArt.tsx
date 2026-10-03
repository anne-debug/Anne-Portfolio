/**
 * The project card picture for IBM watsonx Builder Control Plane.
 *
 * It is drawn, not photographed. The work it stands for is under NDA, so there
 * is no screenshot here and nothing in this file is taken from, traced over or
 * reconstructed from the real product: no watsonx Orchestrate or Builder
 * screen, no internal prototype, no real agent names, no real numbers, no
 * labels of any kind. Every surface inside the dashboard is a placeholder bar,
 * a status dot or an abstract glyph. What it communicates is the *shape* of the
 * system — one place to see, run and watch over AI agents and the workflows
 * they take part in — and nothing about how the actual one looks.
 *
 * That is also why it is SVG rather than a capture. `scripts/capture-previews`
 * deliberately skips this project, since a screenshot of its hero would publish
 * protected content to a guessable URL under `public/`. This picture carries no
 * protected content, so it is safe to serve, and being vector it stays sharp in
 * the 402px card on My Projects and in the 480px card in a More Projects strip
 * without a second asset.
 *
 * The two logos are the supplied files, placed and scaled and otherwise
 * untouched — not redrawn, not set in type, no effects over them.
 *
 * Drawn at 1120x800, which is `CARD_ASPECT` exactly, so it fills the card frame
 * with no crop and no letterbox.
 *
 * It reads in three zones. The left tells the building story — watsonx, a
 * builder at a desk, and Bob in the foreground. The centre is the control
 * plane, and stays the largest thing on the canvas. The right is the ecosystem
 * it reaches: outside systems on dotted paths, and IBM's signature under them.
 *
 * Bob is deliberately outside the dashboard, unconnected to the workflow and
 * standing beside the builder rather than among the agent cards. He was a tool
 * used to implement the work; he is not one of the things the control plane
 * manages, and the composition has to say so without a word of explanation.
 */

/** The card frame's shape, so the drawing fills it exactly. */
const VIEW = { w: 1120, h: 800 };

/** IBM's own blues, so the picture sits in their world rather than near it. */
const BLUE = "#0F62FE";
const CYAN = "#08BDBA";
const PURPLE = "#8A3FFC";
const NAVY = "#0A1F44";

/**
 * The control plane's own box.
 *
 * It moved right and shrank a little to open a left column for the builder
 * story, and it is still 60% of the canvas wide — by a wide margin the largest
 * object here, which is the hierarchy the brief asks for.
 */
const BOARD = { x: 316, y: 160, w: 668, h: 396 };

/** The three agent cards. Varied on purpose — a row of identical ones reads as
 *  wallpaper rather than as a list of different things. */
const AGENTS = [
  { x: 340, glyph: "a", dot: "#24A148", line: 100, sub: 68, active: false },
  { x: 552, glyph: "b", dot: BLUE, line: 84, sub: 56, active: true },
  { x: 764, glyph: "c", dot: "#F1C21B", line: 112, sub: 74, active: false },
];

/** The workflow chain across the foot of the dashboard. */
const FLOW = [368, 456, 544, 632];

export function IbmControlPlaneArt({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <svg
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        className="h-full w-full"
        role="img"
        aria-label={`${title} — an abstract control plane dashboard showing AI agents, an agentic workflow and monitoring`}
      >
        <defs>
          {/* Kept close to white on purpose. Every other card on My Projects
              is a hero screenshot on off-white, so a card tinted edge to edge
              sat heavier than the four beside it — the brief's own last check.
              The tint and the two glows are halved from the first pass. */}
          <linearGradient id="cp-bg" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F3F7FD" />
          </linearGradient>
          <radialGradient id="cp-glow-blue">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.085" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cp-glow-purple">
            <stop offset="0%" stopColor={PURPLE} stopOpacity="0.065" />
            <stop offset="100%" stopColor={PURPLE} stopOpacity="0" />
          </radialGradient>
          {/* Two stops each, not three. One gradient running blue to cyan to
              purple across the whole stack read as a rainbow stripe, which is
              exactly what the brief rules out. */}
          <linearGradient id="cp-panel-near" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.44" />
            <stop offset="100%" stopColor={CYAN} stopOpacity="0.34" />
          </linearGradient>
          <linearGradient id="cp-panel-far" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.3" />
            <stop offset="100%" stopColor={PURPLE} stopOpacity="0.26" />
          </linearGradient>
          <linearGradient id="cp-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={BLUE} />
            <stop offset="100%" stopColor={CYAN} />
          </linearGradient>
          <linearGradient id="cp-b" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={BLUE} />
            <stop offset="100%" stopColor={PURPLE} />
          </linearGradient>
          <linearGradient id="cp-c" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={CYAN} />
            <stop offset="100%" stopColor={BLUE} />
          </linearGradient>
          <linearGradient id="cp-bar" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={BLUE} />
            <stop offset="100%" stopColor={CYAN} />
          </linearGradient>
          <filter id="cp-lift" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow
              dx="0"
              dy="10"
              stdDeviation="16"
              floodColor={NAVY}
              floodOpacity="0.1"
            />
          </filter>
          <filter id="cp-lift-sm" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="7"
              floodColor={NAVY}
              floodOpacity="0.11"
            />
          </filter>
        </defs>

        <rect width={VIEW.w} height={VIEW.h} fill="url(#cp-bg)" />
        <ellipse
          cx="300"
          cy="140"
          rx="340"
          ry="240"
          fill="url(#cp-glow-blue)"
        />
        <ellipse
          cx="900"
          cy="660"
          rx="300"
          ry="220"
          fill="url(#cp-glow-purple)"
        />

        {/* ── LEFT: who builds it ─────────────────────────────────────── */}

        {/* watsonx, at the size of a product mark rather than a favicon. The
            supplied file, scaled and placed; nothing drawn over or around it. */}
        <image
          href="/images/ibm/watsonx-mark.a98aad79.png"
          x="62"
          y="54"
          width="116"
          height="116"
        />

        {/*
          The builder, and the screen of code above the desk: both lifted
          straight out of the supplied illustration rather than drawn here.

          They keep the spacing they have in the original — the screen sits
          101/364ths of the figure's width to its left and 90/364ths above it,
          scaled by the same factor — so the pair reads as the one object it
          was drawn as, at whatever size the card gives it.

          Using the two pieces rather than the whole illustration is what keeps
          the control plane in the lead: dropped in whole, its own panel stack
          and platform sat level with the dashboard and the two argued.

          Each is masked to its own shape rather than cut as a rectangle. The
          dotted paths that run between the objects in the original pass through
          the boxes around them, so a plain crop brought along a tail of loose
          dots — a thousand stray pixels on the figure alone.
        */}
        <image
          href="/images/ibm/code-screen.4b644606.png"
          x="90"
          y="233"
          width="80"
          height="108"
        />
        <image
          href="/images/ibm/builder.07937f0d.png"
          x="150"
          y="286"
          width="160"
          height="215"
        />

        {/* One more surface from the same illustration, so the builder is not
            the only thing the control plane is reaching past. */}
        <image
          href="/images/ibm/phone.2ca97da3.png"
          x="296"
          y="612"
          width="128"
          height="89"
        />

        {/* Bob, in the foreground at the builder's feet. The supplied asset,
            untouched. He is the tool the work was built with, so he stands
            outside the dashboard with nothing wired to him — see the note at
            the top of this file. */}
        <ellipse cx="175" cy="733" rx="56" ry="9" fill={NAVY} opacity="0.07" />
        <image
          href="/images/ibm/bob.5b28425e.png"
          x="112"
          y="540"
          width="126"
          height="195"
        />

        {/* ── RIGHT: what it reaches ──────────────────────────────────── */}

        <g
          stroke="#8FABD6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1 11"
          fill="none"
          opacity="0.85"
        >
          {/* builder → control plane */}
          <path d="M244 272 C 274 232, 300 214, 318 210" />
          {/* control plane → the systems it governs */}
          <path d="M986 274 C 1002 262, 1008 254, 1022 244" />
          <path d="M986 402 C 1006 404, 1016 406, 1032 409" />
          <path d="M986 504 C 1000 524, 1006 538, 1012 556" />
        </g>

        <ExternalNode cx={1046} cy={236} glyph="data" />
        <ExternalNode cx={1056} cy={410} glyph="grid" />
        <ExternalNode cx={1034} cy={576} glyph="agent" />

        {/* ── CENTRE: the control plane ───────────────────────────────── */}

        {/* Panels receding behind it: many systems, one surface. */}
        <rect
          x="368"
          y="118"
          width="564"
          height="110"
          rx="14"
          fill="url(#cp-panel-far)"
          opacity="0.62"
        />
        <rect
          x="342"
          y="138"
          width="616"
          height="110"
          rx="16"
          fill="url(#cp-panel-near)"
          opacity="0.82"
        />

        <g filter="url(#cp-lift)">
          <rect
            x={BOARD.x}
            y={BOARD.y}
            width={BOARD.w}
            height={BOARD.h}
            rx="20"
            fill="#FFFFFF"
            stroke="#E2E9F5"
            strokeWidth="1.5"
          />
        </g>

        {/* Window chrome, and two placeholder controls. No words anywhere. */}
        <circle cx="356" cy="196" r="5" fill={BLUE} />
        <circle cx="374" cy="196" r="5" fill="#D7E1F0" />
        <circle cx="392" cy="196" r="5" fill="#E6EDF8" />
        <rect x="868" y="190" width="48" height="12" rx="6" fill="#E8EEF9" />
        <rect x="924" y="190" width="36" height="12" rx="6" fill="#E8EEF9" />
        <line
          x1="340"
          y1="218"
          x2="960"
          y2="218"
          stroke="#EDF1F9"
          strokeWidth="2"
        />

        {AGENTS.map((agent) => (
          <AgentCard key={agent.x} {...agent} />
        ))}

        {/* The workflow: agents are not only managed one at a time, they run in
            sequence, and the sequence branches. */}
        <g>
          {FLOW.slice(0, -1).map((x, i) => (
            <g key={x}>
              <line
                x1={x + 17}
                y1="438"
                x2={FLOW[i + 1] - 21}
                y2="438"
                stroke="#C6D6EE"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d={`M${FLOW[i + 1] - 26} 432 L${FLOW[i + 1] - 18} 438 L${FLOW[i + 1] - 26} 444`}
                fill="none"
                stroke="#A8C0E4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ))}
          <path
            d="M456 451 C 456 478, 472 484, 494 484"
            fill="none"
            stroke="#C6D6EE"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle
            cx="506"
            cy="484"
            r="9.5"
            fill="#FFFFFF"
            stroke="#BFD2EC"
            strokeWidth="2.5"
          />
          <circle cx="506" cy="484" r="3" fill="#A8C0E4" />

          <circle cx={FLOW[0]} cy="438" r="13" fill={BLUE} />
          <circle cx={FLOW[0]} cy="438" r="4.5" fill="#FFFFFF" />
          {FLOW.slice(1, 3).map((x) => (
            <g key={x}>
              <circle
                cx={x}
                cy="438"
                r="13"
                fill="#FFFFFF"
                stroke="#BFD2EC"
                strokeWidth="2.5"
              />
              <circle cx={x} cy="438" r="4" fill="#8FABD6" />
            </g>
          ))}
          <circle cx={FLOW[3]} cy="438" r="13" fill="url(#cp-c)" />
          <circle cx={FLOW[3]} cy="438" r="4.5" fill="#FFFFFF" />
        </g>

        <line
          x1="668"
          y1="390"
          x2="668"
          y2="500"
          stroke="#EDF1F9"
          strokeWidth="2"
        />

        {/* Watching it run: a ring broken into states, and a few levels. No
            numbers, because a number here would either be meaningless or be
            something I am not free to show. */}
        <g transform="translate(730 438)">
          <circle r="32" fill="none" stroke="#E9EFF9" strokeWidth="11" />
          <circle
            r="32"
            fill="none"
            stroke={BLUE}
            strokeWidth="11"
            strokeDasharray="110 91"
            strokeLinecap="round"
            transform="rotate(-90)"
          />
          <circle
            r="32"
            fill="none"
            stroke={CYAN}
            strokeWidth="11"
            strokeDasharray="44 157"
            strokeDashoffset="-118"
            strokeLinecap="round"
            transform="rotate(-90)"
          />
        </g>
        <g>
          <rect x="800" y="454" width="18" height="26" rx="5" fill="#CFDCF2" />
          <rect x="834" y="436" width="18" height="44" rx="5" fill="#CFDCF2" />
          <rect x="868" y="446" width="18" height="34" rx="5" fill="#CFDCF2" />
          <rect
            x="902"
            y="424"
            width="18"
            height="56"
            rx="5"
            fill="url(#cp-bar)"
          />
        </g>

        {/* The signature, last and quietest. Bigger than it was, and still a
            third of watsonx's area, which is the order the branding wants: the
            product mark leads, the company signs. Its corner is unchanged —
            the extra size is taken inward, not out of the margin. */}
        <image
          href="/images/ibm/ibm-logo.85026a1f.png"
          x="902"
          y="687"
          width="156"
          height="62"
        />
      </svg>
    </div>
  );
}

/** One agent in the list: a mark, a state, and two lines standing for its name
 *  and whatever metadata belongs beside it. */
function AgentCard({
  x,
  glyph,
  dot,
  line,
  sub,
  active,
}: {
  x: number;
  glyph: string;
  dot: string;
  line: number;
  sub: number;
  active: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y="236"
        width="196"
        height="114"
        rx="13"
        fill={active ? "#F1F6FF" : "#F8FAFE"}
        stroke={active ? "#A9C7FF" : "#E6EDF8"}
        strokeWidth={active ? 2 : 1.5}
      />
      <rect
        x={x + 18}
        y="254"
        width="30"
        height="30"
        rx="9"
        fill={`url(#cp-${glyph})`}
      />
      {/* A hexagon node rather than a disc: a filled circle inside a square
          reads as a camera lens, which is the one thing this must not look
          like. A hexagon is how an enterprise diagram draws a module. */}
      <path
        d={`M${x + 33} 261 l6.5 3.8 v7.6 l-6.5 3.8 l-6.5 -3.8 v-7.6 Z`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx={x + 33} cy="269" r="2.1" fill="#FFFFFF" />
      <circle cx={x + 178} cy="263" r="4.5" fill={dot} />
      <rect
        x={x + 18}
        y="302"
        width={line}
        height="9"
        rx="4.5"
        fill="#D5E0F1"
      />
      <rect x={x + 18} y="319" width={sub} height="7" rx="3.5" fill="#E7EDF8" />
    </g>
  );
}

/** A system outside the control plane, reduced to the kind of thing it is. */
function ExternalNode({
  cx,
  cy,
  glyph,
}: {
  cx: number;
  cy: number;
  glyph: "data" | "grid" | "agent";
}) {
  return (
    <g filter="url(#cp-lift-sm)">
      <circle
        cx={cx}
        cy={cy}
        r="24"
        fill="#FFFFFF"
        stroke="#DEE7F4"
        strokeWidth="1.5"
      />
      {glyph === "data" ? (
        <g fill={BLUE}>
          <rect x={cx - 10} y={cy - 9} width="20" height="4.5" rx="2.25" />
          <rect x={cx - 10} y={cy - 2.25} width="20" height="4.5" rx="2.25" />
          <rect x={cx - 10} y={cy + 4.5} width="13" height="4.5" rx="2.25" />
        </g>
      ) : glyph === "grid" ? (
        <g fill={BLUE}>
          <circle cx={cx - 6} cy={cy - 6} r="3.4" />
          <circle cx={cx + 6} cy={cy - 6} r="3.4" />
          <circle cx={cx - 6} cy={cy + 6} r="3.4" />
          <circle cx={cx + 6} cy={cy + 6} r="3.4" fill={CYAN} />
        </g>
      ) : (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r="9"
            fill="none"
            stroke={BLUE}
            strokeWidth="3"
          />
          <circle cx={cx} cy={cy} r="3" fill={CYAN} />
        </g>
      )}
    </g>
  );
}
