import { TaskGridRoot } from "./TaskGrid";
import { TaskDatasetControlRoot } from "./dataset-control/TaskDatasetControl";
import { Settings } from "./dataset-control/settings";
import { Notifications } from "./dataset-control/notifications";
import { PageSizeSwitcher } from "./dataset-control/page-size-switcher";

export interface ITaskDatasetControlParts {
    /** A menu of the task grid's toggles, such as Show hierarchy. */
    Settings: typeof Settings;
    /** `DatasetControl.Notifications`, also saying when new tasks are shown regardless of the filter. */
    Notifications: typeof Notifications;
    /** `DatasetControl.PageSizeSwitcher` showing the task count, always disabled. */
    PageSizeSwitcher: typeof PageSizeSwitcher;
}

/** A DatasetControl of tasks, drawn as a tree in its body. */
export const TaskDatasetControl: typeof TaskDatasetControlRoot & ITaskDatasetControlParts = Object.assign(TaskDatasetControlRoot, { Settings, Notifications, PageSizeSwitcher });

/** The tasks of a `TaskDatasetControl`, drawn as a tree; goes in its body. */
export const TaskGrid = TaskGridRoot;
