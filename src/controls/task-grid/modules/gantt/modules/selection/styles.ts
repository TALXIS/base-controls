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
    //a locked bar folds the brightness into its own filter
    [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SELECTED_CLASS}`]: {
        '--gantt-task-brightness': '1.2',
    },
    [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SELECTED_CLASS}:not(.${GANTT_TASK_LOCKED_CLASS})`]: {
        filter: 'brightness(var(--gantt-task-brightness))',
    },
    [`.${GANTT_SELECTION_BOX_CLASS}`]: {
        border: `1px solid ${theme.palette.themePrimary}`,
        background: `color-mix(in srgb, ${theme.palette.themePrimary} 15%, transparent)`,
    },
});
