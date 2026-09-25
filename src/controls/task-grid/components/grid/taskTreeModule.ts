import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { IRecord } from "@talxis/client-libraries";
import { GRID_MODULE_PRIORITY, IGridModule } from "@controls/grid";
import { ITaskDataProvider } from "../../providers/task";
import { ITaskGridServiceLocator } from "../../services";

const processUnpinnedColumns = () => [];

/** The task tree: AG Grid's row grouping, fed the hierarchy the task provider holds. */
export const createTaskTreeModule = (taskDataProvider: ITaskDataProvider, taskGridServices: ITaskGridServiceLocator): IGridModule => {
    const getDataPath = (record: IRecord) => taskDataProvider.getRecordTree().structure.getAncestorIds(record.getRecordId());
    return {
        agGridModules: [RowGroupingModule],
        onRegister: services => {
            //ahead of the grid's first column push, so those columns meet the customizer's patch
            services.whenAvailable('gridApi', gridApi => taskGridServices.register('gridApi', () => gridApi));
            const grid = services.get('grid');
            grid.registerAgGridInitialOptions(result => {
                result.options.suppressGroupRowsSticky = true;
                result.options.processUnpinnedColumns = processUnpinnedColumns;
            }, GRID_MODULE_PRIORITY.grouping);
            grid.registerAgGridOptions(result => {
                //the path first: AG Grid reads it the moment tree data is switched on
                result.options.getDataPath = getDataPath;
                result.options.treeData = true;
                result.options.groupDisplayType = 'custom';
            }, GRID_MODULE_PRIORITY.grouping);
        },
    };
};
