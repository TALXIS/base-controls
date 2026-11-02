import type { IGridComponents, IGridModule, IGridModuleMap, IGridProps } from "@controls/grid";
import type { ITaskRuntime } from "./runtime";
import type { IDatasetControlLoadParameters } from "@controls/dataset-control";
import type { ITaskDataProvider, ITaskDataProviderInitializeParameters, ITaskViewData } from "./provider";
import type { ITreeCellComponents, IExpansionHeaderComponents, IPercentCompleteCellComponents, ITaskCommandsCellComponents } from "./components/adapters";

/** The task grid's own variants of the grid modules it takes, by name. */
export interface ITaskGridGridModuleMap { }

/** A grid module a task grid accepts. */
export type ITaskGridGridModule = IGridModule<Exclude<keyof IGridModuleMap, 'rowModel' | 'editing' | 'grouping' | 'aggregation' | 'taskTree'>> | ITaskGridGridModuleMap[keyof ITaskGridGridModuleMap];

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
    /** The percent complete cell, a bar until it is edited. */
    percentComplete?: IPercentCompleteCellComponents;
    /** A task's row commands, below expand and collapse all. */
    taskCommands?: ITaskCommandsCellComponents;
}

/** The tasks of a `TaskDatasetControl`, drawn as a tree in its body. */
export interface ITaskGridProps extends Omit<IGridProps, 'modules'> {
    /** Read once, at mount, and loaded after the client-side row model and the task tree. */
    modules?: ITaskGridGridModule[];
    components?: ITaskGridComponents;
}
