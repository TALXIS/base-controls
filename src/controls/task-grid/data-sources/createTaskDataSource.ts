import type { ITaskDataProvider, ITaskStore } from "../provider";
import { ITaskDataProviderParameters, TaskDataProvider } from "../provider/TaskDataProvider";
import type { ITaskRuntime } from "../runtime";

export interface ITaskDataSourceParameters {
    taskRuntime: ITaskRuntime;
    /** Such as a `MemoryTaskStore` or a `DataverseTaskStore`. */
    onCreateStore: (taskRuntime: ITaskRuntime) => ITaskStore;
    /** The provider class to build over the store, a `TaskDataProvider` when left out. */
    provider?: new (parameters: ITaskDataProviderParameters) => ITaskDataProvider;
}

/** Tasks kept by the store `onCreateStore` creates. */
export const createTaskDataSource = (parameters: ITaskDataSourceParameters): ITaskDataProvider => {
    const { taskRuntime, onCreateStore, provider: Provider = TaskDataProvider } = parameters;
    return new Provider({ store: onCreateStore(taskRuntime) });
};
