import type { IRecord } from "@talxis/client-libraries";
import type { IGridComponents, IGridModule, IGridModules, IGridProps } from "@controls/grid";
import type { ITaskGridServiceMap } from "./services";
import type { ITaskGrid } from "./runtime";
import type { ITaskGridLabels } from "./labels";
import type { IDeleteTasksResult, ITaskMoveParams } from "./provider";
import type { ITreeCellComponents, IAddTaskCellComponents, IExpansionHeaderComponents } from "./tree";

/** A feature of a task grid: a grid module that also sees the task grid's services. */
export type ITaskGridModule = IGridModule<ITaskGridServiceMap>;

/** The modules a task grid is given; the row model is always client-side, and grouping does not mix with a tree. */
export interface ITaskGridModules extends Omit<IGridModules, 'rowModel' | 'grouping' | 'aggregation' | 'custom'> {
    /** The caller's own modules, run after the task grid's. */
    custom?: ITaskGridModule[];
}

/** What a task grid does, for a consumer to react to. */
export interface ITaskGridEventHandlers {
    onTasksCreated: (records: IRecord[], parentId?: string) => void;
    onTasksDeleted: (taskIds: string[]) => void;
    onTaskMoved: (params: ITaskMoveParams) => void;
    onTasksUpdated: (records: IRecord[]) => void;
}

/** The replaceable pieces of what a task grid draws, the grid's own included. */
export interface ITaskGridComponents extends IGridComponents {
    /** The subject cell, with the chevron. */
    treeCell?: ITreeCellComponents;
    /** The button that adds a subtask. */
    addTaskCell?: IAddTaskCellComponents;
    /** Expand and collapse all, above the add-task buttons. */
    expansionHeader?: IExpansionHeaderComponents;
}

/** The task grid reads its provider, a `TaskDataProvider`, from the DatasetControl around it. */
export interface ITaskGridProps extends Omit<IGridProps, 'modules' | 'components' | 'labels' | 'onReady' | 'onDestroyed'>, Partial<ITaskGridEventHandlers> {
    /** What the task grid is made of; read once, at mount. */
    modules?: ITaskGridModules;
    components?: ITaskGridComponents;
    /** Overrides for the strings the task grid and its grid render; read once, at mount. */
    labels?: Partial<ITaskGridLabels>;
    /** Whether tasks can be moved by dragging their rows. */
    enableRowDragging?: boolean;
    /** Whether the New command and the add-task buttons are there. */
    enableTaskCreation?: boolean;
    /** Hands you the task grid once AG Grid is ready. */
    onReady?: (taskGrid: ITaskGrid) => void;
    /** Hands you the task grid before it tears down. */
    onDestroyed?: (taskGrid: ITaskGrid) => void;
}

export type { IDeleteTasksResult };
