import type { GanttStatic } from "gantt-trial";
import { GANTT_DATA_AREA_CLASS, GANTT_TASK_BG_CLASS, GANTT_TASK_CELL_CLASS, GANTT_TASK_ID_ATTRIBUTE, GANTT_TASK_LINE_CLASS, GANTT_TASK_ROW_CLASS } from "../../chart/classNames";

/** The row a drawn task goes above, relative to the chart's root. */
export interface ITimelineCreateTarget {
    rowTaskId?: string;
    rowTop: number;
    rowHeight: number;
}

const CREATE_TARGET_SELECTOR = [GANTT_TASK_BG_CLASS, GANTT_TASK_CELL_CLASS, GANTT_TASK_LINE_CLASS, GANTT_DATA_AREA_CLASS].map(className => `.${className}`).concat(`[${GANTT_TASK_ID_ATTRIBUTE}]`).join(', ');

export const isCreateTarget = (gantt: GanttStatic, target: EventTarget | null): boolean => {
    const element = target as HTMLElement | null;
    return !!element && gantt.$root.contains(element) && !!element.closest(CREATE_TARGET_SELECTOR);
};

/** A client x as a position on the timeline, so it stays put while the chart scrolls. */
export const getTimelineX = (gantt: GanttStatic, clientX: number): number => {
    return gantt.getScrollState().x + clientX - gantt.$root.getBoundingClientRect().left;
};

export const getCreateTarget = (gantt: GanttStatic, target: EventTarget | null): ITimelineCreateTarget | undefined => {
    const element = target as HTMLElement | null;
    if (!element || !isCreateTarget(gantt, element)) {
        return undefined;
    }
    const rootTop = gantt.$root.getBoundingClientRect().top;
    const rowElement = element.closest<HTMLElement>(`.${GANTT_TASK_ROW_CLASS}`);
    if (rowElement) {
        const rowRect = rowElement.getBoundingClientRect();
        return { rowTaskId: rowElement.getAttribute(GANTT_TASK_ID_ATTRIBUTE) ?? undefined, rowTop: rowRect.top - rootTop, rowHeight: rowRect.height };
    }
    //a bar has no row element to measure; its row is centred on it
    const taskElement = element.closest<HTMLElement>(`[${GANTT_TASK_ID_ATTRIBUTE}]`);
    const rowTaskId = taskElement?.getAttribute(GANTT_TASK_ID_ATTRIBUTE) ?? undefined;
    if (!taskElement || !rowTaskId || !gantt.isTaskExists(rowTaskId)) {
        return undefined;
    }
    const taskRect = taskElement.getBoundingClientRect();
    const rowHeight = gantt.getTask(rowTaskId).row_height ?? gantt.config.row_height;
    return { rowTaskId, rowTop: taskRect.top - rootTop - (rowHeight - taskRect.height) / 2, rowHeight };
};
