import { createElement } from "react";
import type { IFieldMapping } from "../../provider";
import { TaskDataProvider } from "../../provider/TaskDataProvider";
import type { ITaskDataSourceModule } from "../../interfaces";
import { IMemoryTaskStrategyParameters, MemoryTaskStrategy } from "./MemoryTaskStrategy";
import { MemoryTaskForm } from "./MemoryTaskForm";
import { MemoryTaskFormDialog } from "./form-dialog";

export interface IMemoryTaskDataSourceParameters extends IMemoryTaskStrategyParameters {
    fieldMapping: IFieldMapping;
}

/** Tasks held in memory, opened in a form drawn over the control. */
export const createMemoryTaskDataSource = (parameters: IMemoryTaskDataSourceParameters): ITaskDataSourceModule => {
    const form = new MemoryTaskForm();
    const strategy = new MemoryTaskStrategy(parameters, form);
    return {
        provider: new TaskDataProvider({ strategy, fieldMapping: parameters.fieldMapping }),
        onLoad: taskDatasetControl => {
            taskDatasetControl.services.register('memoryTaskForm', () => form);
            taskDatasetControl.services.get('datasetControl').surfaces.registerSurface(surfaces => {
                surfaces.push({ key: 'memoryTaskForm', onRender: () => createElement(MemoryTaskFormDialog) });
            });
        },
    };
};
