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
