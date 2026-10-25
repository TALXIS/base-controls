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
    //a gap keeps the ring apart from a bar in the same colour
    [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SELECTED_CLASS}, .${GANTT_TASK_LINE_CLASS}.gantt_milestone.${GANTT_TASK_SELECTED_CLASS} .${GANTT_TASK_CONTENT_CLASS}`]: {
        boxShadow: `0 0 0 2px ${theme.semanticColors.bodyBackground}, 0 0 0 4px ${theme.palette.themePrimary}`,
    },
    [`.${GANTT_SELECTION_BOX_CLASS}`]: {
        border: `1px solid ${theme.palette.themePrimary}`,
        background: `color-mix(in srgb, ${theme.palette.themePrimary} 15%, transparent)`,
    },
});
