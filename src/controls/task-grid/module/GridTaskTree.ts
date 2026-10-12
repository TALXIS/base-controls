import { IRecord } from "@talxis/client-libraries";
import { GRID_MODULE_PRIORITY, IGridAgGridInitialOptions, IGridAgGridOptions, IGridRuntime, IGridServiceMap, IGridStyles } from "@controls/grid";
import { ITheme } from "@theme";
import { ITaskGridServiceLocator } from "@controls/task-grid/services";
import { TaskTreeColumns } from "./TaskTreeColumns";
import { TaskTreeExpansion } from "./TaskTreeExpansion";
import { TaskTreeReordering } from "./TaskTreeReordering";
import { TaskTreeUpdates } from "./TaskTreeUpdates";
import { getTaskTreeStyles } from "./styles";

/** The grid's services, with the task grid's own. */
export interface ITaskTreeServiceMap extends IGridServiceMap {
    /** Everything the task grid was built with: its providers, its control and its feature modules. */
    taskGrid: ITaskGridServiceLocator;
}

export interface IGridTaskTreeParameters {
    runtime: IGridRuntime<ITaskTreeServiceMap>;
}

const processUnpinnedColumns = () => [];

/** Makes the grid the task hierarchy: the rows, their columns, their expansion and their reordering. */
export class GridTaskTree {
    private _runtime: IGridRuntime<ITaskTreeServiceMap>;

    constructor(parameters: IGridTaskTreeParameters) {
        this._runtime = parameters.runtime;
        this._runtime.registerAgGridInitialOptions(this._onAgGridInitialOptions);
        //ahead of the rows, which `treeData` decides how to read
        this._runtime.registerAgGridOptions(this._onAgGridOptions, GRID_MODULE_PRIORITY.rowModel - 1);
        this._runtime.services.get('gridTheme').registerStyles(this._onStyles);
        new TaskTreeColumns({ runtime: this._runtime });
        new TaskTreeExpansion({ runtime: this._runtime });
        new TaskTreeReordering({ runtime: this._runtime });
        new TaskTreeUpdates({ runtime: this._runtime });
    }

    private _onAgGridInitialOptions = (result: IGridAgGridInitialOptions): void => {
        result.options.suppressGroupRowsSticky = true;
        result.options.processUnpinnedColumns = processUnpinnedColumns;
        result.options.getDataPath = this._getDataPath;
    };

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options.treeData = true;
        result.options.groupDisplayType = 'custom';
    };

    private _onStyles = (result: IGridStyles, theme: ITheme): void => {
        result.styles.push(getTaskTreeStyles(theme));
    };

    private _getDataPath = (record: IRecord): string[] => {
        return this._runtime.services.get('taskGrid').get('taskDataProvider').getRecordTree().structure.getAncestorIds(record.getRecordId());
    };
}
