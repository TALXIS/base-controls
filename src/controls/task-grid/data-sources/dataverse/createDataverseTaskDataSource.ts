import type { ITaskDataProvider, ITaskStore } from "../../provider";
import { ITaskDataProviderParameters, TaskDataProvider } from "../../provider/TaskDataProvider";
import type { ITaskRuntime } from "../../runtime";

export interface IDataverseTaskDataSourceParameters {
    taskRuntime: ITaskRuntime;
    /** Such as a `DataverseTaskStore`. */
    onCreateStore: (taskRuntime: ITaskRuntime) => ITaskStore;
    /** The provider class to build over the store, a `TaskDataProvider` when left out. */
    provider?: new (parameters: ITaskDataProviderParameters) => ITaskDataProvider;
}

/** Tasks in Dataverse, read through FetchXML and opened in their forms. */
export const createDataverseTaskDataSource = (parameters: IDataverseTaskDataSourceParameters): ITaskDataProvider => {
    const { taskRuntime, onCreateStore, provider: Provider = TaskDataProvider } = parameters;
    return new Provider({ store: onCreateStore(taskRuntime), taskRuntime });
};
