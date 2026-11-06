import { GANTT_TASK_ID_ATTRIBUTE, GANTT_TASK_ROW_CLASS } from "../chart";

export const GRID_ROW_HOVER_CLASS = 'ag-row-hover';

//the variable is defined on the grid's theme
export const getGridRowHoverColor = (gridRoot: HTMLElement) => getComputedStyle(gridRoot).getPropertyValue('--ag-row-hover-color').trim();

export const getChartRowHoverRule = (taskId: string, color: string) => `.${GANTT_TASK_ROW_CLASS}[${GANTT_TASK_ID_ATTRIBUTE}="${CSS.escape(taskId)}"] { background-color: ${color}; }`;
