import { GRID_MODULE_PRIORITY } from "@controls/grid";

const AFTER_GRID = Math.max(...Object.values(GRID_MODULE_PRIORITY)) + 10;

/** Where the task grid's hooks run: after every grid module's, so the tree has the later word. */
export const TASK_GRID_MODULE_PRIORITY = {
    tree: AFTER_GRID,
};
