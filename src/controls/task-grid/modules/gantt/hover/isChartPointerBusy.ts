import type { GanttStatic } from "dhtmlx-gantt";

/** Whether the pointer is pressed, drawing a link, or on a link's handle, where a tooltip would be in the way. */
export const isChartPointerBusy = (chart: GanttStatic, event: MouseEvent): boolean => {
    return event.buttons !== 0 || !!chart.getState().link_source_id || !!(event.target as HTMLElement | null)?.closest('.gantt_link_control');
};
