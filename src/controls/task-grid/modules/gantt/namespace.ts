import { TaskGanttRoot } from "./TaskGantt";
import { GanttZoomSlider, GridGanttSplit } from "./components";

export interface ITaskGanttParts {
    /** The Gantt's zoom, for the header. */
    ZoomSlider: typeof GanttZoomSlider;
    /** The grid and the Gantt side by side, for the body. */
    Split: typeof GridGanttSplit;
}

/** The tasks of a `TaskDatasetControl` on a timeline, row for row with the `TaskGrid`. */
export const TaskGantt: typeof TaskGanttRoot & ITaskGanttParts = Object.assign(TaskGanttRoot, { ZoomSlider: GanttZoomSlider, Split: GridGanttSplit });
