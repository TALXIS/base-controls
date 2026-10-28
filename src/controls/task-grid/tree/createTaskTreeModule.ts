import { RowDragModule } from "ag-grid-community";
import { RowGroupingModule, TreeDataModule } from "ag-grid-enterprise";
import type { IGrid, IGridModule } from "@controls/grid";
import type { IStateStore } from "@utils";
import type { ITaskGridServiceMap } from "../services";
import type { ITaskRuntime } from "../runtime";
import { TaskTree } from "./TaskTree";

export interface ITaskTreeModule extends IGridModule<'taskTree'> { }

declare module "@controls/grid/interfaces" {
    interface IGridModuleMap {
        /** The tasks drawn as a tree on the grid. */
        taskTree: TaskTree;
    }
}

/** Builds the grid module that draws a task grid's tasks as a tree. */
export const createTaskTreeModule = (runtime: ITaskRuntime, state: IStateStore): ITaskTreeModule => ({
    name: 'taskTree',
    agGridModules: [RowGroupingModule, TreeDataModule, RowDragModule],
    onLoad: grid => new TaskTree({ grid: grid as IGrid<ITaskGridServiceMap>, runtime, state }),
    onDestroy: tree => tree.destroy(),
});
