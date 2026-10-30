import type { IStyle, ITheme } from "@fluentui/react";
import { GANTT_TASK_LINE_CLASS, GANTT_TASK_LOCKED_CLASS } from "../../chart/classNames";
import { GANTT_ROW_SELECTED_CLASS, GANTT_SELECTION_BOX_CLASS, GANTT_TASK_SELECTED_CLASS } from "./classNames";

export const getGanttSelectionStyles = (theme: ITheme): IStyle => ({
    //drawn over the cells, as the grid draws its selected rows
    [`.${GANTT_ROW_SELECTED_CLASS}`]: {
        position: 'relative',
        '::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `color-mix(in srgb, ${theme.palette.themePrimary} 20%, transparent)`,
            pointerEvents: 'none',
        },
    },
    //a filter keeps the bar's own colour and follows a summary bar's ends
    [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SELECTED_CLASS}`]: {
        //chained unblurred shadows each side draw a 2px edge around the whole shape
        '--gantt-task-selection-filter': ['brightness(0.92) saturate(1.4)', ...['2px 0', '-2px 0', '0 2px', '0 -2px'].map(offset => `drop-shadow(${offset} 0 ${theme.palette.themePrimary})`)].join(' '),
    },
    [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SELECTED_CLASS}:not(.${GANTT_TASK_LOCKED_CLASS})`]: {
        filter: 'var(--gantt-task-selection-filter)',
    },
    [`.${GANTT_SELECTION_BOX_CLASS}`]: {
        border: `1px solid ${theme.palette.themePrimary}`,
        background: `color-mix(in srgb, ${theme.palette.themePrimary} 15%, transparent)`,
    },
});
