import { TaskGridRoot } from "./TaskGrid";
import { TaskDatasetControlRoot } from "./dataset-control/TaskDatasetControl";
import { Settings } from "./dataset-control/settings";
import { PageSizeSwitcher } from "./dataset-control/page-size-switcher";
import { Ribbon } from "./dataset-control/ribbon";

export interface ITaskDatasetControlParts {
    /** A menu of the task grid's toggles, such as Show hierarchy. */
    Settings: typeof Settings;
    /** `DatasetControl.PageSizeSwitcher` showing the task count, always disabled. */
    PageSizeSwitcher: typeof PageSizeSwitcher;
    /** `DatasetControl.Ribbon`, its items passed through `registerRibbonCommandUi`. */
    Ribbon: typeof Ribbon;
}

/** A DatasetControl of tasks, drawn as a tree in its body. */
export const TaskDatasetControl: typeof TaskDatasetControlRoot & ITaskDatasetControlParts = Object.assign(TaskDatasetControlRoot, { Settings, PageSizeSwitcher, Ribbon });

/** The tasks of a `TaskDatasetControl`, drawn as a tree; goes in its body. */
export const TaskGrid = TaskGridRoot;
