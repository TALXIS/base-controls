import { RowDragModule } from "ag-grid-community";
import { RowGroupingModule, TreeDataModule } from "ag-grid-enterprise";
import type { TaskGridRuntime } from "../runtime";
import type { ITaskGridModule } from "../interfaces";
import { TaskTree } from "./TaskTree";

export interface ITaskTreeModuleOptions {
    runtime: TaskGridRuntime;
    onIsRowDraggingEnabled: () => boolean;
}

/** The module every task grid is built on: the tasks as a tree. */
export const createTaskTreeModule = (options: ITaskTreeModuleOptions): ITaskGridModule => ({
    agGridModules: [RowGroupingModule, TreeDataModule, RowDragModule],
    onRegister: grid => {
        new TaskTree({ grid, runtime: options.runtime, onIsRowDraggingEnabled: options.onIsRowDraggingEnabled });
    },
});
