import { createElement } from "react";
import type { ITaskDataProvider } from "../../provider";
import { ITaskDataProviderParameters, TaskDataProvider } from "../../provider/TaskDataProvider";
import type { ITaskDatasetControlRuntime } from "../../runtime";
import type { IMemoryTaskStrategy } from "./MemoryTaskStrategy";
import { MemoryTaskForm } from "./MemoryTaskForm";
import { MemoryTaskFormDialog } from "./form-dialog";

export interface IMemoryTaskDataSourceParameters {
    /** The strategy the factory initializes, such as a `MemoryTaskStrategy` over its tasks. */
    strategy: IMemoryTaskStrategy;
    /** The provider class to build over the strategy, a `TaskDataProvider` when left out. */
    provider?: new (parameters: ITaskDataProviderParameters) => ITaskDataProvider;
    /** The mount the provider is for, which draws the memory form. */
    taskDatasetControl: ITaskDatasetControlRuntime;
}

/** Tasks held in memory, opened in a form drawn over the control. */
export const createMemoryTaskDataSource = (parameters: IMemoryTaskDataSourceParameters): ITaskDataProvider => {
    const { taskDatasetControl, strategy } = parameters;
    const form = new MemoryTaskForm();
    taskDatasetControl.services.register('memoryTaskForm', () => form);
    taskDatasetControl.services.get('datasetControl').surfaces.registerSurface(surfaces => {
        surfaces.push({ key: 'memoryTaskForm', onRender: () => createElement(MemoryTaskFormDialog) });
    });
    strategy.onInitialize(taskDatasetControl);
    const Provider = parameters.provider ?? TaskDataProvider;
    return new Provider({ strategy });
};
