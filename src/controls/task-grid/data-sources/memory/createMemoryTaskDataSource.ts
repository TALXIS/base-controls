import { createElement } from "react";
import type { IFieldMapping, ITaskDataProvider } from "../../provider";
import { TaskDataProvider } from "../../provider/TaskDataProvider";
import type { ITaskDatasetControlRuntime } from "../../runtime";
import { IMemoryTaskStrategyParameters, MemoryTaskStrategy } from "./MemoryTaskStrategy";
import { MemoryTaskForm } from "./MemoryTaskForm";
import { MemoryTaskFormDialog } from "./form-dialog";

export interface IMemoryTaskDataSourceParameters extends IMemoryTaskStrategyParameters {
    fieldMapping: IFieldMapping;
    /** The mount the provider is for, which draws the memory form. */
    taskDatasetControl: ITaskDatasetControlRuntime;
}

/** Tasks held in memory, opened in a form drawn over the control. */
export const createMemoryTaskDataSource = (parameters: IMemoryTaskDataSourceParameters): ITaskDataProvider => {
    const { taskDatasetControl } = parameters;
    const form = new MemoryTaskForm();
    taskDatasetControl.services.register('memoryTaskForm', () => form);
    taskDatasetControl.services.get('datasetControl').surfaces.registerSurface(surfaces => {
        surfaces.push({ key: 'memoryTaskForm', onRender: () => createElement(MemoryTaskFormDialog) });
    });
    return new TaskDataProvider({ strategy: new MemoryTaskStrategy(parameters, form), fieldMapping: parameters.fieldMapping });
};
