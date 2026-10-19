import { TaskGridRoot } from "./TaskGrid";
import { TaskDatasetControlRoot } from "./dataset-control/TaskDatasetControl";
import { Settings } from "./dataset-control/settings";

export interface ITaskDatasetControlParts {
    /** A menu of the task grid's toggles, such as Show hierarchy. */
    Settings: typeof Settings;
}

/** A DatasetControl of tasks, drawn as a tree in its body. */
export const TaskDatasetControl: typeof TaskDatasetControlRoot & ITaskDatasetControlParts = Object.assign(TaskDatasetControlRoot, { Settings });

/** The tasks of a `TaskDatasetControl`, drawn as a tree; goes in its body. */
export const TaskGrid = TaskGridRoot;
