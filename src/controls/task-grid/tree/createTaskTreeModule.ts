import { RowGroupingModule, TreeDataModule } from "ag-grid-enterprise";
import type { IGridModule } from "@controls/grid";
import type { ITaskDatasetControlRuntime } from "../runtime";
import type { ITaskGridServiceMap } from "../services";
import { TaskTree } from "./TaskTree";

export interface ITaskTreeModuleOptions {
    runtime: ITaskDatasetControlRuntime;
}

/** The module every task grid is built on: the tasks as a tree. */
export const createTaskTreeModule = (options: ITaskTreeModuleOptions): IGridModule<ITaskGridServiceMap> => ({
    agGridModules: [RowGroupingModule, TreeDataModule],
    onRegister: grid => {
        new TaskTree({ grid, runtime: options.runtime });
    },
});
