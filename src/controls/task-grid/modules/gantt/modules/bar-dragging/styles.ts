import type { IStyle } from "@fluentui/react";
import { GANTT_TASK_LINE_CLASS, GANTT_TASK_LOCKED_CLASS } from "../../chart/classNames";

const HANDLE_WIDTH = 10;

//inside the bar's ends, so the links' dots just outside them keep their own room
export const getGanttTaskDraggingStyles = (): IStyle => ({
    [`.${GANTT_TASK_LINE_CLASS} .gantt_task_drag`]: {
        top: 0,
        height: '100%',
        minHeight: 0,
        width: HANDLE_WIDTH,
        zIndex: 2,
        '::after': {
            content: '""',
            position: 'absolute',
            top: '25%',
            bottom: '25%',
            width: 2,
            borderRadius: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
        },
    },
    [`.${GANTT_TASK_LINE_CLASS} .gantt_task_drag.task_left`]: {
        left: 0,
        '::after': { left: 3 },
    },
    [`.${GANTT_TASK_LINE_CLASS} .gantt_task_drag.task_right`]: {
        right: 0,
        '::after': { right: 3 },
    },
    [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_LOCKED_CLASS} .gantt_task_drag`]: {
        display: 'none',
    },
});
