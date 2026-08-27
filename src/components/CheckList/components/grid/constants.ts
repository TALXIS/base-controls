/**
 * Names shared between the customizer, which applies them, and the styles, which select on them.
 *
 * Here rather than in either of those: the styles need the column names and the customizer needs the
 * class name, so keeping them in one of the two would make the pair import each other in a cycle — which
 * typechecks but leaves whichever module evaluates second holding `undefined`.
 */

/** Put on the grid root only while a row is being dragged. See the transition rule in `styles.ts`. */
export const REORDERING_CLASS_NAME = 'talxis_check-list--reordering';

/** The synthetic leading column holding each item's finished checkbox. */
export const COMPLETION_COLUMN_NAME = 'completion';

/** The synthetic trailing column holding each item's delete button. */
export const DELETE_COLUMN_NAME = 'delete';

/** Both control columns are as wide as the grid's own, which is what the checkbox is sized against. */
export const CONTROL_COLUMN_WIDTH = 40;
