/**
 * Eye-Bee-M, from the artwork itself, in two pieces.
 *
 * Every path below is the supplied `IBM logo.svg`, shape for shape and
 * coordinate for coordinate — nothing here was redrawn, traced or rounded.
 * Five things were done to it and nothing else:
 *
 * 1. The white sheet it was exported on, and the four `fill: none` boxes
 *    Illustrator leaves behind as clip bounds, are dropped. They are the
 *    only elements removed, and neither drew anything.
 * 2. The viewBox is the artwork's own bounds rather than the sheet's, which
 *    is the `Clip-41` box the export already carries: 99.7, 81.8 to 733.5,
 *    264.4. The two wrapping translates that put it on that sheet go with
 *    the sheet; the three translates *inside* the drawing are kept, because
 *    they place real shapes.
 * 3. One fill, set on the root and inherited, in place of the export's
 *    black-and-classed mixture.
 * 4. The drawing is split in two along a line the export already drew: the
 *    bee is `Fill-8` through `Fill-22`, and everything before and after it
 *    is the eye and the M. No shape moved to make the cut.
 * 5. One shape is drawn twice. The eyelid is the outer contour of the eye's
 *    own lens, repeated as a path of its own so it can be swept down over
 *    the iris; see the note on it below. It is a copy, not a new drawing.
 *
 * ── Why two components ────────────────────────────────────────────────────
 * The bee flies off the screen and the eye and the M do not, and an SVG
 * clips its own viewBox. Rather than let the bee out of the box — which is
 * possible, but then the flight is measured in the artwork's units and has
 * no idea how big the screen is — the bee is its own SVG over the other one.
 *
 * Both carry the *same* viewBox, and both are stretched over the same box by
 * `IbmIntro`, so the bee lands exactly where the export put it: registration
 * costs nothing and cannot drift, because neither drawing was moved.
 *
 * The order matters in one place. The eye is a lens with a hole in it and
 * the pupil is a separate disc inside that hole, so the pupil is painted
 * first, exactly as the export has it.
 */

/** Carbon Blue 50: the one colour in the drawing, and the hero's accent. */
const BLUE = "#4589ff";

/** The artwork's own bounds — the export's `Clip-41`. Shared, deliberately. */
const VIEW_BOX = "99.7 81.8 633.8 182.6";

/**
 * The eye and the striped M: everything the bee leaves behind.
 *
 * Both are grouped so each can leave on its own, which is the order the
 * reference animation goes in — the eye first, the M a beat later, and then
 * the bee has the screen to itself.
 *
 * ── The blink ─────────────────────────────────────────────────────────────
 * A flat mark has no eyelid to lower, and the obvious substitute — squashing
 * the lens — does not work here, because the lens is a ring: flattened, it
 * reads as two hairlines with a gap, not as a shut eye. So the lid is the
 * lens's own outer contour, filled, scaled from nothing down over the iris
 * about the lens's top edge. Shut, the eye is a solid almond, which is what
 * a closed eye looks like when everything else in the drawing is solid too.
 * The brow is outside the group and stays where it is, as it does in the
 * reference.
 */
export function EyeBeeMStill({ className }: { className?: string }) {
  return (
    <svg viewBox={VIEW_BOX} fill={BLUE} aria-hidden className={className}>
      <g className="ibm-ebm-eye">
        <path
          className="ibm-ebm-pupil"
          d="M213.4,201.7c0,12.6-10.2,22.8-22.7,22.8c-12.6,0-22.7-10.2-22.7-22.8 c0-12.6,10.2-22.8,22.7-22.8C203.2,178.8,213.4,189.1,213.4,201.7"
        />
        <path d="M190.7,253c-28.3,0-51.2-23-51.2-51.4s22.9-51.4,51.2-51.4c28.3,0,51.2,23,51.2,51.4 S218.9,253,190.7,253 M190.7,138.9c-40.9,0-76,25.9-91,62.8c15,36.9,50.1,62.8,91,62.8s76-25.9,91-62.8 C266.6,164.8,231.6,138.9,190.7,138.9" />
        {/* the lid: the lens's outer contour again, swept down from its top */}
        <path
          className="ibm-ebm-lid"
          d="M190.7,138.9c-40.9,0-76,25.9-91,62.8c15,36.9,50.1,62.8,91,62.8s76-25.9,91-62.8 C266.6,164.8,231.6,138.9,190.7,138.9"
        />
        <g transform="translate(3.569721, 0.000358)">
          <path d="M187.1,81.8c-36.4,0-68.2,20.6-85.3,51.4v17.1c20.4-24.4,51-39.9,85.3-39.9 s64.9,15.5,85.3,39.9v-17.1C255.2,102.5,223.5,81.8,187.1,81.8" />
        </g>
      </g>

      <g className="ibm-ebm-m">
        <polygon points="639.7,260.2 643.8,248.4 635.7,248.4" />
        <polygon points="631.9,237.7 647.6,237.7 651.7,225.9 627.8,225.9" />
        <polygon points="624.1,215.2 655.4,215.2 659.5,203.5 620,203.5" />
        <polygon points="616.2,192.8 663.3,192.8 667.4,181 612.1,181" />
        <polygon points="569.4,147.8 632.7,147.8 628.7,136.1 569.4,136.1" />
        <g transform="translate(390.884462, 21.500358)">
          <polygon points="263.6,103.9 342.6,103.9 342.6,92.1 267.7,92.1" />
        </g>
        <polygon points="666.4,91.2 662.3,102.9 733.5,102.9 733.5,91.2" />
        <polygon points="546,260.2 604.6,260.2 604.6,248.4 546,248.4" />
        <polygon points="546,237.7 604.6,237.7 604.6,225.9 546,225.9" />
        <polygon points="569.4,215.2 604.6,215.2 604.6,203.5 569.4,203.5" />
        <polygon points="569.4,192.8 604.6,192.8 604.6,181 569.4,181" />
        <polygon points="710.1,136.1 650.8,136.1 646.7,147.8 710.1,147.8" />
        <polygon points="674.9,192.8 710.1,192.8 710.1,181 674.9,181" />
        <polygon points="674.9,215.2 710.1,215.2 710.1,203.5 674.9,203.5" />
        <polygon points="674.9,237.7 733.5,237.7 733.5,225.9 674.9,225.9" />
        <polygon points="674.9,260.2 733.5,260.2 733.5,248.4 674.9,248.4" />
        <polygon points="625,125.4 620.9,113.6 546,113.6 546,125.4" />
        <polygon points="617.2,102.9 613.1,91.2 546,91.2 546,102.9" />
        <polygon points="674.9,170.3 710.1,170.3 710.1,158.5 674.9,158.5 643,158.5 639.7,168.1 636.5,158.5 569.4,158.5 569.4,170.3 604.6,170.3 604.6,159.5 608.4,170.3 671.1,170.3 674.9,159.5" />
      </g>
    </svg>
  );
}

/**
 * The bee alone, on the same viewBox, so it sits where the export drew it.
 *
 * Its centre inside that box is x 418, y 176.75 — the middle of its own
 * bounds, antennae at the top to the tip of the abdomen at the bottom —
 * which is 50.2% and 52% of the box. `globals.css` turns on that point, and
 * says the same two numbers.
 *
 * Each wing is hinged where it meets the body, which is exactly a corner of
 * its own bounding box, so the hinge needs no coordinates: `right top` for
 * the left wing and `left top` for the right one. They are folded down along
 * the body to begin with and open before the bee goes, which is the pose the
 * reference starts in.
 */
export function EyeBeeMBee({ className }: { className?: string }) {
  return (
    <svg viewBox={VIEW_BOX} fill={BLUE} aria-hidden className={className}>
      <path d="M413.7,106.1c0,9.4-7.6,17.1-17,17.1c-9.4,0-17-7.7-17-17.1s7.6-17.1,17-17.1 C406.1,89,413.7,96.6,413.7,106.1" />
      <path d="M456.4,106.1c0,9.4-7.6,17.1-17,17.1c-9.4,0-17-7.7-17-17.1S430,89,439.4,89 C448.8,89,456.4,96.6,456.4,106.1" />
      {/* the left wing, hinged at its top right corner */}
      <path
        className="ibm-ebm-wing ibm-ebm-wing--left"
        d="M323.2,171.7l57.9-25.7l-19.5,62.2c-3.7,11.1-13,22-28.8,22c-16.4,0-29.8-13.4-29.8-29.9 C302.9,186.3,311.5,176.9,323.2,171.7"
      />
      {/* the right wing, hinged at its top left corner */}
      <path
        className="ibm-ebm-wing ibm-ebm-wing--right"
        d="M512.9,171.7L455,146l19.5,62.2c3.7,11.1,13.1,22,28.9,22c0,0,0,0,0,0c16.4,0,29.7-13.4,29.7-29.9 C533.1,186.3,524.6,176.9,512.9,171.7"
      />
      <path d="M451.5,151.7c-5.9-12.6-18.7-21.4-33.5-21.4c-14.8,0-27.5,8.8-33.4,21.4H451.5z" />
      <polygon points="455,188.8 381.1,188.8 381.1,168.9 455,168.9" />
      <polygon points="455,225.9 381.1,225.9 381.1,206 455,206" />
      <g transform="translate(199.904382, 112.875358)">
        <path d="M184.7,130.2c5.9,12.6,18.7,21.4,33.5,21.4c14.8,0,27.5-8.8,33.4-21.4H184.7z" />
      </g>
    </svg>
  );
}
