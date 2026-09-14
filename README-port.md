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
