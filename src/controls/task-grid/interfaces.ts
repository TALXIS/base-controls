import type { IRecord } from "@talxis/client-libraries";
import type { IGridComponents, IGridModule, IGridModules, IGridProps } from "@controls/grid";
import type { ITaskGridServiceMap } from "./services";
import type { ITaskDatasetControlRuntime } from "./runtime";
import type { IDatasetControlLoadParameters } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import type { IDeleteTasksResult, ITaskDataProvider, ITaskMoveParams, ITaskViewData } from "./provider";
import type { ITreeCellComponents, IAddTaskCellComponents, IExpansionHeaderComponents } from "./tree";

/** A feature of a task grid, loaded on every mount. */
export interface ITaskGridModule {
    /** Registers what the module adds, once the provider is registered; may wait for what it needs first. */
    onLoad?(taskDatasetControl: ITaskDatasetControlRuntime): Promise<void> | void;
}

/** Where the tasks come from: carries the provider built for the view, and whatever its platform draws. */
export interface ITaskDataSourceModule extends ITaskGridModule {
    readonly provider: ITaskDataProvider;
}

/** The modules a `TaskDatasetControl`'s `onLoad` returns. */
export interface ITaskGridModules {
    dataSource: ITaskDataSourceModule;
    /** Registered after the data source, in order. */
    custom?: ITaskGridModule[];
}

/** The grid modules of a task grid; the row model is always client-side, and grouping does not mix with a tree. */
export interface ITaskGridGridModules extends Omit<IGridModules, 'rowModel' | 'grouping' | 'aggregation' | 'custom'> {
    /** The caller's own grid modules, registered after the task tree. */
    custom?: IGridModule<ITaskGridServiceMap>[];
}

/** What a `TaskDatasetControl`'s `onLoad` is called with. */
export type ITaskGridLoadParameters = IDatasetControlLoadParameters<ITaskViewData>;

/** What a `TaskDatasetControl`'s `onLoad` returns. */
export interface ITaskGridLoadResult {
    modules: ITaskGridModules;
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

/** The tasks of a `TaskDatasetControl`, drawn as a tree in its body. */
export interface ITaskGridProps extends Omit<IGridProps, 'modules'> {
    /** Read once, at mount; the task tree and the client-side row model are always added. */
    modules?: ITaskGridGridModules;
    components?: ITaskGridComponents;
}

export type { IDeleteTasksResult };
