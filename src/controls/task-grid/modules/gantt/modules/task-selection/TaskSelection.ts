import { createElement } from "react";
import type { ITheme } from "@fluentui/react";
import type { GanttStatic } from "dhtmlx-gantt";
import type { ITaskDataProvider } from "../../../../provider";
import { runQuietly } from "../../../../runtime/runQuietly";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import type { IGanttTasks } from "../../tasks";
import type { IGanttStyles } from "../../theme";
import { ROW_SELECTED_CLASS, BAR_SELECTED_CLASS } from "./classNames";
import { SelectionBoxLayer } from "./components/adapters/selection-box-layer";
import { getTaskSelectionStyles } from "./styles";

export interface ITaskSelectionParameters {
    /** Shift+drag selects the bars under a band (default `true`). */
    enableSelectionBox?: boolean;
}

/** The `taskSelection` module: selects tasks from the chart, through the provider's selection. */
export interface ITaskSelection {
    isSelected(taskId: string): boolean;
    /** Selects exactly these tasks, or adds them to the selection. */
    select(taskIds: string[], options?: { isAdditive?: boolean }): void;
    /** Called as the Gantt goes. */
    destroy(): void;
}

export class TaskSelection implements ITaskSelection {
    private _gantt: IGantt;
    private _provider: ITaskDataProvider;
    private _rangeAnchorTaskId?: string;
    private _selectedTaskIds?: Set<string>;
    private _offSelectionChanged: () => void;

    constructor(gantt: IGantt, parameters: ITaskSelectionParameters) {
        this._gantt = gantt;
        this._provider = gantt.getTaskRuntime().getProvider();
        this._offSelectionChanged = this._provider.addEventListener('onRecordsSelected', this._onSelectionChanged);
        gantt.services.observe('chart', this._onChartReady);
        gantt.services.observe('tasks', this._onTasksReady);
        gantt.services.get('theme').registerStyles(this._onStyles);
        if (parameters.enableSelectionBox ?? true) {
            gantt.surfaces.registerSurface(this._onSurfaces);
        }
    }

    public isSelected(taskId: string): boolean {
        this._selectedTaskIds ??= new Set(this._provider.getSelectedRecordIds());
        return this._selectedTaskIds.has(taskId);
    }

    public select(taskIds: string[], options?: { isAdditive?: boolean }): void {
        this._provider.setSelectedRecordIds(options?.isAdditive ? [...new Set([...this._provider.getSelectedRecordIds(), ...taskIds])] : taskIds);
        this._selectedTaskIds = undefined;
    }

    public destroy(): void {
        this._offSelectionChanged();
    }

    private _onChartReady = (chart: GanttStatic): void => {
        chart.attachEvent('onTaskClick', this._onTaskClick);
        chart.attachEvent('onTaskDblClick', this._onTaskDblClick);
    };

    private _onTasksReady = (tasks: IGanttTasks): void => {
        tasks.registerRowClass((classNames, { record }) => this._addClassIfSelected(classNames, record.getRecordId(), ROW_SELECTED_CLASS));
        tasks.registerTaskClass((classNames, { record }) => this._addClassIfSelected(classNames, record.getRecordId(), BAR_SELECTED_CLASS));
    };

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        surfaces.push({ key: 'selectionBox', onRender: () => createElement(SelectionBoxLayer) });
    };

    private _onStyles = (result: IGanttStyles, theme: ITheme): void => {
        result.styles.push(getTaskSelectionStyles(theme));
    };

    private _onSelectionChanged = (): void => {
        this._selectedTaskIds = undefined;
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
            this._selectedTaskIds = undefined;
        }
        else {
            this.select([taskId]);
        }
        return true;
    };

    private _onTaskDblClick = (id: string | number): boolean => {
        const record = this._gantt.services.find('tasks')?.getRecord(String(id));
        if (record) {
            runQuietly(() => this._gantt.getTaskRuntime().tasks.open([record.getRecordId()]));
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
        taskSelection: ITaskSelection;
    }
}
