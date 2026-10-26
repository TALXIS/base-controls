import { createElement } from "react";
import type { ITheme } from "@fluentui/react";
import type { GanttStatic } from "dhtmlx-gantt";
import type { ITaskDataProvider } from "../../../../provider";
import { runQuietly } from "../../../../runtime/runQuietly";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import type { IGanttTasks } from "../../tasks/GanttTasks";
import type { IGanttStyles } from "../../theme";
import { GANTT_ROW_SELECTED_CLASS, GANTT_TASK_SELECTED_CLASS } from "./classNames";
import { SelectionBoxLayer } from "./components/adapters/selection-box-layer";
import { getGanttSelectionStyles } from "./styles";

export interface IGanttSelectionParameters {
    /** Shift+drag selects the bars under a band. Defaults to `true`. */
    enableSelectionBox?: boolean;
}

/** The `selection` module: selects tasks from the chart, through the provider's selection. */
export interface IGanttSelection {
    isSelected(taskId: string): boolean;
    /** Selects exactly these tasks, or adds them to the selection. */
    select(taskIds: string[], options?: { isAdditive?: boolean }): void;
    isSelectionBoxEnabled(): boolean;
    /** Called as the Gantt goes. */
    destroy(): void;
}

export class GanttSelection implements IGanttSelection {
    private _gantt: IGantt;
    private _provider: ITaskDataProvider;
    private _isSelectionBoxEnabled: boolean;
    private _rangeAnchorTaskId?: string;
    private _unregisters: (() => void)[] = [];

    constructor(gantt: IGantt, parameters: IGanttSelectionParameters) {
        this._gantt = gantt;
        this._provider = gantt.getTaskRuntime().getProvider();
        this._isSelectionBoxEnabled = parameters.enableSelectionBox ?? true;
        this._provider.addEventListener('onRecordsSelected', this._onSelectionChanged);
        this._unregisters.push(() => this._provider.removeEventListener('onRecordsSelected', this._onSelectionChanged));
        gantt.services.whenAvailable('chart', this._onChartReady);
        gantt.services.whenAvailable('tasks', this._onTasksReady);
        this._unregisters.push(gantt.services.get('theme').registerStyles(this._onStyles));
        if (this._isSelectionBoxEnabled) {
            this._unregisters.push(gantt.surfaces.registerSurface(this._onSurfaces));
        }
    }

    public isSelected(taskId: string): boolean {
        return this._provider.getSelectedRecordIds().includes(taskId);
    }

    public select(taskIds: string[], options?: { isAdditive?: boolean }): void {
        this._provider.setSelectedRecordIds(options?.isAdditive ? [...new Set([...this._provider.getSelectedRecordIds(), ...taskIds])] : taskIds);
    }

    public isSelectionBoxEnabled(): boolean {
        return this._isSelectionBoxEnabled;
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
    }

    private _onChartReady = (chart: GanttStatic): void => {
        const eventIds = [
            chart.attachEvent('onTaskClick', this._onTaskClick),
            chart.attachEvent('onTaskDblClick', this._onTaskDblClick),
        ];
        this._unregisters.push(() => eventIds.forEach(eventId => chart.detachEvent(eventId)));
    };

    private _onTasksReady = (tasks: IGanttTasks): void => {
        this._unregisters.push(
            tasks.registerRowClass((classNames, { record }) => this._addClassIfSelected(classNames, record.getRecordId(), GANTT_ROW_SELECTED_CLASS)),
            tasks.registerTaskClass((classNames, { record }) => this._addClassIfSelected(classNames, record.getRecordId(), GANTT_TASK_SELECTED_CLASS)),
        );
    };

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        surfaces.push({ key: 'selectionBox', onRender: () => createElement(SelectionBoxLayer) });
    };

    private _onStyles = (result: IGanttStyles, theme: ITheme): void => {
        result.styles.push(getGanttSelectionStyles(theme));
    };

    private _onSelectionChanged = (): void => {
        this._gantt.render();
    };

    private _addClassIfSelected(classNames: string[], taskId: string, className: string): void {
        if (this.isSelected(taskId)) {
            classNames.push(className);
        }
    }

    private _onTaskClick = (id: string | number, event?: MouseEvent): boolean => {
        const taskId = String(id);
        const isToggle = !!event?.ctrlKey || !!event?.metaKey;
        if (event?.shiftKey) {
            this._selectRange(taskId, isToggle);
            return true;
        }
        this._rangeAnchorTaskId = taskId;
        if (isToggle) {
            this._provider.toggleSelectedRecordId(taskId);
        }
        else {
            this.select([taskId]);
        }
        return true;
    };

    private _onTaskDblClick = (id: string | number): boolean => {
        const record = this._gantt.services.find('tasks')?.getRecord(String(id));
        if (record) {
            runQuietly(() => this._gantt.getTaskRuntime().tasks.open(record.getNamedReference()));
        }
        return false;
    };

    private _selectRange(taskId: string, isAdditive: boolean): void {
        const taskIds = this._gantt.services.find('tasks')?.getTaskIds() ?? [];
        const from = taskIds.indexOf(this._rangeAnchorTaskId ?? taskId);
        const to = taskIds.indexOf(taskId);
        if (from >= 0 && to >= 0) {
            this.select(taskIds.slice(Math.min(from, to), Math.max(from, to) + 1), { isAdditive });
        }
    }
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** Selecting tasks from the chart. */
        selection: IGanttSelection;
    }
}
