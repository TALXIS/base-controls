import { GRID_MODULE_PRIORITY } from "@controls/grid";

/** Where the task grid's hooks run: after every grid module's, so the tree has the later word. */
export const TASK_GRID_PRIORITY = {
    tree: Math.max(...Object.values(GRID_MODULE_PRIORITY)) + 10,
};
