import type { ITaskDataProvider, ITaskStore } from "../../provider";
import { ITaskDataProviderParameters, TaskDataProvider } from "../../provider/TaskDataProvider";
import type { ITaskRuntime } from "../../runtime";

export interface IMemoryTaskDataSourceParameters {
    taskRuntime: ITaskRuntime;
    /** Such as a `MemoryTaskStore` over its tasks. */
    onCreateStore: (taskRuntime: ITaskRuntime) => ITaskStore;
    /** The provider class to build over the store, a `TaskDataProvider` when left out. */
    provider?: new (parameters: ITaskDataProviderParameters) => ITaskDataProvider;
}

/** Tasks held in memory. */
export const createMemoryTaskDataSource = (parameters: IMemoryTaskDataSourceParameters): ITaskDataProvider => {
    const { taskRuntime, onCreateStore, provider: Provider = TaskDataProvider } = parameters;
    return new Provider({ store: onCreateStore(taskRuntime) });
};
