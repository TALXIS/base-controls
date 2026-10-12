import { ColDef } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { IGridRuntime } from "@controls/grid";
import { ITaskTreeServiceMap, TASK_TREE_PRIORITY } from "@controls/task-grid/module";
import { IGanttServiceLocator } from "../services";
import { GanttScrollSync } from "./GanttScrollSync";

export interface IGanttGridParameters {
    runtime: IGridRuntime<ITaskTreeServiceMap>;
    ganttServices: IGanttServiceLocator;
}

/** What the grid is as the left half of the split view: unpinned, one line per row, scrolled with the chart. */
export class GanttGrid {
    private _runtime: IGridRuntime<ITaskTreeServiceMap>;
    private _ganttServices: IGanttServiceLocator;
    private _scrollSync?: GanttScrollSync;
    private _isDestroyed = false;

    constructor(parameters: IGanttGridParameters) {
        this._runtime = parameters.runtime;
        this._ganttServices = parameters.ganttServices;
        this._runtime.services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, TASK_TREE_PRIORITY + 2);
        this._runtime.events.addEventListener('onDestroyed', this._onDestroyed);
        //registered once the chart is drawn, which is when its viewport exists
        this._ganttServices.whenAvailable('ganttData', () => this._runtime.services.whenAvailable('gridApi', this._startScrollSync));
    }

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const subject = this._runtime.services.get('taskGrid').get('nativeColumns').subject;
        for (const colDef of columnDefs) {
            if (colDef.colId === subject) {
                colDef.pinned = undefined;
            }
            //a row that grows to fit its content would no longer line up with its bar
            colDef.autoHeight = false;
        }
    };

    private _startScrollSync = (): void => {
        const gridViewport = this._runtime.services.get('gridRoot').querySelector('.ag-grid-viewport');
        if (this._isDestroyed || !(gridViewport instanceof HTMLElement)) {
            return;
        }
        this._scrollSync = new GanttScrollSync({ chart: this._ganttServices.get('ganttChart'), gridViewport });
    };

    //the chart outlives a remount of the grid
    private _onDestroyed = (): void => {
        this._isDestroyed = true;
        this._scrollSync?.destroy();
    };
}
