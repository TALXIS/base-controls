import type { GanttStatic } from "dhtmlx-gantt";
import { GANTT_LINK_CONTROL_CLASS } from "../chart";

/** Whether the pointer is pressed, drawing a link or on a link's handle. */
export const isChartPointerBusy = (chart: GanttStatic, event: MouseEvent): boolean => {
    return event.buttons !== 0 || !!chart.getState().link_source_id || !!(event.target as HTMLElement | null)?.closest(`.${GANTT_LINK_CONTROL_CLASS}`);
};
