# Framer port notes

This app is a hand-built port of the Framer project **Anne Profolio (v4.0)**
(`WE8GkcO35Gct6AiLOZuW`). Framer has no React export, so every screen is rebuilt
from the node tree read through `@framer/agent`, with the original artwork
downloaded into `public/`.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4, configured in `src/app/globals.css` via `@theme`
- `motion` for the animation work, `lenis` available for smooth scroll

## How Framer concepts map

| Framer | Here |
|---|---|
| Colour styles | CSS custom properties in the `@theme` block |
| Text styles | `.ts-*` component classes, stepping at Framer's own breakpoints |
| Breakpoints | phone `< 810`, `tablet: >= 810`, `desktop: >= 1200` |
| Layout template "Main" | `src/app/layout.tsx` |
| Appear / Parallax / Drag / Loop / Text effects | `src/lib/framer-effects.tsx` |
| Canvas components | `src/components/**` |

The effect components take Framer's serialised effect objects more or less
verbatim, so a node can be translated without reshaping its data. Framer writes
transitions as strings such as `spring-duration 1.4s 0 0.8s`; `parseTransition`
turns those into motion transitions.

## Extraction gotchas worth knowing

**The agent serialiser silently drops vector and icon nodes.** The home hero
contains four "Vector" instances (the sparkle, the smiley and the butterfly,
plus one hidden). `framer.agent.serialize` and `getDescendantsOfTypes` both omit
them; only the raw plugin API (`framer.getChildren`) lists them. Always
cross-check a section with `getChildren` before assuming the tree is complete.

**Those vectors cannot be exported.** `framer.exportSVG` refuses them because
they are icon-set instances, and `framer.screenshot` returns them on an opaque
background. They are redrawn as inline SVG in `src/components/site/Doodles.tsx`
at their recorded sizes.

**One component cannot be read at all.** `Q3te4gud1` ("CTA button") fails to
serialise with *Could not resolve the icon set for variable "Icon"* — a broken
reference inside the Framer file. It was rebuilt from a rendered capture as
`src/components/site/CtaButton.tsx`. Fixing the icon reference in Framer would
let it be read properly.

**Each breakpoint is a separate subtree.** The Desktop, Tablet and Phone frames
hold independent copies of every node with their own values, so per-breakpoint
work means serialising that frame, not inferring from Desktop.

## Open discrepancy: Heading 1 size on desktop

Framer's Heading 1 text style stores these breakpoints:

| Range | Stored size |
|---|---|
| `>= 1200px` | 96px |
| `>= 810px` | 56px |
| base | 80px |

Every render of the Desktop frame measures the heading at **80px**, and 80px is
the only size that keeps "Hi, this is Anne Lin" on one line inside its 720px
box. At 96px it wraps. The port uses 80px on desktop to match the render; the
measured heading is 685px wide against Framer's 686px.

If the intent really was 96px, change `.ts-heading-1` in `globals.css` and widen
the heading's `max-width`, because the headline will otherwise break to two
lines.

## Other places the render and the data disagree

**Hero tagline width.** Framer stores `max-width: 720px`, but at 720px the line
breaks after "complexity" and the paragraph is two lines. Framer renders three,
breaking after "transforming", which puts its real box between 664px and 707px.
The port uses 690px so the break matches.

**Every project-card frame is the same shape, and it is chosen so that filling
it crops nothing.** These thumbnails are case-study boards with the project title
along their top edge, so a frame much wider than the board crops that title off,
which is what a fixed frame used to do at most widths. Giving each frame its own
artwork's shape fixed the cropping but broke the pairing: two cards side by side
came out with different picture heights and their titles on different lines.

`CARD_ASPECT` in `src/lib/thumbnails.ts` is the single frame all of them use.
The boards run from 1.30 to 1.54 wide and 1.40 is the shape that fills for all
of them without cutting anything: the near-square boards lose about 3.6% off the
top and bottom, well clear of their titles, and the Ryze banner loses 9% off one
side, which `object-position: left` puts on the right so its logo survives.
Measured at six widths, a pair now matches to the pixel in card size, picture
size and the line its title sits on.

Four thumbnails needed trimming for that to work. In each the artwork was a panel
floating inside a page-coloured margin, and the two Taipei files also carried
about 90px of the *next* section of the deck along the bottom:

| File | Was | Now |
|---|---|---|
| `/images/3ERWzAf6UfkLtaIEjZLUSpUyAU.jpg` | 751x734 | 748x568 |
| `/images/lKiiHwCIn6KBdznWwKf5t8dwA.jpg` | 710x672 | 690x547 |
| `/pages/HJx3zAPx9dMFv6Krt8lKlh5oew4.jpg` | 757x734 | 749x568 |
| `/pages/HDZF8LdEMPMB2bBzoQG4sBfLB2E.jpg` | 697x672 | 690x547 |

That tail is also why the old crop drifted against Framer: Framer's own copies do
not carry it, so its frame and this one were never cropping the same picture. All
four are re-encoded at 0.85 and are smaller than the files they replace.

Because the covers now follow their artwork, the card heights follow their covers
rather than being fixed, and the two-up row on the home page stretches so the
pair still ends level. The badge and the arrow sit on `mt-auto`, which holds them
against the bottom edge whatever the copy above runs to: the arrow keeps the
card's own padding from the bottom and the right on all three card shapes and at
every width. Neither the copy column nor its footer carries a height of its own,
because an explicit height opts a flex item out of the stretch and was what used
to leave the large card's arrow floating 243px up under the summary. The closing "More Projects" strip on the case studies is
left on its fixed 480x320 frame: its six thumbnails run from 0.84 to 2.48 wide,
so per-artwork frames there would leave a two-up row wildly ragged, and nothing
readable is lost to that crop.

**Hero artwork fit.** The boxes and the source images have different aspect
ratios: the rooster is 689x1447 inside a 198x252 box. Framer's render shows the
whole painting, and its measured bounding box matches `contain` to the pixel, so
the port uses `object-contain` rather than cropping.

**Arc text curvature.** The "Arc text" component is not readable through the
agent API; its stored controls say `height: 0`, which would be a straight line,
yet every render is curved. The geometry was measured off Framer's own renders
instead: the string is 173px wide in both the Desktop and the Tablet frame, its
two end baselines sit level with each other, and the middle of the line rides
about 11px higher. A circle of radius 337 gives exactly that rise, and it is
also the curvature at the top of the 623x581 ellipse the instance is drawn on.
`ArcText` draws that circle as an SVG `textPath` with the string centred on it,
at 16.5px, which is the size that measures 173px wide here.

**Work card covers.** Superseded: see "Work card covers fit their artwork"
above. The port used to crop these to fill the frame; it fits them instead,
because the frames and the thumbnails are different shapes and the crop was
cutting the project titles out of the artwork.

## The home hero

Framer holds three separate frames for this section and they are not variations
on one layout, so all three are transcribed literally in `Hero.tsx` from their
own node values rather than derived from one another:

| | Desktop | Tablet | Phone |
|---|---|---|---|
| Stage | 1048x572 | 798x340 | 390x613 |
| Section height | 100vh | 100vh | fit-content |
| Heading | 80px, left aligned in a 720px box | 83px, centred in 500px | 48px, centred in 300px |
| Rooster layer | 198x252 at (-21,-76) | a different layer, 141x180 at (41,-141) | 80x101 at (45,17) |
| Arc text | yes | yes | hidden |
| Appear effects | yes | yes | none |
| Drag effect | yes | yes | none |

Two things about the container matter more than any single offset. The stage is
a fixed size centred inside a section that clips at the page's 40px column, and
on tablet and phone the stage is **wider** than that column, so artwork is
deliberately cut off at the column edge. That clip is also what keeps the
overhang away from the page scrollbar. Because the column follows the viewport
rather than the 1200px reading width, the section breaks out of `main` with
`width: calc(100vw - 80px)` and matching negative margins.

The two-second detail: Framer's tablet sparkle is 50x60, not square, so the
doodles take an explicit width and height and let their viewBox stretch.

### Interactions that are not literal ports

- **Tap on an artwork.** Framer's own tap effect is `scale 0.9` plus a rotation
  offset that differs per layer (-17, -8, 20, 15 degrees), held only while the
  pointer is down. The port keeps those exact values but holds the pose for
  three seconds after the tap and then eases back over a slower, flat spring,
  which is what was asked for. The rotation target is always absolute, never
  incremented, so repeated taps cannot drift the resting angle.
- **Butterfly cursor wingbeat.** The beat was halved in speed, to roughly 1.1s
  per open-and-close, and the `|cos|` drive was replaced with a raised cosine so
  the wings ease through the bottom of the stroke instead of snapping back.
  Both the beat and the flight are now driven off elapsed time, so a 120Hz
  display no longer runs them at double speed.

### Space above "Selected Work"

Framer gives the three home sections the same 50px between them, 60px on phone,
and the port matches that. What differs is the whitespace inside them: the hero
is 100vh with its stage centred, so a lot of empty canvas sits under it, and
against that the run from the last ability tag into "Selected Work" reads as
cramped even though it is close to Framer's own. Measured at 1200, Framer leaves
119px there and the port left 105px.

Selected Work now carries 70px of top padding of its own, 40px on phone, which
takes that gap to 175px and 164px. This is the one piece of home page spacing
that is deliberately not Framer's.

### The home page at phone width

Three things were sized off the Desktop frame rather than the Phone frame and
have been corrected against Framer's own phone render:

| | Was | Framer's Phone frame |
|---|---|---|
| About me button | 160x55 | 152x42, 14px label, 21px mark |
| Ability tags | one per row, two missing | two per row, 35px tall |
| Work cards | 350px side-by-side and 540px stacked | one 310px stacked card, 276x224 cover |

**Two of the ability tags never appeared at all.** The scattered field gives
each tag its own flying entrance, and several of them start 200px to the side.
On a 390px screen that puts the tag outside the viewport, so the observer meant
to bring it back never fires and the tag stays invisible and out of position,
which is also what pushed the rest of the row out of alignment. The phone tags
now fade and rise 12px in reading order, 50ms apart.

Framer also shortens two labels on phone, to "UX Design" and "UI Design", and
lays the eight tags out in a different order from the scattered field. Both are
reproduced. The pills sit 12px in from the label rather than Framer's 15px,
because this build of DM Sans sets the longer labels about 7% wider and at 15px
two rows came out a pixel over the 310px column.

**The phone cover is 276x224 for all three cards,** which is what Framer draws.
Cropping the Ryze banner to that box cut off its logo and half its headline, and
Framer's own render does not do that; it stretches the banner about 20%
vertically instead. Neither is needed now that every cover fits rather than
fills.

## Responsive pass against Framer v4.0

A page-by-page audit against the Framer frames, at 1440, 810 and 390.

**Which frames Framer actually has.** Not every page is designed at all three
sizes, which bounds what can be matched:

| Page | Desktop frame | Tablet | Phone |
|---|---|---|---|
| `/` | 1200 | yes | yes |
| `/about` | 1200 | yes | yes |
| `/my-projects` | **1440** | yes | yes |
| `/resume` | **1440** | yes | yes |
| `/projects/taipei-metro-app` | 1200 | yes | yes |
| `/projects/budgetcart` | 1200 | yes | yes |
| `/projects/ryze-coffee` | 1440 | none | none |
| `/projects/jubo-healthcare` | 1200 | none | none |
| `/projects/little-chestnut-thief` | 1200 | none | none |

Three case studies have no tablet or phone frame at all, so below 1200 there is
no Framer composition to reproduce for them and the port reflows on its own.

### What the audit found, and what changed

**The nav was switching variant at the wrong breakpoint.** Every Framer tablet
render shows the compact "Open to opportunities" pill, not the full link row.
The port switched at 810, so from 810 to 1199 it showed a nav Framer never
shows. The switch moved to 1200, which is where Framer's desktop frame begins.
This affects every page.

**`/my-projects` cards were side by side on tablet.** Framer's tablet frame
stacks them: thumbnail across the full width, then badge, title, description and
tools underneath. The port kept the desktop row from 810 up, which squeezed the
copy into a narrow column and wrapped "Taipei Metro Point Redesign" onto four
lines. The row now starts at 1200. Page height at 810 went from 2665px against
Framer's 3458px to 3793px.

**The desktop thumbnail was 28% too wide.** Framer's measures 402px in a 1120px
column at 1440; the port drew 515px. It is 402px from 1200 up, which is where
the port's column is also 1120px wide. Page height at 1440 went from 2471px
against Framer's 2191px to 2144px.

### Fluid behaviour between the keyframes

Framer itself is not fluid: it snaps between frames at 810 and 1200. Two places
where that snap was large enough to see while dragging the window are now
interpolated instead.

**Type.** Eight heading styles stepped at 810 and again at 1200. They now ramp
between Framer's own values and still land on them exactly at the reference
widths:

| Style | 390 | 810 | 1200 and up |
|---|---|---|---|
| Heading 1 | 56 | 80 | 80 |
| Heading 2 | 42 | 48 | 72 |
| Heading 3 | 24 | 32 | 55 |
| More Projects | 30 | 44 | 60 |

**The Skills field.** Framer draws it at a fixed 1060x687 and it has to be
scaled to fit anything narrower. The port stepped that scale at 1200, so the
whole field jumped 39% as the window crossed it. `.skills-stage` interpolates
from 0.72 at the tablet breakpoint to 1 at the desktop one, using
`tan(atan2())` because that is the one way CSS can turn a width into the plain
number a `scale()` needs. Browsers without those functions get the old stepped
pair as a fallback.

### What still differs

The hero, the About shortcuts and the Skills layout each swap composition at
Framer's breakpoints, because those are three separately drawn compositions
rather than one that moves. That swap is Framer's own and reproducing it means
reproducing the jump. Within each range the port is fluid.

## The Taipei case-study hero

Rebuilt against Framer's Desktop frame after a side-by-side comparison. Five
things differed:

- **The category badge stretched the full column.** It is a flex child, so
  without `self-start` it filled the width instead of hugging its label.
- **The sidebar carried four sub-entries** under User Research. Framer's rail
  lists the six sections flat.
- **The artwork was the wrong composition.** The port had the mascot and the
  Metro Taipei mark stacked in a column to the right of the handset, with two
  pale tint circles behind. Framer has a collage: green triangles in the
  top-right, the mark to the left of the handset, a solid blue disc behind its
  lower-left, and the mascot overlapping that disc.
- **The Metro Taipei file is mostly margin.** Its artwork occupies 62% by 57% of
  a 1720x1420 canvas, so `contain` drew it at about a third of the size Framer
  shows. Trimmed to 1083x820.
- **The lede was three times too big on tablet.** `.ts-body-large` steps to 32px
  at that breakpoint; Framer sets about 14px here.

The collage is now a 550x594 stage with every piece placed as a percentage of
it, measured off Framer's frame. All six land within 2px of Framer's own
positions:

| Piece | Framer | Port |
|---|---|---|
| Stage | x 610, 550 wide | x 610, 550 wide |
| Green triangles | x 895, y 178 | x 895, y 180 |
| Metro Taipei mark | x 661, y 317, 131x91 | x 661, y 319, 131x91 |
| Handset | x 833, y 222, 264 wide | x 833, y 224, 264 wide |
| Mascot | x 622, y 590, 170x153 | x 622, y 592, 170x153 |
| Blue disc | centre 880, 635 | centre 880, 637 |

The green triangles are drawn as SVG rather than an image: they are Framer
vector shapes, so there is no asset to pull. They are four right-angled
triangles on a 136 by 128 grid, which is the tiling Framer's own render shows.

`PhoneMockup` gained a `fluid` mode for this. Everything it used to derive from
a pixel width is written in `cqw` there, one percent of its container, so the
handset scales with the stage and keeps its proportions. The other pages still
use the fixed-width mode.

Two ratios ramp rather than step, so the split moves smoothly between Framer's
frames: the text column's cap runs from 240px at the tablet breakpoint to 424px
at the desktop one, and the lede from 14px to 20px across the same span.

### The section rail: two layouts, one component

Asked for directly, not Framer's own layout, and shared by every case study that
passes a section list. It switches at 1200, which is where Framer's own Desktop
frame takes over from its Tablet frame for these pages.

**From 1200 up** the list is simply open, floating in the left gutter 150px in
from the edge of the window. No hamburger: there is room for the list there, so
nothing is hidden. A spacer stays in the flow, so the article keeps the width and
position measured off Framer, and the Taipei title still starts at x 209 at 1200.

**Below 1200 the list opens by pushing the article, not by covering it.** It is
a column in the flow beside the article at every width: narrow enough for just
the button while closed, the full list while open. Widening it is what moves the
article across. Nothing is laid over the page, nothing is dimmed, and the reader
can keep scrolling and clicking the case study with the list open.

It got there the long way. It was first a bar above the article with the list
dropping out underneath, then a screen over the viewport in the page's own colour
behind an 8px blur, then a drawer floating over the content. All three read as
leaving the case study rather than looking something up in it, and none of them
is what Framer does.

Framer's own component is `FloatingSidebarMenu`, a code component in the project.
Its source is not readable through the agent API and its canvas instances are 1px
placeholders, so its geometry came off the rendered screenshots instead, scaled
against the site's nav pill: the article moves right by about 150px when the list
opens, which is the same 150px the Desktop frame gives the rail. That one value
carries across the breakpoints, tapering to 120 on the phone, which has no room
for 150.

**One thing in this column is not in the Framer reference: "All Projects".** The
screenshots show the list starting straight at the first section. The link was
asked for separately, so that someone arriving on a case study from a search
result or a shared link has a way further into the portfolio rather than only a
way back out of the browser, and it is a real link to the projects index for
exactly that reason. Its old home was the bar above the article, which the push
layout does away with, so it sits at the top of the column instead. Say the word
and it comes out.

The close sits on the first entry's line at the far edge of the column, where
Framer puts it, rather than in a header of its own. Choosing a section does not
close the list, also following Framer: the reader keeps it open and moves around
the page with it.

Two states are laid over each other inside the column and cross-faded, so its
contents never rewrap while it is moving. The list is the one in the flow,
because it is the taller of the two and the column would otherwise clip it.

**Making room moves the reader, and that had to be undone.** Narrowing the
article rewraps its text, so everything above the viewport grows taller and
carries the page down under the reader. Measured before it was fixed, that was
worth 1161px at 390 and a few hundred at the middle widths.

There is nothing to lock, because nothing is being scrolled. Instead a heading
already on screen is taken as an anchor, and for as long as the column is moving
the page is nudged to keep that heading exactly where it was. The reader sees
pure horizontal movement. It is a plain scroll write rather than anything the
smooth-scroll library has to be stopped for; the library is idle between
gestures, so it is told the new position and left running. Opening and closing
now holds the view inside 1px at every width from 390 up, at the middle of the
page and near its end. At the very top there is nothing to hold: the page is
already at offset 0 and cannot move up, so the article's own rewrap shows.

The push is a layout change, which the earlier overlay went out of its way to
avoid. Here it is unavoidable, since content that shifts without narrowing would
run off the right edge, so it was measured rather than assumed: layout costs
0.25ms a pass, no frame after the first open exceeds the budget, and the worst is
19ms. The first open costs one 40ms frame, and profiling puts that in paint,
where a subtree first appearing always costs something.

The menu closes on the cross and on Escape. Choosing a section smooth-scrolls to
it and writes the anchor into the URL.

Two things about that scroll were not obvious:

- **It has to go through the page's smooth-scroll instance.** A plain anchor
  jump fights it, so `SmoothScroll` publishes its instance and the rail scrolls
  through that, falling back to `window.scrollTo` where there is none.
- **It corrects itself once the page stops.** Sections above settle by about
  140px while the page is travelling, which left the chosen heading short of
  where it was aimed, so one correction pass runs at the end. Measured, the
  chosen section lands 108-110px below the viewport top, clear of the pinned
  page nav.

### Prioritize Strategy, Little Jie and Impact

- **The priority axis was a plain rule.** Framer draws a dashed run ending in an
  arrowhead, in deep blue. The dashes are a repeating gradient rather than a
  dashed border, so their length and spacing are set rather than left to the
  browser, and the arrowhead is its own SVG so it is not stretched by the line.
- **The Little Jie block was two columns and carried the wrong asset.** Framer
  sets it in one: the italic lead, what the assistant does, the line it would
  say, then the artwork across the full width. The port also repeated the yellow
  speech bubble there, which belongs to the "Why?" block much earlier on the
  page. That artwork is a transparent PNG and Framer stands it on a pale blue
  panel, so the panel is the wrapper's rather than the file's.
- **The Impact close had no sparkles and no colour.** Framer flanks it with them
  and colours the second half: the feature in deep blue, what happened to it in
  green.

### Strategy Evolution is a timeline

Not Framer's own design; asked for directly. The five steps are numbered and the
dots are joined by a line that runs on through the gap to the next one. The
connector hangs off the row rather than off the rail, `top: 30px` with a height
of `calc(100% + 44px)`, so it reaches the next dot whatever that row's content
adds up to: the row's own height, less the 30px down to the dot's underside,
plus the 74px gap. Anchoring it to the rail instead left it stopping short,
because the rail is only as tall as the dot and its label.

The line is drawn from tablet up only. Below that the step sits above its
content rather than beside it, and a vertical line would run straight through
the copy.

`Accordion` was a plain underlined row with a chevron. It is a filled bar with a
plus now, and hovering a closed one turns it orange with white text and a white
plus. Open, it becomes a panel: the summary grows to a heading, the plus becomes
a close cross in orange, and the hover tint is dropped so it never sits behind
the body copy.

### Three section images were on the wrong sections

The clearest fault found by walking Framer's own image tree, which names the
section each asset belongs to:

| Asset | Framer's section | Was on |
|---|---|---|
| `pNyfX9DrGQ19Zt7RnUUADVb24.png` | Target User | Reward System Comparison |
| `D5kodJ1CD0Cjg7IhFE0pqpadrRI.png` | Reward System Comparison | Design Strategy |
| none | Design Strategy | — |

So the diagrams had slipped one section down the page: the rider-segment circles
were captioned as a comparison of reward systems, the reward matrix was standing
in for the design strategy, and Target User had no diagram at all. Framer gives
Design Strategy no image, so it no longer has one.

Both sections were also single-column with the image beneath. Framer sets them
side by side: the segment circles beside the numbered list, the reward matrix to
the left of its three findings.

### Solution Overview and Key Research Insights

- **The sub-points carried a second bullet.** Framer indents them under the star
  with no marker of their own, since the arrow that opens each line is the
  marker. Fixed in `StarPointList` rather than on the page.
- **"Skip to Redesign Details" sat at the left.** Framer centres it.
- **The research quotes were a tight stack with the brain on the left.** Framer
  scatters the three at different indents, sets a large quote mark at the bottom
  left of the group, and puts the brain on the right. The quote that runs
  alongside the brain is held to 31% so the two never touch.

### Project context

Four more differences in the section below the hero:

- **The two feature headings had no icons.** Framer sets a subway glyph beside
  "Metro Navigation" and a shopping-bag glyph beside "Metro Point (Shopping)".
  Both are drawn as SVG, since they are icon-set glyphs with no asset to pull.
- **Their lists used discs.** Framer ticks them. `BulletList` takes a
  `marker="check"` now so the change is in the shared component rather than
  inlined here.
- **The "However" line was small, italic and beside the character.** Framer runs
  it across the full column at 20px in title case, with the 72% set about half
  again as large and underlined by hand.
- **"Why?" was plain text under the character.** It belongs inside the yellow
  speech bubble, which is an asset the repo already had and nothing was using:
  `szP9tqheMkCDg6ZTNmU78RB1jo.png`. The bubble and the character now sit side by
  side to the right of centre, as Framer places them.

## Verifying against Framer

Captures of the Framer frames live outside the repo. To compare, run the app and
screenshot it at a **764px viewport height**, which is what Framer's own capture
used. At that height the home page is 3138px tall and the deep-blue text spans
976px starting at x=111, matching Framer exactly. Capturing at a different
height shifts everything below the hero, because the hero is `100vh`.

## Case study compromises

Five case studies are ported: Taipei Metro, BudgetCart, Jubo Healthcare, Little
Chestnut Thief and Ryze Coffee. `/upcoming_projects` and `/frontend-projects`
are deliberately excluded, and no CMS is used anywhere; all copy and artwork is
inlined in the page components.

**A second serialiser gap.** Beyond the vector nodes noted above, rich text
blocks nest: a bullet list is a block holding item blocks holding the runs. An
extractor that reads only one level silently drops every bullet. The Ryze and
Taipei pages are full of these. Always walk rich text recursively.

**Components rebuilt from captures.** The agent API exposes these community and
project components only as names and control values, never their internals, so
each is reimplemented from its settings and a rendered capture:

| Framer component | Here | Basis |
|---|---|---|
| Smooth Scroll | `SmoothScroll` | Lenis, the same library underneath |
| ButterflyCursor | `ButterflyCursor` | its controls: size 2, smoothing 0.6, `#38BDF8` |
| iPhone Sim Mockup | `PhoneMockup` | drawn in CSS at iPhone 17 Pro proportions |
| Tab Component / Tab Btn | `Tabs` | three panels, stored spring timing |
| Accordion | `Accordion` | five panels, content read from its variants |
| Sidebar link | `SidebarNav` | labels and nesting from its controls |
| Slideshow | `Slideshow` | 11 slides, spring 200/40/1 as stored |
| Video | `VideoBlock` | 80% width, looping, muted, 10px radius |

The butterfly and the phone shell are the two where the drawing is mine rather
than Framer's. Everything else matches its stored configuration.

**A broken link fixed rather than copied.** The sidebar on BudgetCart's Desktop
variant points every entry at `/projects/taipei-metro-app`, which is a
copy-paste slip in the Framer file; its Tablet variant has the right anchors.
The port uses the BudgetCart anchors so the rail scrolls its own page.

**Artwork was downscaled.** Six of the case-study PNGs were exported at up to
32768px wide, 285MB in total. Framer serves resized variants, so nothing near
that resolution is ever displayed. Every image longer than 2800px on its longest
edge was resampled to 2800, taking the folder to 91MB with no visible change at
any layout width. Animated GIFs were left untouched and are marked
`unoptimized` so they keep moving.

**Typos are preserved.** "REDEISGN", "Jubo Heallthcare Platform", "Point
Redepmtion" and the rest are Framer's own text and are carried over as written,
since each page spells its neighbours differently.

**Little Chestnut Thief looks longer than Framer's capture.** Its Deliverable
image is 1139x2800 and renders 2458px tall. Framer's own screenshot failed to
draw it and left blank space, so the port is taller and correct.

## Height comparison

Measured at a 764px viewport, 1440px wide for Ryze:

| Page | Port | Framer frame |
|---|---|---|
| Home | 3138 | 3138 |
| Jubo Healthcare | 4952 | 4940 |
| BudgetCart | 12483 | 12084 |
| Taipei Metro | 16106 | 17247 |
| Ryze Coffee | 15254 | 13099 |
| Little Chestnut Thief | 5598 | 4224 |

Ryze and Little Chestnut differ because the Framer frame height stops before the
page does: Ryze's More Projects cards begin at 12780 in a frame reported as
13099, and Little Chestnut's tall image never rendered. Section by section, Ryze
tracks Framer within about 200px. Taipei is 6% shorter, spread across its media
blocks rather than concentrated anywhere.

## The About page

`/about` is a desktop metaphor rather than a document: a wallpaper fills the
viewport, six shortcuts sit at the anchor points Framer records, and each opens
a window at 90% by 80% of the desktop, matching Framer's 1080px at a 1200px
canvas. The dock opens the profile card and the notes panel, and its third icon
goes to LinkedIn.

Windows drag by their title bar, close on the red light or Escape, and each
carries the coverflow carousel Framer uses, one image centred with its
neighbours scaled back.

### The three breakpoints

Framer draws this page at all three sizes and moves the shortcuts between them,
so each one carries both anchors. Framer mixes two kinds of anchor and the port
keeps both as written, because they behave differently as the page widens: My
Sketchbook, Miles & Memories and Design Diary are pinned by a pixel offset,
while Olympus mju ii, Anne's Bakery and Where I Found Myself are pinned by a
percentage of the desktop.

| | Desktop and Tablet | Phone |
|---|---|---|
| My Sketchbook | left 168, top 96 | left 60, top 96 |
| Miles & Memories | left 228, bottom 149.2 | left 230, top 400 |
| Olympus mju ii | 43% / 49% | left 100, top 200 |
| Anne's Bakery | 68% / 62% | left 50, top 350 |
| Where I Found Myself | 74% / 41% | left 233, top 150 |
| Thumbnail | 80px, label 16px | 40px, label 12px |
| Dock | 19px up on desktop, 40px on tablet | 100px up |

Framer anchors each shortcut by the left edge of its group, which is as wide as
its widest child, so the card is centred over the label rather than the other
way round. The port matches that, and matches Framer's 96px card by using 6px of
padding around the thumbnail rather than 12px.

**Below the breakpoint the phone anchors scale with the desktop.** Held at their
390px values they left the shortcuts at 40px huddled in the top-left corner of a
768px screen with two thirds of the canvas empty. The factor is
min(width/390, height/613), Framer's own canvas, and it is written per value as
a `min()` of three lengths in `.about-shortcut`. That keeps it out of a
transform, which matters because the shortcuts are draggable and a scaled
ancestor would make them outrun the pointer. Any slack left over is split either
side so the composition sits in the middle of the desktop.

The card and the label scale on width alone, with height taking over only on a
genuinely short screen, and the width term reaches Framer's tablet values just
before the breakpoint. So the thumbnail runs 40px to 78px across the phone range
and steps only 2px as the composition swaps, rather than doubling.

The desktop also keeps a 680px floor under itself. Framer's wider composition
pins one shortcut 49% down and another 149px up from the bottom, and those two
start to collide below about 645px of canvas, which a phone held sideways
reaches.

**Design Diary is the one anchor that is not Framer's.** Framer pins it at left
1000, which is off the canvas on both the Tablet and the Phone frame, so on
anything under 1200px wide the folder cannot be seen or opened at all. The port
puts it at 82% of the desktop, which lands within 16px of Framer's pixel at
1200 and keeps the shortcut on the canvas and clear of the edge at every other
width, and at left 240, top 270 on phone.

**The desktop is full bleed.** The wallpaper fills the viewport at every size,
so the page is not held inside the 1200px reading column here and carries no
rounded corner that would leave the page colour showing. Framer's own two pixel
anchors get a percentage floor to go with that, `max(168px, 14%)` and
`max(228px, 19%)`, each floor being the Framer pixel over its 1200px design
width. At 1200 and below the Framer value still wins; past it the whole
composition keeps spreading with the canvas instead of crowding into its left
half. Measured at 1920 the shortcuts sit 269px in from the left and 249px from
the right, with at least 100px between any two.

**The phone composition scales off the room above the dock.** Framer's phone
canvas is 613px tall but its lowest shortcut ends at 477, and the 136px below
that is the dock's band. Scaling by the full 613 put the bottom shortcut on the
dock at any 600-700px viewport height, so the scale divides the room above the
dock instead, and the card, its padding, its gap and its label all scale by that
same factor so they never outgrow the spacing. Whatever room is left over is
split, which stops the shortcuts sitting in the top half of a tall screen: 190px
below the nav and 100px above the dock at 390x844, rather than 96px and 193px.

Two things follow from that. The 680px floor under the desktop is now tablet-only,
because the phone composition scales off the viewport height and needs the canvas
to be exactly that tall. And the label keeps an 8px floor rather than 12px, which
is what stops two labels touching on a viewport around 420px tall.

This is checked by sweeping 133 viewport combinations, 19 widths from 360 to 1440
against 7 heights from 420 to 1080, asserting on every one that all six shortcuts
are present, none overlap, none touch the dock, none fall outside the canvas and
none are crammed against the top.

### The window and its carousel

The window is 90% by 80% of the desktop and now also capped at the viewport
height, so the 680px floor under the desktop cannot push it off a short screen.

**The deck can be scrolled sideways.** Framer steps it with arrows; here it also
follows a drag or a swipe and takes a sideways trackpad scroll or a shift-wheel,
alongside the arrows, the dots and the arrow keys. A drag settles on whichever
slide it was nearest when released, and a flick carries on to the next one. It
is not allowed to fire the click it ends on, so letting go over a neighbour does
not also select that neighbour. The gesture stays horizontal: `drag="x"` leaves
`touch-action` at `pan-y` and the wheel handler ignores anything that is not
clearly sideways, so a vertical swipe or scroll still moves the window behind
the deck. The slide images carry `draggable={false}`, without which the browser
starts its own image drag and the deck never sees the pointer move at all.

Framer's carousel is a 385x380 slide stepping 430px on a 460px tray, which only
holds while the tray is wide enough for it. The window is a share of the
desktop, so on a phone the tray is narrower than the slide and the deck hung
over both edges. The tray is measured instead and the slide and the step are
taken from Framer's proportions of it, so the deck fits at any size: 255px wide
at a 390px screen, Framer's full 385px from about 500px up. The measurement runs
before paint and the component only mounts after a click, so nothing is ever
drawn at the wrong size.

### Shortcuts can be dragged

Framer's shortcuts are fixed; here each one can be picked up and moved anywhere
on the desktop, clamped to the desktop area, with the one picked up last on top.
Dragging is a transform on an inner element so it never fights the positioning,
a drag is not allowed to fire the click that opens a folder, and it works with a
mouse or a finger. Positions are not saved: a reload puts every shortcut back on
its Framer anchor.

Two things differ from the Framer file:

**The Experience note is not ported.** Framer's NotesWindow has an "Experience"
variant still holding the template's placeholder CV, with agencies and job
titles that are not Anne's. It is hidden on the Framer page, and putting
invented employment history on a real portfolio would be worse than leaving it
out. Only the About note is included. If real experience copy is wanted, add it
to `NotesContent` in `src/components/about/AboutPanels.tsx`.

**The Blur Gradient is left out.** Framer fades the bottom of the wallpaper into
the dock. Reproducing it took four stacked bands of increasing blur, because
Chromium applies a `backdrop-filter` across an element's whole box no matter what
mask it carries, so a single masked layer blurred the entire desktop. The fade is
gone now regardless: it washed out any shortcut sitting low on the canvas, and
the shortcuts here can be dragged anywhere, so readability wins over the fade.

## Projects index and resume

`/my-projects` is a 1200px column of four rows, each a 515x300 thumbnail beside
the category pill, title, summary and tool tags. `/resume` is the resume image
in a soft panel with a download button wired to the uploaded PDF.

**Another broken link fixed.** The Ryze Coffee row on `/my-projects` points at
`/projects/jubo-healthcare` in Framer, the same class of copy-paste slip as the
BudgetCart sidebar. It points at `/projects/ryze-coffee` here.

**Tool tags stop at the first blank.** Framer stores four tool slots per card.
Taipei and BudgetCart have Javascript and Typescript sitting in slots three and
four behind an empty slot two, and Framer renders neither. Reproducing that rule
gives exactly what the page shows: one Figma tag on three cards, four tags on
Jubo.

**Thumbnails are fitted, not cropped, on this page.** The artwork is near square
in a wide box, and cropping cut the project titles off. Framer shows the whole
board, so the images are fitted on their white card.

## A transition-parsing bug worth knowing about

Framer writes springs two ways, and they are easy to confuse:

```
spring-duration 1.4s 0 0.8s      duration, bounce, delay
spring-physics  400 30 1 0s      stiffness, damping, mass, delay
```

The original parser only understood the first, so a physics spring fell through
to a generic tween and read 400 as *seconds*. Every card on `/my-projects`
faded in over roughly seven minutes, which reads as permanently invisible. Both
spellings are handled now, along with `tween`, and an unrecognised string falls
back to a fixed short ease rather than lifting a number out of the wrong slot.

Only `/my-projects` used a physics spring, so no earlier page was affected.

## Review pass

A sweep of all nine pages at 390px, 810px and 1440px turned up five real
problems, all now fixed:

| Problem | Cause | Fix |
|---|---|---|
| Nav overflowed every page on phone | The pill rendered its full desktop row at 419px inside a 390px screen | Framer's "Tablet & Phone" variant is now implemented: avatar, availability, and a toggle that opens the links |
| Case pages scrolled sideways on phone | The "More Projects" heading is 60px Chonburi and 571px wide | Stepped to 30px on phone and 44px on tablet via `.ts-more-projects` |
| Ryze hero scrolled sideways at 810px | The 976px glow overhangs the column by design | The hero stage clips it |
| Taipei scrolled sideways on phone | 290px hero circles and a two-label axis row | Circles shrink below tablet; the axis stacks |
| Home hero overhung at 810px | The 1048px desktop stage was being scaled down rather than replaced | The tablet and phone frames are now transcribed from Framer, and the section clips at the column edge the way Framer's does |

Also corrected during review:

- **The butterfly cursor was missing from the home page.** Framer mounts it on
  every page. It now lives in the root layout instead of being repeated in four
  places.
- **`/about` and `/resume` had no `h1`.** Their visible headings sit inside
  windows or inside the resume image. Both now carry a screen-reader-only
  heading, which changes nothing visually.
- **Internal helpers were needlessly exported.** `StarGlyph`, `AbilityTag`,
  `Logo` and `LoadMoreButton` are module-private now.

Checks that pass across all nine pages: no horizontal scroll at any of the three
breakpoints, no console or network errors, no broken images, every internal link
resolves, and every in-page anchor resolves.

## Known differences from Framer

**The home page has two `h1` elements in the DOM.** The desktop stage and the
phone stage are separate compositions, exactly as Framer stores three breakpoint
frames, and only one is ever displayed. The hidden one is `display: none`, so
assistive tech and crawlers skip it.

**Page heights**, measured at a 764px viewport, 1440px wide for Ryze:

| Page | Port | Framer | Note |
|---|---|---|---|
| Home | 3138 | 3138 | exact |
| Resume | 1449 | 1448 | |
| Jubo Healthcare | 4952 | 4940 | |
| My Projects | 2183 | 2192 | |
| BudgetCart | 12483 | 12084 | |
| Taipei Metro | 16106 | 17247 | 6% shorter, spread across media blocks |
| Ryze Coffee | 15254 | 13099 | Framer's frame height stops before the page does |
| Little Chestnut | 5598 | 4224 | Framer's capture never drew the tall image |

Ryze and Little Chestnut are not really discrepancies. Ryze's More Projects
cards begin at 12780 inside a frame Framer reports as 13099, and section by
section the port tracks it within about 200px.

## Asset weight

`public/` holds 125MB, down from 285MB as downloaded. Three passes got it there:
oversized exports resampled to 2000-2800px on the long edge, 53 near-lossless
JPEGs re-encoded at quality 80, and 18 large PNGs resampled again. Filenames and
formats are unchanged throughout, so no code moved.

This does not affect what visitors download. Next.js serves generated variants
at the sizes each layout asks for, so nobody fetches a 4MB source file. It is a
repository and deploy-size concern only. The largest remaining files are five
GIFs and three MP4s between 3MB and 5MB, left untouched because re-encoding
animation risks visible artefacts.

## Content completeness audit

Every page was diffed against its Framer source rather than spot-checked. The
comparison walks the Framer node tree for each page plus the components it
instantiates, collecting every visible text block and media file, then drives
the rendered page with a headless browser that expands each accordion, selects
each tab, opens each About window and steps every carousel, and reports anything
Framer shows that never appears.

That found eleven genuine gaps, all now closed:

**Taipei Metro**
- The hero used the wrong screen recording. It now uses `DtQR8qdh…gif`, which is
  what the Framer instance points at.
- Two images flanking the hero phone were absent.
- The More Projects strip had one card; Framer shows two, BudgetCart and Jubo,
  each with its own artwork rather than the thumbnails used elsewhere.
- The Final Direction row was missing the three layered-system bullets and the
  Result paragraphs that sit outside its accordion.
- The Iteration 2 accordion was missing its closing Outcome line.
- Accordion panels 2, 3 and 4 each end with an image; all three were absent.

**BudgetCart**
- The Taipei card in More Projects used the wrong thumbnail.
- Tabs 2 and 3 show their recordings inside Framer's phone-frame PNG, which was
  not being drawn.

**Little Chestnut Thief**
- The Deliverable section holds two boards, not one.

**About**
- The profile card has a "Contact me" button linking to
  `mailto:annelin.yuen@gmail.com`.

### What the audit still reports, and why each is expected

| Reported | Reason |
|---|---|
| "LinkedIn" missing on `/about` | It is the dock tooltip, carried as an `aria-label`, so it is not in the page's text |
| One About carousel slide | Present in source and on disk; the harness simply did not click that far before snapshotting |
| `MLWPbW1d…mp4` on Ryze | The unused `uRL` fallback on Framer's Video control; the `file` field is what plays |
| "More Eng cost/Business dependency" | Rendered across a line break, so the comparison sees a space Framer does not have |
| Eight Ryze bullet lines | Framer stores a literal "•" and tab in the text; they are real list markup here |
| "Metro Points became more familiar…" | Sits behind a hidden ancestor in Framer, so it never renders there either |

### Final state

- Text and media: every visible Framer string and asset accounted for on all
  nine pages.
- Interactions: 5 accordions, 3 tabs, 3 videos, a slideshow, 6 About windows
  with carousels, 2 dock panels, 2 sidebar rails and the draggable hero artwork
  all present.
- No horizontal scroll at 390px, 810px or 1440px; no console or network errors;
  no broken images.
- All 10 internal link targets resolve; all 15 in-page anchors resolve.

## BudgetCart tabs on mobile

Framer's "Tab Component" carries a separate mobile treatment that the desktop
and tablet variants do not: in "Tab1 - Mobile" the tab switcher is set to
`visible: false`, the panel's own heading moves above the content, and the panel
sits in a 32px-radius card with the phone stacked over an arrow and its
explanation. On a phone the three tabs stop being tabs and read as three
labelled blocks instead.

Only the first panel was drawn that way in Framer; "Tab2 - Mobile" and the third
slot were still 600px wide with the tablet layout. The same pattern is now
applied to all three panels here.

`Tabs` renders both layouts from one `TabPanel[]`, so the mobile stack and the
desktop switcher cannot drift apart. Each step carries its screen artwork, an
optional phone-frame image, and its caption.

**A related fidelity fix.** Framer's Phone frames hide the sidebar rail
altogether; only Desktop and Tablet show it. The collapsed toggle was appearing
on phone here, which also put two hamburger buttons on screen at once next to
the nav. It is now desktop rail, tablet toggle, nothing on phone.

Note that the During Shopping and After Shopping mobile layouts are an
extrapolation from the one finished panel, since the other two were still
unconverted in Framer. Worth a look to confirm they match the intent.

## Status

Every page in scope is ported and content-complete: the home page, `/about`,
`/my-projects`, `/resume`, and the five case studies under `/projects`.
Type-check, lint and production build are clean.

Not ported: `/upcoming_projects` and `/frontend-projects`, excluded by request,
along with the placeholder Experience note. The custom `/404` has no equivalent;
Next.js serves its own not-found page.

### My Projects cards between 600 and 1200

Framer's Tablet frame stacks each card with the thumbnail across the full column,
and left to that, the thumbnails were drawn up to 1000px wide. The boards Framer
holds are only 749 and 690px wide, and fetching them again from Framer's own CDN
returns the same files, so there is no sharper source to use. On a retina screen
they were being stretched to more than twice their resolution.

Stacked, the card is now capped at 520px, which draws the thumbnail at 460px, and
from 1000px the capped cards sit two to a row so a wide window is not left half
empty. The desktop row from 1200 is unchanged at 402px.

### Project card previews

The cards on the home page and on My Projects used boards that had been
screenshotted by hand, and they were soft. They are now screenshots of each case
study's own hero, taken by `npm run previews` (scripts/capture-previews.mjs)
against the running app, written to public/project-previews/, and read by both
pages through src/lib/project-previews.ts, so a project shown in both places
uses one file.

Each file's name carries eight characters of its own content hash. Regenerating
a preview therefore changes its URL, and the old file is deleted. Without that,
the name stayed the same while the picture changed, and browsers went on showing
the previous one long after it had been replaced.

The script captures each hero by its DOM box at 2x and adds a 60px band of page
background. The home frames are 1.4:1, and the heroes are not: Taipei and
BudgetCart are 1.65:1 at desktop. They are responsive, though, so the script
measures each hero across a range of window widths and captures it at the one
where its real layout comes out at 1.4:1. That is 930px for Taipei, 1010px for
BudgetCart and 1440px for Ryze. Jubo's column is capped at 1000px, which holds
its hero near 1.1:1 at any width, so it is captured at 1440 and anchored to the
top of its frames, giving up the lower rows of dashboard cards.

Every card frame, on both pages, is the same 1.4:1 shape, and each preview is
fitted whole inside it and centred. My Projects used to give each row the shape
of the board it once showed, so four different frames cropped their previews by
anything from 7% to 21%, each by a different amount and Jubo's anchored to the
top. One frame and one fit is what makes the previews sit the same way in every
card and stay that way as the cards resize.

Three of the four pictures are within half a percent of 1.4:1 and fill their
frames. Jubo's hero is nearly square, so it takes the height and leaves a margin
down each side; the captures are taken on white and the frame is white, so that
margin cannot be seen.

For the capture only, anything fixed to the window is hidden: nav pill,
butterfly cursor, dev badge, page grain and the section rail toggle. The page
background is forced to white, so the picture reads as a picture rather than
dissolving into the off-white of the pages the cards sit on.

The cards replay the handset animation, so the interaction is visible without
opening the case study. The still is taken with each GIF pinned to its own first
frame, and the animation is laid back over exactly that patch, at coordinates
the script measures and writes to the manifest. It starts at the Dynamic
Island's lower edge, leaving the still's status bar and the island itself
showing; the strip it gives up does not move anyway.

Holding an overlay steady over a picture that is being cropped to fit takes one
extra box, in PreviewMedia: the picture and the animation share a stage sized
the way `object-fit: cover` sizes a picture, so everything inside can be placed
as a percentage of the picture and stays put at every width.

The handset is drawn from the iPhone 17 Pro variant's own measurements: a shell
of 265.43x549.31 wrapping four nested rings, each with Framer's padding, corner
radius and fill (0.61 black, 0.61 #999, 4.81 #2c2c2c, 6.02 black). Collapsed
into the single grey band this drew before, the edge reads soft and heavy;
Framer's is a crisp black outline with a hairline of grey inside it.

Their padding adds up to 12.05, so the screen sits that far inside the shell. That leaves a screen of 2.176:1, and the two
recordings that play in it are 2.175:1 and 2.168:1, so each fills its screen
with nothing trimmed and no gap.

Deriving the shell from 19.5:9 and insetting a bezel, which is what this did
before, leaves a screen of 2.25:1. The recordings then lost about 3.5% off
their sides, which took the bookmark icons off the Taipei event cards and the
right-hand column off BudgetCart's. Fitting them whole instead left a band of
empty screen under the nav bar. Correcting the proportions removes the need for
either.

The capture records how the page fits a recording, and the card mirrors it, so
the animation lands on the still instead of beside it.

In the card the animation is clipped to the screen's own shape, corner radius
included, and only then is the strip above the Dynamic Island cut away as a
straight edge. Sitting it in a box that began below the island instead gave that
box square top corners, which reached past the screen's curve and printed the
app over the bezel. The radius is written in `cqw` against the stage rather than
as a percentage, which on a box this tall would have come out as an ellipse.

The animations are re-encoded to the size a card draws them, 300px wide at
quality 80. The quality cannot go much below that: WebP describes each frame of
an animation as a change from the one before, and lower settings get that wrong
on these recordings, leaving blocks of an earlier frame behind so the phone
fills with pale rectangles. Everything from 80 up is clean. They are marked
`unoptimized`, because Next's optimizer flattens an animation to a single frame,
and they load lazily.

The stills are lossless WebP, served at 2x or better at every width checked.

### BudgetCart hero, desktop

Checked against Framer's Desktop frame for /projects/budgetcart (node gtmCwp7GV)
and corrected to it:

| | was | Framer |
|---|---|---|
| Category badge | stretched the column | `fit-content`, 3px/15px padding |
| Project Meta Grid | two columns | one column, 20px rows, 6px columns |
| Hero stack gap | 30px | 0; the image column's own 30px left padding is the only space |
| iPhone Sim Mockup | 230px | 265.43px, the iPhone 17 Pro variant |
| Image container padding | 30px sides | 50 top, 50 right, 30 bottom, 30 left |
| "Vector" doodle, 57x57 at top 11 / right 79 | missing | added, drawn with the squiggle asset |

With the gap removed the text column goes from 446px to 476px, which is what
puts the lede on two lines instead of three.

Stacking order: Framer gives the character a z-index of 1, but its own render
draws the handset in front of the shopper, so the z-index is dropped here. The
money bag stays in front of the handset, which is the one piece that overlaps
it.

Only the desktop composition was corrected. Framer's Tablet frame stacks this
hero and pads its image column 200px on the left, where this port lays it out
as a row from 810; that difference predates this change and is left alone.

The capture script prefers a dev server over a production one. `next start`
serves the pages and public files from whenever it was built, so capturing from
it silently produces stale previews.

### The case-study table of contents stops at More Projects

From 1200 up the rail used to be fixed to the window, 150px in from its left
edge, with a 119px spacer holding its place in the row. Fixed means nothing
bounds it, so it stayed put while the reader scrolled on and ended up over the
More Projects strip.

It is now the column itself: the spacer holds the list and is `sticky` at the
same 150px offset. Sticky is bounded by the row it sits in, and that row is a
sibling of More Projects rather than its parent, so the rail travels with the
reader through the case study and comes to rest where the row ends. No script,
no z-index, nothing to flicker.

The column keeps its 119px, so the article has not moved. The list inside is
still 150px and now sits at the body's own left padding rather than at a fixed
distance from the window, which means it tracks the content instead of drifting
away from it on a wide screen: at 1920 it was 210px clear of the column it
belongs to.

Below 1200 the rail was already a sticky column in the same row, so it was
already bounded; nothing there changed.

### More Projects card images

The cards show the linked case study's own hero, the same picture and the same
1.4:1 frame the cards on My Projects use, derived from the card's href rather
than configured per page. Framer gave each card a picture of its own, but they
ranged from 0.84:1 to 2.48:1 and several were page screenshots rather than
heroes: the BudgetCart one had Framer's nav and editor toolbar in it. The four
that nothing references any more are deleted; the Jubo and Little Chestnut
banners stay, because those pages still use them.

Little Chestnut Thief gained a preview of its own so every card has one.

The card title is bounded twice. By the card, because a card is 480px on
desktop, about 345px when two squeeze into a tablet, and up to its 480px cap
when they stack, so its width does not follow the window: it grows to 480 by
600px, drops back to 345 at 810 where the row goes two-up, then climbs again. A
size keyed to the window alone ran from 4.4% of the card to 11.5% of it; keyed
to the card it holds at 7.5%, which is Framer's 36px on the 480px card it drew.

And by the window, because in the stacked range a full-width card carried a 36px
title while "More Projects" above it is only 24 to 30px, so the card outshouted
the section it belongs to. The window ramp holds the title between 0.6 and 0.87
of the heading at every width, and always above the 14px description. Whichever
bound is smaller wins.

That does take the rule variant's title down from Heading 3's 55px, which was
11.5% of its card and the widest of the mismatches. Both variants now top out at
36px, so the two strips read the same. The description stays at 14px: scaling it
with the card would have left it at 10px on a phone.

### Filling the width on a phone

The Taipei hero capped its text column with a ramp written for the 810 to 1200
stretch, where the text has to leave room for the collage beside it. Below 810
the hero stacks and there is nothing to leave room for, but the ramp bottoms out
at its 240px floor, so the text sat in a 240px column on screens up to three
times that wide. The cap now applies only from 810 up.

BudgetCart's competitor grid put four cards two-across on a phone, leaving each
121px for a logo and a paragraph. They stack until there is room for a readable
pair at 560.

The 44px the rail reserves beside the article below 1200 stays. That column is
what the open list widens, and widening it is what moves the article across.

The Taipei hero's two columns meet at the bottom. Aligned to the top, the
collage's own height decided where it finished, so it ended anywhere from 71px
above the last row of the meta grid to 56px below it, depending on the width.
Aligned to the end from 810 up, the collage and the meta finish on the same
line at every width.

Its meta grid is two across at every width, including phones, where Framer
stacks it into one column. Four facts in a 2x2 block read better than a list.
BudgetCart's meta keeps Framer's single column, which is what its own Desktop
frame draws.

### Checking for overflow on both sides

The overflow sweep compared the document's scroll width against the window,
which only ever catches content escaping to the right: an element pushed off the
left edge is clipped without lengthening the page, so it never registered. The
check now walks every element, intersects its box with each ancestor that hides
its overflow, and reports anything whose visible part still crosses either edge.

It found one, on BudgetCart. Framer pins the shopper illustration 225px to the
left of the hero's image column and 335px in from its right, which works while
that column is the right half of a wide hero. Below 810 the hero stacks, the
column runs the width of the page, and -225px put the shopper 141px off the side
of the screen at every width from 390 to 768. The pins now apply from 810 up;
below that it sits inside the column.

### Project meta on small screens

All five case studies lay their four facts out two by two below 810. The three
that go through `CaseHeader` stacked them into a column four deep, and BudgetCart
into Framer's single column, which on a phone is a long run of labels. Each page
keeps its own arrangement above that: Taipei two across, BudgetCart one column
from 1200, and the rest four across from 810, as Framer draws them.

Below 810 the BudgetCart hero's handset takes a share of the column rather than
Framer's fixed 265px. At 265 it filled a phone screen on its own, so the shopper
had nowhere to stand but behind it and only his trolley showed. The handset now
takes 56% of the column and sits to the right, the shopper 42% and sits to the
left, and the two no longer overlap at any width below 810. From 810 up both
return to Framer's own composition, where they overlap by design.

### Section titles and sub-headings

BudgetCart drew "My role" and "Solutions Overview" at Heading 2 while its other
nine sections used Heading 3. That is faithful to Framer, which does size those
two differently, but it read as a mistake on the page, so both come down to
Heading 3 and every section title on that page now matches. Taipei was already
uniform at Heading 3. Ryze, Jubo and Little Chestnut Thief are uniform at
Heading 2 through `CaseSection`; each page is internally consistent, and the
two families differ because Framer's own pages do.

`.ts-heading-6`, the sub-heading under a section title, was a flat 24px. The
title above it ramps down to 24px at 390, so on a phone a heavier sans
sub-heading read larger than the serif title it belongs to. It now ramps from
18px at 390 to Framer's 24px at 810 and holds there, staying about three
quarters of the title's size below tablet.

### Type hierarchy below desktop

Framer fixes the sizes of the styles used inside a section, while the section
title itself ramps down, so below desktop the order inverted: at 810 the title
was 32px and `.ts-heading-5` 36px, which made the numbered pain points and the
iteration titles larger than the sections holding them.

The two now hold a constant share of the title rather than ramping on their own:

| | 390 to 810 | 1000 | 1200 |
| --- | --- | --- | --- |
| `.ts-heading-3` section title | 32 | 43 | 55 |
| `.ts-heading-5` heading in a section | 22 | 29 | 36 |
| `.ts-heading-6` sub-heading | 18 | 21 | 24 |
| `.ts-body` | 16 | 16 | 16 |

Framer's desktop values are unchanged, and the section title's own floor is
raised to 32px so the two styles under it have room.

Three places pin their own size and so do not follow this: the cards on the home
page, on My Projects and in More Projects. My Projects previously used the bare
style and drew a 36px title on a 282px phone card; it now takes the same 22/36
pair the home cards use.

The pain point cards carried Framer's 30/40 padding at every width, which made
each one half a phone tall. They keep it from 810 up and tighten below.

Taipei sets 41px and 45px between "Project context" and "Today's Focus" and
their content, which Framer measured against a 55px title. Those hold from 810
up and come down to 24 and 26 below, against the 32px title there.

BudgetCart set a full sentence at section-title size in Design Breakdown ("I
redesigned the comparison interface..."). It is a sub-heading now.

### Taipei detail work

The Strategy Evolution step number was a 26px disc beside an 18px label; it is
20px below 1200 and Framer's 26px above. The open accordion's title was a fixed
24px, larger than the iteration title it sits under, and is now the sub-heading
style, which ramps.

The Prioritize Strategy axis only ever drew its dashed run and arrowhead from
810 up, because the two labels cannot sit either side of it on a phone, so below
that there was no arrow at all. It now turns upright and runs down the side of
the three initiatives, from the first to the third, with "Less Eng cost" above
them and the arrowhead pointing at "More Eng cost / Business dependency" below.
The three items are written once; only the axis and the labels change with the
breakpoint.

The two Solution Overview demos sit in the handset, like BudgetCart's, with
their captions centred. Both recordings are 2.165:1 against the screen's
2.176:1, so nothing is cropped.

The four Design Breakdown diagrams open full screen when clicked, through
`Zoomable`. They are 2800px wide and their annotations are unreadable in the
column. From 810 the diagram is fitted to the window; below that, fitting one
onto a phone gains almost nothing over the column it came from, so it runs at
full height and pans sideways: 282px in the column becomes 2064px. Escape or a
click closes it, and the page is held still behind it the same way the
case-study drawer holds it.

## Taipei Metro responsive pass

Ten pieces of work, taken at 390 but written so every one of them ramps rather
than switching at a phone width.

### The visuals were small for the width they had

The demo screens and the Solution Overview recordings ran at the width a
three-column desktop grid gave them, carried down unchanged. At 390 the article
column is 342px and the screens were 141px, so half the width was margin. Metro
Navigation and Metro Point are now one grid that is a single column below 810
and `2fr 1fr 1fr` above it, with each screen placed directly after the text it
illustrates rather than both dropping to the bottom. The screens take 72% of the
column below 810 (246px) and their own track above it. The two Solution Overview
figures do the same: a column below 810, a row above, each recording at 72%
(224px). Nothing is cropped or stretched anywhere — every one of them is width
led with `h-auto`.

The gap between the two demo blocks was 90px at every width, which is a screen
of scrolling on a phone; that figure is now the tablet-and-up row gap, and below
810 the two blocks sit in the normal 24px column rhythm.

The brain and the My Learning girl went the other way: both were drawn at their
desktop size on a 342px column and crowded the text beside them. They are
120x131 and 140x220 below 810, against 160x175 and 187x294 above, at their own
aspect ratios and still right-aligned.

### Enlarging an image on a phone

Eleven images on the page open full screen now rather than four: every diagram,
flow and screen that carries detail. The wide ones are 2800px, and the point of
opening one on a phone is to read it, so it is not fitted to the viewport — it
runs at full height and pans in both directions. What it used to do was start
against its left edge, which reads as stuck, so the pan container now centres
itself on open, and again once the picture has laid out, since its width is what
decides the range. `touch-pan-x touch-pan-y` keeps the gesture native and
`overscroll-contain` stops the page behind it taking over. Escape, the close
button and a tap outside the picture all dismiss it.

### The skip link

"Skip to redesign details" landed with the Design Breakdown title under the top
navigation. Rather than pad the target, every element with an `id` now carries
`scroll-margin-top: 110px`, one rule in `globals.css`, which fixes the sidebar's
links and the in-page skip link together and applies to the other case studies
for free.

### The sidebar becomes a floating control

Below 1200 the section list no longer occupies a column. It is a portalled
hamburger at a fixed `top-[88px] left-4` (`left-6` from 810), with a light
orange outline on the page background, and the panel opens directly under it
against the same left anchor, over the page, on white with a hairline border and
a shadow. Nothing in the article moves when it opens: the column measures 342px
at 390 and 730px at 810 whether it is open or shut, and the article's own box
does not shift by a pixel. The hamburger stays visible and toggles, so there is
no separate close control; a tap outside, through a transparent full-page
catcher, or on any link closes it too. Active-section highlighting is the same
code the desktop rail uses. "All Projects" is dropped here — it is a site-level
link and the top navigation already carries it. From 1200 the sticky rail is
unchanged.

### The top navigation reads intent, not direction

The "Open to opportunities" pill on the case studies is hidden while you read
and appears when you move deliberately, in either direction — not the usual
down-hides / up-shows. `useScroll` feeds a trailing 120ms sample window, and a
velocity over 1.1px/ms in either direction shows the pill and restarts a 1.6s
timer that hides it again. Slow scrolling never crosses the threshold, so there
is no flicker at the boundary, and small movements are ignored outright. It
animates on `translateY` with `opacity`, so it never takes part in layout, and
`useReducedMotion` turns the movement into a fade. React state is touched only
when the pill actually changes, not per scroll event. Both the desktop and phone
pills share it, and it lives in `Nav` rather than in any page.

### Checked

375, 390, 430, 768, 810, 1024 and 1440 on the home page, My Projects, Taipei and
BudgetCart: no horizontal overflow at any of them, no page errors, and no
visible image whose rendered box is off its natural aspect ratio by more than
2%. The floating navigation was measured open and shut at seven widths for
column width and article position. `npm run previews` was re-run afterwards,
because the captures are taken at 960 and 810, below the breakpoint whose layout
changed.

## BudgetCart responsive pass

The same treatment the Taipei page had, applied to BudgetCart, with the Taipei
page as the reference wherever the two draw the same thing.

### One demo per row

Solution Overview carried two handsets side by side at every width, 141px each
on a phone. It is now the Taipei block to the class: a column below 810 with
each recording at 72% of it and its caption underneath, a row from 810.

### The brain

It sat in a column beside the three quotes, at its desktop size, on a 342px
screen. From 810 that is still Framer's layout; below it the illustration drops
under the quotes and to the right at 120x131, which is the size and the
alignment the Taipei page gives the same file. `order` moves it rather than a
second copy of the markup.

### Four competitors of equal weight

Framer drew the four logos at four different widths, between 138 and 165, and
left the name and the description ranged left under a logo that was not centred
on them. They now share one square, 76px on a phone ramping to 120, with the
logo, the name and the description centred on one axis.

Equal measured size is not equal perceived size: Flashfood and Walmart are solid
tiles that reach their own edges, Instacart's carrot covers 61% of the width of
its file and BudgetCart's trolley nearly all of it. Each logo carries a `scale`,
the share of the square it may fill — 0.76 for the two tiles, 1 for Instacart,
0.82 for the trolley — which lands all four marks within a few pixels of each
other. Corner radii became percentages so they hold as the square shrinks.

### Body Large at tablet

Framer's Body Large is 20px on its Desktop frame and 32px on its tablet one, and
everything in the design breakdown inherits it: the captions over the flow
diagrams, the journey, and the numbered step headings. At 32px the step headings
outweighed the section titles above them and "Build Cart -> Compare Price ->
Commit" ran to three rows.

Three ramps replace it, each keeping Framer's desktop size exactly and coming
down below 1200 rather than stepping up: 16-20 for the diagram captions, 18-20
for the step headings, and 14-20 with a 10-28 gap for the journey, which now
holds one row from 375 up. Nothing above 1200 moved.

### The walkthroughs

Both are one component now, on a grid, because the three parts are arranged
differently in each range and nesting them in boxes would have meant writing the
markup twice.

- Phone: one column in reading order — title, journey, demo, then the steps, so
  the recording arrives before the description of it. It used to come first,
  above its own title.
- Tablet: the title and journey take their own full-width row and the demo and
  the steps share the row beneath. The demo takes 38% of it, 277px at 810 and
  340 at 1024 against Framer's fixed 240.
- Desktop: Framer's layout, untouched. A 240px handset beside a column holding
  the title, the journey and the steps, on the side Framer puts it on; the two
  walkthroughs alternate, and `side` is the only thing that differs between
  them.

The demo is capped at 340 below 1200. 72% of a 768px screen is a 518px handset
over a thousand pixels tall, and 38% of a 1199px window is 426 against 240 on
desktop, so the step across the breakpoint would have been larger than the
handset.

The 86px between a walkthrough title and its content is Framer's, measured
against a two-column desktop row. On a phone it is a blank screen, so it holds
from 1200 and is 32px below that.

### Reading the pictures

Six images open full screen: the two research artifacts, both flow diagrams, the
SNAP journey and the design iterations. The diagrams are the reason — they are
2800px wide and under 9:1, so in the column they come to 39px tall on a phone.

Two faults in the lightbox came out of this, and both are fixed in the shared
component, so the Taipei page gets them too.

It asked for `100vw`, so the browser kept the 390px-wide variant it had already
fetched for the column and stretched it over 2800px: opening a diagram gave a
blurrier picture than the one it came from. It asks for the picture's own width
now.

And `h-full` on a 2800x320 diagram drew it seven thousand pixels wide to reach
the height of a phone, two and a half times its own resolution. It is capped at
the file's own pixels, so a short wide picture opens at its natural size and a
tall one still fills the screen.

Framer's 60/30 inset on the SNAP and iteration pictures took 120px of a 342px
column, a third of the width. It holds from 1200, halves through the tablet
range and comes off below it.

### Next Steps, More Projects

Next Steps is a numbered list rather than two headed paragraphs. The wording is
unchanged.

More Projects was the Chonburi rule strip while Taipei closes with the compact
one. BudgetCart passes `moreVariant="compact"` now, so both pages run the same
component with the same measurements: heading, section width, card size, media
treatment, title ramp, badge and gaps measure identically at 390, 810, 1024 and
1440. The cards are Taipei Metro and Ryze Coffee, in that order.

### Checked

375, 390, 430, 600, 768, 809, 810, 1024, 1199, 1200, 1280 and 1440, across all
nine pages: nothing crosses either viewport edge once each box is intersected
with every ancestor that clips it, no page errors, and no visible picture off
its natural aspect ratio. On BudgetCart specifically: the journey holds one row
at every width from 375, the handset measures 240 on desktop exactly as before,
each competitor's logo, name and description share one centre to within a pixel,
and every lightbox opens at the file's own resolution, starts centred and closes
on Escape.

### BudgetCart at tablet

One measurement explains every complaint about this range. Below 1200 the
section rail stops taking a column, so the article is *wider* on a tablet than
on desktop — 1119px at 1199 against 951. Anything sized as a share of it came
out larger on the smaller screen, which is the opposite of scaling down.

The hero is held at 951 and centred from 810, so the two columns keep Framer's
ratio. The artwork's 225px overhang into the text column, which is how Framer
pins the shopper, now runs from 810 as well: it was desktop-only, so the whole
group was 56% of the article on a tablet against 73.7% on desktop, and read as a
small object in the corner. The meta grid follows Framer's single column from
810 too — 2x2 runs the full width of the text column and put the trolley through
"Product designer" — and stays 2x2 on a phone. The column stretches to the
artwork's height with the project information at its foot, so the two sides
finish level, the way the Taipei hero does; only the information moves, and the
title and description stay clear of the shopper.

Both handset sizes are now capped at what they measure on desktop, since a
tablet is narrower and nothing in it should come out bigger: 228px for the two
Solution Overview demos, which were reaching 270, and 240px for the walkthrough
demo, which was reaching 426. The walkthrough demo also stopped filling its
column — it takes about two thirds of a 38% column and is centred in the rest,
which is the quarter of the article it occupies on desktop, and the row reads as
two balanced columns again. Both ramp with the window below the cap: 173 to 228
and 189 to 240 across 810 to 1199.

The 228 cap also covers the 700-809 band, where a 72% column was drawing a 518px
handset on a 768px screen.

Measured at 810, 900, 1024, 1100 and 1199 against 1200 and 1440: the hero
composition is 73.7% of the article up to 1024 and its desktop size above that,
the two columns finish level at every width, and no demo exceeds its desktop
size. 1200 and 1440 are unchanged to the pixel.

Two follow-ups. The Solution Overview pair goes side by side from 700 rather
than Framer's 810: a 768px iPad is the commonest tablet there is and it fell
below that breakpoint, so the two demos stacked on exactly the device the row is
meant for. Below 700 they still stack, one per row, as they do on a phone.

And the hero's two columns now finish level from 810 all the way up rather than
only below 1200. Framer leaves the artwork hanging 65px below the project
information on its own Desktop frame; both columns stretch to the taller of the
two now, the text dropping its information to the foot of a short column and the
artwork sitting at the foot of its own when the text is the longer one, which it
is below about 950px. Measured at every width from 810 to 1440, the information
finishes within 9px of the artwork.

The two design-breakdown demos carried a 340px ceiling below 810 while the
tablet range held them to 240. Between 600 and 809 that drew a 340x704 handset,
a third to a half of the article and a screen and a half tall. Framer's 240 is
the ceiling at every width under 1200 now, so neither demo is ever larger than
it is on desktop.

From 810 the Solution Overview's two columns are centred on each other rather
than stretched, so the four points sit level with the middle of the handsets
instead of starting at their top edge. The 29px between the points is untouched:
the group moves, not its spacing.

The brain moved to the right of the quotes from 810, which is the same side it
takes on a phone, so the `order` is now set once rather than swapped at the
breakpoint.

Both design-breakdown walkthroughs centre their steps on the handset from 810
up. On desktop the handset used to span the title row as well as the steps row
and centre over both, which left the description about 90px below the middle of
the recording it describes; it shares the steps' row now, as it does on a
tablet, and the two are centred on each other. The title and journey still sit
where Framer puts them, at the top of the text column.

### The budget awareness tabs

Framer's "Tab Component" is rebuilt from its own render for tablet and desktop.
The three tabs sit over a rounded card in the page's warm grey, and the open tab
is the pale one: it carries the card's colour up into the switcher while the two
waiting tabs are the filled ones. The four steps are numbered straight through
the three tabs, so "During Shopping" carries 2 and 3.

A tab with one step is a handset against a note; a tab with two puts a handset
at each edge and both notes down the middle, each pointing back at its own
screen. The pointer is a green dot on the part of the screen the note describes
with a line running out to it.

Nothing is measured at runtime. Each step carries three numbers — how wide its
handset is drawn as a share of the card, the artwork's own height over its
width, and how far down the handset the marker sits — and the note is placed at
the depth those three give, so the line always arrives at its first line of
type. The card is a container and every width and type size inside it is a share
of that container, so the composition scales with the column rather than
stepping at a breakpoint.

Two things keep it steady. The row inside is as tall as the tallest handset in
any tab, not just the open one, so the card holds one height and the page does
not jump under the cross-fade. And the card is capped at the 951px the article
comes to on desktop, with its padding in container units rather than
percentages: a percentage would be read against the article outside the card,
which is wider than the card once that cap bites, and the composition would have
come out a different shape either side of 1200. It measures 0.78 of its own
width at every width from 810 to 1440, against Framer's 0.81.

Mobile is untouched: the switcher stays hidden and the three panels stay stacked
as 350px cards. Only the numbering changed there, from 1/1,2/1 to 1/2,3/4.

The open tab is the filled one, against two pale ones. Framer's own render has
that the other way round, with the open tab carrying the card's colour up into
the switcher; the filled one reads more clearly as the selection. Sizes,
spacing and the order of the row are the same either way — only the two colours
swap.

The markers are drawn in the row rather than inside the handset, because both
ends of one belong to something else: the dot sits on the handset's outer edge
and the line stops 5px short of the note's own box. Drawn over the screen, which
is what they did first, the dot landed on whatever was under it — a price, a
label, the "See More" control — and the line crossed the interface on its way
out. On the edge it covers only the bezel. Measured at 810, 900, 1024, 1100,
1199, 1200 and 1440, across all three tabs: every dot is 14px over an 8px core,
every line is 2px, every gap to the note is 5px, and no dot reaches into a
screen at all. The lengths differ, 22px to 179px, because the notes sit at fixed
places and the handsets are not the same width, which is true of Framer's render
too. The middle column came down from 32% to 27% to make room for them: at 32%
the right-hand marker was 12px long on a desktop and 7px at 810.

Two refinements followed from measuring Framer's own render rather than eyeing
it. The note is centred on its marker, not hung from it: on both single tabs the
dot falls within a pixel of the note block's vertical centre, and hanging the
block from its title instead left the whole group sitting low against the
handset. And the dot's centre sits 3px inside the handset's outer edge rather
than against it, so about 10px of it laps onto the bezel and it reads as
attached to the screen instead of floating beside it. The lap is the frame only
— no dot touches anything drawn inside a screen.

Measured across all three tabs at 810, 900, 1024, 1100, 1199, 1200 and 1440:
every dot 14px, every line 2px, every lap 10px, every gap to the note 5px, every
note centred on its marker to the pixel, and the two notes on the double tab 36
to 62px apart.

On the double tab the two notes became one group, centred on the row rather than
each hung off its own marker, so the middle column sits level with the handsets
either side of it. Their own spacing is unchanged at 54px.

That pulls each note away from the marker that points at it, so the marker is an
elbow rather than a straight run: it leaves the dot, steps across to the note's
height half way over, and comes in level with it. Where the two ends are already
level, which is every tab with one handset, the upright is zero high and what is
drawn is the straight line it was before.

Where a note lands has to be measured, since it depends on how far its own text
wraps, and that changes with the width. The panel writes it onto the row as a
custom property for the markers to read, rather than holding it in state, so a
resize moves the markers without anything re-rendering. Until it is written the
marker falls back to its dot's own height.

Measured at 810, 900, 1024, 1100, 1199, 1200 and 1440: the group's centre is on
the handsets' centre to the pixel at every one, the two notes stay 54px apart,
and both lines still stop 5px short of their text.

### Side navigation

`CASE_STUDY_NAV_RULES.md` holds the rules for these: one shared component, a
per-project list of sections, the research phase collapsed into a single entry
pointing at the first of its sections, and no entry for a section a page does
not have.

BudgetCart lost its Project Context entry. Its hero is the title, the subtitle
and the project meta, with no heading of that name — Taipei's hero does carry
one, which is why that page keeps the entry. The `#project-context` id stays on
BudgetCart's hero for deep links; an id does not earn a place in the rail.

`SidebarEntry.children` is gone. It was declared for Framer's second level,
never rendered, and BudgetCart was still passing four research subsections
through it — exactly the list the rules say must not become navigation.

Ryze, Jubo and Little Chestnut Thief render no rail at all and were left alone
rather than given an invented one.

### The How-might-we card

`ProblemStatement` is one component for every project now, replacing a copy on
Taipei and another on BudgetCart. The card is sized by what is in it — statement
plus padding, nothing else. Framer draws it at a fixed 229px, which is right for
a three-line statement and wrong for any other: BudgetCart held that height at
every width and Taipei held it from 810 up. The padding is Framer's 229 less the
three lines it was drawn around, 40 on a phone, 54 from 810 and 66 from 1200, so
a three-line statement still comes out at 226 and the others follow their own
text. At 1100 Taipei's card is 166 tall and BudgetCart's 196, from the same
component.

The stars belong to the statement, not to the card. The fixed height was what
pushed them apart: the row was 229px tall whatever the text did, so `self-start`
and `self-end` sent them to the card's corners. With the card sized to its
content the row is the paragraph's own height, and they sit 16 to 24px off the
block of type, moving with it when it rewraps.

### Two groups that were being spread

Taipei's Project Context set 90px between Metro Navigation and Metro Point,
measured to fill the height of the screens beside them, which left the two
reading as unrelated blocks pinned to the top and the bottom of the image. They
are one group now, 40px apart, centred against the screens. `contents` below 810
keeps the phone layout exactly as it was: each block is still a grid item in its
own right, interleaved with the screen it belongs to.

Taipei's Solution Overview centres its four points against the two demos and
their captions, which is what BudgetCart's already did. Both are measured as
whole groups — the captions are part of the visual, not something the alignment
ignores.

Measured at 390, 768, 810, 900, 1024, 1100, 1199, 1200, 1280 and 1440: no card
carries a pixel of slack beyond content and padding, no star overlaps its text,
and from 810 up both groups sit on their visual's centre exactly.

### My Projects, between 510 and 1000

The card is capped at 520px so its thumbnail does not stretch across a 1000px
column. A block with a max-width keeps to the left of the space it is given, and
from about 510 up that cap is narrower than the column, so the card sat against
the left edge with the slack piled on the right: 40px to its left and 439 to its
right at 999. Auto inline margins centre it in whatever column it lands in — the
single one below 1000, either of the two above it — and from 1200 the cap is
lifted and they have nothing to do.

Measured at 390, 480, 509, 510, 600, 768, 834, 900, 999, 1000, 1100, 1160, 1199,
1200, 1280 and 1440: the space either side of the cards is equal at every one.
Card widths are unchanged at every width, so the column counts, proportions and
spacing are as they were; below 510 and from 1200 nothing moved at all.

### Ryze Coffee typography

`CASE_STUDY_DESIGN_SYSTEM.md` writes down the scale the case studies share, off
Taipei and BudgetCart. Ryze was the first page brought onto it.

Six things were off. Its section titles came through `CaseSection`, which set
them at Heading 2 — the size Metro and BudgetCart keep for the project title, so
every section on the page shouted at 72px against their 55. Its project title
came through `CaseHeader` at italic Heading 1, a different family and size again,
over a plain 16px description where the other two set a lede that ramps to 20.
Its research sub-blocks were `ts-heading-3b`, Libre Baskerville bold uppercase,
which nothing else on the site uses. Its sub-headings were
`ts-heading-6-small`, a flat 22px with no ramp, so they were larger than the
system on a phone and smaller on a desktop. One line was `ts-body-medium-bold`,
a near-duplicate of body with emphasis. And two diagram labels were
`ts-body-large`, which steps to 32px through the tablet range.

`CaseHeader` and `CaseSection` now carry the shared scale by default. Jubo and
Little Chestnut Thief have not been standardised, so they pass `legacy` and
render exactly as before — Libre Baskerville italic 56/80 and Instrument Serif
42/72, measured either side of the change. The debt sits on the two pages that
own it rather than in the shared component.

`.ts-body-large-fluid` is new: the 16-to-20 ramp Metro and BudgetCart both
carried as an inline clamp on their hero subtitles, given a name so a page can
ask for the role instead of copying the number. Their inline copies can adopt it
when those pages are next touched.

Checked at 390, 1024 and 1440 across all three pages: project title, lede,
section title, body and meta label come out identical on every one.

Four more on Ryze. The hero was a still of the redesigned home page, cropped to
a fixed 447px band by `object-cover`; it is the recording that opens the
Solutions section now, width-led at its own 2558x1820, so it holds its shape and
stays centred from 390 to 1440 instead of being cropped differently at each
width.

Its headings ran a level high. The three numbered solutions and "Validating the
Redesign" were at Heading 3, the size Metro keeps for a section title, and the
Problem sub-headings and the Solutions lede were at Heading 5. The page now runs
the same three levels Metro does — 55 for a section, 36 for a sub-block, 24 for
a sub-heading — and comes out identical to it at 390, 1024 and 1440.

The prohibition glyph is off "Overall Impact".

And the how-might-we statement was a flat picture of itself, so it could not
rewrap and carried whatever type that export was drawn at. It is the shared card
now, with real text: same gradient, corner, padding and Heading 6 as the other
two, and at 1024 and 1440 it measures exactly the height Metro's does. At 390 it
is taller, by one line, because the statement is longer — which is the point of
sizing the card to its content.

The hero recording sits in a laptop again. `LaptopMockup` reuses Framer's own
export as the frame and lays the recording over exactly its screen, the way
`PreviewMedia` lays an animation over the still it was captured from — the
screenshot baked into that export is covered rather than removed, so there is no
empty frame to draw and no new asset.

Every figure was measured off the file: the screen sits at 10.016% from the left
and 3.175% from the top of a 1248x756 frame, 79.968% wide and 85.847% tall. The
notch hangs 3.24% of the screen's height into its top edge rather than sitting
in the bezel, so covering the screen covers the notch too; it is redrawn over
the recording, 12.22% wide at 43.89% across. Holding the frame at its own aspect
ratio keeps those shares exact at any size.

The recording is 1.405:1 against a 1.538:1 screen, so it fills from the top: the
page's own header stays put and what goes is a little of the foot of the frame,
rather than the picture being stretched. Measured at 390 through 1440 the frame
holds 1.651:1, the screen holds 80.0 x 85.8% of it, the notch stays on the
screen's top edge, and the whole mockup stays centred.

Six more on Ryze. The page sat on a 1440 canvas with no horizontal padding,
where Metro and BudgetCart use 1200 with 40; it matches them now, so the article
starts 24px in on a phone, 40 from 810 and 160 at 1440, the same as theirs. The
remaining difference at 1440 is Metro's rail, which Ryze has no equivalent of.

The problems stood 42px apart and now stand 90, the gap the page uses between
sections. The Solutions subtitle was at Heading 5 and is Heading 6, the size
Metro sets a section's lede at: 18, 21 and 24 against Metro's own.

`StarPointList` draws two columns as a grid rather than two stacks. Two stacks
let each column set its own rhythm, so the four points ended at four different
heights and nothing lined up across the gap; `auto-rows-fr` gives every row the
height of its tallest point. Measured at 810 through 1440 the four cells come
out the same height and each row's pair shares a top. Below 810 it is one
column, where the question does not arise. Only Ryze passes `columns={2}`, so
nothing else moved.

"Explore our Prototype here" was a line of bold body text in the middle of the
run, with nothing to say it could be clicked. It is a centred outlined pill with
an arrow now, in the page's orange, and an anchor rather than a paragraph.
Framer set it as plain text with no link behind it, so the address came from
Anne rather than from the source file; it lives in `PROTOTYPE_URL` at the top of
the page.

The radial glow behind the hero is gone, and with it the `overflow-hidden` that
was only there to clip it.

The project type tag on Ryze is Metro's now rather than Framer's orange rule:
`CategoryBadge` gained a `solid` variant, the filled charcoal pill Metro and
BudgetCart set theirs in, and a standardised hero takes it while a `legacy` one
keeps the outline. Measured against Metro at 390, 1024 and 1440 it matches on
background, colour, border, radius, font and padding; only the words differ,
"UI/UX Design" against Metro's "UI / UX Design". Jubo and Little Chestnut Thief
still draw the orange rule, and so do the rule-variant project cards.

Five more on Ryze. "target user" and "PersonA" read Target User and Persona, and
the persona artwork has 20px of air under the copy that introduces it.

The journey carousel stood at a fixed 600px, which on a phone left a band of
empty card above and below a 16:9 slide and on a desktop cut it short.
`Slideshow` takes a `ratio` now, defaulting to the 16:9 all eleven slides are,
and the stage derives its height from the column: 342x192 at 390 up to 1120x630
at 1440, holding 1.778 throughout. Its arrows shrink from 40 to 32px below 810
so they do not sit over the slide. Only Ryze uses the component.

The three pictures still drawn square — the problem shots and the two result
charts — carry the 20px corner the rest of the page uses. The laptop frame keeps
its own silhouette, which is not a rectangle to round.

More Projects is the compact strip Metro closes with rather than the Chonburi
rule. Heading, block width, card width, media, title ramp and badge all measure
identically to Metro's at 390, 810, 1024 and 1440; the cards differ in height
only where a description runs to a third line, which is the copy rather than the
design.

Two typos in that strip's own data: "Jubo Heallthcare Platform" and "Little
Chestnut THief" now read as the projects are named elsewhere on the site.

Words set in capitals now read as words. Ryze had "Ryze Coffee WEB Redesign",
"UIUX designer/ Researcher", "SOLUTIONS", "MAKING THE EXPERIENCE CLEAR,
TRANSPARENT, AND TRUSTWORTHY" and "RESULT & IMPACT "; BudgetCart had its three
design opportunities as "COMPARISON EFFICIENCY", "BUDGET AWARENESS" and
"ELIGIBILITY TRANSPARENCY". A sweep of the rendered text on both pages now turns
up only UI/UX and SNAP/WIC, which are acronyms.

The Solutions lede outranks the solutions under it. It was the smallest of the
three headings in that section, which read as though each numbered solution
outranked the sentence introducing all of them; the section now steps 55, 36 and
24 on a desktop and 32, 22 and 18 on a phone, the scale's own adjacent sizes at
every width between.

Three more on Ryze. The A/B results picture has 24px of air above it.

The demo recordings take the whole column on a phone. Framer sets them at 80% of
it and insets the block a further 20px either side, which on a 342px column left
a 273px recording of a web page — too small to follow. That 80% holds from 810;
below it they are full width and the side padding comes off.

The pain points were one flat picture of three cards, 342px wide and 78 tall on
a phone with the type in it unreadable. They are the cards the Taipei page
builds its own three from — stacked one to a row below 810, across from there —
with the text real at every size and in the sentence case the rest of the page
now uses. Verified: three rows below 810, one row from 810.

The lines under a star point now start where the title starts. `StarPointList`
indented them 32px, but the title sits 22 in — the star's 14 plus the 8 after it
— so every sub-line stood 10px adrift of the point it belonged to. The indent is
those two numbers added rather than a figure of its own, and the row's gap reads
from the same constant, so the two cannot drift apart again. One component, so
Taipei, BudgetCart and Ryze are all square: measured at 390, 810, 1024 and 1440,
all twelve lists on the three pages start flush with their titles.

### The mushroom that opens the prototype

Ryze's "Explore our prototype" pill is a character now: a mushroom on the left
waving a small wand, a speech bubble on its right reading "Click me to see the
prototype!", and the whole thing one `<a>` to the same Figma address the pill
carried.

The artwork is Anne's own file, unaltered but for its backdrop. It arrived as a
132x136 PNG with opaque white behind the character, which on the page's off-white
would have shown as a pale square, so the background is keyed out by flooding in
from the border — only white connected to the edge goes, which leaves the
character's own light tones alone — then feathered by a pixel and trimmed to the
figure. Nothing about the mushroom itself is redrawn.

The character is mirrored so it faces the bubble rather than away from it — a
flip, not a redraw, so the pixels stay the file's own. That swaps its arms, and
the wand moves with them: the hand nearest the bubble is the one drawn at 9-21%
across the file, which lands at 83-91% once flipped.

Character, wand, sparkles and bubble are one flex row rather than boxes
positioned against the page, so the pair scales together, and the wand lives in
the character's own box with every offset written as a share of it. That is what
holds the wand in the hand: the hand sits at 88% across and 72% down the figure,
measured off the asset, and the wand's box is placed so its lower left corner —
where the stick starts — lands there. It took two passes to look right. Drawn
flat along the arm it read as a wire running across to the bubble; angled out
toward the bubble its tip disappeared behind it. Steep, it reads as held.

The animation is CSS, no library. The wand rides up and back down once every
three seconds, with the sparkles timed to the top of the stroke rather than
running on their own, and hovering shortens the cycle so the character answers
the pointer. `prefers-reduced-motion` stops all three animations and leaves the
sparkles showing rather than blinking, with the link, the bubble and the focus
ring untouched.

The bubble answers the pointer in three states rather than one. At rest it is
white inside a grey-100 border; under the pointer or keyboard focus it takes the
orange border, a 6% warm tint, orange type and a lift of a pixel; held, the tint
deepens to 12% and it presses back down. The tail is a rotated square beside the
bubble rather than part of it, so every state names both — colour one and not
the other and the two come apart at the seam. The hover rules sit behind
`(hover: hover)`, since a touch device has no pointer to leave and an unguarded
`:hover` would stay lit after the tap; focus and the held state are unguarded,
so both work everywhere. Under reduced motion the colours still change and
nothing moves.

The first artwork was a 132px file, which is where the softness came from: the
character is drawn at 84 CSS px, and a 2x screen wants 168 real pixels for that.
Anne's second file carries 169, so it now lands pixel for pixel — a render at 2x
and the source at the same size are indistinguishable. It arrived with a
transparent background already, so it is trimmed to the figure and otherwise
untouched: no keying, no feathering, no resampling. The file name carries a hash
of its contents, because replacing an image at the same path leaves Next serving
the old one from its optimiser cache, which is exactly what happened on the
first attempt.

Checked at 375 through 1440: the mushroom is left of the bubble at every width,
its aspect is its own, the wand stays inside the character's box, the whole
group is one link to the right address with a pointer cursor, there is no
overflow, and it keeps 80px clear of the Skip button below so the two never read
as a pair of buttons. Hovering peaks the sparkles at full opacity and the wand
at 16 degrees; under reduced motion all three animations report `none`.

### Jubo

Four things. Its More Projects strip pointed at Taipei and Little Chestnut Thief
with the titles misspelt — "TAIPEI METRO APP REDEISGN " and "Little Chestnut
THief" — and drew the Chonburi rule rather than the compact strip. It carries
Taipei Metro and BudgetCart now, spelt as those pages spell themselves, through
the same `moreVariant="compact"` the other case studies close with.

The hero screenshot sits in the laptop rather than in a 527px band cropped to
fit. `LaptopMockup` takes a still as well as a recording now — it tests the file
extension and renders an `Image` or a `video` into the same screen — so Ryze's
hero and this one are the same component.

The charts picture asked for `radius={0}` and now takes the 20px corner the rest
of the site uses.

And the page came off the `legacy` typography it was pinned to: `CaseHeader` and
every `CaseSection` now draw at the shared scale, which puts its project title
in Instrument Serif at 42/61/72 and its section titles at 32/45/55, measured
identical to Taipei's at 390, 1024 and 1440. `SubHeading` went with it — Framer
sets those blocks at Heading 3, the size it gives the section titles themselves,
so a block inside a section read as loudly as the section; it is Heading 5 over
an italic Heading 6 now. The skills heading reads "Skills" rather than "skills".

Two console warnings predate all of this and show on every case study: motion
declining to animate a `gap` from `normal`, and Next's LCP hint on an image that
is below the fold. Neither affects the render.

### Ryze and Jubo heroes

The project meta on both pages printed its labels grey and its values orange;
Metro and BudgetCart set the label semibold and the value plain, both in the
page's own colour. `CaseHeader` does that now, with the orange kept behind
`legacy` for Little Chestnut Thief, which has not been standardised.

Their cards were the odd ones out because their heroes were: a full-width title
over a full-width picture, where Metro and BudgetCart put the words on the left
and the artwork on the right. `CaseHeader` takes an optional `media` now, and
given one it becomes that two-column shape and drops its facts into a 2x2 block,
since half a row is too narrow for four across. Ryze's laptop and Jubo's moved
into it, so both pages and both cards follow the house pattern.

The capture regions moved with them. Jubo's named two siblings — the header and
whatever followed — which was right while the laptop sat below the words and
wrong once it moved up: it pulled the skills row into the card. Both are the
header alone now, captured at 810 and 1199 like Metro and BudgetCart. Ryze's
card comes out at 1.38:1 against Metro's 1.40 and BudgetCart's 1.41, and
measures 374x271 in the frame against their 380x271 and 380x270. Jubo's picture
is wider at 1.65, so it sits 230px tall in the same frame — inside the spread
the strip already carries, Little Chestnut Thief being 1.19.

Jubo's page ran 120px of padding under the whole frame on top of the 120 already
under More Projects, and another 80 between the body and that strip, so the
footer sat 240px below the last card against Metro's 120. It takes Metro's shell
figures now — 60 at the top, nothing at the foot, no extra gap — and measures
120 to the footer at 390 and 1440 alike.

Its two block ledes were italic. Metro keeps italics for figure captions and
uses none at heading sizes, so `SubHeading` sets its line plain. Nothing on the
page is italic now.

That leaves Jubo running Metro's families and scale throughout: Instrument Serif
for the project and section titles at 42/61/72 and 32/45/55, DM Sans for
everything under them, body at 16. It carries one rung Metro has no use for —
Heading 5, for the named blocks inside Development Process, which Metro's
sections do not have — so the ladder there is 55 to 36 to 24 to 16, all of it on
the shared scale. The skills heading is an `h2` now, like every other section
title on the page.

### More Projects follows the index

Each case study hand-wrote the two projects it closed with, and the five lists
had drifted: a page could point at a project My Projects does not list, and the
order bore no relation to the order there. `src/lib/projects.ts` holds the four
in the order My Projects lists them and `CaseShell` takes the page's slug rather
than a list.

The strip is that order with the page you are on removed, and the rest left
exactly where they were — a filter, not a rotation. The difference shows on
BudgetCart: filtered it closes with Taipei and Ryze, the same pair in the same
order as every other page draws them, where rotating from the current project
would have started it at Ryze and Jubo. No page can link to itself, and Little
Chestnut Thief, which My Projects does not index, gets the first two.

My Projects renders from that array too, rather than keeping a second copy of
the order beside it. Merging the two turned up three fields that had drifted
apart: BudgetCart was "Product Design" there and "UI/UX Design" on its own badge
and cards, Jubo was "Jubo Healthcare" there and "Jubo Healthcare Platform"
everywhere else, and Jubo's line was still the sentence its subtitle used before
it was rewritten. All three now read as the project's own page reads.

### The Ryze hero

The laptop has the mushroom standing in front of it now, with two sparkles over
its cap. It is one canvas with a fixed aspect ratio and every piece placed as a
percentage of it, which is what `CLAUDE.md` asks of a hero composition, so the
laptop, the character and the marks keep their spacing and their overlap from
390 up rather than each answering the viewport alone. The character is the one
that invites you into the prototype further down the page, mirrored to face the
screen it is presenting.

That gives the card a character, which is what Metro's and BudgetCart's have and
Ryze's did not. It captures at 1.40:1, the same as Metro's.

The laptop was small for the room it had — 495px in a 1120px article, 44% of the
row against the artwork Metro gives three quarters of its own. The media column
takes 60% now and the laptop 84% of it, which is 564px, and the canvas is
exactly as tall as the laptop standing in it. It carried slack underneath
before, which put the artwork's own centre above the canvas's, so the header
centred the box and the picture still sat high against the words. The character
also stands in its own lane to the left rather than across the screen it is
presenting; at 12% the laptop started under it and its cap covered the copy on
the page it was showing.

Four coffee beans drift around the group, drawn as an oval and a crease rather
than an asset, in Ryze's own roast brown — they belong to this project the way
Metro's green triangles belong to that one. The character breathes with them,
slowly and out of step, so the group never reads as one pulsing block.
`prefers-reduced-motion` stops both and leaves every piece where it lies, the
mushroom included, whose flip lives in the keyframes so the animation cannot
overwrite it.

The character is resampled to twice its size, 338x414, because it is drawn at
128px and a 2x screen wants 256 of real pixels for that where the file had 169.
Lanczos and a light sharpen do not invent detail — the 266px original is the
ceiling — but they beat the browser's own upscale, and the edges and gills come
out visibly cleaner. A larger original would do better still.

### Ryze hero, second pass

The hero is the product now, not just the site: the bag standing on the left,
the laptop behind it, the character at the other end turned back toward the
screen, and roasted beans across the floor between them. The beans and the bag
are the client's own photography. The bag arrived cut out already; the beans
arrived as a screenshot of a transparent image, checkerboard and all, so the
board is flooded out from the border, the edge feathered, and each bean lifted
off by labelling the blobs that remain — five of the seven, the single beans and
one pair. Their shape is pinned in the style rather than left to the file: they
draw at 16 to 41px, small enough that rounding the height of the variant Next
serves shifts the ratio by a couple of per cent, which is enough to read as a
stretch.

### Hero spacing, the rule, and the rail

Ryze and Jubo set 23px between the subtitle and the project facts where Metro
sets 120, and 23 between the badge and the title where Metro sets 20. One gap on
that column cannot do both, so the badge and the title are one group now and the
space before the facts is the column's own. Both pages measure 20, 20 and 120
against Metro's 20, 20 and 120. Little Chestnut Thief keeps Framer's flat 23
behind `legacy`.

Both pages also draw the hairline rule under the hero that Metro and BudgetCart
draw, and both have the section rail they were missing. Ryze lists seven phases
and Jubo four, each built from the sections that page actually has:
`CaseSection` takes an `id` now, so the anchors are the sections themselves.
Ryze's research phase is one entry pointing at Research Process, the first of
its sections, with Target User, Persona, Journey Mapping, Usability Testing and
Pain points inside it rather than beside it — the rule in
CASE_STUDY_NAV_RULES.md. Every anchor on both pages was clicked and lands.

With the rule and the rail in place both heroes capture at 1.40:1, the same as
Metro's; Jubo's was 1.65 before.

### Ryze hero, third pass: the bag leans in and the beans spill

The bag used to stand beside the laptop rather than against it, and the reason
was not the gap in the numbers. The laptop frame is not a laptop-shaped cutout:
it is opaque from 8.3% to 91.8% of its own box at every height, so with the
frame at 16% of the canvas its first solid pixel is at 23%, and a bag running
to 20% never touched it. It is 25% wide now and runs to 26.5%, which puts its
last sixth behind the screen. The RYZE mark ends at 22% and the laptop begins
at 23%, so the branding clears the edge — checked at 3x rather than taken from
the arithmetic.

That opacity is also why the spill needs two layers instead of one. There is no
gap under the machine to fall through: behind the laptop means hidden, full
stop. So four beans drop in the back layer and vanish past the left bezel at
four different moments — `dx` is the same for all of them and the starting `x`
differs, which is what staggers the disappearance — and six drop in front and
land along the base. Depth is explicit now: bag, back beans, laptop, floor,
character, with `isolate` on the canvas so the order belongs to the hero and
not to the page.

Nothing in the spill is a timeline. Each bean's offset is a function of the
scroll position — the drop is `t²` so it accelerates, the sideways carry is
`t(2 - t)` so it spends itself early — which means scrolling back up runs the
spill backwards with no second animation to keep in step. The window it runs
in is the canvas's own time on screen, opening just under half a viewport above
the hero and closing as its upper third passes the top of the view. A flat
window was the first attempt and was wrong everywhere: 540px of scroll outlived
a desktop hero that leaves after 250.

`dy` names where a bean's *top* lands, not the bean, so the first settle points
put beans up to 8% of the canvas below its floor. Each is its own height short
now — measured against the rotated box rather than the upright one, since a bean
turned 44° has a bounding box a quarter taller than itself — and nothing in the
composition crosses the canvas at any width in the sweep.

The bag no longer floats. It had the same slow bob as the character, and a
mouth that bobs while beans are leaving it reads as the bag doing the pouring,
so `ryze-float` is gone. `prefers-reduced-motion` pins the spill at its end:
the beans are simply already where they land, which is the same composition the
scroll would have built.

### Ryze hero, fourth pass: one heap instead of fifteen beans

The scattered beans are gone, and so is the scroll animation that went with
them — there is nothing left to roll. The hero is the bag, the laptop, a heap
of roasted beans on the floor in the corner where those two meet, and the
character. `RyzeBeanSpill`/`RyzeBeans` is deleted; the heap is one `Image` in
`RyzeHeroArt`, and the only thing still moving in the hero is the character's
breath.

The heap runs from 10% to 36% of the canvas, so its middle sits on the 23%
seam where the bag's front and the laptop's first opaque pixel meet. Its foot
is at 101.9%, below the bag's at 94.9% and below the laptop's own at 99.9%,
which is the point rather than an overhang: a thing nearer the viewer than the
laptop meets the ground lower in the frame, and at 98.9% the heap read as
floating against the machine's base. It is the one piece stacked in front of
the laptop for the same reason. The canvas does not clip, and the two points
measure 3 to 7px against at least 120px of gap beneath at every width.
The supplied file carried 104px of transparent margin, which would have made
every one of those percentages describe padding rather than beans, so it is
trimmed to its content first: 796x384.

The character stands on the laptop now rather than beside it: 77% to 90% of
the canvas, inside the frame's own right edge at 93.1%, with its feet at 95% —
below the screen, which ends at 89% — so it is planted on the base deck. It
used to sit at 84% to 97%, hanging off the machine's right side with nothing
under it. It keeps its breath, and over a full bob it never rises past 91.6%
or reaches past 90%, so it stays on the machine at both ends of the cycle.

### Where the Ryze artwork lives

The pictures Anne supplied for this page are no longer mixed in with Framer's
exports under `public/case/`. They are in `public/images/ryze/`:

| file | what it is |
| --- | --- |
| `bag.0b8f0fca.png` | the product shot behind the laptop |
| `coffee-beans.008c3884.png` | the heap on the floor |
| `mushroom.2a3dacb3.png` | the character, in the hero and in the prototype invite |

Each keeps a content hash in its name, which is what lets the file be replaced
without Next's image optimizer serving the old one from cache off the old URL.
The four single-bean cutouts that used to sit beside them are deleted: they
were lifted out of a screenshot for the scatter, and nothing refers to them any
more.

## The IBM case study, and its password

IBM watsonx Builder Control Plane is an ordinary project in the system with one
extra property. `src/lib/projects.ts` carries `locked: true` on it, and that
flag does two things and nothing else: the card draws a quiet padlock line, and
the preview capture leaves the project alone. Ordering, card layout, the rail
and the closing strip all treat it exactly like the other four.

### The gate is server-side, because the architecture allows it

`next.config.ts` sets no `output: "export"`, so this is a Next.js server app and
the password can be checked somewhere the browser cannot see.

`src/lib/ibm-access.ts` reads `IBM_CASE_STUDY_PASSWORD`. It is not
`NEXT_PUBLIC_`, so Next never inlines it into a browser bundle, and the module
imports `next/headers` and `node:crypto`, either of which fails the build if a
client component pulls it in. With the variable unset nobody is admitted, which
is the right way round: a fallback to a literal would put the password back into
the source and undo the whole exercise. `.env.example` names the variable;
`.env.local` holds the value and is ignored by git.

`/api/ibm-access` compares the submitted password with `timingSafeEqual` — byte
for byte, so it is case-sensitive by construction, and constant-time, so neither
answer leaks through how long it took. On a match it sets `ibm_access` to an
HMAC of a fixed string keyed by the password. Signed rather than a flag, because
a flag is forgeable: anyone could type `ibm_access=1` into dev tools and walk
in. Deriving it from the password means a valid cookie cannot be made without
knowing the password, the server needs no session store, and changing the
password invalidates every cookie already issued.

The cookie is `httpOnly`, `sameSite=lax`, `secure` in production, and carries no
`maxAge` — a session cookie. It survives navigation and a refresh and the
browser drops it on close, which is the asked-for rule without `sessionStorage`,
which the server could not read anyway.

### No content behind the cover

`page.tsx` asks `hasAccess()` before rendering anything. Without access it
returns `PasswordGate` and never calls `CaseStudy`, which lives in its own
module for that reason. Measured: the gate's HTML is 34KB and contains none of
the case study's headings; the same route with a valid cookie is 59KB and
contains all of them. There is nothing to find in the page source. Reading the
cookie makes the route `ƒ (Dynamic)`; every other route stays static.

### What this gate does and does not do

It does: keep the case study's markup and text away from anyone without the
password, keep the password out of the client bundle and out of git, and resist
a forged cookie.

It does not:

- **Protect files in `public/`.** Anything there is served to anyone who asks
  for the URL, with no check at all. This is why the preview capture skips the
  project — a screenshot of the hero would be a public picture of protected
  content. Real IBM images must not go in `public/`. Put them outside it and
  serve them through a route handler that calls `hasAccess()` first.
- **Survive a change of host.** The protection is the server check. Switching to
  `output: "export"`, or to a purely static host, silently turns it into
  decoration. Deploy to a Node or serverless host.
- **Amount to confidentiality.** One shared, static password handed out by email
  is access control suitable for a portfolio. It is not an NDA control. Anything
  genuinely confidential — unreleased interfaces, internal metrics, customer
  names — should be cleared for sharing before it goes in, not relied on this to
  contain.

### Requesting the password

"Request Password" on the gate opens a dialog rather than jumping to a mail
client: someone who has no password usually has something to explain, and a
blank `mailto:` makes them write it from nothing. The dialog asks for a name, an
address to reply to, and a message, and the message field's placeholder does the
explaining — that the project is under NDA, that it is shared case by case, and
what to say.

It posts to `/api/password-request`, which sends the message on with the
provider named by `RESEND_API_KEY` and `REQUEST_FROM_ADDRESS`. The key is read
on the server and never reaches the browser, which only ever learns whether the
message went.

With no provider configured the route answers 503 and the dialog hands the
finished message to the visitor's own mail client, already addressed, subjected
and written. That is the part worth keeping: the feature works on the day it
ships, on a portfolio with no mail account wired up, and upgrades to sending
server-side the moment those two variables are set. What it never does is accept
a message and quietly drop it — a contact form that loses mail is worse than no
contact form, because the sender believes they have been heard.

A hidden field no person can reach catches bots; anything in it gets a cheerful
200 and goes nowhere. There is no rate limit, because that needs a store this
portfolio does not have — worth adding if the address starts attracting noise.

### The scaffold

`CaseStudy.tsx` is structure, not content. Fifteen sections exist with their
ids; each holds one grey line saying what belongs there. Nothing states a
finding, a number, a quote or an outcome, because none was supplied. `Role`,
`Team` and `Duration` read "To be added" for the same reason; `Client` is IBM.

The rail carries eleven of the fifteen. Key Findings sits inside the research
phase and gets no entry of its own — CASE_STUDY_NAV_RULES.md rule 3 — and
Notifications, Workspace Collaboration and Control Plane Experience are the
three parts of Design Breakdown rather than three phases beside it. All four
keep their ids; an id does not earn a rail entry.

### The IBM thumbnail

The card picture is `IbmControlPlaneArt`, drawn in SVG rather than captured.
There is no screenshot because there is nothing safe to screenshot: the work is
under NDA, and `capture-previews` skips the project for the same reason.

Nothing in it is taken from, traced over or reconstructed from the real product.
It carries no words at all — grep it for `<text>` and there are none — so every
surface inside the dashboard is a placeholder bar, a status dot or an abstract
glyph, and there is no label that could read as a real one. What it communicates
is the shape of the system: three agents side by side, a workflow that runs
through them and branches, a ring and a few levels standing for watching it run,
and dotted paths from outside systems into the one surface that governs them.

SVG also means one asset does every size. It is drawn at 1120x800, which is
`CARD_ASPECT` exactly, so it fills the 402px frame on My Projects and the 480px
frame in a More Projects strip with no crop and no letterbox, and stays sharp in
both. `ProjectCover` picks it up from a slug-to-component map, so the card
component itself is untouched.

Two passes were needed on the look. The agent mark began as a disc inside a
rounded square, which is a camera lens; it is a hexagon now, which is how an
enterprise diagram draws a module. And the background began tinted edge to edge,
which made the card sit heavier than the four around it — every other card is a
hero screenshot on off-white. The tint and both glows are halved.

The IBM logo and the watsonx mark are the supplied files, placed and scaled and
otherwise untouched: the logo's pixels are identical to the file as given.

### Second pass: the builder story

The picture now reads in three zones. The left is who builds it — watsonx at
2.5x its first size, a builder at a desk with a laptop and a panel of code
lines above it, and Bob standing in the foreground. The centre is the control
plane, which moved right and shrank a little to open that column and is still
60% of the canvas wide, by a wide margin the largest object here. The right is
what it reaches: three outside systems on dotted paths, with IBM's signature
below them, smaller than watsonx.

Bob is the asset as supplied, and where he sits is the whole point. He is
outside the dashboard, nothing is wired to him, he stands beside the builder
rather than among the agent cards, and he is drawn at a different scale from
anything inside the interface. He was a tool used to implement the work; he is
not one of the things the control plane manages, and the composition has to say
that without a word of explanation. He is also deliberately not the loudest
thing on the canvas — the first pass had him larger and he pulled the eye off
the dashboard, so he came down from 136 to 126 wide and the builder's figure
was lightened from #4C6B96 to #6480A8 to stop it being the darkest mark in the
picture.

### Third pass: the real figure, and two pieces beside it

The composition is the second pass's again — watsonx large at the top left, the
control plane in the middle, Bob in the bottom-left corner, the nodes and IBM's
signature on the right. What changed is that the builder is no longer drawn
here. It is the figure out of the supplied illustration, with that
illustration's own screen of code above the desk and its phone added below.

The whole illustration went in first, at Anne's request and over a flagged
concern, and the concern was right: its panel stack and platform sat level with
the dashboard and the two argued for the same attention. Three pieces of it
carry the same story without that fight.

The pieces keep the spacing they have in the original — the code screen sits
101/364ths of the figure's width to its left and 90/364ths above it, scaled by
the same factor — so the pair reads as the one object it was drawn as at
whatever size the card gives it.

Each is masked to its own shape rather than cut as a rectangle. The dotted paths
that run between the objects in the original pass straight through the boxes
around them, so a plain crop brought a tail of loose dots along with it: a
thousand stray pixels on the figure, two hundred on the phone. Every visible
pixel of all three is identical in colour to the illustration as supplied;
checked pixel by pixel against the original, not by hashing a file.

## Project cards: the design, and only the design

The previews used to be the whole hero section, so every card printed the
project's title, its one-line description and its four facts — all of which the
card already sets in type beside the picture. The card said everything twice,
once as text and once as a screenshot of text too small to read.
`capture-previews` now points at each hero's artwork column instead, and the
picture is the design.

The widths are fixed rather than searched. The old script swept a range looking
for the window width at which the hero happened to be 1.4:1, the card frame's
shape. The artwork columns have fixed aspect ratios of their own — Metro's stage
is 550/594, Ryze's 760/387 — that no window width changes, so there was nothing
left to search for. `PreviewMedia` already sizes each picture to its own shape
and centres it, so a tall one keeps its proportions instead of being cropped.

One hero needed more than a selector. BudgetCart's composition is pinned 225px
to the left of its own column, so it reaches back across the words, and the
first capture printed the tail of the description under the trolley. Each
project can now name the parts to hide for the shot, and the words go.

### The Ryze card moves now

Ryze's hero plays an mp4 in a laptop, and a screenshot froze it while Metro and
BudgetCart animated. It plays in the card now.

sharp could not do this. It re-encodes the other two because their sources are
animated GIFs and it can read an animation and write it back; it cannot author
one from frames, and there is no ffmpeg here — a stack of frames handed to it
with `pageHeight` comes back as a single tall still. Chromium can, so the
capture now draws the video frame by frame into a canvas and lets MediaRecorder
write a WebM. The page's own file is 2558x1820 and 4.6MB; what the card loads is
580px wide and about 580KB, less than either of the GIF-derived animations.

The hard part was not the encoding. The card lays the moving version over the
still, which repaints the screen's rectangle — and the character stands *on*
the laptop, inside that rectangle, so the first working version lost it
completely. Punching holes for whatever stands in front half-worked and was
worse: a bounding box is not a cut-out, so a frozen rectangle of the first frame
showed around the character, and three holes strung into one CSS `polygon()`
joined themselves with seams that cut visible wedges across the picture.

What works is a third layer. Whatever the hero paints in front of the screen is
photographed on its own against nothing — everything hidden, then those elements
and the ancestors that position them shown again — and the card lays that back
over the video. 60KB, 95% transparent, and nothing is lost or frozen. Getting it
transparent took one more go: `omitBackground` drops only the page's default
background, and this capture forces `html, body { background: #fff !important }`,
which an inline style cannot beat. It is cleared with `setProperty(..., "important")`.

### Taipei Metro's hero, rebuilt on the card's shape

Framer drew this hero as a 550x594 stage — taller than wide — holding the
handset, the green triangles, a blue disc, the Metro Taipei mark and the mascot.
It is rebuilt here on a 1.4:1 canvas, the shape the cards are cut to and the
shape the IBM hero already uses, with the route threading the composition, the
mascot and the mark half again as large, and panels receding behind the handset.
This is a deliberate departure from the Framer frame, which `CLAUDE.md` asks to
be recorded: Framer's portrait stage left a third of every card empty.

The arithmetic is worth keeping, because it is not obvious. A card draws the
picture 480px wide at most, which is 343px tall, and a handset is twice as tall
as it is wide. Whatever shape the canvas takes, a handset that fits *inside* it
lands at about 152px in the card — which is what the old portrait stage already
gave. Widening the canvas alone cannot enlarge the demo; it trades empty side
margin for a smaller phone. Measured on the real card, 1.4:1 with no crop came
out at 154px against the old 152.

So the handset is 40% of the canvas and its last fifth runs past the bottom edge,
which the canvas clips. It reads as the phone standing up out of the frame
rather than floating in the middle of it, and the demo is the size it should be.

The capture's white band comes off for this project too. The band exists so a
frame that is not quite the capture's shape trims background rather than
artwork; this art is already a panel with its own padding and already the card's
shape, so the band only shrank the picture — 28px each side is 9% of the width,
and that 9% came straight off the demo. `margin` is per project now.

End to end the animated screen went from about 104px in a 402px card, when the
preview was the whole hero section, to 122 once the previews became artwork
only, to 146 after this. The card fills the frame instead of 66% of it.

### BudgetCart's hero, the same way

The same rebuild, on the same 1.4:1 canvas, for the same reason: the handset is
40% of it with its last fifth clipped, the capture's white band comes off, and
the card fills the frame with a 146px demo — the identical figures Metro now
has, which is what makes the two read as a set.

It also retires the overhang `CLAUDE.md` documents. That canvas was the image
column extended 225px to the left, where Framer pins the shopper, and a negative
margin pushed it back across the words; it needed a `hide` rule in the capture
too, because the shot caught the tail of the description printed under the
trolley. The new canvas is self-contained, so the column simply holds it and
there is nothing to reach back over.

The composition keeps Framer's four pieces — shopper, handset, doodle, money —
and adds two fragments of the interface floating beside the phone: a budget
track with a fill and a marker short of the end, and a smaller chip to its
right. The track is the one device that says what this project is about, since
it is a project about knowing where the total stands before the till tells you.
Both are abstract: a figure printed at card size would be unreadable and would
read as a claim.

The palette is sampled off the recording rather than guessed — #007830 is the
app's own green, with the gold it marks money in and the mint behind its cards.

One small correction came with it. The money bag was declared 400x715 in the
markup against a file that is 2800x1797, and `object-contain` had been
letterboxing the difference inside a box nearly twice as tall as the art. It is
declared at its own size now.

### Nothing stacked behind the handsets, and BudgetCart on white

The translucent panels receding behind the handset are gone from both phone
heroes. The IBM hero layers them because it is about one surface standing for
many; Metro and BudgetCart are each a single app, and the panels only crowded
the screen they sat behind.

BudgetCart's tinted wash and its two glows are gone with them. The card frame
behind it is white, so on white the picture reads as the composition itself
rather than as a coloured panel sitting in a card — and the file halved, from
328KB to 174KB, since most of what the lossless encoder was storing was the
gradient. Its two floating interface fragments carry a thin edge of their own
now, which the tint used to do for them.

Metro keeps its wash: only BudgetCart was asked to go white.

One thing to watch when editing these by hand: the `<defs>` for both files lived
inside the background `<svg>`. Removing BudgetCart's wash took its gradients
with it and left the budget track pointing at an id that no longer existed,
which paints as nothing rather than as an error. The track is a flat fill now,
and a check for dangling `url(#...)` paint references on the rendered page comes
back clean.

### The Metro route became a network

One green line said "a line". Taipei's map is read by colour before it is read
at all — Tamsui–Xinyi red, Bannan blue, Songshan–Xindian green, Zhonghe–Xinlu
orange, Wenhu brown — so the hero carries five, in the operator's own colours
rather than a palette invented to match the page. Drawn as a map is drawn: right
angles and 45s, rounded joins, a plain dot where a line ends and a larger ringed
one where two meet.

They are placed around what is already in the picture — the mark top left, the
mascot bottom left, the triangles top right — so the network fills the bands
those leave: a crossing on the left, a junction on the lower right, a short run
under it.

The crossing is solved, not eyeballed. Red runs y = 196 + (x − 104) and green
y = 320 − (x − 104), which meet at (166, 258); placed by eye the interchange dot
sat 27px left of the join, which on a transit map reads as a mistake.

### Metro on white, and the sizes ordered

The wash and its two glows are gone, as BudgetCart's were, so both phone heroes
now sit on the same white the card frame is. The file came down from 338KB to
147KB; most of what the lossless encoder was storing was the gradient.

The sizes are ordered on purpose, because the first pass had five things asking
for attention at once. The handset at 40% of the canvas leads; the mascot (25 →
22%) and the triangles (32 → 20%, tucked into the corner) sit well below it; the
mark is smaller again (21 → 17%); and the map is the quietest thing in the
picture, its strokes down from 8 to 7 and its dots from 10/13 to 9/11.

Two things came out rather than being shrunk. The fifth line went — four is a
network, five was a thicket. And Framer's blue disc went altogether: reduced to
a halo it sat entirely behind the handset and drew nothing at all, and left at
its old size it was a field of colour competing with the screen. The blue is
carried by the mark and by the Bannan line instead.

## The card and the hero are separate things again

For a while the project previews were screenshots of each case study's hero, so
the two could not differ: making a card better meant editing the page, and
reshaping a hero to a card's proportions is how Metro's and BudgetCart's heroes
ended up wearing the card's composition. They are split now.

Both pages are back to the heroes Anne designed — Metro's 550x594 collage and
BudgetCart's 700.5x628.4 canvas with its overhang, restored from f56ca20, which
held nothing else of mine.

The card pictures live in `src/components/project` as `MetroCardArt` and
`BudgetCartCardArt`, drawn straight into the card like `IbmControlPlaneArt`
rather than photographed: no still, no manifest entry, no animation to line up
over it. The handset plays the re-encoded animation, moved to `public/case/` so
it belongs to the component rather than to the capture script — half the weight
of the source GIF the page uses.

`capture-previews` no longer visits either project, and the comment there says
why it must not start again. The manifest is down to the three projects whose
cards really are screenshots.

Selected Work on the home page went through `PreviewMedia` and the manifest
directly, which made it the one surface that could disagree with the other two.
`WorkCard` takes a slug now and asks `ProjectCover`, like My Projects and the
closing strips, so all three show whatever that project's card is supposed to
be.

## A second IBM case study

IBM watsonx Orchestrate Notification Experience is built to the same shape as
the Builder Control Plane one: the route at
`/projects/ibm-watsonx-orchestrate-notification-experience` decides on the
server before rendering, `CaseStudy` lives in its own module so it is never
called for a visitor without access, the page is `noindex`, and the rail
carries the same eleven phases.

It shares the Builder's gate. `hasAccess()` is scoped to the password rather
than to a route, and both studies are the same internship under the same NDA,
so one password opens both and nobody has to type it twice. Splitting them
means a second secret and a second cookie in `ibm-access.ts`; nothing in either
page would change but the import.

Design Breakdown has no subsections. The Builder page names its three because
they were given; here they were not, and inventing structure for an NDA project
is the same mistake as inventing findings. They go inside that phase when the
content is written — not into the rail.

The card picture is `IbmNotificationsArt`, a sibling of `IbmControlPlaneArt`:
same 1120x800 canvas, same IBM blues, watsonx top left, IBM signing bottom
right, drawn into the card rather than photographed. The subject differs — the
control plane card is one surface standing for many systems, this one is many
events arriving in one place — and like its sibling it contains no text at all,
only placeholder bars, severity edges and abstract glyphs. `capture-previews`
skips both projects for the same reason: a screenshot of either would publish
protected content to a guessable URL.

One placement note worth keeping. The foreground notification first sat at
y 596, which put its foot at 716, and the IBM signature — fixed at 687 to match
the Builder card — printed straight across it. The signature's position is the
constant of the pair, so the notification moved to 548 rather than the logo.

## The Builder Control Plane case study, hero through Solution Overview

The scaffold in `ibm-watsonx-builder-control-plane/CaseStudy.tsx` is now written
as far as Solution Overview. Research, Design Iteration, Final Design and
Outcomes are still to come, and the rail lists six entries rather than eleven
because `CASE_STUDY_NAV_RULES.md` rule 4 says a page gets no entry for a
section it does not have. The two sub-blocks that exist — Five key builder
needs, and My design ownership — keep their ids for deep links and earn no
rail entry of their own.

### Recovering clean screens out of the playback deck

The design playback supplies twelve slides, and ten of them are spotlight
slides: the whole 1920x1080 frame is covered with 60% black and a hole is left
over whichever region the slide is talking about, with a white callout card
somewhere else on top. Only two frames are clean, the issue investigation panel
and the board of metric views.

A spotlight slide is still recoverable, because the overlay is flat. White
backgrounds read 102 everywhere they are covered, 102/255 is exactly 0.4, so
the original is the slide multiplied by 2.5. That gets a whole screen back from
one slide at the cost of quantisation — only 103 distinct levels survive — and
it leaves the callout card sitting on top as a white slab.

So the three Home slides were combined instead. Per pixel, the median of the
three brightened frames throws away both the callout (white in one slide, real
in two) and the clipped spotlight (blown out in one, real in two), which leaves
a clean, evenly recovered screen. The crisp spotlight regions were then pasted
back over it at full resolution: the shortcut cards from one slide, the issues
panel from another, the three recent-artifact cards from the third.

Two bands needed hand-picking after that, and the reason is worth writing down.
The deck does not only dim the regions it is not talking about — on the slide
about recent projects, the "Your most recent" label is redrawn in **white**, and
on the slide about shortcuts the two empty "Create shortcut" tiles are redrawn
in white as well. A median across three slides cannot help when the pixel is
wrong in one slide and hidden behind a callout in another. Each band therefore
comes from a slide that was neither spotlighting it nor covering it:

| Band | Source | Why |
| --- | --- | --- |
| Empty shortcut tiles | slide 48 | 47 whitens them, 46 has a callout over them |
| "Your most recent" label | slide 47 | 48 whitens it, 46 has a callout over it |
| That row under the issues panel | slide 46 | 47's callout covers it |

Metrics came out of a single slide plus two patches, because its three slides
show different tree states and a median would ghost one into another. The tree
panel's own header is the one disagreement: the search slide renders it at 57
where the other two render 23, so that strip is taken from the tree slide.

The arithmetic worth keeping: a gap of 245 between two white cards is not a
seam left by the compositing. The real page background is #F4F4F4, 244 — the
cards are white and the page behind them is not.

The script lives in the scratchpad, not the repo. It is a one-off against
twelve specific files, and the six PNGs it produced are the artefact worth
keeping.

### The hero

Three directions were tried. A row of three equal windows gave each one a third
of the column and made all three unreadable. A single flat screenshot read
clearly and said nothing about the thing the project is about. The one built is
the third: Home as the main plate, because it is the starting point the project
proposes, with the issue investigation panel overlapping in front of it, because
that is the move a builder makes from the landing page into a failure.

It is a `CLAUDE.md` hero composition — one canvas with a fixed 1200x700 ratio,
every piece placed in percentages of it, nothing rearranged at a breakpoint.
The corner radius and the elevation are written in `cqw` against the canvas's
own container, so a 12px radius at full size stays proportional at a phone's
third of it rather than turning into a collar.

The header is stacked rather than the two-column `CaseHeader` Metro and
BudgetCart use. Beside the words, the artwork gets 64% of a 951px column, about
609px, and a browser window drawn 609px wide is a thumbnail. The words are also
heavier here — a subtitle, an internship line and four team names.

Behind the windows is Carbon's twelve-column rule field, and the one saturated
colour on the page is IBM's interactive blue `#0F62FE`, used in the hero motif
and the artifact diagram and nowhere else. The portfolio's own type, spacing,
tokens and components carry everything around them; Carbon is not introduced as
a dependency and nothing global is restyled.

### One type override

`ts-body-large-fluid` carries `text-transform: capitalize`, which Framer baked
into every Body Large class and which the whole portfolio inherits. It is
harmless on a four-word lede. On this subtitle — a full sentence with three
commas — CSS capitalises "A", "For", "To" and "And" too, and it reads as a bug.
The hero lede carries `normal-case` and keeps the class for its size and
colour. Metro and BudgetCart still capitalise theirs; if that is wrong it is
wrong in `globals.css`, not here.

### Asset organisation, and one thing to decide

`public/images/ibm/` now has `home/`, `issues/`, `metrics/` for the six
recovered screens, `references/` for the twelve playback slides exactly as
supplied, and `card/` for the thumbnail art that used to sit loose at the root.
`IbmControlPlaneArt` and `IbmNotificationsArt` were repointed at `card/`;
nothing else referenced those files. Originals are preserved and no source
image was overwritten.

The thing to decide: the earlier note in this file says `capture-previews`
skips both IBM projects because "a screenshot of either would publish protected
content to a guessable URL." Everything under `public/` is served without the
password gate, so the six screenshots now sit at exactly such URLs. The route is
gated and `noindex` and nothing links to the files, but an unlinked URL is not
an access control. Either that is acceptable, or the assets move behind a route
that calls `hasAccess()` — which on Vercel also needs `outputFileTracingIncludes`
so the files reach the deployment, and `unoptimized` images so the browser's
cookie is the one that fetches them.

### The copy is Anne's, verbatim

The brief allowed the supplied text to be refined "to improve clarity, reduce
repetition, and fit the page layout", and the first pass took that licence:
sentences were tightened, paragraphs merged, headings set in the portfolio's
sentence case, the bullet list in Project Context folded into prose, and a few
connecting lines written outright. Anne then asked for her own words back.

So every sentence of visible prose on the page is now her text, character for
character. That includes the five need titles in their original title case, the
section and sub-section headings as her IA names them — Project Overview,
Project Context, The Problem, Design Challenge, My Role, Solution Overview, and
inside them What is watsonx Orchestrate?, Five Key Builder Needs, How Might We,
My Design Ownership — and the three feature names with their em dashes. The
heading case is not a deviation from the portfolio: Metro already sets "My
Role", "Solution Overview" and "Making Metro Points Visible, Clear and
Actionable" the same way.

Four strings on the page are not hers, and all four are there for a reason a
reader never sees as prose:

- the three `alt` texts, which describe the screenshots for a screen reader
- the figure caption marking every screen as fictional sample data

The team names are her four, joined with commas rather than set as a bullet
list, which is the "compact format consistent with my existing portfolio" the
brief asks for. The hero metadata is the three fields she lists — Duration,
Team, My Role — and nothing else; an earlier pass had added a fourth, Product.

Two structural consequences of going verbatim:

- Project Context regains the real bullet list of five artifact types, set with
  the portfolio's own `StarPointList` in two columns.
- Solution Overview's "These are connected destinations that builders can
  access as needed." sits **after** the three previews, where her document puts
  it, rather than opening the section as a lede. It is the line that stops the
  three reading as a fixed sequence, so its placement is worth a second look if
  the section ever gets reordered.

`IbmArtifactDiagram` was rebuilt to match her example exactly: Agent with
Tools, Knowledge Base and Other Agents; Workflow with Agents and Tools. The
earlier version had five children under Agent (it added MCP servers), renamed
the second parent "Agentic workflow", and carried a one-line gloss under each
parent that was written here rather than supplied. All of that is gone, and the
caption is her sentence.

A note for whoever edits this page next: the header comment in `CaseStudy.tsx`
says the prose is verbatim and asks that it stay that way. A line that reads
long or repeats is a question for Anne, not an edit to make in the file.

### The hero background: an IBM mark field

Anne asked for more IBM in the hero background and pointed at a teammate's
portfolio, which tiles a dark frame edge to edge with outline icons — IBM
logotypes, speech bubbles, bees, eyes — a handful of them picked out in blue,
fading to black with a solid blue band at the foot. The brief was to take the
idea, not the design.

What is here instead:

- **A vocabulary from this project, not stock tech iconography.** Eight marks:
  the eight-bar signature, then the artifact types a builder actually works
  with in watsonx Orchestrate — agent, agentic workflow, tool, knowledge base,
  MCP server — and the two things the Control Plane exists for, an issue and a
  metric. Those are the same nouns the Project Context section lists, so the
  hero states the page's subject before a word of it is read. The reference's
  bees and eyes belong to its author's own identity; borrowing them would say
  nothing here.
- **The signature is weighted.** It fills three of the ten slots in the pool
  rather than one of eight. It is the only mark that is IBM rather than merely
  technical, and a field where it recurs reads as IBM's; one where it turns up
  as often as a database icon reads as a generic stack of product glyphs.
  Uniform bars in a square, not the logotype, which is a trademark.
- **Marks sit only in negative space.** Every candidate slot is tested against
  both window boxes plus a clearance margin and dropped on a collision, so the
  field frames the product rather than crowding it. Move a window and the
  field re-flows with no coordinate list to maintain.
- **Some neighbours are joined.** A quarter of the adjacent pairs get a short
  connector, trimmed back so it stops before each mark instead of running
  under it. That turns the field from a wall of loose icons into a sparse
  network, which is the project's actual subject. It is also the clearest break
  from the reference, where nothing connects to anything.
- **Light, not dark.** The reference is a dark site. This page is cream, so the
  marks are a warm light grey (`#D7D3CB`) with a few in IBM blue at reduced
  opacity, over Carbon's twelve-column grid. No gradient, no blue band, no
  colour the portfolio does not already carry.
- **Depth.** Grey marks take one of five opacities from their own seed. At a
  single flat value the field read as wallpaper.

Placement is derived from the row and column indices rather than randomised, so
the server and the client draw the same field and nothing needs a seed stored.

The canvas grew from 1200x700 to 1200x780 and the two windows were inset — Home
from 72% to 65% of the width — to open the margin the field lives in. That costs
Home about 65px of drawn width at desktop (685px to 620px); it is a hero, the
screens are captioned and `Zoomable` further down the page, and the trade buys
the background its room. Strokes stay `non-scaling-stroke`, which is what keeps
a 40-unit mark legible when the canvas is a phone's 358px rather than 951px.

### Project Context: one real screenshot instead of two drawn diagrams

The section used to run a bullet list of artifact types and then
`IbmArtifactDiagram`, a pair of hand-drawn trees for Agent and Workflow. Anne
replaced all of it with a capture of the shipping Workflow Builder, and the
swap is the right one: a reader who has never opened an agent platform learns
more from one look at the real canvas — nodes, a branch with two labelled
paths, a tool call, a nested sub-flow — than from a diagram of the same idea,
and it puts no invented UI on the page.

`src/components/case/IbmArtifactDiagram.tsx` was deleted with it. It was never
committed, so it is not recoverable from git; the shape it drew is written out
in the entry above if it is ever wanted back.

The section is now intro, picture, caption, close. No card, no background, no
second diagram.

#### The crop

`public/images/ibm/product/` holds both files:

| File | Size | What it is |
| --- | --- | --- |
| `workflow-builder-full.b15da434.png` | 3296x1824 | the capture as supplied, byte for byte |
| `workflow-builder.cf4ce454.png` | 2160x1717 | the crop the page uses |

The crop was taken off a column and row profile of the capture rather than by
eye: columns were scored by the fraction of pixels differing from the canvas
background, which put the graph's right edge near x=2110 and showed the minimap
sitting alone past x=2800. Four things came off:

- the window chrome at the top, which the capture clips mid-row and which reads
  as a mistake rather than as context
- the minimap, bottom right
- the **Stop Screen Recording** bar, which overlaps the canvas at the foot of
  the frame and would have published the fact that this was screen-recorded
- the empty canvas between the graph and those two

What stayed: the Flow nodes panel in full, the whole graph including the green
sub-flow, and the `Travel approval flow / Edit details` toolbar, which is the
cheapest way to show this is a builder tool. The bottom edge of the sub-flow's
dashed border is lost by about 17px, which is the price of clearing the
recording bar; the graph visibly continues below the fold anyway.

Nothing is scaled: `width` and `height` on the `Image` are the file's own
pixels, so the aspect ratio cannot drift.

#### The label

The screenshot carries an `Existing watsonx Orchestrate interface` pill above
its caption, in the same component as the ownership tags in Solution Overview.
It is load-bearing rather than decorative. Every other screenshot on the page
is the team's prototype; this one is the product as it already shipped, and a
reader who mixed the two would credit Anne with work that is not hers.

#### Still unused

`public/images/ibm/Design System/` holds six artifact icons shipped by IBM —
`Agent`, `Workflow`, `Tools`, `Knowledge`, `Models`, `Connections`. Nothing
references them yet. They are the real marks for the artifact types the deleted
diagram drew by hand, so they are worth reaching for before drawing anything
like it again. The folder keeps its supplied name, spaces and capitals and all,
because renaming it would be a change to source assets nobody asked for.

### Four corrections to the Builder Control Plane page

**Client leads the metadata.** `Client: IBM watsonx Orchestrate` is now the
first of four facts under the title, ahead of Duration, Team and My Role. Four
again, so the block falls back into 2x2 and Team's names keep a column.

**The heading scale follows Metro.** The page was setting its h3s at
`ts-heading-5`, the Sub-block rung. Metro runs `ts-heading-3` for h2 and
`ts-heading-6` for every h3 under it, with no `ts-heading-5` anywhere, and this
page now does the same. Three consequences worth knowing:

- `SubHeading` grew a `size` prop — `"sub-block"` (unchanged, still the
  default) and `"sub-heading"` (the Metro rung). Jubo and the Notifications
  case study take the default and are untouched; only this page opts in. Under
  `"sub-heading"` the lede drops from `ts-heading-6` to `ts-body`, because the
  title is now at the size the lede used to be.
- The problem statement stopped being a `<p>` at `ts-heading-5` and became an
  `<h3>` at `ts-heading-6`, which is exactly how Metro sets its own.
- The h4s — the five need titles and the two ownership areas — were at
  `ts-heading-6`, which would now collide with their own h3. They drop to
  `ts-body font-semibold`, which is what `StarPointList` already gives a titled
  point and therefore what the portfolio means by that rung.

**The rail takes IBM blue.** `SidebarNav` grew an `accent` prop defaulting to
`var(--color-orange)`; it reaches the markup as a `--rail-accent` custom
property so the hover and active states stay ordinary classes. This page passes
`#0F62FE`, which colours the active entry, the hover, and the floating button's
ring and glyph below 1200. Verified that Metro's rail still computes
`rgb(255, 89, 0)`. The site's own nav pill is untouched and stays orange: it
belongs to the site, not to the case study.

**The dark hairline on the Workflow Builder screenshot is gone.** The crop
started at row 38, and rows 38 and 39 are the last two of the dark window
chrome — at 2160px wide they drew a near-black line across the top of the
picture that ran straight past the rounded corners and read as a stray frame
stroke. The cut is now row 40, the first row that measures pure white, and the
file is `workflow-builder.f039db18.png` at 2160x1715. The `rounded-[10px]`
and the `border-grey-100` hairline are unchanged and correct; magnified 4x the
corner is now one continuous curve. Checked against a profile of the source
rather than by eye, and re-checked that the foot of the crop still clears the
screen-recording bar, which starts at row 1760 against a cut at 1754.

### Spacing brought onto Metro's

The page felt disconnected under its section titles. Measuring both pages in
the browser rather than reading the classes showed why: Metro puts **10px**
between an `h2` and the first thing under it in twelve of its fifteen sections,
and this page was putting **40px** (20px on Overview).

What changed, all of it values Metro already uses:

| | Metro | IBM before | IBM now |
| --- | --- | --- | --- |
| `h2` to first content | 10 | 40 (20 on Overview) | 10 |
| section to section | 90 | 90 | 90 |
| hero to rule | 90 | 90 | 90 |
| rule to first section | 90 | **50** | 90 |
| blocks inside a section | 70 / 40 | 70 / 50 / 40 | 70 / 40 |
| bare `h3` to its copy | 10 | **20** | 10 |
| statement `h3` to its copy | 20 | 20 | 20 |
| figure to caption | 10 | 10 | 10 |
| More Projects `h2` | 40 | 40 | 40 |

Four edits did it:

1. Every `CaseSection` takes `gap={10}`. The component's own default stays 20,
   so Jubo and the Notifications case study are untouched.
2. `bodyGap` went 50 to 90, Metro's value, and the hero lost the `pb-10` that
   was making up the difference before the rule. Hero to rule stays 90 and rule
   to the body is now 90 as well, where it had been 50.
3. Project Context's sub-heading block went `gap-5` to `gap-2.5`. A bare `h3`
   with no lede should hug its own copy at 10px, which is what Metro does; 20px
   is the figure for an `h3` that is a *statement* paired with the `h2`, and the
   Problem section — which has exactly that shape — keeps it.
4. The Problem section's two blocks went 50px to 70px, which is what Metro puts
   between the two blocks of its own Problem section. The page now uses two
   block gaps, 70 and 40, instead of three.

No new token, no override, no media query: the h2 gap is a flat 10 at 1440, 810
and 390, measured. Typography and hierarchy are untouched — this was spacing
only. Metro was not modified; its rail still measures 90px section gaps and
`rgb(255, 89, 0)`.

### Labels out, interactions in

**Removed.** Six pill labels, all of which repeated something the page already
said: the `Existing watsonx Orchestrate interface` pill over the Workflow
Builder caption, two `Primary design responsibility` badges on the ownership
cards, and the three ownership tags in Solution Overview. The `OwnershipTag`
component is gone with them. A sweep of the rendered article for pill-shaped
elements now returns an empty list.

The attribution those pills carried is not lost, which was the thing to check
before deleting them. My Role still states in its lede which surfaces were the
team's and which were Anne's, and the Metrics card still closes with "I
collaborated with the team to develop and refine the design." The caption under
the Workflow Builder still names it as the Workflow Builder — the shipping
product, not the Builder Control Plane the rest of the page is about — so the
line the pill drew is still drawn, once instead of twice.

Kept: the `Enterprise AI · UX Design` badge and the internship line in the
hero, and the two ownership cards themselves. The cards earn their borders —
they hold the one claim on the page that has to be read precisely.

**Added**, all of it out of what the portfolio already owns:

| | Reused from |
| --- | --- |
| Section content fading up on scroll | `Reveal`, already used by Ryze and BudgetCart |
| Five Key Builder Needs, staggered 0.08s | `AppearEffect` + the `index * 0.1` stagger `MoreProjects` uses |
| Screenshot frame answering the pointer | the `.invite` rules in `globals.css`: 0.2s ease, accent border, 6% wash |
| Picture creeping to 1.02 under the pointer | `MoreProjects`, which runs `duration-500 group-hover:scale-[1.03]` |
| Click to expand | `Zoomable`, which the page already used |

No new dependency and no new timing: every entrance is the
`spring-duration 0.6s 0` the rest of the portfolio animates on, and every
hover is 0.2s ease.

**Two decisions worth recording.**

The brief listed the ownership cards as hover candidates and, two paragraphs
later, said static informational cards should not look clickable. Those pull
against each other, and the second wins: the cards take a border and a 3% wash
on hover and nothing else. No lift, no shadow, no cursor change — a lift is the
single cue that makes a surface read as pressable, and these cards do nothing
when clicked. Verified: `transform` stays `none`, `box-shadow` stays `none`,
`cursor` stays `auto`.

The screenshot hover had to not move the page. The scale sits on the `<img>`
and the radius and `overflow-hidden` sit on a wrapper, so the growth is clipped
by the frame and the figure's box never changes. That also moved the border off
the `<img>` onto its own element, which is what keeps the corner one clean
curve.

**Checked rather than assumed**, all in the browser:

- screenshot hover moves the border grey to IBM blue and the picture to 1.02,
  with the bounding box byte-identical before and after
- ownership card hover does not lift, shadow or change the cursor
- Tab reaches the screenshot, Enter opens it, Escape closes it
- under `prefers-reduced-motion` the copy renders at opacity 1 and the picture
  does not scale — Tailwind's `motion-reduce:` on the image, `useReducedMotion`
  inside `AppearEffect`
- on an emulated iPhone, a tap opens the viewer and leaves no hover stuck on
  afterwards; Tailwind v4 compiles `hover:` inside `@media (hover: hover)`,
  which is the same guard `globals.css` writes by hand
- cumulative layout shift over a full scroll of the page: **0.0000**
- no element crosses either viewport edge at any of the thirteen widths

Taipei Metro was not modified.

### Solution Overview as a step showcase

Three screenshots stacked down the column became a two-column walkthrough:
the three areas on the left, the screen for whichever one is selected on the
right. `src/components/case/StickyStepShowcase.tsx`, driven entirely by a
`steps` prop — it knows nothing about Home, Issues or Metrics.

The change is not only shorter. Three headings stacked down a page read as
chapters, and the one thing the brief insists on is that these are *not* a
sequence: "Do not present Home → Issues → Metrics as a mandatory linear
workflow." A tab list says siblings. A reader can open Metrics first and the
layout does not argue. It also buys back about two screens of scrolling and
each picture is larger than when all three shared the column.

**The reference.** `showCase.mov` is H.264 in a QuickTime container, which
Playwright's bundled Chromium cannot decode and its bundled ffmpeg (a stripped
build for recording only) cannot read. Frames came out of it by transcoding
with macOS's `avconvert` to `.m4v` and seeking a real Chrome through it. It
shows a marketing page with a large product screenshot beside a column of
steps, the screenshot swapping as the steps change — which is the shape the
written spec already described in more detail than the video could.

The video has been moved from `public/animation_reference/` to
`reference/animation/`. Anything under `public/` is served, so it was a 3MB
file sitting at a live URL and shipping with every deploy, for a working
reference nothing on the site links to.

**Screenshots**, all three already in the tree and all three 1292x919, which
is what lets one frame hold every step without letterboxing:

| Step | File | Why |
| --- | --- | --- |
| Home | `home/control-plane-home.106ced35.png` | the Home tab |
| Issues | `issues/issue-investigation.6d140d03.png` | severity, artifact relationships, execution trace and recommended next steps — the four things the copy names |
| Metrics | `metrics/metrics-artifact-view.ff753f0f.png` | checked by opening it: it is the artifact-centric screen and carries **both** the hierarchical tree and the search field, which are the two things Anne proposed. `metric-views.c1859996.png` is the board of view options, not this. |

**Animation.** The marker is one element with a `layoutId`, so Motion moves it
between steps instead of fading one out and another in. The spring is the
spec's: stiffness 320, damping 28, mass 0.8.

The picture swap deviates from the spec's numbers, deliberately.
`AnimatePresence mode="wait"` runs exit and enter in series, so the spec's
`duration: 0.35` for both would have taken 700ms — against its own acceptance
criterion of "approximately 300-400ms". The outgoing frame is the one nobody
looks at, so it takes 0.15s and the incoming one keeps 0.3s: 450ms end to end,
same `[0.16, 1, 0.3, 1]` easing and the same ±8px / 0.99 offsets. The frame is
white rather than transparent so the beat between them reads as a blink rather
than a hole in the page.

**Layout stability.** The frame carries an `aspectRatio` and the pictures are
laid in with `fill` + `object-contain`, so its height is identical before,
during and after a swap. Only opacity and transform animate. Measured: the
frame is 424.9px at 1440 before and after switching steps, and cumulative
layout shift over a full visit on an emulated iPhone is **0.0000**.

**The phone needed a different answer.** Three descriptions stacked above the
picture pushed it about 650px down the page, so tapping a step changed
something nobody could see. Below 810 the description moves out of its step
and into the panel, directly above the picture. It is rendered in both places
with `display: none` on one, and `display: none` is out of the accessibility
tree as well as off the screen, so exactly one copy is offered at any width.

**Accessibility**, all verified in the browser rather than asserted:

- `role="tablist"` / `tab` / `tabpanel`, `aria-selected`, `aria-controls` and
  `aria-labelledby` wired to ids from `useId`, so two showcases on one page
  could not collide
- roving tabindex: the selected tab is the only stop, then arrows
- Up/Down and Left/Right both move, Home and End jump, every one of them
  `preventDefault`ed — measured that `scrollY` is unchanged after a run
- focus follows selection, and focus rings take the accent
- `prefers-reduced-motion` drops the marker's spring to zero duration and the
  swap to opacity alone, no y and no scale
- touch targets measure 61px against the 44px floor; tapping switches steps
  and leaves no hover stuck on
- the active screenshot still opens full size through `Zoomable`, Escape to
  close, which is the lightbox the page already had

No dependency was added: `motion` v13 was already here, and `lucide-react` was
not needed because the component has no icons. There is no `cn()` in this
project, so class names are composed the way the rest of the codebase does it.

Auto-play is not built. `select()` is the only place a step changes, so adding
a timer later is an effect that calls it and a clear in the handlers that
already exist.

### Making the Solution Overview screenshots readable

Three changes, with the screenshot width as the measure of all of them. It was
586px — 65% of a 951px article, for a 1292px screen of dense enterprise
dashboard. It is now 951px, or **1072px with the rail folded away**: +83%.

**1. The steps moved above the picture.** They are three short lines and did
not need a column of their own. `StickyStepShowcase` now lays them across the
top — three up from 810, stacked below — with the picture beneath at the full
width of the article. The switching, the gliding marker, the crossfade, the
ARIA and the keyboard handling are all unchanged.

The marker and the rule moved from the left of each step to underneath it.
Above, the rule sat immediately below the section title and read as an
underline of it; underneath, it separates the row from the screenshot and the
marker underlines the selected step, which is also where Carbon puts a tab's
indicator.

**2. The rail folds.** `CaseShell` gained `collapsibleSidebar`, off by default,
and the row became a client component, `CaseRow`, because both halves have to
agree about the fold at the same moment: the rail narrows from 119px to 28px
and the gap beside it closes from 50px to 20px, or the article would gain the
rail's width and lose it again to empty space. `SidebarNav` reads the same
state through context — context rather than a prop because the rail arrives at
`CaseRow` as an already-built node handed down from a server component, and a
node cannot be given new props.

The control keeps its 28px when the list goes, which is the only way back. It
carries `aria-expanded` and `aria-controls`, an accurate label that swaps
between "Hide section list" and "Show section list", and a focus ring in the
page's accent.

Below 1200 nothing changed, by design. The brief asked for this at 1024, but
1200 is where this portfolio's rail stops being a column at all — under it the
rail already floats as a button over the page, and there is no column to fold.
Folding was wired to the same breakpoint the rail itself uses.

Verified that Metro, BudgetCart and Jubo still measure a 951px article, a 50px
gap and zero fold controls.

**3. Two real bugs in the lightbox.** Found by trying to click the close
button in a test rather than by reading the markup:

- The picture was a `fill` image inside a `h-full w-full` div, a later sibling
  of the close button with no stacking context between them, so it painted
  over the button. **The X was visible and unclickable** on every page that
  uses `Zoomable` — this one, Metro and BudgetCart. The button now carries
  `z-[1]`.
- That same div also swallowed clicks in the empty space beside a letterboxed
  picture, so "click away from the image to close" did nothing across most of
  the window. The picture now sizes to its own box rather than sitting in a
  full-window one, so a click beside it reaches the backdrop.

Both are fixes to shared behaviour and improve the other two case studies.

A third change is opt-in: `panOnDesktop` opens a picture at its own pixels and
pans, instead of fitting it to the window. Metro and BudgetCart keep fitting —
a flow diagram 2800px wide is opened to be seen whole. A product screenshot is
the other case, opened to read the small type in it, and fitting 1292x919 into
an 820px-tall window threw away a tenth of the resolution the file has. The
IBM screenshots pass it; the lightbox now draws them at 1:1, centred, panning
vertically.

One measurement trap worth recording: `naturalWidth` on an image served from a
`srcset` with `w` descriptors is reported *divided by the density the browser
chose*, so a correctly-served 1292px file reads back as 869 at dpr 1 and 434 at
dpr 3. Fetching the optimizer URL directly is what settles it — `w=1920` and
`w=3840` both return the full 1292x919.

**Validation.** `tsc`, `eslint`, `prettier` and `next build` clean. No element
crosses either viewport edge at any of the thirteen widths. Folding moves the
article from 951 to 1072 at both 1440 and 1280, with the rail's right edge at
188 against an article starting at 208 — 20px clear, no overlap. Cumulative
layout shift across a full scroll, two step switches and a fold: **0.0006**,
of which the step switches contribute 0.0000. On an emulated iPhone the fold
control is absent, the existing floating menu is untouched, and tapping a step
still switches the picture.

#### The step label, in three rows

The step was `01 **Home** — Return to Work` on one line with the copy beneath.
It is now:

```
01  Home                 <- number and title, both in the accent when selected
    Return to Work
    A starting point for recent work, shortcuts, and items needing attention.
```

The dash is gone and the subtitle has a row of its own. In a column a third of
the page wide the one-line form ran to two lines anyway, and the dash was
landing at the end of a line about as often as it sat between the two words it
was meant to join.

The number hangs in its own flex column so the title, the subtitle and the copy
all start on one left edge with the number beside the first of them. Selected,
the number and the title take the accent together — they are one label — and
the subtitle drops to `grey-200`. Unselected, all three are `light-grey`.

Worth knowing for any future label built this way: splitting a label across
flex children does **not** damage its accessible name. Chrome blockifies flex
items and inserts the separators, so the tab still announces as
`01 Home Return to Work A starting point for recent work…` — checked through
CDP's `Accessibility.getFullAXTree`, not inferred from `textContent`, which
does run the spans together and would have suggested otherwise.

### The double border on the prototype screenshots

The screenshots were showing two corners: a dark rounded one and, a few pixels
outside it, a grey arc with a white sliver between. The cause was in the
assets, not only in the CSS.

**What the files actually hold.** Each recovered screen is the prototype window
filling its frame, with the window's own rounded corners baked in. The three
differ, because they were recovered off slides at different scales:

| File | Baked radius | Outside the curve |
| --- | --- | --- |
| `issue-investigation` | 12px | already transparent |
| `control-plane-home` | ~16px | **opaque white** |
| `metrics-artifact-view` | ~25px | **opaque white** |
| `product/workflow-builder` | none | n/a — a flat crop of the app viewport |

So two of them carried a radius that could not be seen, because white was
filling the outside of it. Drawing a `rounded-[10px] border` container around
that put a second corner outside the first, and the white in between is what
made it read as a frame.

**The fix, in both places.**

1. The containers lost their border, radius, background, shadow and
   `overflow-hidden`. In the showcase a box remains, but only to hold the
   aspect ratio — which is what keeps the column from moving when the picture
   changes — and to position the two frames of the crossfade. In Project
   Context the wrapper is gone entirely; the `Image` is now `Zoomable`'s only
   child.
2. `control-plane-home` and `metrics-artifact-view` were re-cut with their
   alpha following the window's own curve, so the baked radius is finally the
   radius you see. Each file's radius was measured off its own ink boundary
   rather than assumed, and the mask also trims the stray white row the
   recovery left above the chrome. New hashes: `af87ef1c` and `cd140067`.

The pre-mask files are still in the tree. `control-plane-home.106ced35.png` is
not spare — `IbmHeroArt` still uses it, and should: the hero plate is a
deliberate composition with a ring, a radius and elevation, and an image with
transparent corners inside a clipped rounded box would fight it. Two
presentations, two assets.

**What went with the frame.** The scale-on-hover on the Project Context
screenshot is gone. It only looked right because the box clipped it, and the
box is what had to go; scaling an unclipped picture would have had it grow over
the caption beneath. `Zoomable` still makes the picture a button with
`cursor-zoom-in`, so the lightbox is as reachable as it was.

**Checked after.** A 3x capture of each rendered corner shows one curve and no
arc outside it. Computed styles on both containers read
`border 0 / radius 0 / no shadow`. Tab switching, the frame's height across a
switch (676.4px either side), the lightbox and its three ways out all behave as
before; CLS over a full visit is 0.0006, and nothing crosses either viewport
edge at any width.

**For the screenshots still to come:** present them bare. If a screen is a
window with rounded corners, cut its alpha to that curve and draw nothing
around it. A container is for holding an aspect ratio, not for framing a
picture that already has an edge of its own.

### One corner across Home, Issues and Metrics

Replacing the Home still with a recording made a difference visible that had
been there all along: the three screens in the Solution Overview did not share
a corner. They had never been compared side by side at the same size.

Measured off each file's own alpha rather than assumed:

| Step | File | Pixels | Corner carried |
| --- | --- | --- | --- |
| Home | `control-plane-home.51c2ce92.gif` | 960x681 | none — square, no alpha anywhere |
| Issues | `issue-investigation.6d140d03.png` | 1292x919 | 16px |
| Metrics | `metrics-artifact-view.cd140067.png` | 1292x919 | 25px |

Three files, three corners, all drawn at the same width on the page — so three
visibly different curves. The recording could not simply be masked to match:
GIF has one transparent colour rather than an alpha channel, so a curve cut
into it comes out jagged.

**The rule.** A clip can only take more away; it cannot put back a corner a
file has already cut. So the corner the set can share is the widest of them,
and every step is clipped to that. `StickyStepShowcase` derives it: each step
declares `imageRadius`, the curve its file carries in its own pixels, and the
largest wins.

Two details make it hold.

1. **A share of the width, not a pixel count.** The frame runs from 92vw on a
   phone to 1072px with the rail folded. A fixed radius would be the window's
   curve at one width and wrong at every other, while a baked-in corner scales
   with the picture. The clip is written as a percentage pair —
   `1.3158% / 1.8498%` — because `border-radius` reads a lone percentage
   against width for the horizontal radius and against height for the
   vertical, which on a 1.4:1 box draws an ellipse. The second figure is the
   same share re-expressed against the box's height.
2. **`CLIP_MARGIN`, one pixel.** Clipped to exactly the widest curve, the file
   that set it is still bounded by its own alpha and keeps whatever its mask
   carries, while its neighbours get a clean geometric arc. Measured on the
   page that read as one step a pixel and a half rounder than the other two.
   Landing the clip just outside the curve puts all three under one rule.

**Where the clip goes.** Not on the frame. The frame holds one aspect ratio so
the column cannot move during a swap, and it now takes the *tallest* step
rather than the first, so every step fits inside its height instead of one of
them overflowing. Inside it each step gets a clip box of its own shape,
centred — so the curve lands on the picture's real edges, and a step of another
shape is letterboxed rather than having a corner cut out of thin air beside the
one it was meant to round. Home, at 960x681 against a 1292x919 frame, sits
with 0.92px of air above and below at a desktop.

`Zoomable` takes the same corner through `cornerRadius`, so opening a picture
does not hand back the file's own instead. The prop is optional and unset on
Metro and BudgetCart, which still present their files exactly as they are.

**The white line.** Chasing the Metrics mask turned up the real defect
underneath. Its first row is pure white — the edge of the window it was grabbed
from — and against the near-black IBM header beneath it that row drew a light
hairline across the top of the picture. On the page it measured brightness 180
where Home and Issues read 21. The mask had not removed it, only made it
transparent, which renders just as light. The row is now trimmed:
`metrics-artifact-view-trimmed.75c939b4.png`, 1292x918, cut from the untouched
`ff753f0f`. With the showcase clipping every step there was nothing left for
the mask to do, so the masked copy is no longer used.

Removing it also lowered the shared corner. Metrics' 25px mask had been setting
it at roughly 19px on a desktop; with Issues' 16px the only curve left, the set
now sits at about 12px, which is nearer the `rounded-[10px]` the rest of the
site uses.

**Checked after.** Corners read back off the rendered pixels at both
top-left and bottom-right, against a background colour the screenshots cannot
imitate — these captures are near-white in exactly the corner being measured,
so comparing against the page colour cannot tell a clipped corner from content.
Six corners across the three steps: 11.6, 11.8, 11.8, 12.0, 11.8, 12.0px at
1440, a spread of 0.4px; 2.7-3.9px at 390, which is one rendered pixel. Top
edge 20-23 on all three. Frame height identical across all twelve widths and
sampled every 60ms through a swap with motion enabled — 676.44px, never moves.
The recording still animates inside its clip box and in the lightbox. No
element crosses either viewport edge at 390, 430, 500, 600, 700, 768, 810, 900,
1024, 1100, 1280 or 1440. Metro and BudgetCart lightboxes still compute
`border-radius: 0px`.

**For the screenshots still to come:** measure the corner the file carries and
declare it as `imageRadius`; do not guess it, and do not style around it. If a
capture has a stray row along an edge, trim the row rather than masking over
it — a transparent row renders as light as a white one.

### The Solution Overview on a phone

Stacked, the three steps put their number, title, subtitle and a line or two of
copy one above the other, and the picture they describe started below all of
it — past the fold on a 390px screen. The picture is the section; the words are
there to say which one you are looking at.

**One list, two shapes.** From 810 nothing has changed: a grid of three, each
carrying all four lines. Below 810 the copy comes out of the buttons and the
three become a row of plain labels — `Home`, `Issues`, `Metrics` — with the
active step's subtitle and copy under the row instead, where only one of them
is in the way at a time. It stays one `role="tablist"` with one roving
tabindex; what changes is which parts of each button are drawn. The parts that
are not use `hidden tablet:block`, so they leave the accessibility tree with
the layout and a phone reader hears `Home`, not `01 Home Return to Work A
starting point for...`.

The labels are `flex-1 basis-0`, so the three divide the column evenly rather
than sizing to their own words. That keeps the rule under them continuous,
gives all three the same target, and holds the row to one line: 90.7px each at
320, 127.3px at 430. `min-h-11` brings the buttons to the 44px touch target,
which 16px of label and its padding did not reach on their own.

**The copy block cannot move the picture.** All three descriptions render into
one grid cell, with the inactive two held by `invisible` and `aria-hidden`, so
the block is always as tall as the longest. Rendering only the active one had
the picture rise and fall by a line of text on every switch — the same jump the
frame below is built to avoid. Measured: the block is 87.2px at 320 and 390 and
66.4px at 430, the same for all three steps, and the picture's top does not
move.

**Expand.** On a desktop the picture says it can be opened through
`cursor-zoom-in` and the pointer that reads it. A touch screen has neither, so
the only way to find the lightbox was to guess the picture was tappable. Below
810 there is now a labelled control under it. It is a `span`, not a button:
`Zoomable` already wraps all of this in one, and a button inside a button is
invalid and does not survive parsing. It labels that control rather than being
one, and the whole picture stays tappable.

**Pinch and pan.** `Zoomable` gained `pinchZoom`, off by default. On it, a
touch screen gets the picture fitted to the window, pinched to zoom to 5x,
dragged to pan and double-tapped to go in and back out; off, the old behaviour
stands — the file at its own pixels in a scroll container. The old one panned
but could not zoom: a 1292px screenshot arrived on a 390px phone at three and a
half times the width of the window with no way to see the whole of it and no
way to go closer. Fitting first and handing the zoom over is the other way
round.

The gestures are written out rather than left to the browser because they have
to be. A scroll container needs `touch-action` to allow panning, and once the
browser owns the touch it keeps the second finger too, so the pinch never
arrives. Under `touch-action: none` both are available. The pinch holds
whatever is under the fingers in place — `m - (m - T) * s'/s`, with the
midpoint measured from the box's centre — and the offsets are clamped to half
of whatever hangs outside the window, so the picture cannot be flicked off the
screen.

It is opt-in because Metro and BudgetCart would otherwise change character.
Fitted-and-zoom and natural-size-and-pan are two different ways to read a
picture, not a fix and a bug, and switching those pages over is a decision
about them.

**A bug the gestures turned up.** `setPointerCapture` throws when the browser
has no active pointer with that id — a touch that ended between the event being
queued and the handler running, and anything synthesising events. It used to
run before the pointer was recorded, so the throw aborted the handler and the
finger existed for the browser and not for us: every following move was
ignored and the gesture was dead. The pointer is now recorded first and the
capture is wrapped. Losing the capture degrades the gesture; it no longer ends
it.

**What went.** The picture's name — "Home Page" over the Home step, and so on.
With the step's own label in the tab row above it, and its subtitle and copy
between the two on a phone, it was the third time the same word appeared on the
way down. This is the one change that reaches the desktop as well, where it was
the second. The accuracy note stays; it says what the prototype is, which
nothing else on the page does.

**Checked.** At 320, 390 and 430: tabs on one row, 47.8px tall; labels
`Home` / `Issues` / `Metrics`; frame height identical across the three steps;
copy block identical across the three steps; the picture takes 85-89% of the
viewport; no element crosses either edge and the document has no overhang; the
recording animates inline and in the lightbox; the opened picture arrives
fitted with `touch-action: none`; a synthetic pinch takes it to 5x and a drag
moves it; the 44px close button and Escape both close it. Fourteen widths from
320 to 1440 are clean and stable. At 1440 the tablist is still a three-column
grid of 295.7x135 buttons, the phone copy block and the Expand control are
`display: none`, the frame is 951x676.44 across all three steps, and the
lightbox still opens at the file's own 1292x918 without the touch stage.
Metro and BudgetCart still open their phone lightbox in the scroll container,
with `touch-action: pan-x pan-y`, no pinch stage and no corner imposed.

**One for the harness, not the page:** Playwright locators pierce shadow DOM,
so `[role="dialog"]` also matches the Next dev overlay and a close looks like a
failure. Count dialogs with `document.querySelectorAll` inside `page.evaluate`.

### Research

The section after Solution Overview: who the work was for, how it was studied,
and what came back. Three blocks under one `h2`, in that order, because each
answers a question the one before it raises.

**Where it sits in the hierarchy.** `h2` Research at `ts-heading-3` (55px),
`h3` for the three blocks at `ts-heading-6` (24px), `h4` for each insight's
finding at `ts-body-large-fluid` (20px). One `h1` on the page, still the
project title. The spacing is The Problem's, measured rather than guessed:
90px between sections, 10px from the section title to its content, 70px
between blocks inside it. `Research` takes a line in the rail; Target User,
Research Methods and Key Research Insights carry ids for linking but no rail
entry, which is the rule the page already follows — an id is for linking, a
phase is what earns a line.

**Research Methods** is `ResearchSnapshot`. The counts used to be the kind of
thing that lives inside a sentence and gets skimmed; set as figures in IBM blue
they are the first thing in the block, which is what a research report does
with them. No card, no fill, no shadow.

**One rule, and it divides something.** Each figure first sat under a hairline
of its own, which put two rules through the block a few lines apart — grey
above the number, the blue breakdown bar below it — and the grey one read as a
second bar rather than as a grouping. The figures are 55px of IBM blue and do
not need a rule to be found. The only rule left is under the pair, between the
figures and the prose about them, which is the one boundary in the block worth
drawing; it is the same hairline My Role uses between its two halves. With the
rules went their 20px of padding, so the gap from the objective line down to
the figures is 24px rather than 52px.

The scope note is set in `light-grey` so it reads as the aside it is, while the
explanation above it stays `dark-charcoal`. Not `grey-150`, the small-label
colour: at 16px on this background that is 3.0:1 and short of readable.
`light-grey` measures 5.50:1, which is secondary and still passes AA for body
text.

The figures keep `ts-heading-3` for its 32-to-55px ramp but take the family
back to DM Sans inline, the way Metro, the resume and Selected Work override a
face. The class carries Instrument, the serif the page titles are set in, and a
serif numeral above a DM Sans label read as a quotation mark rather than as a
figure belonging to the words under it.

The bar is not the data. Every count is written underneath in numerals and
words, and the bar is `aria-hidden`: it exists to make eight-in-ten and
twelve-in-thirteen comparable at a glance, and nothing is lost by not seeing
it, not telling the two colours apart, or having it never move. The two colours
are the page's own — IBM blue and `--color-ability-blue`. Counts of one read as
one: `ResearchStatPart` carries the singular and the component pluralises, so
the survey says `1 Admin`.

**Key Research Insights** is `ResearchInsights`: three blocks one under the
other, each the full width of the column. Not three cards in a row — the
findings carry two paragraphs apiece and a third of a column cannot hold them —
and not cards at all, since a border with a fill makes static prose look like
something to click.

The prose runs to `max-w-[760px]` while the rules stay the full 951px. At 16px
the whole column is about 115 characters to the line, past where an eye finds
the start of the next one reliably, and these are the longest paragraphs on the
page. Full-width rules against a narrower measure is the pairing the reference
sheets use, and it leaves the page's content width alone.

The theme takes the accent along with the number before it: `01 Navigation` is
one label, and colouring half of it had the theme read as a caption on the
number rather than as part of it. "Design Implication" stays grey — it names a
different kind of thing.

Each implication keeps body type but takes a 2px accent rule down its left
edge, because the join between what was found and what was done about it is the
point of the section, and that join is invisible when both are body copy in the
same stack.

**Animation.** One `Reveal` per insight rather than one around the three: they
are a screen apart by the time they are read, so each arrives on its own as it
is scrolled to — the stagger, without a stagger having to be timed. The bars
sweep once from the left, as one sweep for the whole bar rather than a width
animation per segment, which would show proportions that were never the data on
the way to the ones that are. The implication rules draw top to bottom. All of
it is `viewport={{ once: true }}`, and all of it collapses to `duration: 0`
under `prefers-reduced-motion`. No counters: a number that counts up implies
research data that changes.

**Target User** holds two sentences and the persona slide, and deliberately no
more — the slide carries the role, responsibilities, needs and pain points, and
setting the same material as copy beside it would have the reader read it twice
and the page claim it twice. Betty is a persona standing for the role, not
somebody who was interviewed, and nothing on the page says otherwise.

The slide is not in the repo yet. `TargetUser` takes it as an optional prop:
given one it is two columns from 810 and a stack below, with the slide opening
through `Zoomable` (`pinchZoom`, so the small type in it can be read on a
phone); without one it is the copy at a readable measure rather than an empty
column beside it. The two-column branch was checked against a throwaway
stand-in at a slide's 16:9 and then removed — nothing invented was left in the
tree.

**Checked.** Heading sizes 55 / 24 / 20 against body 16, one `h1`. Section
spacing identical to The Problem at 90 / 10 / 70px. The rail gains Research and
jumps to it clear of the pinned nav. Bars measure 80.0% / 20.0% and 92.3% /
7.7%, which is 8-in-10 and 12-in-13. Both methods, three themes, three
implications and the three arrows in insight 01 all present. Statistics side by
side from 810 and stacked below it, in two 451.5px columns, with exactly one
horizontal rule left in the Research Methods block. No element crosses either edge and the
document has no overhang at 320, 390, 430, 600, 768, 810, 1024, 1200, 1280 or
1440. The bars run 0 to 1 over 0.6s with motion on, land in one frame under
`reduce`, and stay drawn after scrolling away and back. All three implication
rules draw during an ordinary scroll.

**Two things left open.** The Betty slide has not been supplied, so Target User
is currently copy only. And the counts: the brief says ten semi-structured
interviews, while the research page supplied as a visual reference shows eight,
with a participant table of eight and a usability-testing phase of seven that
the brief does not mention. The brief is the source of truth and the page says
ten, but the two do not agree and only Anne can say which is right.

**A warning that is not this section's:** `animate gap from "normal" to "40"`
appears in the console on every case-study page, Metro and BudgetCart and Ryze
included. It predates this work.

### Design Process & Iteration

Three areas, three versions each, as they were actually drawn. The section
after Research, and the one that says what the research changed.

**Two levels, which is the playback deck's own shape.** Across the top the
areas — Home, Issues, Metrics — with a marker that glides between them. Down
the left that area's versions, only the open one showing its reasoning. On the
right the screenshot for whichever version is open. The two controls are
independent, and each area remembers which version was last open, so coming
back to one finds it as it was left rather than reset to Version 1; the reader
was comparing, and throwing that away makes them do it again.

**Collapsed rather than three paragraphs.** The versions are alternatives to
each other. Printed one under the other in full they read as three things that
happened; collapsed to their titles with one open they read as three answers to
the same question, which is what they were. It also keeps the left column near
the height of the picture beside it instead of running twice as long.

**The two levels are told apart by form, not just by position.** Both started
as text on a divider with a blue mark, which made two different kinds of
navigation look like one kind done twice. The areas keep that treatment, being
the primary control. The versions became a stepper: a numbered circle per
version — `01`, `02`, then a check for the last one, which is where the area
ended up — joined by a hairline running down through them. The horizontal
rules between versions are gone; the only line left in that column runs
vertically and joins the steps rather than separating them, which is the
opposite job. The marker that moves is one disc per area carrying a
`layoutId`, so Motion slides it from circle to circle instead of one filling
while another empties; `-inset-px` puts it over the border underneath, which
cannot be animated with it.

The connector is drawn from the foot of each marker to the foot of its row, so
it grows and shrinks as the description opens above it rather than being a
fixed length that has to be kept in step. The copy is indented `pl-12` — the
32px marker and the 16px beside it — so it starts on the title's left edge
rather than under the circle.

**Why the stage has a fixed height.** These captures are not one shape — they
run from 0.61 to 1.41 wide-over-tall, because the early versions are full-page
scrolls of a dense dashboard and the final ones are shorter and more focused.
The shape changing is part of what the section shows. One aspect ratio would
either be as tall as the tallest, leaving a landscape capture floating in a
half-empty frame, or as wide as the widest, with the tall ones spilling out.
**The frame takes the active picture's own proportions** and holds exactly the
picture, no more. A fixed box could not: whichever height was picked, some of
the nine sat in it with a band of nothing above or beside them, and a frame
drawn round that band is a box with a picture floating in it rather than a
framed picture. This is a deliberate reversal of the fixed stage that came
before it — the frame now reshapes between versions, which the `layout` prop
animates over 0.4s, and snaps under reduced motion.

It runs the full width of its column. A cap on how tall a full-page capture
could get used to hold the tall ones back from that edge and leave them
centred, their right edge somewhere short of the Metrics tab and in a
different place for each version; without it every version's right edge lands
on the same line and each picture is as large as the column allows.

Measured across all nine, the slack inside the frame is 0 to 1px — the picture
fills it — and every one is larger than under the fixed stage it replaced:
Home's Version 1 went 295x480, then 428x697, now 640x1042. The frame's top
edge never moves, so reshaping changes the height below it and nothing above.
The tall captures are genuinely tall at this size: Home's Version 1 is a
1045px block, which is what a full-page scroll of a dense dashboard measures
when it is shown whole and not shrunk.

The frame carries the 12px corner and `overflow-hidden`, and nothing else —
no border, no fill, no shadow. It had a 1px `grey-100` border for a while; it
read as a grey outline down the right and bottom, where the captures are
light, and was invisible along the top and left, where their dark chrome runs
to the edge. Checked up the whole ancestor chain afterwards: every element
from the `img` to the section reports border 0, shadow none, transparent
background, and `outline-style: none` — the only outline widths in there
belong to focus rules that draw nothing until focused.

**No blank frame between versions.** The swap used to run under
`AnimatePresence mode="wait"`, which finishes the exit before it starts the
enter. Measured on a strip of the frame, that left it holding nothing but the
page behind it — 100% background for about 200ms, five consecutive samples —
and since the incoming picture was a freshly mounted `img`, the gap lasted
until it had been fetched and decoded rather than for a fixed time. One image
node was destroyed and another created on every switch.

All of the active area's pictures are laid in on top of each other now, and
switching changes only their opacity over 0.25s. Nothing mounts, unmounts or
reloads: measured again, zero image nodes added or removed per switch, three
mounted, and no frame anywhere in the transition is uniform page background.
A picture is decoded long before it is chosen, because it has been sitting in
the frame at zero opacity — which is the preloading, without a preloader.
Nine clicks at 45ms apart produce no blank frames and settle with one step
open and the right picture showing.

The frame's proportions are animated as a number on `aspectRatio` rather than
through Motion's `layout`. A layout animation reshapes a box by scaling it,
and that scale lands on the picture inside and squeezes it for the length of
the animation; animating the ratio changes the height with no transform
anywhere near the content. The picture itself no longer animates scale or
position at all — only opacity.

**The columns answer to the tabs above them.** The three tabs are equal
thirds of the row — 317px each in a 951px column, 243px at 810 — and those
thirds are the boundary the two columns below have to respect: the timeline
stays inside the first, the picture runs to the right edge of the third.

So the split is a share, 30/70, not a fixed width. A fixed timeline wide
enough to read at a desktop crossed into the Issues tab at 810; 30% is inside
the first third at every size, by 32px at a desktop and 24px at 810. The gap
is 24px, the narrowest that still reads as two columns, so what it gives up
goes to the picture. Measured at 810, 1024, 1280 and 1440, on all three
versions: the timeline's right edge never passes the Home tab's, and the
frame's right edge lands on the Metrics tab's to the pixel.

**The section cannot be made wider than the column.** `CaseShell` caps `main`
at 1200px at every viewport, and the article is 951px of it — 119px rail,
90px gap, 40px padding, measured. There is 40px of slack to the canvas edge
and nothing beyond it. A 1280px container needs `canvasWidth` raised, which
widens the hero, every other section and MoreProjects; breaking this one
section out of the column instead would misalign its left edge against every
other section on the page. The width gain here comes from the split and from
the frame fitting the picture, not from the container.

**Two columns from 810, not from 1200**, even though a tablet is usually where
this would stack. The rail only takes layout space from 1200, so the column is
1119px wide at 1199 and 951px at 1200. Splitting at 1200 would have the picture
run the full 1119px on the narrower window and then shrink to 620px on the
wider one — the responsive behaviour backwards. Two columns the whole way up
keeps it monotonic; the narrowest case, 730px at 810, gives the reasoning
248px.

**One rhythm down the column.** The last step used to drop the 28px that
followed every other one, which made it the only step whose spacing changed
with which step was open — the column read differently depending on where you
were in it. Every step carries it now. Measured in all three states: the gap
from button to copy and the padding under the copy are identical, the copy
never leaves its own step, and the frame's top does not move.

**Animation**, borrowed from the Ripplix accordion and not its styling. The
panel opens and closes on `height: auto` over 0.35s inside `overflow-hidden`,
and because the closing and opening panels run together the column's own height
barely moves — measured 122px to 103px across the swap rather than collapsing
to nothing and back. The picture swaps under `AnimatePresence mode="wait"`,
0.16s out and 0.4s in, so exactly one image is ever mounted. The area marker
and the version marker are `layoutId` elements, so they glide.

Under `prefers-reduced-motion` the panel transition is `duration: 0`, not a
short fade. With height un-animated, any exit duration at all leaves both
panels at full height at once and the column jumps by the height of one of
them and back — measured at 124px for 120ms before this was fixed.

**No auto-advance.** The Ripplix component cycles on an 11s timer; here the
reader is comparing screenshots and reading the reasoning beside them, and
having it move under them is the opposite of useful. Not built rather than
built and disabled: `selectVersion` is the single place a version changes, so a
timer would be an effect calling it and a clear in the handlers that exist.

**The files.** Used where they already sit, under each area's own `Iteration`
folder, rather than copied into a new one — same bytes, one place, no
duplicates. `V3` on disk is the Final column; they were named before the third
version turned out to be the last. These are the only IBM assets not carrying a
content hash, which is the price of not duplicating them.

| | Version 1 | Version 2 | Final |
| --- | --- | --- | --- |
| Home | `home/Iteration/Home_V1.png` | `Home_V2.png` | `Home_V3.png` |
| Issues | `issues/Iteration/Issues_V1.png` | `Issues_V2.jpg` | `Issues_V3.png` |
| Metrics | `metrics/Iteration/Metrics_V1.png` | `Metrics_V2.png` | `Metrics_V3.png` |

Nine more files sit in those folders unused — `ErrorDetailPanel_V1/V2`,
`Execution flow`, `Impacted dependencies`, `Issues_V3_Expanded`, `Connections`,
`Network`, `Pinned Metrics`, `Runtime`, `Tools`. They are detail shots of the
final designs, which is the Features section, and that is not this section.

**Checked.** All nine combinations: each shows its own title and its own file,
exactly one step open, alt text on every picture. Heading levels run
`h2` then `h3` with nothing skipped, and the page still has one `h1`. Section
spacing is the page's own — 90px between sections, 10px from the title to its
content. The rail gains `Design Process` and jumps to the section at 110px,
clear of the pinned nav. Area tabs take arrow keys, Home and End, with focus
following selection and a visible ring; the accordion buttons are ordinary
tab stops and open on Enter, each panel a `region` labelled by its button. The
lightbox opens, closes on Escape, and has a 44px close button. Touch targets
are 49px for the area tabs and 48px or more for the steps. Two columns from
810, stacked below, no overflow at either edge and no document overhang at 320,
360, 390, 430, 500, 600, 700, 768, 810, 900, 1024, 1100, 1280 or 1440. Nothing
in Solution Overview moved. `tsc`, `eslint`, `prettier` and `next build` clean.

**One line removed from the Metrics final.** It read "This final Metrics
direction had not yet undergone dedicated usability validation." Anne took it
out. Nothing left in the section claims the direction was validated, and
`note` stays on `DesignIteration` if a qualification is wanted on any version
later. The section's own introduction still says the work was refined "through
iterative prototyping and usability feedback", which is true of the project as
a whole and now covers Metrics by implication rather than by exception — worth
knowing if that distinction ever needs to be exact again.

**The border came off, and the flash had a cause.** Two things were wrong with
the frame. The `border border-grey-100` asked for in the layout round read as an
outline down the right and bottom only, which is where these captures are light;
along the top and left the dark IBM chrome runs to the edge and swallows it. It
is gone, and the whole chain from the `img` up to the section now reports border
0, shadow none and a transparent background. The 12px corners and the clipping
stay.

The flash on a version switch was `AnimatePresence mode="wait"`, which finishes
the exit before it starts the enter. A strip of the frame sampled through one
switch was 100% page background for five consecutive samples, about 200ms, and
the DOM showed one `img` destroyed and another created each time — so the gap
lasted as long as the new file took to fetch and decode, not for a fixed
duration. All three of the active area's pictures are now stacked in the frame
and only their opacity changes, over 250ms. Nothing mounts, unmounts or reloads;
a picture is decoded long before it is chosen, which is the preloading without a
preloader. Nine clicks 45ms apart produce no blank frame and settle with one
step open, three layers at 0/0/1 and the right file showing. The frame's
proportions animate as a number on `aspectRatio` rather than through Motion's
`layout`, because a layout animation reshapes a box by scaling it and that scale
lands on the picture inside.

**Home and Issues copy replaced.** Anne supplied the final wording for all six
Home and Issues versions and asked for it verbatim — no rewriting, no trimming.
Each paragraph is its own string in `description`, so Home Version 2 and Final
and Issues Final now run three paragraphs where they ran one. Two titles changed
with the copy: Issues Version 2 is `Simplifying Issue Management`, previously
`Connecting Issues to Context`, and the Issues final is `Connecting Issues with
Affected Artifacts`, previously `Focused Issue Investigation`. Metrics is
untouched, and so is every component — this was a change of data only.

**Checked.** All nine combinations read back character for character against the
supplied text, with exactly one step open each. The longer descriptions change
nothing about the frame: the timeline still ends inside the Home tab (534 against
the tab's 566 at 1280) and the frame is still flush with the Metrics tab's right
edge at 810, 1024, 1280 and 1440. No overflow at either edge at 390, 430, 810,
1024, 1280 or 1440, and no console errors. `tsc`, `eslint`, `prettier` and
`next build` clean.

### Design Process & Iteration, restructured

The tabs are gone. Home, Issues and Metrics are three blocks down the page,
each with its own row of versions, its own screenshot and its reasoning under
it. Anne asked for it and the two reasons are good ones: a tab hides what is
behind it, so a reader who never pressed `Issues` never learned that Alerts
became Issues or why the Tickets panel went away — decisions sitting behind a
control that looks optional — and the reasoning was living in a 30% column
about 280px wide, roughly forty characters to the line, which turned a
three-line paragraph into seven.

**The shape now.** Section title, the section's one introduction, then three
`section`s at 70px with the page's hairline between them. Each is a numbered
`h3` at the size Research gives its blocks (`ts-heading-6`), a body-sized line
saying where the area travelled, a compact row of version buttons, the
screenshot, and under it the version's title at `ts-body-large-fluid` with its
paragraphs at the 760px measure Research uses for its longest prose. The
numbers are `aria-hidden`, so the heading is read as "Home" rather than "oh
one Home"; the order is in the DOM already.

**The version row is `w-fit`, not three equal thirds.** A full-width row of
three was exactly what the area tabs were, and making the versions look like
the thing that was just removed would say they were the same kind of control.
They are 167px of buttons on a short rule with the marker riding it, left
aligned under the subtitle — 232px when Metrics takes its fourth version,
which still fits the 272px column at 320.

**Each block owns its version.** `AreaBlock` holds its own `useState`, so
choosing Final in Home leaves Issues and Metrics on V1; every block starts at
V1 on load. The labels are `V1`, `V2`, `Final` — the data's `version` field
now carries the short form, since the selector is the only place it is drawn.

**The frame.** Full column width instead of two thirds of it, with the picture
taking its own proportions and a maximum height per breakpoint: 1300 at a
desktop, 1150 at a tablet, none on a phone. Only Home V1 needs it at a desktop
— 2160x3517 would be 1549px tall at the column's 951 — and the cap holds it to
798px wide where the two-column layout gave it 642. The other eight run the
column's full 951. A tablet's column is the widest on the site, 1119px at
1199, so the cap does more work there; a phone's is narrow enough that heights
follow from it. Where the cap bites the picture is centred and the frame is
wider than it, which is invisible because nothing is drawn around it.

The crossfade is unchanged and for the same reason: every version of an area
is mounted in the frame at once and only opacity moves, so nothing mounts,
reloads or flashes. Only the copy below is keyed on the version, and keying
text costs nothing.

**The prototype disclaimer is now one line at the foot of the section** rather
than a caption under the stage. There are three stages now, and the sentence
would have been printed three times.

**Metrics V2.5.** The slot is declared in `DESIGN_AREAS` as a comment where
the object goes, not as a placeholder: an invented title or a screenshot
borrowed from another version would be a claim about work that has not been
written up. The component takes however many versions an area has. Four was
checked by temporarily adding one: the buttons stay on one row at 320, 390,
810 and 1440, each at 44px, the fourth drives the frame, and the frame carries
four stacked layers. The probe was removed afterwards.

**Checked.** All nine titles and all nine description blocks read back out of
the live page character for character — Home and Issues against Anne's
approved wording, Metrics against what was already there. Every version shows
its own file: Home V1/V2/V3, Issues V1/V2.jpg/V3, Metrics V1/V2/V3. Choosing a
version in one block leaves the other two as they were. Arrow keys wrap, Home
and End jump to the ends, focus follows selection and the page does not scroll
under it; roving `tabindex`, each list labelled, each tab pointing at its
block's panel, the panel labelled by the selected tab, and `alt` only on the
picture actually being shown. The lightbox opens the right file with a 44px
close button and shuts on Escape. Switching from Issues V1 to Final samples
0 blank frames in both motion modes, and the frame's document position and the
page's scroll are identical before and after. Nine clicks 45ms apart settle
with one tab selected, three layers at 0/0/1 and the right file. No element
crosses either viewport edge at 320, 390, 430, 600, 768, 810, 1024, 1199, 1280
or 1440, and the subtitles wrap rather than clip at 320. One `h1`, no heading
level skipped, the rail unchanged and still landing the section at 113px.
`tsc`, `eslint`, `prettier` and `next build` clean, no console errors.

### Reasoning first, screenshot as a preview

The stacked layout put the whole screenshot between the version buttons and
the reasoning, so reaching the next thing Anne had to say meant scrolling a
dashboard and a half. The order inside each block is now heading, subtitle,
version buttons, version title, description, screenshot — and the screenshot
is a preview rather than the whole picture.

**The preview is clipped, not scaled.** The frame takes the full width of the
column and 500px of height at a desktop, 440 at a tablet, 360 on a phone. The
picture is laid in at the frame's width with its height left to follow and
pinned to the top; whatever falls past the cap is clipped by the frame. No
file is touched and nothing is resized — the lightbox opens the original, at
its own size on a desktop and pinchable on a phone.

**Width and automatic height, not `fill` with `object-cover`.** Cover fits
whichever edge is tighter, and the frame spends 300ms between one picture's
proportions and the next on every switch. A landscape capture arriving into a
frame still as tall as the portrait one would be scaled up to fill that height
and lose about 160px off its sides for the length of the animation. A width
with `h-auto` cannot do that: the picture is the frame's width throughout,
whatever the frame is doing around it.

**The cue.** A clipped picture has to say so. `cursor-zoom-in` tells a desktop
reader the picture opens but not that there is more of it, and a touch screen
has neither. A pill sits at the bottom right of the frame — the expand arrows
the Solution Overview already uses, `View full screenshot`, on the page's own
background at 95% with the page's hairline round it. `aria-hidden`, because
`Zoomable`'s button is already named `Enlarge: <alt>`; it is a label on the
control, not a control, and a button inside a button would not survive
parsing. It is set in `text-light-grey` rather than the grey the small label
class carries: 5.5:1 against the page where the token gives 3.0:1, and it sits
over screenshots whose own background it cannot be sure of.

**What this does to layout shift.** From 810 up every one of the nine
overruns its cap, so the frame is exactly 500 (or 440) tall whichever version
is showing and switching moves nothing below it. What does move is the
screenshot itself, by as much as the descriptions differ in length — 52px
between a two-paragraph version and a three-paragraph one. The browser's
scroll anchoring absorbs it: measured through a switch, the frame stayed at
the same offset in the window while the document scroll took up the
difference. On a phone the column is narrow enough that four of the nine fit
under the cap, and there the frame is the picture's own height.

**Checked.** The description precedes the screenshot in all nine, at 760px
with 30px between the two, and all nine titles and descriptions still read
back character for character. The frame is 951x500 at 1440, 944x440 at 1024,
730x440 at 810 and at most 360 tall on a phone, with the picture at the
frame's full width every time and the cue inside the frame at every width,
175px wide, which fits the 272px column at 320. No element crosses either
viewport edge at 320, 390, 810, 1024, 1199 or 1440. Switching samples zero
blank frames in both motion modes and the frame's height is unchanged across
it. Keyboard, ARIA wiring and the lightbox are as they were: arrow keys wrap,
Home and End jump, focus follows selection, each list labelled, `alt` only on
the picture being shown, the lightbox opening the right file with a 44px close
button and shutting on Escape. `tsc`, `eslint`, `prettier` and `next build`
clean.

### The preview scrolls, and the lightbox opens whole

Two things were wrong with the viewer. The preview was clipped with no way to
see what was under the cut but the lightbox, and the lightbox opened at the
file's own pixels: Home V1 is 2160x3517, so clicking it put a reader somewhere
inside an image three times the height of their window with the scrollbar as
the only way out. The screenshot Anne sent showed a table row filling the
screen.

**The preview is a scroll container.** Same box, same cap, same picture at the
column's full width — `overflow-y: auto` and it scrolls in place. The frame's
`aspect-ratio` already gives the box the picture's full height and the cap
takes back everything past 500px, so the overflow is exactly the part that was
being clipped.

Three things had to be true for that to work:

- **The layers had to be held to the stage.** An absolutely positioned child
  still counts towards a scroll container's extent, so with the three versions
  stacked, the tallest one set how far every one of them scrolled — Home Final
  ran out at its own foot and then kept going through 870px of nothing. Each
  layer is now `inset-0` with its overflow hidden, so it stops where the stage
  does, and the stage is the shown picture's own shape. Measured: the scroll
  extent equals the visible picture's height for all nine, to the pixel.
- **Lenis had to let go of the wheel.** `smoothWheel` takes every wheel event
  on the window and turns it into page scroll, so the wheel over a screenshot
  scrolled the article. `allowNestedScroll: true` hands the wheel to a nested
  scroller — but only while that scroller can still move the way the wheel
  asked, which it decides by reading the element's scroll position and its
  `overscroll-behavior`. So no `overscroll-contain` here: at the bottom of the
  picture the page takes over again instead of trapping the reader in 500px of
  screenshot. Measured: 300 of wheel moves the picture 300 and the page 0; at
  the end, the next wheel moves the page 487.
- **The scroll position belongs to the version.** Every switch returns to the
  top, instantly — the picture underneath has changed, so there is nothing for
  a smooth scroll to be continuous with. A `ResizeObserver` and one delayed
  measurement keep the "more below" state honest while the frame is still
  animating and the pictures are still decoding.

**The cue is now two.** The expand pill stays, and a fade at the foot of the
frame appears while there is more below and goes as the end is reached. Both
sit outside the scroller and over it, so they hold still while the picture
runs past, with `pointer-events: none` so the click and the wheel reach the
picture underneath.

**The lightbox fits first.** `panOnDesktop` is gone from this section, replaced
by a new `fitZoom` on `Zoomable`: one behaviour at every width — the whole
picture fitted to the window, then zoomed and panned from there. Fitting first
answers "what am I looking at" before "what does that say", and the zoom is
still there for the second question. The old `TouchStage`, which already did
exactly this on a phone, is now `ZoomStage` and serves both; what it gained is

- a wheel and trackpad zoom about the cursor, on a native non-passive listener
  because React registers `wheel` at the root as passive and a `preventDefault`
  from `onWheel` would do nothing;
- a row of controls under the picture — minus, the current percentage, plus —
  for a reader who does not know a picture can be pinched or double-clicked,
  and for a mouse whose notched wheel is a coarse way to find 140%;
- `grab` and `grabbing` cursors once there is something to pan.

`pinchZoom` and `panOnDesktop` are untouched, so Solution Overview, the
persona slide and Metro open exactly as they did.

**Checked.** The lightbox opens Home V1 at 504x820 inside a 1440x900 window
and 358x583 inside a 390x844 one — whole, centred, 100% both times — zooms to
140% on two presses, pans on a drag, comes back to 100% on the wheel and sits
centred again; double-click goes to 250% and back. The close button and Escape
both shut it, the page behind cannot be scrolled over the picture or over the
backdrop, and reopening after a version switch opens that version's file. The
asset is the original: the optimizer is asked for the largest variant and
returns the file's own 2160x3517 (a headless browser reports a downsampled
`naturalWidth` for an image this large, which is the decoder's memory budget,
not what was served).

The preview scrolls on the wheel, the trackpad and a touch swipe — 197px on a
synthetic swipe on an iPhone 13, with the page unmoved — the extent matches
the picture for all nine versions, the frame stays 500px tall, the fade is on
at the top and off at the bottom, and a switch returns to the top. The
`01`/`02`/`03` before each area title is now the heading's own 24px rather
than a 14px label beside it, in IBM blue, still hidden from the heading's
accessible name. `tsc`, `eslint`, `prettier` and `next build` clean, no
console errors.

**The fade came off, and the number went black.** The gradient at the foot of
the frame washed the bottom of every screenshot into the page; the cut edge of
a dashboard says plainly enough that there is more of it, and the expand pill
says where the rest is. With it went the `more` state, the scroll handler and
the `ResizeObserver` that kept it honest — the scroll container now needs only
the reset to the top on a version change. The `01`/`02`/`03` before each area
title takes the heading's own colour as well as its size: in blue it read as a
label on the heading rather than as part of it.

**One edge, and the unselected versions further back.** The reasoning ran at
the 760px measure Research uses, which left it stopping 190px short of the
screenshot beneath it; Anne asked for the two to share an edge, so the copy
takes the column. Measured, the text and the frame start and end on the same
pixel at 390, 810, 1024 and 1440. At a desktop that is 951px, about 115
characters to the line — longer than the measure the rest of the page keeps,
which is the trade for one edge, and a version's reasoning is two or three
paragraphs rather than a page of prose. The unselected version buttons move
from `light-grey` to `grey-150`: three states of one control, only one of them
current, so the other two step back further than body copy does.

### Metrics: four versions, and a version shown by four pictures

Anne sent the final Metrics copy and it runs to four versions rather than
three — V1, V2, V2.5 and the final — so the slot left open for V2.5 in the
restructure is filled. The wording is hers, verbatim, including the last
paragraph of the final version, which says the concept has not been usability
tested and what future testing would have to validate. The button stays
`Final` rather than `V3`, her choice, so all three areas end the same way.

**V2.5 is four pictures, not one.** `Runtime`, `Network`, `Connections` and
`Tools` — the metric cards the copy describes, each about 1114x640 — were
sitting unused in the Iteration folder. They are four separate studies, and
showing them as one picture would mean making a montage that never existed.
`DesignIteration` gained `shots`, a list of pictures that replaces the single
screen where it is set, and the showcase lays them out two across from 810 and
one below it. Each opens on its own in the lightbox.

That split the figure in two: `screenOf` turns an iteration into the one
screen it is shown by, or nothing where `shots` carries the pictures, and the
crossfade stack is built from the iterations that have one. A version shown by
studies is not in that stack — it has its own grid, and nothing in the frame
to fade to.

**No expand cue on the studies.** Nothing is clipped at 466x266, so there is
nothing for a cue to say "there is more" about, and the badge had to sit on
the card's own content: it covered the end of a credential expiry in
`Connections` and a degraded tool in `Tools`. The pill stays on the full
screenshots, which are clipped and which teach the behaviour earlier in the
section.

**Two alt texts rewritten.** The Metrics V1 and V2 alts described fleet-wide
performance across every artifact; the files actually show the Metrics tab of
the Overview page — pinned figures for conversations, token usage, unique
users, estimated cost and task completion over an analytics block of top token
consumers, a token trend and a cost forecast. V2 is the same with two empty
`Create pin` slots. The pictures were always these; the alts had been written
against the older copy. The final's alt was already accurate and is unchanged.

**Checked.** All four versions read back character for character against what
Anne sent, each with its own screenshots: V1 `Metrics_V1`, V2 `Metrics_V2`,
V2.5 the four cards in order, the final `Metrics_V3`. Home and Issues are
untouched — all six still exact. The selector carries four buttons on one row
at 390, 810 and 1440, arrow keys wrap through all four and Home and End reach
the ends. The grid is one column at 390 and two at 810 and 1440, with no
overflow at either edge. A study opens fitted and centred in the lightbox at
1034x600 inside a 1440x900 window, with the zoom controls and its own alt text
as the dialog's name. `tsc`, `eslint`, `prettier` and `next build` clean, no
console errors.

### Issues Final: the opened panel, and the two tabs under it

`Issues_V3.png` was the empty state. The right-hand two thirds of it says
`Click an issue to see more` and nothing else, so the version whose whole point
is that issues and their impacted artifacts were brought together was shown by a
picture in which they are not. Anne swapped it for `Issues_V3_Expanded.png`,
which is the same screen with `Agentic workflow execution failures` open: the
list on the left, and beside it the investigation panel with its
`Execution flow` and `Impacted dependencies` tabs, the artifact relationship
graph, the execution trace and the recommended next steps. The copy already
described that screen; now the screenshot does too. The old file is left in
place, unused.

**Why the two tabs are shown separately.** Under them Anne added
`Execution flow.png` and `Impacted dependencies.png`, which are those two tabs
captured on their own at 1680px wide. They have to be separate pictures: the
panel is one tab at a time, and in the full screen at 951px its prose renders at
about 6px — visibly a panel, legibly nothing. Shown at the column's own width
the explanation, the trace timings and the dependency table can be read.

**`details`, not `shots`.** `shots` replaces the version's screen and lays its
pictures two across, which is right for Metrics V2.5 — four alternatives, none
of them the screen — and wrong here: these belong under a screen, not instead of
one, and at half a column the illegibility that prompted them comes straight
back. `DesignIteration` gained `details`, a list rendered below the screen, each
one full width in the same frame the screen uses: same height cap, same clipping
with the remainder scrollable in place, same cue to the lightbox. No layer stack
and no animated ratio, because nothing crossfades — they belong to one version,
and switching away unmounts them, which is also why their scroll position needs
no resetting.

**A caption under each.** Both captures carry the same panel header with a
different tab lit, so without a word under them they read as the same picture
twice. `DesignShot` gained an optional `caption`; the two say `Execution flow`
and `Impacted dependencies`, which is what the tabs in the pictures say.

**The pair sits in one row.** They were stacked at first, each the full width
of the column. Anne asked for them side by side, which is also how two states of
one panel are compared: the same header with a different thing under it, read
across rather than scrolled between. Two across from 810 and one below it, in
the grid the Metrics studies use.

They are top-aligned, not stretched. At 1440 each plate is 466px wide, where
`Execution flow` stands 562px tall and `Impacted dependencies` 333px, so the row
ends ragged. The alternative is giving the shorter one the taller one's height,
which adds 167px of empty frame under a picture that has already finished —
worse than an uneven bottom edge, and the caption under each keeps it clear
which is which. Only `Execution flow` is still clipped at this size, by 62px,
and it scrolls as before.

**The cue went compact.** Spelled out, the pill is 175px of a 466px plate —
better than a third of the picture, and on `Execution flow` it sat over the
panel's own `Inspect in Flow` button. `ExpandCue` gained a `compact` form, the
icon alone in a round badge; the full-width screen above still carries the
wording, which is where the behaviour is learned. This is the same reasoning
that took the badge off the Metrics studies, one step short of removing it:
these are clipped and those were not.

**Checked** at 390, 810, 1024 and 1440. Three figures in the Final panel, no
element crossing either viewport edge. Stacked at 390 and side by side from 810,
both plates starting on the same line at 810, 1024 and 1440. The frames cap at
360 / 440 / 440 / 500, and what runs past the cap is scrollable: a wheel over the
first plate moved it 300px of its 649 and the article not at all. Each plate
opens on its own in the lightbox, fitted — `Impacted dependencies` at 1146x820
inside a 1440x900 window — with its own alt as the dialog's name, and Escape
closes it. The Final copy is untouched: same title, same three paragraphs.
`tsc`, `eslint`, `prettier` and `next build` clean, no console errors.

**The left border came off the files.** Both captures carried their leftmost two
columns as solid `#e0e0e0` — the panel's own left edge, where the capture was cut
against the issue list beside it. On the page it drew a hairline down the left of
each plate, inside a frame that has no border of its own, so it read as a frame
the other pictures do not have. Cropped to 1678 wide as
`Execution flow-trimmed.png` and `Impacted dependencies-trimmed.png`, which is
the naming `metrics-artifact-view-trimmed` already set; the originals stay in
place untouched. Nothing else was resampled — the crop is two columns of one
colour — and the lightbox now opens the trimmed file too, so the line is gone
there as well. Checked at the rendered left edge: white at the first pixel of
both, where it was `e0e0e0`.

### Solution Overview: Issues becomes a recording too

Anne renamed the Home recording to `Home.gif`, so the showcase's `imageSrc`
follows it; the file is the same 960x681, 177 frames. Nothing else about Home
changed, and `IbmHeroArt` still points at its own still.

Issues was the still `issue-investigation.6d140d03.png`, the end of an
investigation with nothing to say about how it was reached. The recording walks
it: the list with nothing selected, an agent failure opened beside it, the
artifact graph and execution trace under `Execution flow`, then the affected
assets under `Impacted dependencies`. The still stays in place, unused.

**The last 25 frames had to go.** `issues.gif` ends with the macOS
screen-recording controls fading in across its bottom left — the stop button,
`Options`, `Capture`. A GIF loops, so that is not a tail, it is a thing the page
shows for a second every thirteen. Trimmed at frame 292, which is the last frame
before they appear and which leaves the loop ending on the dependency table with
the cursor at rest.

The trim is a byte-level truncation, not a re-encode. A GIF is a header, a
palette and a run of frame blocks, so cutting after a frame's data and writing
the trailer leaves every kept frame exactly as it was: 4.51MB against 4.62MB, and
each of the 292 frames rendering identical to the original's, measured at zero
mean difference. Pillow's `save_all` was tried first and wrote 34.8MB, because it
re-encodes each frame whole rather than keeping the deltas, and dropped five
frames on the way. The original stays beside the trimmed file.

**The set lost its last baked corner.** `imageRadius` records the curve a file
carries in its own alpha, and the clip reconciles files that disagree. Issues was
the only step still carrying one; a GIF has a single transparent colour and no
alpha, so with it gone every step is square and the clip had nothing to
reconcile — the three pictures would have come out hard-edged, the only ones on
the page with no corner at all. `StickyStepShowcase` gained `BARE_CORNER`, 16px,
used only when no step carries a curve of its own. It is what the rest of the
case study rounds a picture to and within two pixels of the 21-over-1292 share
Issues used to set, so the section keeps the corner it has been showing. A pixel
count, not a share: a share of a frame running from 92vw to 1072px leaves a phone
with a 5px corner.

**Checked** on the running page: the three steps resolve to `Home.gif` at
960x681, `issues-trimmed.gif` at 960x683 and the Metrics still, each clipped to
16px, both GIFs served unoptimized so they animate rather than arriving as one
still frame. No failed image requests, no console errors. `tsc`, `eslint`,
`prettier` and `next build` clean. `npm run previews` not rerun: the project
cards are shots of the hero, which this does not touch.

### Drawn wireframes in place of the prototype captures

The conservative branch took the IBM prototype screenshots off the page and
left the case study arguing about screens a reader could not see. These put
something back: eighteen grayscale mid-fidelity wireframes, built as React and
SVG rather than exported pictures.

**Why elements and not PNGs.** A drawing per version would have been eighteen
files to keep in step, heavy for what they carry, with unselectable text that
turns to mush when a phone scales them down. Built as markup each one is a few
kB, every label stays crisp at any zoom, and — the part that mattered most — a
composition can thin itself out at a narrow width instead of being shrunk into
illegibility. The charts are hand-written: bars are flex elements with a
capped width, because a stretched SVG `rect` fills whatever box it is given and
a seven-bar chart in a wide card came out as seven slabs.

**The kit.** `wireframe/Wire.tsx` holds the shared pieces — screen chrome with
a rail and header, tabs, cards, stat tiles, list rows, tables, badges, severity
dots, a search field, buttons, a split bar, a donut, bars, a line chart,
sixteen 12px icons — over five greys and white declared once on the frame.
IBM blue appears only where the product would mark a choice: the open rail
item, the active tab, a link, the selected row's edge. Severity is told by
weight, not hue — filled, ringed, hollow — because a grayscale drawing cannot
paint red and a blue dot would read as "selected".

**The compositions** are in `home.tsx`, `issues.tsx`, `metrics.tsx` and
`hero.tsx`, and they are deliberately not one layout with different labels:
Home V1 leads with the fleet and has no shortcuts, V2 puts Quick actions and
Recent artifacts above a fleet block that has grown charts, and the final one
has no fleet on it at all. Issues V1 runs an alert list over a ticket table
with a `Source` column, V2 deletes the table and folds assignment into the
rows, and the final version is the list beside an investigation panel. Metrics
V1 is the only drawing that shows two pages at once, because the split between
them is the thing it is about. V2.5 is four different cards, not four copies of
one. Every name, figure, ID and timestamp is invented.

**Fitting the frames.** Each area's versions share one frame height per
breakpoint — 420 / 480 / 520 — so switching a version does not move the page.
The compositions are built to fill it, and where they would not, the content
thins rather than the box growing: a phone gets two fleet figures instead of
four, two quick actions instead of four, no Recent artifacts row on the final
Home. Measured across 390, 810, 1024 and 1440, nothing inside any of the
eighteen overflows its frame.

**The hero** carries three labelled panels — Home as the plate, Issues
overlapping in front, Metrics behind and above — placed as fractions of the
canvas per the hero composition rule. Their geometry lives beside the drawings
and `IbmHeroArt` reads it only through `heroBoxes`, so the mark field clears a
space for them with nothing else to edit.

**Solution Overview is a tab row again.** It became a plain three-column list
when its pictures were removed, because tabs that choose between nothing are
not a control. With a drawing behind each step they choose something again, so
`StickyStepShowcase` puts a drawing in the frame its picture used to occupy and
the original layout comes back: three steps across the top, the open one in
blue, one drawing under them. No crossfade on the switch — the three drawings
are the same height, so the frame does not move and there is nothing for a fade
to cover. The section is 760px again rather than the 1,950 the stacked version
ran to.

**Severity is a glyph, not a dot.** Three plain dots read as three weights but
not as three kinds. `WireDot` draws a filled circle with an exclamation for
critical, an open triangle for warning, an outlined circle with an `i` for
information — deliberately not the product's own slashed circle, solid triangle
and filled square, only the same three things said in another hand. Shape
rather than fill carries it, so nothing depends on telling two greys apart.

**The Issues step plays itself.** The other drawings are stills; what the Issues
work is about is a sequence, and a still can only show one moment of it.
`SolutionIssuesDemo` loops four beats — the execution flow at the top of the
panel, the panel running down through the trace to the recommended steps, a
pointer reaching for `Impacted dependencies` and pressing it, then the
dependency table — and starts again. The scroll distance is measured from the
content against its viewport rather than guessed, because the panel is a
different height at every breakpoint. It holds at the first beat for a visitor
who asked for reduced motion, and it does not run while the section is off
screen. Not a GIF: a recording would be a megabyte of fixed-size frames whose
text turns to mush on a phone and would need re-exporting whenever a label
changed.

**No disclosure line under the drawings.** `Conceptual UI illustration —
simplified for portfolio presentation.` was removed at Anne's request. The
`Concept prototype. All names, agents, and performance data are fictional.`
note stays in both sections, and nothing on the page calls these screenshots or
claims the final Metrics concept was validated.

### Home, drawn to the narrative rather than to the captures

The first pass at the three Home drawings was too thin: each was one screenful,
so V1 lost the artifact table and the whole Health block, V2 lost three of its
four sections, and the iteration stopped being legible — three dashboards that
differed by a row. They are now drawn section for section against the team's
own captures, in the captures' order. Nothing is traced and every name, count,
percentage, owner and timestamp is invented; what is kept is the information
architecture, which is the only part the case study is arguing about.

- **V1** — Fleet overview (a card per artifact type, each with a count, a
  trend, a health bar and a three-way severity split), the artifact table
  (search, type and status filters, Add new, eight columns, six rows), Your
  most recent, then a second Health block of six cards carrying donuts,
  breakdowns and a connection table. Four sections, nothing on it a shortcut.
- **V2** — Quick actions with two pinned cards and three empty slots, Your
  most recent, then a Fleet overview that has grown a tab per artifact type,
  seven figures, two breakdown donuts and a usage trend, and the artifact table
  last with severity counts and pagination. The decision is the order.
- **Final** — pinned shortcuts with two empty slots beside Latest issues
  (severity counts, sort control, four rows with artifact and detail), then Your
  most recent. No fleet block, no artifact table, and `Overview` is `Home`.

**The previews scroll.** V1 is 1,342px tall at a desktop and 2,208px on a
phone; a fixed frame would either shrink it to a smudge or cut two sections
off. `WireFigure` gained a `scroll` mode: a fixed window — 440 / 540 / 580 per
breakpoint, the same for all three versions so the page never moves when a
reader switches — with the page inside it at its own size. `WireScreen` gained
`height="natural"` for the same reason, and its rail sticks to the top of the
window so the chrome stays put while the page runs under it.

A scroll container that nobody can find is no better than a crop, so
`.wire-scroll` in `globals.css` keeps a thin scrollbar on screen rather than
leaving it to macOS's overlay, which only appears once the reader has already
guessed. The box takes `tabIndex`, so arrows, Page Up/Down, Home and End work
on it; measured, PageDown moves it one window and End reaches the bottom. No
`overscroll-contain`, so Lenis hands the page back at the ends instead of
trapping a reader inside a drawing. `DesignIterationShowcase` puts every
`[data-wire-scroll]` box back to the top when the version changes.

**Checked** at 390, 810, 1024 and 1440: all four sections present in V1 and V2
and all three in the final, no horizontal overflow at any width, the window
height identical across the three versions, scroll position reset on switch
(400 → 0), wheel over a preview moving it 300px and the article 0, and no
console errors. The fixed-height drawings in Issues and Metrics are unchanged
and still overflow nothing. Case study copy byte-identical.

### Home, pulled back from the product

The redrawn Home pages went too far the other way. Drawn section for section
against the captures they had become the product in grey: success rates,
latency percentiles, token counts, costs, trend chips, health percentages,
time-range controls, Personal/Team toggles, pagination. That is a
reconstruction of an unreleased interface, which is the thing this branch
exists to avoid, and it buried the argument — three dashboards that differed
by a row.

**The test every element now has to pass:** does it explain what changed
between V1, V2 and the final version? Quick actions does, because it did not
exist in V1. Recent artifacts does, because it moved. The monitoring blocks do,
because they led the page, then grew, then went. A success rate does not. A
token count does not. A time-range control does not.

So the sections and their order are kept exactly, and everything inside them is
abstracted:

- **Fleet overview** is five category cards, each a label and a divided bar.
  No counts, no percentages, no trends.
- **Artifacts** is four columns — artifact, type, status, last updated — and
  four rows. The eight-column operational table is gone; what made V1 dense is
  shown by the table's size and its place on the page.
- **Health** is six cards, each a heading and an abstract mark — a ring, a run
  of bars, a divided bar. It still reads as a substantial monitoring area,
  which is its job in the story.
- **V2's Fleet overview** keeps its tab row and its doubled size, and its
  figures are `WireBlankStat`: a label bar and a figure bar with nothing
  written in either, under one unlabelled ring and one unlabelled bar run.
- **Latest issues** is severity, title and the artifact it belongs to. The
  failure rates and diagnostics are gone.

`WireShortcut` and `WireRecent` lost their status dots, owners and run counts;
`WireTrend`, `WireHealthBar` and `WireDonutStat` were deleted with the detail
they were drawn for. `WireBlankStat` and `WireShape` took their place.

**Audited on the page:** the rendered text of all three Home drawings contains
no percentage, latency, token count, cost or success rate. The only numerals
left are the final version's `2 critical issues`, which the written iteration
turns on, and relative timestamps like `Modified 5h ago`.

**Checked** at 390, 810, 1024 and 1440: four sections in V1 and V2, three in
the final, no horizontal overflow, preview window identical across versions
(440 / 538 / 578), scroll reset on switch, nothing clipped, no console errors.

### Issues, brought to the same standard as Home

The Issues drawings were both structurally wrong and too detailed. V1 showed
an alert list over a ticket table, when the capture is three stacked sections —
a row of ticket cards, a ticket list with an investigation panel beside it, and
impacted assets below. V2 had lost its investigation panel to a full-width
list. The final version had its execution trace stacked under the diagram
rather than beside the recommended steps, and all three carried failure rates,
latency percentiles, timestamps to the second and a credential error.

Redrawn to the written iteration at the fidelity Home now uses:

- **V1** keeps all three sections. The ticket cards are a title, a severity
  glyph, two placeholder lines and an assign control; `Your tickets` is the
  two-column correction, a ticket list with one row selected beside the
  investigation panel; `Impacted assets` is its own block at the foot.
- **V2** deletes the ticket row and the ticket section, puts `Personal / All`
  and a sort over one list with assignment on each row, and keeps the panel
  beside it. `Impacted assets` is still separate, which is what makes the final
  version's change legible.
- **Final** adds the ID, the timestamp and the two tabs. Under `Execution
  flow` the summary sits over the relationship diagram, and the trace runs
  **beside** the recommended steps. The second tab is drawn below as the panel
  in that state — not a second copy of the whole screen — so both tab states
  can be inspected without the interaction the Solution Overview demo has.

`InvestigationPanel` is one component across the three, with the ID and the
tabs as options, which is how the drawings stay honest about what the final
version actually added. The diagram keeps its one dashed link and lost its
lone node marker; `DetailHead` and `TraceStep` moved into
`SolutionIssuesDemo.tsx`, since Solution Overview answers a different question
and keeps the timings that make its loop legible.

**Audited on the page:** no failure rate, latency, run count, success rate or
real error text in any of the three. The only identifier is the fictional
`ISS-204 · opened today`, which the iteration explicitly turns on.

**Checked** at 390, 810, 1024 and 1440: three sections in V1, two plus impacted
assets in V2, tabs and the side-by-side trace in the final, no horizontal
overflow, preview window identical across versions, scroll reset on switch, no
console errors. Home, Metrics and Solution Overview unchanged — the Solution
Overview loop still runs its four beats.

### Metrics, brought to the same standard

The Metrics drawings were the last at the old fidelity and two of them were
structurally wrong. V1's right half was a page of token and cost figures that
the capture does not show that way; V2 had been replaced with an invented
Health/Performance dashboard; V2.5 was four tall cards of one shape with a hole
in each; the final version stacked Overview and Dependencies as continuous
sections, when the whole idea is that they are alternatives.

- **V1** keeps the two-page comparison and now renders the *actual* Home V1
  component on the left — `HomeV1Page`, extracted so Home and Metrics cannot
  drift apart, with a `compact` flag that stops after the artifact table. On
  the right is the Metrics page the capture shows: pinned metrics over an
  Analytics pair, one panel for usage and one for cost.
- **V2** is the same page with a pin left as an empty slot, which is the only
  change the capture carries. The consolidation the narrative describes is not
  in that capture, so rather than invent a dashboard for it there is a small
  labelled inset underneath — `Fleet overview` with tabs by artifact type and
  four blank figures — set on a tinted band and deliberately quieter than the
  page above it.
- **V2.5** is four compact cards, each built around a different kind of
  information: a trend, a set of relationships, a health roll-up, an inventory.
  Each carries one of the interaction ideas the round was testing — a selected
  chart range, an explore link, an action, a hover hint. Top-aligned at their
  own heights: stretched to fill the preview they grow the hole this round was
  meant to close.
- **Final** has real tabs. `MetricsFinal` is a client component with
  `role="tablist"`, roving `tabIndex` and arrow keys; pressing `Dependencies`
  swaps the panel and leaves the hierarchy where it is. No pinned metrics
  anywhere on it, because the round removed them.

`WireFigure` gained `interactive`, which renders `role="group"` instead of
`role="img"` — a picture role would have hidden the tabs from assistive
technology. `WireScreen` now lets a natural-height page fill the preview
window, so a short drawing does not leave a band of white under it.

**Audited on the page:** no figure, percentage, cost, latency or run count in
any of the four, and no provider, credential or integration name. The pinned
cards carry a name and an unreadable bar; the V2.5 cards carry labels and bars.

**Checked** at 390, 810, 1024 and 1440: the comparison stays side by side from
810, V2's inset reads as subordinate, the V2.5 grid is two across, the final
tabs switch by click and by arrow key, no horizontal overflow, preview window
identical across the four versions, scroll reset on switch, no console errors.
Home, Issues and Solution Overview unchanged.

### Two corrections, and two more prototypes that play themselves

**Issues Final had a second panel.** The Impacted dependencies state was drawn
below the main interface under a heading of its own, which showed the opposite
of what the version is about: the whole decision is that one panel holds both.
The duplicate is gone and the tabs inside the panel are real buttons — roles,
roving `tabIndex`, arrow keys — so pressing one swaps what is in the panel and
never adds anything under it.

**Metrics Final had tabs it should not have.** `Metrics_V3` shows Overview and
Dependencies as two sections stacked on the same page, which is the point: a
builder sees an artifact's own performance and what it is wired to without
choosing between them. They are stacked sections again, and the tab machinery
is gone.

**Solution Overview Home and Metrics now play.** The Issues step has looped
since it was built; the other two were stills of a page, and both of those
pages are about a move. Home's pinned shortcuts are a builder's to fill, and
Metrics is the relationship between what you choose on the left and what the
right-hand page reads.

- **Home** plays the sequence the recording actually shows; see below.
- **Metrics** moves through three invented artifacts — an agent, a workflow, a
  tool — 2.5s on the first, a second to reach the next in the tree, 3s to
  notice that the panel changed, and the same again for the third. Each carries
  its own bar widths, curve, dependency categories and related artifacts.

Both render the same components the Design Process drawings use — `HomeFinalPage`,
`ArtifactTree`, `ArtifactPanel` — with one prop different, so Solution Overview
is that design with an interaction on it rather than a second drawing that can
drift. `demo.tsx` holds the shared `useBeats`, pointer and crossfade; the Issues
demo keeps its own copy, because it works and the point of sharing is to stop
drift rather than introduce some.

**One height for the three.** `WireFigure`'s scrolling preview now takes the
compact heights when asked for them, so all three Solution Overview drawings are
380 / 430 / 450 and switching steps does not move the page.

**Checked** at 390, 810 and 1440: Issues Final has one tab panel and its tabs
swap content in place; Metrics Final has no tablist and shows both sections at
once; the Home loop runs 2 empty slots → 1 → 2; the Metrics loop runs Order
assistant → Invoice workflow → Search tool and back, with the tree highlight
following; all three Solution Overview drawings are the same height; no
horizontal overflow; the Issues prototype still animates; no console errors.

### Result & Next Steps, and Reflection

Both sections are new; the page ended at Design Process until now. The copy is
Anne's, verbatim — ten strings, each checked character for character against
what she sent.

**Result & Next Steps** opens with the one paragraph that says where the work
got to, including the line that the final artifact-centric Metrics direction
came after the last round of testing and is not validated. Under it the three
next steps run as three columns rather than three paragraphs: they are
parallel, none follows from the one before, and stacked as prose a reader works
down them looking for an argument that is not there. Side by side the eye takes
all three in before reading any of them.

`NextSteps` draws them with a hairline between the columns and nothing else —
no card, no fill, no icon, no number. A card is a surface you can act on and
these are sentences, and the page has enough drawn boxes in it already. The
heading takes IBM blue at `ts-body-large-fluid`, which is the size and the
accent pairing `ResearchInsights` already uses for a block heading under a
section title; the copy stays `ts-body`. `items-stretch` is what runs the rules
the full height of the row rather than stopping at the shortest column. Below
810 the columns stack and the rules go: a vertical hairline between blocks that
are no longer side by side would be drawing a relationship that is not on
screen, and the 40px gap separates them.

**Reflection** is three paragraphs of `Paragraphs` and nothing else, at the
measure and the type every other prose block on the page uses. It is the one
section about the work rather than the product, and dressing it up would have
it read as another finding. Anne's note asked for two paragraphs and her copy
has three; the copy is what was followed, since preserving the wording exactly
was the first instruction.

The rail gained two entries — `Result & Next Steps` and `Reflection` — which is
CASE_STUDY_NAV_RULES.md rule 1: the list is built from the sections the page
actually has. The scope note at the top of the file said outcomes were for a
later phase; that phase is this one, so the note now says what the page is.

**Checked** at 390, 810 and 1440: the three columns share a row from 810 and
stack below it, the dividers appear only between columns, the headings are
`rgb(15, 98, 254)`, Reflection runs three paragraphs at the page's own measure
(342 / 730 / 951), both rail entries are present, nothing crosses either
viewport edge, no console errors. The Solution Overview prototypes still run.

### Four fixes across Design Process

**Issues Final carries a fuller list and a longer trace.** `ISSUES` went from
four to seven; V1 and V2 keep the first four through `EARLY_ISSUES`, because
those two are making a point about how many *places* a builder has to look and
a longer list in them would argue about the wrong thing. The execution trace
runs six generic steps now, each with a fictional time beside it: the times are
what make it read as a trace rather than a list — they say the steps happened
in order and roughly how far apart — and none of them measures anything. It
also evens the panel up: the trace and the recommended steps beside it now end
at about the same line.

**Metrics V2 lost its inset.** The "Explored in this round · Fleet overview and
Health consolidated" block is gone, so V2 is the page its capture shows and
nothing else.

**Metrics V2.5 hugs its cards.** It was sitting in a 580px preview window with
a quarter of it empty, which drew the four explorations as if they were a page.
`WireFigure` gained `size="hug"`: no window, no border, no scroll — the figure
is as tall as what is in it, 377px at a desktop. That does mean the panel
changes height when a reader switches to or from V2.5, which is the honest
consequence of the four cards not being a screen.

**The Metrics tree runs deeper.** Seven rows became fourteen — subagents under
an agent, a second and third agent, a second workflow and tool, a knowledge
branch — and the panel stretches beside the artifact page rather than stopping
a third of the way down it. The Solution Overview demo renders the same tree,
so its pointer was re-measured against the new row positions: the second and
third artifacts now sit at 59% and 73% of the drawing.

**Checked** at 390, 810 and 1440: seven issues and six timed trace steps in
Issues Final, no inset in V2, V2.5 377px with no scroll box, fourteen tree rows
with the panel full height, the Metrics demo still stepping Order assistant →
Invoice workflow → Search tool and back, no overflow at either edge, no console
errors, and the Solution Overview drawings unchanged in height.

### The Home loop follows the recording

The first version of it pressed a slot and a shortcut appeared. That skipped
the part a visitor needs — the shortcut came from somewhere, and the builder
chose it — and after the Solution Overview drawings were brought to one height
the pointer no longer landed on the slot at all, so it read as though pressing
an existing shortcut spawned another one. Pressing a pinned shortcut opens it;
it does not create anything.

Read off the team's own recording, the order is: press an empty slot, a
`Create shortcut` panel opens with suggestions, take one, save, and only then
does the pinned area change. That is what plays now, in five beats — 2.5s on
the page, 1s pressing the slot, 1.6s with the panel open and the pointer
reaching a suggestion, 1.3s with it taken and Save pressed, 3s with the
shortcut pinned.

Three things it needed:

- `WireSlot` gained `active`, so the slot the pointer is on is marked the way
  the product marks it before a press.
- `HomeFinalPage` gained `activeSlot`, and its third shortcut — which only
  Solution Overview ever renders — is now the one the panel suggests rather
  than another artifact.
- The drawer is pinned to the top of the preview window and given that
  window's height, not `inset-y-0`. The page behind it is about 47px taller
  than the window, and a drawer stretched to the page put Cancel and Save
  below the fold — the two controls that end the sequence.

The panel holds a title, the three suggestions and the two buttons. The
recording's also offers a written description and a link field; neither is part
of what this loop is showing, so neither is drawn.

**Checked** on the running page: the loop runs two pinned shortcuts → panel
open → three pinned with one slot left → back, the chosen suggestion is ringed
while Save is visible, the Design Process Home drawing still shows two pinned
shortcuts and two empty slots, all three Solution Overview drawings are still
the same height, no overflow at either edge, no console errors.

### Issues V1 and V2 hug; the hero's facts carry the internship

**V1 and V2 take their own height.** Both were sitting in a 578px preview
window — V1 overflowing it by 76px and V2 with space left under it — when
neither needs one: they are pages drawn at a readable size and a window only
added a scrollbar to one and a gap to the other. `size="hug"` on both, and
`WireScreen` gained `framed` so a natural-height page can draw its own window
edge; inside a scrolling preview that edge is already there, so the final
version, which keeps its window, does not ask for it. They now measure 656 and
557 at a desktop, content exactly.

**The hero.** The title is `Designing the Future Builder Control Plane`. The
`IBM Software Design Internship · Summer 2026` line under the lede is gone, and
both facts it carried are in the metadata where the rest of them live:
`Project type · Design internship` between Client and Duration, and the year on
`Duration · 6 weeks (Summer 2026)`. Five facts into a two-column grid leaves
the last cell empty, which is what a list of facts does and is quieter than
squeezing them to three across.

The project's own name is unchanged — `IBM watsonx Builder Control Plane` is
what `src/lib/projects.ts` calls it, so the cards on Home and My Projects, the
browser tab, the OG metadata and the password screen still read that way. Only
the page's own `h1` is the longer title.

**Checked** at 390, 810 and 1440: the new title renders, the internship line is
gone, the five facts read in order, Issues V1 and V2 have content equal to
their height with the window edge still drawn, the final version is unchanged,
no overflow at either edge, no console errors.

### The hero shows the final designs, and every prototype hugs

**The hero's three panels were out of date.** They had been drawn before the
Final versions settled, so Home carried a tile row rather than pinned
shortcuts and issues, Issues showed a tab row over a split that is not what
the panel does, and Metrics showed a figure column rather than Overview and
Dependencies. They are redrawn from the three Final illustrations: Home is the
welcome line with its critical count, pinned shortcuts with their empty slots,
the latest issues and recent work; Issues is the list beside one investigation
with the two tabs, the relationship map and the trace, and no second panel;
Metrics is the tree beside the selected artifact with **Overview over
Dependencies as stacked sections**, not tabs. The composition, the layering,
the mark field and the blue accents are untouched.

The relationship map is drawn locally rather than imported from the Issues
module: that module is a client component and the hero has no reason to become
one, and at 180px wide the five-node version would be a smudge. Measured at
390, 810 and 1440, all three panels' content now equals their box exactly —
nothing is cropped. Below those widths the panels show less rather than
smaller: at a phone the Metrics panel is 120px wide, which holds the tree and
nothing else.

**Every Design Process prototype hugs its content.** The scrolling preview
window is gone from all ten of them — Metrics V1 was the clearest case, 578px
of frame around 480px of drawing, with the gap sitting under the Analytics
cards. They are their own heights now, from 351px (Metrics V2 at a desktop) to
1067px (Home V2 on a phone), and each one's content equals its height exactly.
`WireScreen` draws its own window edge through `framed` where there is no
preview box around it to draw one.

Solution Overview keeps its fixed box: its three drawings are one step each of
the same section, and a visitor switching between them should not have the
page move. They are still 380 / 430 / 450.

**The hero's facts.** Team moved to the end of the list, which lands it in the
left column of the third row — directly under My Role and flush with it. Half a
column is about 470px, which breaks the four names across two lines instead of
running them to the far edge of the page as one; the longest line in the block
was beating the title for width.

**Checked** at 390, 810 and 1440: no prototype scrolls or clips, no hero panel
clips, nothing crosses either viewport edge, the Solution Overview drawings are
still one height, the Issues and Metrics loops still run, and the build, types
and lint are clean.

### Scrolling back, Metrics V2 as a comparison, and the confidentiality note

**The preview window came back, because hugging cut drawings off.** The
previous round let every Design Process prototype be its own height, which is
right for the short ones and wrong for the tall: Home V1 is 854px of drawing
at a desktop and over 1000px on a phone, and a figure that tall stops being a
figure. The prototypes are capped again — 440 on a phone, 540 at a tablet, 580
at a desktop — with `overflow-y: auto` and a styled scrollbar, and the cap is a
`max-height`, so anything shorter than it still hugs. Measured at 1440, six of
the ten hug and four scroll; at 390 all but Metrics V2.5 scroll, which is what
a 390px-wide viewport does to a drawing of a desktop page.

One finding stands unresolved: on macOS Chromium the scrollbar is an overlay
and takes no width, so `::-webkit-scrollbar { width: 10px }` styles a bar that
occupies 0px until the pointer is over it. The content is reachable and the
bar appears on hover and while scrolling; it is not a persistent gutter. A
platform that draws classic scrollbars gets the 10px one.

**Metrics V2 is a comparison now, not a single page.** The round it stands for
moved the fleet metrics off Home and consolidated them into one tabbed Fleet
overview, and a drawing of the destination alone cannot show a move. It is two
pages side by side, the same shape V1 uses: Home on the left still carrying
its own fleet block, and on the right the Fleet overview with a tab per
artifact type and Health, Performance and Usage grouped under their own
headings. The left half is `HomeV2Page` itself rather than a copy, so the two
sections cannot drift.

Both halves are cut to the argument. `compact` drops Home's recent work and
its artifact table, and squeezes the shortcut grid from five across to three:
a column running twice the height of the one beside it reads as the more
important of the two and leaves the shorter one in a field of white. With that
and the Usage group on the right the two columns finish within ~85px of each
other, and the whole figure hugs at 529px on a desktop. Metrics V1 is
untouched.

**The hero's Home panel shows real shortcut cards.** It had tiles standing in
for them, and being able to pin an artifact and come back to it is the final
Home's own decision — a labelled square does not show that it is a card with a
way into the thing. The two cards are there at every width; the two empty
slots beside them appear from 1200 up, where there is room.

The pinned column takes the larger share of the panel on a phone
(`grid-cols-[1fr_1.1fr]` against the desktop's `0.8fr_1fr`), and both columns
carry `min-w-0`. Without that each column floors at its own min-content width,
the ratio is ignored and the shortcut column comes out 45px wide — too narrow
for a card to read as one. It is 86px now, which holds a title, a line of body
and the link.

**The confidentiality note.** Both section-level notes — Solution Overview and
Design Process — carry the full statement: what the drawings are, what has
been left out, that the names and figures are invented, and a request not to
reproduce them. Project Overview gets a shorter one under a hairline after
"This was a design exploration, not a shipped product.", so a reader meets it
before the first drawing rather than halfway down the page. Neither claims a
visitor is bound by anything; they say what was done and ask.

**Checked** at 390, 810 and 1440: nothing crosses either viewport edge on the
page, every capped prototype scrolls to its end and every short one hugs, the
Solution Overview drawings are still one height per breakpoint (380 / 430 /
450), Metrics V1 renders as it did, the hero's pinned cards are legible at all
three widths, both notes render, and `npx tsc --noEmit`, `npx eslint .`,
`npx prettier --check` and `npm run build` are clean.
