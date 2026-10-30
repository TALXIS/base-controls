import type { IStyle, ITheme } from "@fluentui/react";
import { GANTT_TASK_CONTENT_CLASS, GANTT_TASK_LINE_CLASS } from "../../chart/classNames";
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
    //the content repaints the bar, so the filter below leaves the link handles beside it alone
    [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SELECTED_CLASS} .${GANTT_TASK_CONTENT_CLASS}`]: {
        height: '100%',
        borderRadius: 'inherit',
        background: 'inherit',
        //chained unblurred shadows each side draw a 2px edge around the whole shape, a summary's ends included
        filter: ['brightness(0.92) saturate(1.4)', ...['2px 0', '-2px 0', '0 2px', '0 -2px'].map(offset => `drop-shadow(${offset} 0 ${theme.palette.themePrimary})`)].join(' '),
    },
    [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SELECTED_CLASS} .gantt_task_progress_wrapper`]: {
        zIndex: 1,
        filter: 'brightness(0.92) saturate(1.4)',
    },
    [`.${GANTT_SELECTION_BOX_CLASS}`]: {
        border: `1px solid ${theme.palette.themePrimary}`,
        background: `color-mix(in srgb, ${theme.palette.themePrimary} 15%, transparent)`,
    },
});
