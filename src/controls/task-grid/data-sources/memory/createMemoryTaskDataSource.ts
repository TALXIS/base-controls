import type { ITaskDataProvider } from "../../provider";
import { ITaskDataProviderParameters, TaskDataProvider } from "../../provider/TaskDataProvider";
import type { ITaskDatasetControlRuntime } from "../../runtime";
import type { IMemoryTaskStrategy } from "./MemoryTaskStrategy";

export interface IMemoryTaskDataSourceParameters {
    /** The strategy the factory initializes, such as a `MemoryTaskStrategy` over its tasks. */
    strategy: IMemoryTaskStrategy;
    /** The provider class to build over the strategy, a `TaskDataProvider` when left out. */
    provider?: new (parameters: ITaskDataProviderParameters) => ITaskDataProvider;
    /** The mount the provider is for. */
    taskDatasetControl: ITaskDatasetControlRuntime;
}

/** Tasks held in memory. */
export const createMemoryTaskDataSource = (parameters: IMemoryTaskDataSourceParameters): ITaskDataProvider => {
    const { taskDatasetControl, strategy } = parameters;
    strategy.onInitialize(taskDatasetControl);
    const Provider = parameters.provider ?? TaskDataProvider;
    return new Provider({ strategy });
};
