import type { GanttStatic } from "dhtmlx-gantt";
import type { ColDef } from "ag-grid-community";
import type { IRecord } from "@talxis/client-libraries";
import type { IGrid, IGridAgGridInitialOptions } from "@controls/grid";
import type { IStateStore } from "@utils";
import type { ITaskRuntime } from "../../../../runtime";
import { TASK_GRID_PRIORITY } from "../../../../priorities";
import type { IGantt } from "../../interfaces";
import { GridGanttScrollSync } from "./GridGanttScrollSync";
import { GridGanttHoverSync } from "./GridGanttHoverSync";

const GANTT_SIZE_STATE_KEY = 'ganttSize';

export interface IGridGanttSplitSyncParameters {
    taskRuntime: ITaskRuntime;
    /** Where the Split keeps the Gantt's share of the width. */
    state: IStateStore;
}

/** Keeps the grid and the Gantt beside it lined up, row for row and scrolled together, and the split between them. */
export class GridGanttSplitSync {
    private _taskRuntime: ITaskRuntime;
    private _state: IStateStore;
    private _grid?: IGrid;
    private _scrollSync?: GridGanttScrollSync;
    private _hoverSync?: GridGanttHoverSync;
    private _unregisters: (() => void)[] = [];

    //registered as the grid is made, before AG Grid reads its options
    constructor(parameters: IGridGanttSplitSyncParameters) {
        this._taskRuntime = parameters.taskRuntime;
        this._state = parameters.state;
        const datasetControl = this._taskRuntime.services.get('datasetControl');
        datasetControl.modules.whenAvailable('userQueries', userQueries => {
            this._unregisters.push(userQueries.saveWithView('ganttSplitSize', () => this._state.get<number>(GANTT_SIZE_STATE_KEY)));
        });
        datasetControl.parts.whenAvailable('grid', this._onGridAvailable);
        datasetControl.parts.whenAvailable('gantt', this._onGanttAvailable);
    }

    /** The Gantt's share of the width, in percent; this session's first, then the saved view's. */
    public getGanttSize(defaultSize: number): number {
        return this._state.get<number>(GANTT_SIZE_STATE_KEY) ?? this._taskRuntime.getView()?.data?.ganttSplitSize ?? defaultSize;
    }

    public setGanttSize(size: number): void {
        this._state.set(GANTT_SIZE_STATE_KEY, size);
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
        const gridScroller = this._grid?.services.find('gridApi') && this._grid.services.get('viewport').getScrollElement();
        if (gridScroller) {
            this._scrollSync = new GridGanttScrollSync(chart, gridScroller);
            const gridRoot = gridScroller.closest<HTMLElement>('.ag-root-wrapper');
            this._hoverSync = gridRoot ? new GridGanttHoverSync(chart, gridRoot) : undefined;
        }
    };

    private _destroyScrollSync = (): void => {
        this._scrollSync?.destroy();
        this._scrollSync = undefined;
        this._hoverSync?.destroy();
        this._hoverSync = undefined;
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
