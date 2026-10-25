import type { IStyle, ITheme } from "@fluentui/react";
import { GANTT_TASK_CONTENT_CLASS, GANTT_TASK_LINE_CLASS, GANTT_TASK_SUMMARY_CLASS } from "../../chart/classNames";
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
    [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SELECTED_CLASS}`]: {
        boxShadow: `0 0 0 2px ${theme.palette.themePrimary}`,
    },
    [`.${GANTT_TASK_LINE_CLASS}.gantt_milestone.${GANTT_TASK_SELECTED_CLASS} .${GANTT_TASK_CONTENT_CLASS}`]: {
        boxShadow: `0 0 0 2px ${theme.palette.themePrimary}`,
    },
    //the bracket's outline, painted under its band
    [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SUMMARY_CLASS}.${GANTT_TASK_SELECTED_CLASS}`]: {
        boxShadow: 'none',
        '::before': {
            content: '""',
            position: 'absolute',
            inset: -2,
            background: theme.palette.themePrimary,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, calc(100% - 9px) 12px, 9px 12px, 0 100%)',
        },
    },
    [`.${GANTT_SELECTION_BOX_CLASS}`]: {
        border: `1px solid ${theme.palette.themePrimary}`,
        background: `color-mix(in srgb, ${theme.palette.themePrimary} 15%, transparent)`,
    },
});
