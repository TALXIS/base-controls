import { TaskGridRoot } from "./TaskGrid";
import { TaskDatasetControlRoot } from "./adapters/root/TaskDatasetControl";
import { ExpansionHeader, PageSizeSwitcher, PercentCompleteCell, Ribbon, Settings, TaskCommandsCell, TreeCell } from "./adapters";
import { ITaskGridUi, TaskGridUi } from "./ui";

export interface ITaskDatasetControlParts {
    /** A menu of the task grid's toggles, such as Show hierarchy. */
    Settings: typeof Settings;
    /** `DatasetControl.PageSizeSwitcher` showing the task count, always disabled. */
    PageSizeSwitcher: typeof PageSizeSwitcher;
    /** `DatasetControl.Ribbon`, its items passed through `addRibbonCommandUiHook`. */
    Ribbon: typeof Ribbon;
    /** The task grid's parts as plain UI, with no runtime behind them. */
    Ui: ITaskGridUi;
}

/** The parts of the task grid, attached to the task grid itself. */
export interface ITaskGridParts {
    /** The subject cell, indented by its level with the chevron that opens the task. */
    TreeCell: typeof TreeCell;
    /** Expands or collapses the tasks a level at a time. */
    ExpansionHeader: typeof ExpansionHeader;
    /** The cell of a task's row commands, the first spanning the cell and the rest in its menu. */
    TaskCommandsCell: typeof TaskCommandsCell;
    /** The percent complete cell, a progress bar edited as a number. */
    PercentCompleteCell: typeof PercentCompleteCell;
    /** The task grid's parts as plain UI, with no runtime behind them. */
    Ui: ITaskGridUi;
}

/** A DatasetControl of tasks, drawn as a tree in its body. */
export const TaskDatasetControl: typeof TaskDatasetControlRoot & ITaskDatasetControlParts = Object.assign(TaskDatasetControlRoot, { Settings, PageSizeSwitcher, Ribbon, Ui: TaskGridUi });

/** The tasks of a `TaskDatasetControl`, drawn as a tree in its body. */
export const TaskGrid: typeof TaskGridRoot & ITaskGridParts = Object.assign(TaskGridRoot, { TreeCell, ExpansionHeader, TaskCommandsCell, PercentCompleteCell, Ui: TaskGridUi });
