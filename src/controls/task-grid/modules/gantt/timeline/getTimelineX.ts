import type { GanttStatic } from "dhtmlx-gantt";

/** A client x as a position on the timeline, so it stays put while the chart scrolls. */
export const getTimelineX = (gantt: GanttStatic, clientX: number): number => {
    return gantt.getScrollState().x + clientX - gantt.$root.getBoundingClientRect().left;
};
