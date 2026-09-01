import debounce from "debounce";
import { GanttStatic } from "gantt-trial";
import { IRecord } from "@talxis/client-libraries";
import { RowGroupOpenedEvent } from "@ag-grid-community/core";
import { IGanttServiceLocator } from "../services";

/** A double click opens the task, so the toggle has to wait to see whether a second click is coming. */
const TASK_CLICK_DELAY_MS = 200;

export interface IGanttExpansionParameters {
    /** Where the chart and the grid's api are reached. */
    services: IGanttServiceLocator;
}

/** Which rows are open, on both halves of the split view. */
export interface IGanttExpansion {
    /** Whether the task is expanded on the timeline. */
    isTaskExpanded: (taskId: string) => boolean;
    /** Releases the click debounce. */
    destroy: () => void;
}

/**
 * Expansion, end to end: the rows the user opened, the chart's open/close, and the grid's.
 *
 * Neither direction needs an echo guard — each side is only touched when it disagrees, which is what
 * stops the loop.
 */
export class GanttExpansion implements IGanttExpansion {
    private _services: IGanttServiceLocator;
    private _expandedTaskIds: Set<string> = new Set();
    private _debouncedToggle: debounce.DebouncedFunction<(taskId: string) => void>;

    constructor(parameters: IGanttExpansionParameters) {
        this._services = parameters.services;
        this._debouncedToggle = debounce((taskId: string) => this._toggle(taskId), TASK_CLICK_DELAY_MS);
        this._registerChartEventListeners();
        this._services.get('taskGridServices').whenAvailable('gridApi', () => this._registerGridEventListeners());
    }

    public isTaskExpanded(taskId: string): boolean {
        return this._expandedTaskIds.has(taskId);
    }

    public destroy(): void {
        this._debouncedToggle.clear();
    }

    private _registerChartEventListeners(): void {
        const chart = this._chart;
        chart.attachEvent('onTaskClick', (taskId: string) => {
            this._debouncedToggle.clear();
            this._debouncedToggle(taskId);
            return true;
        });
        chart.attachEvent('onTaskDblClick', (taskId: string) => {
            this._debouncedToggle.clear();
            this._services.get('taskGridServices').get('taskDataProvider').openTaskItems([taskId]);
            return false;
        });
    }

    private _registerGridEventListeners(): void {
        this._gridApi.addEventListener('rowGroupOpened', (event: RowGroupOpenedEvent<IRecord>) => {
            if (!event.node.id) {
                return;
            }
            this._setChartTaskExpanded(event.node.id, !!event.expanded);
        });
    }

    private _toggle(taskId: string): void {
        const expanded = !this._chart.getTask(taskId).$open;
        this._setChartTaskExpanded(taskId, expanded);
        this._setGridRowExpanded(taskId, expanded);
    }

    private _setChartTaskExpanded(taskId: string, expanded: boolean): void {
        if (expanded) {
            this._expandedTaskIds.add(taskId);
        }
        else {
            this._expandedTaskIds.delete(taskId);
        }

        const chart = this._chart;
        if (!chart.isTaskExists(taskId) || !!chart.getTask(taskId).$open === expanded) {
            return;
        }
        //opening a task adds rows, which would otherwise scroll the timeline away from where it was
        this._services.get('ganttInfiniteTimeline').executeWithScrollBlock(() => {
            expanded ? chart.open(taskId) : chart.close(taskId);
        });
    }

    private _setGridRowExpanded(taskId: string, expanded: boolean): void {
        const node = this._gridApi.getRowNode(taskId);
        if (node && node.expanded !== expanded) {
            node.setExpanded(expanded);
        }
    }

    private get _chart(): GanttStatic {
        return this._services.get('ganttChart');
    }

    private get _gridApi() {
        return this._services.get('taskGridServices').get('gridApi');
    }
}
