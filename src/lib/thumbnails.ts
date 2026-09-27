/**
 * The one frame every project card uses, on the home page and on My Projects.
 *
 * Cards that sit beside each other have to be the same size, so they share a
 * shape, and the previews are captured at this same shape so they fill it.
 *
 * My Projects used to give each row the shape of the board it once showed,
 * which meant four different frames cropping their previews by anything from
 * 7% to 21%, each by a different amount and one of them off-centre. One frame
 * for all of them is what makes the previews sit the same way in every card.
 */
export const CARD_ASPECT = "1.4 / 1";
