/** The dependency type above the tasks, in the tooltip of a link being drawn. */
export const LINK_DRAG_TYPE_CLASS = 'talxis-gantt-link-drag-type';

/** Why the link being drawn would be refused, below the tasks in its tooltip. */
export const LINK_DRAG_REFUSAL_CLASS = 'talxis-gantt-link-drag-refusal';

/** A dependency line between tasks in a chain being saved. */
export const LINK_SAVING_CLASS = 'talxis-gantt-link-saving';

/** Marks the bar a link being drawn would land on. */
export const LINK_DROP_ATTRIBUTE = 'data-talxis-link-drop';

/** Where the pointer is on the page, for the tooltip of a link being drawn. */
export const LINK_DRAG_POINTER_VARIABLES = { x: '--talxis-gantt-link-drag-x', y: '--talxis-gantt-link-drag-y' } as const;
