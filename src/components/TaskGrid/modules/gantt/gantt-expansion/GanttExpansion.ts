import debounce from "debounce";
import { GanttStatic } from "gantt-trial";
import { ITaskExpansionDelta, ITaskExpansionProvider } from "@components/TaskGrid/providers/expansion";
import { IGanttServiceLocator } from "../services";

/** A double click opens the task, so the toggle has to wait to see whether a second click is coming. */
const TASK_CLICK_DELAY_MS = 200;

export interface IGanttExpansionParameters {
    /** Where the chart and the expansion authority are reached. */
    services: IGanttServiceLocator;
}

/** The chart's half of expansion. */
export interface IGanttExpansion {
    /** Releases the click debounce. */
    destroy: () => void;
}

/**
 * Keeps the chart's open rows and the grid's expansion authority in step.
 *
 * A click on a bar reports what the user did; everything the chart draws comes back from the authority,
 * so the two halves of the split view cannot hold different answers. Nothing here reads the grid.
 */
export class GanttExpansion implements IGanttExpansion {
    private _services: IGanttServiceLocator;
    private _debouncedToggle: debounce.DebouncedFunction<(taskId: string) => void>;
    private _pendingChartWrites?: Map<string, boolean>;

    constructor(parameters: IGanttExpansionParameters) {
        this._services = parameters.services;
        this._debouncedToggle = debounce((taskId: string) => this._toggle(taskId), TASK_CLICK_DELAY_MS);
        this._registerChartEventListeners();
        this._expansion.events.addEventListener('onExpansionChanged', delta => this._onExpansionChanged(delta));
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

    private _toggle(taskId: string): void {
        //the click is answered late, so what it was aimed at can be gone by now - a quick find that
        //dropped the task, or a delete
        if (!this._chart.isTaskExists(taskId)) {
            return;
        }
        this._expansion.toggle(taskId);
    }

    private _onExpansionChanged(delta: ITaskExpansionDelta): void {
        for (const recordId of delta.recordIds) {
            this._queueChartWrite(recordId, delta.expanded);
        }
    }

    /**
     * Collects what the chart has to be told and tells it once.
     *
     * The chart repaints itself on every open and close, so a change covering many rows costs one full
     * repaint per row if it is applied row by row. Everything that lands in the same tick is applied
     * together — which also covers the rows the grid reports one at a time as it builds them.
     */
    private _queueChartWrite(taskId: string, expanded: boolean): void {
        if (this._pendingChartWrites) {
            this._pendingChartWrites.set(taskId, expanded);
            return;
        }
        this._pendingChartWrites = new Map([[taskId, expanded]]);
        queueMicrotask(() => {
            const writes = this._pendingChartWrites;
            this._pendingChartWrites = undefined;
            if (writes) {
                this._applyChartWrites(writes);
            }
        });
    }

    private _applyChartWrites(writes: Map<string, boolean>): void {
        const chart = this._services.find('ganttChart');
        if (!chart) {
            return;
        }
        //only where the chart does not already agree, so a repaint is never spent on nothing
        const changes = [...writes].filter(([taskId, expanded]) =>
            chart.isTaskExists(taskId) && !!chart.getTask(taskId).$open !== expanded);
        if (!changes.length) {
            return;
        }
        //opening a task adds rows, which would otherwise scroll the timeline away from where it was
        this._services.get('ganttInfiniteTimeline').executeWithScrollBlock(() => {
            if (changes.length === 1) {
                const [taskId, expanded] = changes[0];
                expanded ? chart.open(taskId) : chart.close(taskId);
                return;
            }
            //batched rather than written straight onto the tasks: the chart's own open and close are what
            //keep its running totals right, and a batch turns their repaints into the one at the end - a
            //repaint rather than a data refresh, because only that resizes the area both panes scroll
            chart.batchUpdate(() => {
                for (const [taskId, expanded] of changes) {
                    expanded ? chart.open(taskId) : chart.close(taskId);
                }
            });
        });
    }

    private get _chart(): GanttStatic {
        return this._services.get('ganttChart');
    }

    private get _expansion(): ITaskExpansionProvider {
        return this._services.get('taskGridServices').get('taskExpansion');
    }
}
