import type { IGridComponents, IGridModule, IGridModuleMap, IGridProps } from "@controls/grid";
import type { ITaskRuntime } from "./runtime";
import type { IDatasetControlLoadParameters } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import type { IDeleteTasksResult, ITaskDataProvider, ITaskDataProviderInitializeParameters, ITaskViewData } from "./provider";
import type { ITreeCellComponents, IExpansionHeaderComponents } from "./tree";
import type { ITaskEditingModule } from "./modules/editing";


/** A task grid's grid module; the row model is always client-side, editing always saves, and grouping does not mix with a tree. */
export type ITaskGridGridModule = IGridModule<Exclude<keyof IGridModuleMap, 'rowModel' | 'editing' | 'grouping' | 'aggregation' | 'taskTree'>> | ITaskEditingModule;

/** What a `TaskDatasetControl`'s `onLoad` is called with. */
export interface ITaskGridLoadParameters extends IDatasetControlLoadParameters<ITaskViewData> {
    /** The mount the provider is loaded for, to register what the provider's platform adds. */
    taskRuntime: ITaskRuntime;
}

/** What a `TaskDatasetControl`'s `onLoad` returns. */
export interface ITaskGridLoadResult extends Omit<ITaskDataProviderInitializeParameters, 'defaultCreatePosition'> {
    /** The provider for the view. */
    provider: ITaskDataProvider;
}


/** The replaceable pieces of what a task grid draws, the grid's own included. */
export interface ITaskGridComponents extends IGridComponents {
    /** The subject cell, with the chevron. */
    treeCell?: ITreeCellComponents;
    /** Expand and collapse all, above the row commands. */
    expansionHeader?: IExpansionHeaderComponents;
}

/** The tasks of a `TaskDatasetControl`, drawn as a tree in its body. */
export interface ITaskGridProps extends Omit<IGridProps, 'modules'> {
    /** Read once, at mount, and loaded after the client-side row model and the task tree. */
    modules?: ITaskGridGridModule[];
    components?: ITaskGridComponents;
}

export type { IDeleteTasksResult };
