import type { ITaskDataProvider, ITaskStore } from "../provider";
import { ITaskDataProviderParameters, TaskDataProvider } from "../provider/TaskDataProvider";
import type { ITaskRuntime } from "..";

export interface ITaskProviderParameters {
    taskRuntime: ITaskRuntime;
    /** Such as a `MemoryTaskStore` or a `DataverseTaskStore`. */
    createStore: (taskRuntime: ITaskRuntime) => ITaskStore;
    /** The provider class to build over the store, a `TaskDataProvider` when left out. */
    provider?: new (parameters: ITaskDataProviderParameters) => ITaskDataProvider;
}

/** Tasks kept by the store `createStore` creates. */
export const createTaskProvider = (parameters: ITaskProviderParameters): ITaskDataProvider => {
    const { taskRuntime, createStore, provider: Provider = TaskDataProvider } = parameters;
    return new Provider({ store: createStore(taskRuntime), formatting: taskRuntime.services.get('pcfContext').formatting });
};
