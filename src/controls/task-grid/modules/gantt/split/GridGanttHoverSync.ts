import type { GanttStatic } from "dhtmlx-gantt";
import { GANTT_TASK_ID_ATTRIBUTE, GANTT_TASK_ROW_CLASS } from "../../chart/classNames";

const GRID_ROW_SELECTOR = '.ag-row[row-id]';
const GRID_ROW_HOVER_CLASS = 'ag-row-hover';

/** Hovering a task on either side highlights its row on both, as one table. */
export class GridGanttHoverSync {
    private _gridRoot: HTMLElement;
    private _chartArea: HTMLElement;
    //a rule survives the chart redrawing its rows
    private _chartStyle: HTMLStyleElement;
    private _hoverColor: string;
    private _taskId?: string;

    constructor(gantt: GanttStatic, gridRoot: HTMLElement) {
        this._gridRoot = gridRoot;
        this._chartArea = gantt.$task_data;
        this._hoverColor = getComputedStyle(gridRoot).getPropertyValue('--ag-row-hover-color').trim();
        this._chartStyle = gantt.$root.ownerDocument.createElement('style');
        gantt.$root.ownerDocument.head.appendChild(this._chartStyle);
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
        this._setHoveredTask((event.target as HTMLElement).closest(GRID_ROW_SELECTOR)?.getAttribute('row-id') ?? undefined);
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
        this._chartStyle.textContent = taskId ? `.${GANTT_TASK_ROW_CLASS}[${GANTT_TASK_ID_ATTRIBUTE}="${CSS.escape(taskId)}"] { background-color: ${this._hoverColor}; }` : '';
    }

    //the row has a part in each AG Grid container
    private _toggleGridRows(taskId: string | undefined, isHovered: boolean): void {
        if (!taskId) {
            return;
        }
        this._gridRoot.querySelectorAll(`.ag-row[row-id="${CSS.escape(taskId)}"]`).forEach(row => row.classList.toggle(GRID_ROW_HOVER_CLASS, isHovered));
    }
}
