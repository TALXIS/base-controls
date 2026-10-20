import type { ITaskDataProvider } from "../../provider";
import { ITaskDataProviderParameters, TaskDataProvider } from "../../provider/TaskDataProvider";
import type { ITaskDatasetControlRuntime } from "../../runtime";
import type { IDataverseTaskStrategy } from "./DataverseTaskStrategy";

export interface IDataverseTaskDataSourceParameters {
    /** The mount the provider is for. */
    taskDatasetControl: ITaskDatasetControlRuntime;
    /** The strategy the factory initializes, such as a `DataverseTaskStrategy`. */
    strategy: IDataverseTaskStrategy;
    /** The provider class to build over the strategy, a `TaskDataProvider` when left out. */
    provider?: new (parameters: ITaskDataProviderParameters) => ITaskDataProvider;
}

/** Tasks in Dataverse, read through FetchXML and opened in their forms. */
export const createDataverseTaskDataSource = (parameters: IDataverseTaskDataSourceParameters): ITaskDataProvider => {
    const { taskDatasetControl, strategy, provider: Provider = TaskDataProvider } = parameters;
    strategy.onInitialize(taskDatasetControl);
    return new Provider({ strategy });
};

createDataverseTaskDataSource({
    strategy
})
