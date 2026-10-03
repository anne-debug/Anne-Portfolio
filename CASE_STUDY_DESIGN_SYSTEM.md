# Case Study Design System

The source of truth for every case study page. Read this before building a new
one or reworking an old one, and prefer it over copying whatever the nearest
page happens to do.

Two companion files: `CLAUDE.md` holds the portfolio-wide design rules, and
`CASE_STUDY_NAV_RULES.md` holds the section rail in detail. Where they overlap,
this file governs case-study pages.

## 1. Source of truth

**Taipei Metro** and **BudgetCart** are the reference implementations. Where the
two agree, that is the system. Where they disagree, the one that follows Framer
and scales cleanly across the breakpoints wins, and the other is debt.

Ryze Coffee, Jubo Healthcare and Little Chestnut Thief predate the system.
Ryze's typography has been brought onto it. Jubo and Little Chestnut Thief have
not, and they carry an explicit `legacy` flag saying so. Do not standardise a
page opportunistically — do it when that page is being worked on anyway, and
take the flag off when you do.

## 2. Breakpoints

Framer's, and nothing else: phone below 810, tablet 810 to 1199, desktop 1200
and up. In Tailwind these are the bare default, `tablet:` and `desktop:`. A
one-off width (`min-[700px]:`) is allowed where a real device sits inside a
range and the design needs it, and it carries a comment saying which.

## 3. Typography

Every size lives in `globals.css` as a `ts-` class with its own responsive
ramps. Never set a font size inline unless the ramp genuinely differs, and then
say why in a comment.

Match by **semantic role**, not by project:

| Role | Class | Phone | Tablet | Desktop |
| --- | --- | --- | --- | --- |
| Project title | `ts-heading-2` | 42 | 48→72 | 72 |
| Section title | `ts-heading-3` | 32 | 32→55 | 55 |
| Sub-block title | `ts-heading-5` | 22 | 22→36 | 36 |
| Sub-heading | `ts-heading-6` | 18 | 18→24 | 24 |
| Lede, diagram label | `ts-body-large-fluid` | 16 | → | 20 |
| Body | `ts-body` | 16 | 16 | 16 |
| Caption | `ts-body` + `italic` | 16 | 16 | 16 |
| Small label | `ts-body-small-light` | 14 | 14 | 14 |
| Button | `ts-button` | 16 | 16 | 16 |

Emphasis inside body copy is `font-semibold` on `ts-body`, not a class of its
own.

Two traps. `ts-body-large` carries Framer's tablet value of **32px**, which is
right for a block of copy and wrong for a lede or a label — use
`ts-body-large-fluid` for those, which ramps 16 to 20 instead of stepping.
And `ts-heading-6-small` and `ts-heading-3b` have no responsive ramp at all;
they are Framer leftovers, not part of the scale.

## 4. Width and spacing

A case study is a `CaseShell`: `canvasWidth` 1200, `bodyWidth` 1200, `pageTop`
60, `bodyPad` 120, `bodyPadX` 40. The article comes to 951px on desktop, beside
the 119px rail. Below 1200 the rail floats and the article takes the full
column, which means **the article is wider on a tablet than on a desktop** —
1119px at 1199 against 951. Anything sized as a share of it will therefore come
out larger on the smaller screen unless it is capped. Cap it at its desktop
size.

`bodyGap` is the space between major sections: 90 on Taipei and BudgetCart.
Inside a section, 10 between a title and its lede, 20 to 40 between blocks.
Do not invent a spacing value to match a screenshot.

## 5. Grouping and alignment

Where a section is text on one side and a visual on the other, and the text is
several related blocks, treat the text as **one group** and the visual —
including its captions — as **one group**, then centre the two on each other.
Never spread related blocks down the height of an image with `space-between` or
a large gap; that reads as unrelated blocks pinned to the corners.

The exception is an annotation layout, where a note points at a named feature.
There the note follows its marker, not the group. Design Breakdown is the
annotation case; Project Context and Solution Overview are the grouped case.

## 6. Shared components

Reach for these before writing a section from scratch:

| Component | What it is for |
| --- | --- |
| `CaseShell` | The page frame, the rail column and More Projects |
| `CaseHeader` | Project title, description and meta |
| `CaseSection` | A titled section |
| `ProblemStatement` | The "How might we" card |
| `SidebarNav` | The section rail |
| `MoreProjects` | The closing strip |
| `PhoneMockup` | Framer's handset, fixed or fluid |
| `Zoomable` | Any picture worth opening full screen |
| `PreviewMedia` | The picture inside a project card |

`shared component + project-specific content`, never a second copy with slightly
different CSS. Where a project genuinely needs different structure, give the
component a prop and document it, as `CaseSection` does for `legacy`.

## 7. The How-might-we card

`ProblemStatement`, always. The card is content plus padding — 40 on a phone, 54
from 810, 66 from 1200 — and nothing else. No fixed height, no min-height: a
longer statement makes a taller card. The stars belong to the statement, so they
sit against the paragraph's own box, not the card's corners; holding the card at
a fixed height is what pulls them apart.

## 8. The section rail

`SidebarNav`, with a per-project list. `CASE_STUDY_NAV_RULES.md` has the whole
rule; the short version is that the rail lists major phases only, the whole
research phase is one `User Research` entry pointing at the first research
section, and a page gets no entry for a section it does not have.

## 9. Media

Width-led and `h-auto`, never stretched. Nothing below 1200 is drawn larger than
its desktop size. A handset is `PhoneMockup`; a picture with detail in it is
wrapped in `Zoomable`, which opens it at the file's own resolution and pans.
Captions are `ts-body` italic, centred under the media, and count as part of the
visual for alignment.

## 10. Project cards

`MoreProjects` with `moreVariant="compact"` on a case study. Cards are 480px
capped, the picture is the linked project's own hero from the preview manifest,
and the strip is centred in the column. Run `npm run previews` after changing
any hero.

## 11. Responsive

Check phone, tablet and desktop before calling anything done, and look at the
render rather than the code. No horizontal overflow at any width, on either
edge, once each box is intersected with every ancestor that clips it.

Solve alignment through grid, flex, `max-width`, `margin-inline` and the natural
flow. Not with a large `margin-top`, a negative margin, a fixed section height,
a `translate`, or a number that only works at one width.

## 12. Adding a case study

1. Read this file.
2. Look at Taipei Metro and BudgetCart for the pattern, not the content.
3. Work out the page's own semantic structure.
4. Map each piece to a role in section 3 and a component in section 6.
5. Build the rail from the sections that actually exist.
6. Write a new pattern only where the content genuinely needs one.
7. Check the three ranges, and run `tsc`, `eslint` and `next build`.

Inherit the system. Tell a different story with it.
