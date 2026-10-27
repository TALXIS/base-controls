import type { GanttStatic, Task } from "dhtmlx-gantt";

/** The chart's state of a bar being dragged, measured from the rendered range's start. */
export interface ITaskDragState {
    /** The task as it was when the drag began. */
    obj?: Task;
    /** Whether a resize drags the start. */
    left?: boolean;
    start_x?: number;
    pos?: { x: number; y: number };
    obj_s_x?: number;
    obj_e_x?: number;
}

//the timeline view runs the bars' drag and keeps its state
interface ITimelineInternals {
    $ui?: { getView(id: string): { _tasks_dnd?: { drag: ITaskDragState | null } } | undefined };
}

export const getTaskDragState = (chart: GanttStatic): ITaskDragState | undefined => {
    return (chart as GanttStatic & ITimelineInternals).$ui?.getView('timeline')?._tasks_dnd?.drag ?? undefined;
};

/** Moves a running drag's measurements by `offset` pixels, as when the drawn range grew backwards. */
export const shiftTaskDrag = (chart: GanttStatic, offset: number): void => {
    const drag = getTaskDragState(chart);
    if (!drag || !offset) {
        return;
    }
    if (drag.start_x !== undefined) {
        drag.start_x += offset;
    }
    if (drag.pos) {
        drag.pos.x += offset;
    }
    if (drag.obj_s_x !== undefined) {
        drag.obj_s_x += offset;
    }
    if (drag.obj_e_x !== undefined) {
        drag.obj_e_x += offset;
    }
};
