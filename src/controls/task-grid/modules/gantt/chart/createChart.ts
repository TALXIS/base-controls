import { Gantt, GanttStatic } from "gantt-trial";

export interface IChartSizing {
    rowHeight: number;
    scaleHeight: number;
}

/** A chart with the options no part or module owns; every feature starts off. */
export const createChart = (sizing: IChartSizing): GanttStatic => {
    const gantt = Gantt.getGanttInstance();
    gantt.config.show_grid = false;
    gantt.config.select_task = false;
    gantt.config.details_on_dblclick = false;
    gantt.config.show_unscheduled = true;
    gantt.config.show_tasks_outside_timescale = true;
    gantt.config.task_scroll_offset = 200;
    gantt.config.show_links = false;
    gantt.config.drag_links = false;
    gantt.config.drag_move = false;
    gantt.config.drag_resize = false;
    gantt.config.drag_progress = false;
    gantt.config.row_height = sizing.rowHeight;
    gantt.config.scale_height = sizing.scaleHeight || gantt.config.scale_height;
    gantt.config.layout = {
        css: 'gantt_container',
        rows: [
            { cols: [{ view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer' }, { view: 'scrollbar', id: 'scrollVer' }] },
            { view: 'scrollbar', id: 'scrollHor' },
        ],
    };
    return gantt;
};
