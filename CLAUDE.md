@AGENTS.md

# Portfolio design rules

The source of truth for layout and responsive decisions in this repository.
`README-port.md` records how the Framer project was ported and why individual
pages look the way they do; this file states the rules that apply to all of it.

Framer's own file (project `7SmCq66wTlzznoMf2goB`, "Anne Profolio (v4.0)") is the
design reference. Where Framer and these rules disagree, follow Framer and note
the exception here. Breakpoints are Framer's: phone below 810, tablet 810 to
1199, desktop 1200 and up.

## Hero visual composition rule

When several visual assets form one intentional composition in a project hero,
such as device mockups, illustrations, decorative objects, or foreground and
background graphics:

1. Treat them as one composition, not as elements that each answer to the
   viewport independently.
2. Desktop positioning is the source of truth.
3. Tablet and phone keep the relative positioning desktop establishes.
4. Preserve the desktop relative positions, scale ratios, spacing, overlap,
   alignment and visual hierarchy.
5. Respond by scaling the whole composition proportionally.
6. The container may resize or move within the viewport; what is inside it may
   not be rearranged.
7. Do not rearrange individual pieces at tablet or phone unless the original
   design defines a different composition there.
8. Do not stack the pieces vertically on small screens.
9. Position the pieces against a shared parent with a fixed aspect ratio, in
   percentages of that parent, so they stay proportional as it scales.
10. Solve a fit problem by scaling the composition, never by repositioning one
    piece inside it.
11. Desktop is the visual and positioning reference unless the Framer file shows
    tablet or phone deliberately composing differently.
12. Apply this to every project hero.

### How it is implemented here

Both multi-element heroes use the same shape: a canvas `div` with
`position: relative` and an `aspect-ratio`, holding absolutely positioned
children whose `left`, `top` and `width` are percentages of that canvas. The
canvas is the only thing a breakpoint touches.

- `taipei-metro-app` uses a 550x594 stage carrying the green triangles, the blue
  disc, the Metro Taipei mark, the mascot and the handset.
- `budgetcart` uses a 700.5x628.4 canvas carrying the shopper, the handset, the
  doodle and the money bag. It is the hero's image column extended 225px to the
  left, which is where Framer pins the shopper; a negative margin puts it there
  from 1200 up, and below that the canvas is the column's own width so the same
  composition simply arrives smaller.

A handset inside a composition uses `PhoneMockup` with `fluid`, which sizes
itself from its container rather than a pixel width, so it scales with the rest.

## Overflow

No element may cross either edge of the viewport at any width. Comparing the
document's scroll width against the window only catches content escaping to the
right: something pushed off the left is clipped without lengthening the page.
Check both edges, and intersect each element's box with every ancestor that
hides its overflow before judging it.

## Checking a change

Against the running dev server, at 390, 430, 500, 600, 700, 768, 810, 900, 1024,
1100, 1280 and 1440:

- no element crosses either viewport edge, on all nine pages
- the pieces of a hero composition share one scale factor at every width
- desktop geometry is unchanged from before the change
- `npx tsc --noEmit`, `npx eslint .` and `npm run build` are clean

Rerun `npm run previews` after changing any case study hero: the project cards on
the home page and My Projects are screenshots of those heroes.
