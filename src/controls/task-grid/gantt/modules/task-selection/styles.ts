import type { IStyle, ITheme } from "@fluentui/react";
import { GANTT_TASK_CONTENT_CLASS, GANTT_TASK_LINE_CLASS, GANTT_TASK_PROGRESS_WRAPPER_CLASS } from "../../chart";
import { ROW_SELECTED_CLASS, SELECTION_ARMED_CLASS, SELECTION_BOX_CLASS, BAR_SELECTED_CLASS } from "./classNames";

export const getTaskSelectionStyles = (theme: ITheme): IStyle => ({
    //drawn over the cells like the grid's selected rows
    [`.${ROW_SELECTED_CLASS}`]: {
        position: 'relative',
        '::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `color-mix(in srgb, ${theme.palette.themePrimary} 20%, transparent)`,
            pointerEvents: 'none',
        },
    },
    //the content repaints the bar so the filter skips the link handles beside it
    [`.${GANTT_TASK_LINE_CLASS}.${BAR_SELECTED_CLASS} .${GANTT_TASK_CONTENT_CLASS}`]: {
        height: '100%',
        borderRadius: 'inherit',
        background: 'inherit',
        //a blurred glow follows the summary's end caps too
        filter: `brightness(0.92) saturate(1.4) drop-shadow(0 0 3px color-mix(in srgb, ${theme.palette.themePrimary} 70%, transparent))`,
    },
    [`.${GANTT_TASK_LINE_CLASS}.${BAR_SELECTED_CLASS} .${GANTT_TASK_PROGRESS_WRAPPER_CLASS}`]: {
        zIndex: 1,
        filter: 'brightness(0.92) saturate(1.4)',
    },
    [`.${SELECTION_BOX_CLASS}`]: {
        border: `1px solid ${theme.palette.themePrimary}`,
        background: `color-mix(in srgb, ${theme.palette.themePrimary} 15%, transparent)`,
    },
    //doubled to outweigh the chart's grab cursors while the next drag draws a band
    [`&.${SELECTION_ARMED_CLASS}.${SELECTION_ARMED_CLASS}, &.${SELECTION_ARMED_CLASS}.${SELECTION_ARMED_CLASS} *`]: {
        cursor: 'crosshair',
    },
});
