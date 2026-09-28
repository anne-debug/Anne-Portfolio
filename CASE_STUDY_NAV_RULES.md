# Case Study Side Navigation Rules

The source of truth for how the side navigation on a case study is built and
maintained. Read this before creating, modifying or refactoring one.

`CLAUDE.md` holds the project's design rules; this file holds the navigation
rules only. Where they touch, `CLAUDE.md` governs the look and this file governs
the structure.

## 1. Navigation must be project-specific

The side navigation is customised for each case study, from the sections that
actually exist on that project's page. Never assume every case study has the
same sections.

Before creating or updating one:

1. Inspect the actual structure of that specific case study.
2. Identify its major content sections.
3. Only include links for sections or conceptual groups that actually exist.
4. Do not add placeholder or default items for missing sections.
5. Do not remove an item globally because another project lacks that section.
6. Keep each project's configuration independent.

A shared `SidebarNav` component is fine. The data passed into it is not shared.

## 2. Example: BudgetCart against Taipei Metro

BudgetCart has no Project Context section, so it carries no `Project Context`
link; its navigation starts at the first section that does exist. Taipei Metro
does have one, so it keeps it. A change to one project's navigation must not
change another's.

## 3. UX research is always one item

Where several sections belong to the research phase, the whole phase is one
link, `User Research`. Do not give each research subsection a link of its own.

A project may hold Research Approach, User Interviews, Surveys, Competitive
Analysis, Affinity Mapping, Personas, User Segmentation, Research Insights, Key
Findings and Pain Points as separate sections in the page. The navigation shows
`User Research` and nothing else from that phase.

## 4. What `User Research` points at

It jumps to the first section of the research phase on that page, whatever that
section is called. The first research heading does not have to read "User
Research".

If a page runs Research Methods → User Interviews → Affinity Mapping → Research
Insights, the label is `User Research` and the anchor is Research Methods.
If another page opens its research with Competitive Analysis, the label is
`User Research` and the anchor is Competitive Analysis.

## 5. Subsections may keep their ids

Research subsections can keep ids for internal links, scroll behaviour, deep
links and other page interactions. An id does not earn a navigation item. The
navigation represents the major phases of the case study, not every heading.

## 6. Major phases only

Prefer Project Context, Problem, My Role, Solution Overview, User Research,
Design Breakdown, Impact, Reflection. Never generate an item automatically from
every `h2`, `h3`, section id or content block. The list stays short enough to
show the shape of the case study at a glance.

## 7. No global list

There is no universal hardcoded list. The shape is a shared component plus a
per-project configuration:

- BudgetCart → BudgetCart's own section list
- Taipei Metro → Taipei Metro's own section list
- Jubo, Ryze, Little Chestnut Thief → their own, if and when they get one

The component is shared. The structure is decided per project.

## 8. Validation

Every link must point at a real section on that page. Before finishing a
navigation change, check that:

- the target section exists and the id is correct;
- clicking scrolls to the intended section;
- there are no dead links and no duplicates pointing somewhere unintended;
- `User Research` points at the first research section;
- no research subsection appears as a separate item;
- removing an item from one project has not removed it from another.

## 9. New case studies

Do not copy another project's navigation. Inspect the new project's content
first, then: identify its major sections; decide which actually exist; find
every section belonging to research; collapse that phase into one `User
Research` item pointing at the first of them; build the rest from the project's
real sections; verify every anchor.

## 10. The look is out of scope

These rules govern structure, links and anchors. Typography, colours, the active
and hover states, the desktop rail, the tablet and mobile floating panel, the
hamburger, positioning, stickiness and animation are all unchanged by a
navigation-structure change.

---

# Current state

Audited against the rules above.

| Project | Side nav | Entries | `User Research` anchor |
| --- | --- | --- | --- |
| Taipei Metro | yes | Project Context, Problem, My Role, Solution Overview, User Research, Design Breakdown | `#user-research` → "User Recruitment & Survey Strategy" |
| BudgetCart | yes | Problem, My Role, Solution Overview, User Research, Design Breakdown | `#research-process` → "Key Research Insight" |
| Ryze Coffee | none | — | — |
| Jubo Healthcare | none | — | — |
| Little Chestnut Thief | none | — | — |

Taipei Metro opens with a hero that carries its own "Project context" heading,
so it keeps that item. BudgetCart's hero is the title, the subtitle and the
project meta, with no such heading, so it has no `Project Context` item; its
`#project-context` id stays on the hero for deep links, which rule 5 allows.

The three shorter case studies render no side navigation at all — they pass no
`sidebar` to `CaseShell` and carry no section ids beyond Ryze's one skip-link
target. Their structure was not clear enough to group into phases without
guessing, so under rule 9 they were left alone rather than given an invented
list.
