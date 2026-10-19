import { TaskGridRoot } from "./TaskGrid";
import { TaskDatasetControlRoot } from "./dataset-control/TaskDatasetControl";
import { Settings } from "./dataset-control/settings";
import { Notifications } from "./dataset-control/notifications";

export interface ITaskDatasetControlParts {
    /** A menu of the task grid's toggles, such as Show hierarchy. */
    Settings: typeof Settings;
    /** `DatasetControl.Notifications`, also saying when new tasks are shown regardless of the filter. */
    Notifications: typeof Notifications;
}

/** A DatasetControl of tasks, drawn as a tree in its body. */
export const TaskDatasetControl: typeof TaskDatasetControlRoot & ITaskDatasetControlParts = Object.assign(TaskDatasetControlRoot, { Settings, Notifications });

/** The tasks of a `TaskDatasetControl`, drawn as a tree; goes in its body. */
export const TaskGrid = TaskGridRoot;
