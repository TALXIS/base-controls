import { GRID_MODULE_PRIORITY } from "@controls/grid";

/** The column holding each row's add-task command and the expand-all header. */
export const ADD_TASK_COLUMN_NAME = 'addTask';

/** The control a column names to draw its value as a progress bar. */
export const PERCENT_COMPLETE_CONTROL_NAME = 'PercentComplete';

/** When the task tree's column hook runs; a feature module's runs after it. */
export const TASK_TREE_PRIORITY = GRID_MODULE_PRIORITY.clipboard + 10;

//the width of the chevron, so a leaf lines up with its siblings' names
export const INDENT_STEP_WIDTH = 28;

export const INACTIVE_ROW_CLASS = 'talxis_task-grid_row--inactive';
export const DROP_TARGET_ROW_CLASS = 'talxis_task-grid_row--drop-target';
export const UNMATCHED_PARENT_ROW_CLASS = 'talxis_task-grid_row--unmatched-parent';
