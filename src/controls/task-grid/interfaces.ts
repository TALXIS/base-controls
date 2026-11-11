import type { IGridModule, IGridModuleMap, IGridProps } from "@controls/grid";
import type { ITaskRuntime } from "./runtime";
import type { IDatasetControlView } from "@controls/dataset-control";
import type { ITaskDataProvider, ITaskDataProviderParameters, ITaskStore, ITaskViewData } from "./runtime/provider";

/** The task grid's own variants of the grid modules it takes, by name. */
export interface ITaskGridGridModuleMap { }

/** A grid module a task grid accepts. */
export type ITaskGridGridModule = IGridModule<Exclude<keyof IGridModuleMap, 'rowModel' | 'editing' | 'grouping' | 'aggregation' | 'taskTree'>> | ITaskGridGridModuleMap[keyof ITaskGridGridModuleMap];

/** A view of the tasks, set up on the task provider it is opened on. */
export type ITaskGridView = IDatasetControlView<ITaskViewData, ITaskDataProvider>;

/** What a `TaskDatasetControl`'s `onLoad` returns. */
export interface ITaskGridLoadResult extends Pick<ITaskDataProviderParameters, 'fieldMapping' | 'rootTaskId' | 'hoursPerDay'> {
    /** Where the tasks are kept, such as a `MemoryTaskStore` or a `DataverseTaskStore`. */
    store: ITaskStore;
    /** The views to switch between; leave out for a task grid with one view. */
    views?: ITaskGridView[];
}

/** The tasks of a `TaskDatasetControl`, drawn as a tree in its body. */
export interface ITaskGridProps extends Omit<IGridProps, 'modules'> {
    /** Read once, at mount, and loaded after the task tree. */
    modules?: ITaskGridGridModule[];
}
