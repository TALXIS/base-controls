import type { IStyle } from "@fluentui/react";
import { GANTT_TASK_DRAG_END_CLASS, GANTT_TASK_DRAG_HANDLE_CLASS, GANTT_TASK_DRAG_START_CLASS, GANTT_TASK_LINE_CLASS, GANTT_TASK_LOCKED_CLASS } from "../../chart";

const HANDLE_WIDTH = 10;

//inside the bar's ends so the link dots just outside keep their room
export const getBarDraggingStyles = (): IStyle => ({
    [`.${GANTT_TASK_LINE_CLASS} .${GANTT_TASK_DRAG_HANDLE_CLASS}`]: {
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
    [`.${GANTT_TASK_LINE_CLASS} .${GANTT_TASK_DRAG_HANDLE_CLASS}.${GANTT_TASK_DRAG_START_CLASS}`]: {
        left: 0,
        '::after': { left: 3 },
    },
    [`.${GANTT_TASK_LINE_CLASS} .${GANTT_TASK_DRAG_HANDLE_CLASS}.${GANTT_TASK_DRAG_END_CLASS}`]: {
        right: 0,
        '::after': { right: 3 },
    },
    [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_LOCKED_CLASS} .${GANTT_TASK_DRAG_HANDLE_CLASS}`]: {
        display: 'none',
    },
});
