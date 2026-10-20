import type { IRecord } from "@talxis/client-libraries";
import type { IGridComponents, IGridModule, IGridModules, IGridProps } from "@controls/grid";
import type { ITaskGridServiceMap } from "./services";
import type { ITaskDatasetControlRuntime } from "./runtime";
import type { IDatasetControlLoadParameters } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import type { IDeleteTasksResult, ITaskDataProvider, ITaskDataProviderInitializeParameters, ITaskMoveParams, ITaskViewData } from "./provider";
import type { ITreeCellComponents, IExpansionHeaderComponents } from "./tree";


/** The grid modules of a task grid; the row model is always client-side, and grouping does not mix with a tree. */
export interface ITaskGridGridModules extends Omit<IGridModules, 'rowModel' | 'grouping' | 'aggregation' | 'custom'> {
    /** The caller's own grid modules, registered after the task tree. */
    custom?: IGridModule<ITaskGridServiceMap>[];
}

/** What a `TaskDatasetControl`'s `onLoad` is called with. */
export interface ITaskGridLoadParameters extends IDatasetControlLoadParameters<ITaskViewData> {
    /** The mount the provider is loaded for, to register what the provider's platform adds. */
    taskDatasetControl: ITaskDatasetControlRuntime;
}

/** What a `TaskDatasetControl`'s `onLoad` returns. */
export interface ITaskGridLoadResult extends ITaskDataProviderInitializeParameters {
    /** The provider for the view. */
    provider: ITaskDataProvider;
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
