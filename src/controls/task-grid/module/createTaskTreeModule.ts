import { RowDragModule } from "ag-grid-community";
import { RowGroupingModule, TreeDataModule } from "ag-grid-enterprise";
import { IGridModule } from "@controls/grid";
import { ITaskGridServiceLocator } from "@controls/task-grid/services";
import { GridTaskTree, ITaskTreeServiceMap } from "./GridTaskTree";

export interface ITaskTreeModuleOptions {
    services: ITaskGridServiceLocator;
}

/** Builds the module that makes the grid the task hierarchy, and hands it the task grid's services. */
export const createTaskTreeModule = (options: ITaskTreeModuleOptions): IGridModule<ITaskTreeServiceMap> => ({
    agGridModules: [RowGroupingModule, TreeDataModule, RowDragModule],
    onRegister: runtime => {
        runtime.services.register('taskGrid', () => options.services);
        new GridTaskTree({ runtime });
    },
});
