import { FontWeights, IStyle, ITheme } from "@fluentui/react";
import { GANTT_TASK_LINE_CLASS } from "../../chart/classNames";

/** The dependency type above the tasks, in the tooltip of a link being drawn. */
export const GANTT_LINK_DRAG_TYPE_CLASS = 'talxis-gantt-link-drag-type';

/** On the task a link being drawn would land on: the end it would attach to, and whether it may. */
export const GANTT_LINK_DROP_ATTRIBUTE = 'data-talxis-link-drop';

/** Where the pointer is on the page, which the tooltip of a link being drawn follows. */
export const GANTT_LINK_DRAG_POINTER_VARIABLES = { x: '--talxis-gantt-link-drag-x', y: '--talxis-gantt-link-drag-y' } as const;

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
    //the library's own allow and deny glows judge only its handles, so the drop attribute replaces them
    '.gantt_link_target, .gantt_link_target.link_start_allow, .gantt_link_target.link_finish_allow, .gantt_link_target.link_start_deny, .gantt_link_target.link_finish_deny': {
        boxShadow: 'none',
    },
    [`.${GANTT_TASK_LINE_CLASS}[${GANTT_LINK_DROP_ATTRIBUTE}]`]: {
        boxShadow: `0 0 0 2px ${theme.palette.themePrimary}`,
    },
    [`.${GANTT_TASK_LINE_CLASS}[${GANTT_LINK_DROP_ATTRIBUTE}$="denied"]`]: {
        boxShadow: `0 0 0 2px ${theme.semanticColors.errorIcon}`,
    },
    [`.${GANTT_TASK_LINE_CLASS}[${GANTT_LINK_DROP_ATTRIBUTE}] .gantt_link_control`]: {
        display: 'flex',
    },
    [`.${GANTT_TASK_LINE_CLASS}[${GANTT_LINK_DROP_ATTRIBUTE}] .gantt_link_control div`]: {
        display: 'block',
    },
    //the end the link would attach to, filled
    [`.${GANTT_TASK_LINE_CLASS}[${GANTT_LINK_DROP_ATTRIBUTE}^="start"] .task_start_date div, .${GANTT_TASK_LINE_CLASS}[${GANTT_LINK_DROP_ATTRIBUTE}^="end"] .task_end_date div`]: {
        transform: 'scale(1.4)',
        borderColor: theme.palette.themePrimary,
        background: theme.palette.themePrimary,
    },
    [`.${GANTT_TASK_LINE_CLASS}[${GANTT_LINK_DROP_ATTRIBUTE}="start-denied"] .task_start_date div, .${GANTT_TASK_LINE_CLASS}[${GANTT_LINK_DROP_ATTRIBUTE}="end-denied"] .task_end_date div`]: {
        borderColor: theme.semanticColors.errorIcon,
        background: theme.semanticColors.errorIcon,
    },
    '.gantt_link_direction': {
        borderBottom: `2px dashed ${theme.palette.themePrimary}`,
    },
    //the library puts the tooltip in the body but places it as if it were in the chart
    ':global(.gantt_drag_marker:has(.gantt_link_tooltip))': {
        left: `var(${GANTT_LINK_DRAG_POINTER_VARIABLES.x}) !important`,
        top: `var(${GANTT_LINK_DRAG_POINTER_VARIABLES.y}) !important`,
        maxWidth: 'none !important',
        overflow: 'visible !important',
        background: 'transparent',
        zIndex: 1000000,
        pointerEvents: 'none',
    },
    ':global(.gantt_drag_marker .gantt_link_tooltip)': {
        ...theme.fonts.small,
        lineHeight: '18px',
        padding: '8px 12px',
        border: 'none',
        borderRadius: theme.effects.roundedCorner6,
        boxShadow: theme.effects.elevation16,
        background: theme.semanticColors.bodyBackground,
        color: theme.semanticColors.bodyText,
        whiteSpace: 'nowrap',
        '& b': {
            fontWeight: FontWeights.semibold,
        },
    },
    [`:global(.${GANTT_LINK_DRAG_TYPE_CLASS})`]: {
        marginBottom: 2,
        color: theme.semanticColors.bodySubtext,
    },
    ':global(.gantt_drag_marker .gantt_link_tooltip.gantt_link_deny)': {
        color: theme.semanticColors.errorText,
    },
});
