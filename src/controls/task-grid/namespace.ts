import { TaskGridRoot } from "./TaskGrid";
import { Settings } from "./parts/settings";

/** A grid of tasks shown as a tree; goes in a DatasetControl's body. */
export const TaskGrid = TaskGridRoot;

export interface ITaskGridDatasetControlNamespace {
    /** A menu of the task grid's toggles, such as Show hierarchy; goes in the header. */
    Settings: typeof Settings;
}

/** The parts of a DatasetControl that wraps a task grid. */
export const TaskGridDatasetControl: ITaskGridDatasetControlNamespace = { Settings };
