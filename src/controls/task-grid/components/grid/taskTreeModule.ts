import { CustomEditorModule, RowAutoHeightModule, RowDragModule, RowStyleModule } from "ag-grid-community";
import { RowGroupingModule, TreeDataModule } from "ag-grid-enterprise";
import { IRecord } from "@talxis/client-libraries";
import { GRID_MODULE_PRIORITY, IGridModule } from "@controls/grid";
import { ITaskDataProvider } from "../../providers/task";
import { ITaskGridServiceLocator } from "../../services";

const processUnpinnedColumns = () => [];

/** The task tree: AG Grid's row grouping, fed the hierarchy the task provider holds. */
export const createTaskTreeModule = (taskDataProvider: ITaskDataProvider, taskGridServices: ITaskGridServiceLocator): IGridModule => {
    const getDataPath = (record: IRecord) => taskDataProvider.getRecordTree().structure.getAncestorIds(record.getRecordId());
    return {
        agGridModules: [RowGroupingModule, TreeDataModule, RowDragModule, RowAutoHeightModule, RowStyleModule, CustomEditorModule],
        onRegister: runtime => {
            //ahead of the grid's first column push, so those columns meet the customizer's patch
            runtime.services.whenAvailable('gridApi', gridApi => taskGridServices.register('gridApi', () => gridApi));
            runtime.registerAgGridInitialOptions(result => {
                result.options.suppressGroupRowsSticky = true;
                result.options.processUnpinnedColumns = processUnpinnedColumns;
                result.options.getDataPath = getDataPath;
            }, GRID_MODULE_PRIORITY.grouping);
            runtime.registerAgGridOptions(result => {
                result.options.treeData = true;
                result.options.groupDisplayType = 'custom';
            }, GRID_MODULE_PRIORITY.grouping);
        },
    };
};
