import type { GanttStatic } from "dhtmlx-gantt";
import { GANTT_TASK_ID_ATTRIBUTE } from "../chart";
import { getChartRowHoverRule, getGridRowHoverColor, GRID_ROW_HOVER_CLASS } from "./styles";

const GRID_ROW_ID_ATTRIBUTE = 'row-id';

const getGridRowSelector = (taskId?: string): string => `.ag-row[${GRID_ROW_ID_ATTRIBUTE}${taskId === undefined ? '' : `="${CSS.escape(taskId)}"`}]`;

/** Hovering a task on either side highlights its row on both. */
export class GridGanttHoverSync {
    private _gridRoot: HTMLElement;
    private _chartArea: HTMLElement;
    //a rule survives the chart redrawing its rows
    private _chartStyle: HTMLStyleElement;
    private _taskId?: string;

    constructor(chart: GanttStatic, gridRoot: HTMLElement) {
        this._gridRoot = gridRoot;
        this._chartArea = chart.$task_data;
        this._chartStyle = chart.$root.ownerDocument.createElement('style');
        chart.$root.ownerDocument.head.appendChild(this._chartStyle);
        this._gridRoot.addEventListener('mouseover', this._onGridMouseOver);
        this._gridRoot.addEventListener('mouseleave', this._onMouseLeave);
        this._chartArea.addEventListener('mouseover', this._onChartMouseOver);
        this._chartArea.addEventListener('mouseleave', this._onMouseLeave);
    }

    public destroy(): void {
        this._setHoveredTask(undefined);
        this._chartStyle.remove();
        this._gridRoot.removeEventListener('mouseover', this._onGridMouseOver);
        this._gridRoot.removeEventListener('mouseleave', this._onMouseLeave);
        this._chartArea.removeEventListener('mouseover', this._onChartMouseOver);
        this._chartArea.removeEventListener('mouseleave', this._onMouseLeave);
    }

    private _onGridMouseOver = (event: MouseEvent): void => {
        this._setHoveredTask((event.target as HTMLElement).closest(getGridRowSelector())?.getAttribute(GRID_ROW_ID_ATTRIBUTE) ?? undefined);
    };

    private _onChartMouseOver = (event: MouseEvent): void => {
        this._setHoveredTask((event.target as HTMLElement).closest(`[${GANTT_TASK_ID_ATTRIBUTE}]`)?.getAttribute(GANTT_TASK_ID_ATTRIBUTE) ?? undefined);
    };

    private _onMouseLeave = (): void => {
        this._setHoveredTask(undefined);
    };

    private _setHoveredTask(taskId: string | undefined): void {
        if (taskId === this._taskId) {
            return;
        }
        this._toggleGridRows(this._taskId, false);
        this._taskId = taskId;
        this._toggleGridRows(taskId, true);
        this._chartStyle.textContent = taskId ? getChartRowHoverRule(taskId, getGridRowHoverColor(this._gridRoot)) : '';
    }

    //the row has a part in each AG Grid container
    private _toggleGridRows(taskId: string | undefined, isHovered: boolean): void {
        if (!taskId) {
            return;
        }
        this._gridRoot.querySelectorAll(getGridRowSelector(taskId)).forEach(row => row.classList.toggle(GRID_ROW_HOVER_CLASS, isHovered));
    }
}
