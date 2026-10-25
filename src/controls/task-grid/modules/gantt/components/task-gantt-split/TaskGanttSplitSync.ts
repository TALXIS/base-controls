import type { GanttStatic } from "gantt-trial";
import type { ColDef } from "ag-grid-community";
import type { IRecord } from "@talxis/client-libraries";
import type { IGrid, IGridAgGridInitialOptions } from "@controls/grid";
import type { ITaskRuntime } from "../../../../runtime";
import { TASK_GRID_PRIORITY } from "../../../../priorities";
import type { IGantt } from "../../interfaces";
import { GanttScrollSync } from "./GanttScrollSync";

/** Keeps the grid and the Gantt beside it lined up, row for row and scrolled together. */
export class TaskGanttSplitSync {
    private _taskRuntime: ITaskRuntime;
    private _grid?: IGrid;
    private _scrollSync?: GanttScrollSync;
    private _unregisters: (() => void)[] = [];

    //registered as the grid is made, before AG Grid reads its options
    constructor(taskRuntime: ITaskRuntime) {
        this._taskRuntime = taskRuntime;
        const datasetControl = taskRuntime.services.get('datasetControl');
        datasetControl.parts.whenAvailable('grid', this._onGridAvailable);
        datasetControl.parts.whenAvailable('gantt', this._onGanttAvailable);
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
        this._destroyScrollSync();
    }

    private _onGridAvailable = (grid: IGrid): void => {
        this._grid = grid;
        this._unregisters.push(
            grid.registerAgGridInitialOptions(this._onAgGridInitialOptions),
            grid.services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, TASK_GRID_PRIORITY.tree + 1),
        );
    };

    private _onGanttAvailable = (gantt: IGantt): void => {
        gantt.events.addEventListener('onChartReady', this._onChartReady);
        gantt.events.addEventListener('onDestroyed', this._destroyScrollSync);
        this._unregisters.push(
            () => gantt.events.removeEventListener('onChartReady', this._onChartReady),
            () => gantt.events.removeEventListener('onDestroyed', this._destroyScrollSync),
        );
    };

    //the chart is drawn only once the grid has an api
    private _onChartReady = (chart: GanttStatic): void => {
        const gridApi = this._grid?.services.find('gridApi');
        if (this._grid && gridApi) {
            this._scrollSync = new GanttScrollSync(chart, gridApi, this._grid.services.get('viewport'));
        }
    };

    private _destroyScrollSync = (): void => {
        this._scrollSync?.destroy();
        this._scrollSync = undefined;
    };

    private _onAgGridInitialOptions = (result: IGridAgGridInitialOptions): void => {
        result.options.suppressGroupRowsSticky = true;
    };

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const subjectColDef = columnDefs.find(colDef => colDef.colId === this._taskRuntime.getFieldMapping().subject);
        if (subjectColDef) {
            subjectColDef.pinned = null;
        }
    };
}
