import type { IStyle, ITheme } from "@fluentui/react";
import { GANTT_TASK_LINE_CLASS } from "../../chart/classNames";

export const getGanttLinksStyles = (theme: ITheme): IStyle => ({
    '--dhx-gantt-link-background': theme.semanticColors.bodySubtext,
    '--dhx-gantt-link-background-hover': theme.palette.themePrimary,
    '--dhx-gantt-link-handle-size': '10px',
    //a ring in the colour of the bar it hangs off, filled while it is pointed at
    [`.${GANTT_TASK_LINE_CLASS}`]: {
        '--dhx-gantt-link-handle-border': 'var(--dhx-gantt-task-background)',
        '--dhx-gantt-link-handle-border-hover': 'var(--dhx-gantt-task-background)',
        '--dhx-gantt-link-handle-background': theme.semanticColors.bodyBackground,
        '--dhx-gantt-link-handle-background-hover': 'var(--dhx-gantt-task-background)',
    },
});
