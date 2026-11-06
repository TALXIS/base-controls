import { TaskGanttRoot } from "./TaskGantt";
import { GanttZoomSlider } from "./adapters/zoom-slider/GanttZoomSlider";
import { GridGanttSplit } from "./adapters/grid-gantt-split/GridGanttSplit";
import { GanttUi, IGanttUi } from "./ui";

export interface ITaskGanttParts {
    /** The Gantt's zoom, for the header. */
    ZoomSlider: typeof GanttZoomSlider;
    /** The grid and the Gantt side by side, for the body. */
    Split: typeof GridGanttSplit;
    /** The Gantt's parts as plain UI, with no runtime behind them. */
    Ui: IGanttUi;
}

/** The tasks of a `TaskDatasetControl` on a timeline, row for row with the `TaskGrid`. */
export const TaskGantt: typeof TaskGanttRoot & ITaskGanttParts = Object.assign(TaskGanttRoot, { ZoomSlider: GanttZoomSlider, Split: GridGanttSplit, Ui: GanttUi });
