import { GanttStatic } from "gantt-trial";
import {
    GANTT_DATA_AREA_CLASS,
    GANTT_TASK_BG_CLASS,
    GANTT_TASK_CELL_CLASS,
    GANTT_TASK_CONTENT_CLASS,
    GANTT_TASK_ID_ATTRIBUTE,
    GANTT_TASK_LINE_CLASS,
    GANTT_TASK_ROW_CLASS,
} from "../../../classNames";

/** Where a drag would create a task: the row under the pointer, in the chart's own coordinates. */
export interface ITimelineCreateTarget {
    /** The task whose row it is — the new task lands right above it. */
    currentTaskId?: string;
    rowHeight: number;
    /** The row's top, relative to the chart's root. */
    rowTop: number;
    /** The middle of the row — where the preview line is drawn. */
    top: number;
}

/** Everything the chart lets a task be created on: the empty background as well as the bars. */
const CREATE_TARGET_SELECTOR = [
    `.${GANTT_TASK_BG_CLASS}`,
    `.${GANTT_TASK_CELL_CLASS}`,
    `.${GANTT_TASK_LINE_CLASS}`,
    `.${GANTT_TASK_CONTENT_CLASS}`,
    `.${GANTT_DATA_AREA_CLASS}`,
    `[${GANTT_TASK_ID_ATTRIBUTE}]`,
].join(', ');

/** Whether the element is somewhere a task can be dragged into being. */
export const isCreateTarget = (gantt: GanttStatic, target: EventTarget | null): boolean => {
    const element = target as HTMLElement | null;
    return !!element && gantt.$root.contains(element) && !!element.closest(CREATE_TARGET_SELECTOR);
};

/**
 * A client x-coordinate as a position on the timeline — the scroll offset included, so it stays put while
 * the chart scrolls under the pointer.
 */
export const getTimelineX = (gantt: GanttStatic, clientX: number): number => {
    return gantt.getScrollState().x + clientX - gantt.$root.getBoundingClientRect().left;
};

/**
 * The row the element belongs to, or `null` when it is not a place a task can be created.
 *
 * A row element gives its own geometry. Over a bar there is no row element to measure, so the row is
 * derived from the bar and the configured row height — the bar is drawn shorter than its row.
 */
export const getCreateTarget = (gantt: GanttStatic, target: EventTarget | null): ITimelineCreateTarget | null => {
    const element = target as HTMLElement | null;
    if (!element || !isCreateTarget(gantt, element)) {
        return null;
    }

    const rootRect = gantt.$root.getBoundingClientRect();
    const rowElement = element.closest<HTMLElement>(`.${GANTT_TASK_ROW_CLASS}`);
    if (rowElement) {
        const rowRect = rowElement.getBoundingClientRect();
        const rowTop = rowRect.top - rootRect.top;
        return {
            currentTaskId: rowElement.closest(`[${GANTT_TASK_ID_ATTRIBUTE}]`)?.getAttribute(GANTT_TASK_ID_ATTRIBUTE) ?? undefined,
            rowHeight: rowRect.height,
            rowTop: rowTop,
            top: rowTop + (rowRect.height / 2),
        };
    }

    const taskElement = element.closest<HTMLElement>(`[${GANTT_TASK_ID_ATTRIBUTE}]`);
    if (!taskElement) {
        return null;
    }

    const taskRect = taskElement.getBoundingClientRect();
    const rowHeight = gantt.config.row_height ?? taskRect.height;
    const rowTop = taskRect.top - rootRect.top - ((rowHeight - taskRect.height) / 2);

    return {
        currentTaskId: taskElement.getAttribute(GANTT_TASK_ID_ATTRIBUTE) ?? undefined,
        rowHeight: rowHeight,
        rowTop: rowTop,
        top: rowTop + (rowHeight / 2),
    };
};
