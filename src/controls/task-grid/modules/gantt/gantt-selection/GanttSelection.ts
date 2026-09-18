import { GanttStatic, Task } from 'gantt-trial';
import { ITaskDataProvider } from '@components/TaskGrid/providers';
import { ITaskGridServiceLocator } from '@components/TaskGrid/services';
import { IGanttServiceLocator } from '../services';

/** Which tasks are selected. Every write to the grid's selection goes through here. */
export interface IGanttSelection {
    /**
     * Selects exactly these tasks, or adds them to what is already selected.
     *
     * The single place the chart's side of the selection is written, so the box select and a click on a
     * bar cannot disagree about what selecting means.
     */
    applySelection: (taskIds: string[], options?: { additive?: boolean }) => void;
    destroy: () => void;
}

export interface IGanttSelectionParameters {
    /** Where the chart and the other parts are reached. */
    services: IGanttServiceLocator;
}

export class GanttSelection implements IGanttSelection {
    private _services: IGanttServiceLocator;
    private _onTaskClickId: string | null = null;
    private _selectionAnchorTaskId: string | null = null;

    constructor(parameters: IGanttSelectionParameters) {
        this._services = parameters.services;
        this._registerEventListeners();
    }

    private get _taskGridServices(): ITaskGridServiceLocator {
        return this._services.get('taskGridServices');
    }

    private get _gantt(): GanttStatic {
        return this._services.get('ganttChart');
    }

    private get _dataProvider(): ITaskDataProvider {
        return this._taskGridServices.get('taskDataProvider');
    }

    public applySelection(taskIds: string[], options?: { additive?: boolean }): void {
        if (!taskIds.length) {
            return;
        }
        const selectedTaskIds = options?.additive
            ? Array.from(new Set([...this._dataProvider.getSelectedRecordIds(), ...taskIds]))
            : taskIds;
        this._dataProvider.setSelectedRecordIds(selectedTaskIds);
    }

    public destroy() {
        if (this._onTaskClickId) {
            this._gantt.detachEvent(this._onTaskClickId);
            this._onTaskClickId = null;
        }
    }

    private _registerEventListeners() {
        this._onTaskClickId = this._gantt.attachEvent('onTaskClick', (id: string, event?: MouseEvent) => {
            this._onRecordSelectedFromGantt(id, event);
            return true;
        });
        this._dataProvider.addEventListener('onRecordsSelected', () => this._gantt.render())
    }

    private _onRecordSelectedFromGantt(taskId: string, event?: MouseEvent) {
        if (event?.shiftKey) {
            const visibleTaskIds = this._getVisibleTaskIds();
            const anchorTaskId = this._selectionAnchorTaskId ?? taskId;
            const clickedTaskIndex = visibleTaskIds.indexOf(taskId);
            const anchorTaskIndex = visibleTaskIds.indexOf(anchorTaskId);

            if (clickedTaskIndex >= 0 && anchorTaskIndex >= 0) {
                const rangeStart = Math.min(anchorTaskIndex, clickedTaskIndex);
                const rangeEnd = Math.max(anchorTaskIndex, clickedTaskIndex);
                this.applySelection(visibleTaskIds.slice(rangeStart, rangeEnd + 1), {
                    additive: event.ctrlKey || event.metaKey,
                });
            }

            return;
        }

        this._selectionAnchorTaskId = taskId;
        if (!event?.ctrlKey && !event?.metaKey) {
            this.applySelection([taskId]);
        }
        else {
            this._dataProvider.toggleSelectedRecordId(taskId, {
                clearExisting: !(event?.ctrlKey || event?.metaKey)
            });
        }
    }

    private _getVisibleTaskIds(): string[] {
        const taskIds: string[] = [];
        this._gantt.eachTask((task: Task) => {
            if (this._gantt.isTaskVisible(task.id)) {
                taskIds.push(String(task.id));
            }
        });

        return taskIds;
    }
}