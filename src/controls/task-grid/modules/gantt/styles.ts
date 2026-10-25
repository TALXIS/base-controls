import { IStyle, ITheme, mergeStyleSets } from "@fluentui/react";
import {
    GANTT_DATA_AREA_CLASS,
    GANTT_ROW_INACTIVE_CLASS,
    GANTT_TASK_CELL_CLASS,
    GANTT_TASK_CONTAINER_CLASS,
    GANTT_TASK_CONTENT_CLASS,
    GANTT_TASK_LINE_CLASS,
    GANTT_TASK_SUMMARY_CLASS,
    GANTT_WEEKEND_CLASS,
} from "./chart/classNames";

export const getTaskGanttStyles = (theme: ITheme, moduleStyles: IStyle[]) => mergeStyleSets({
    root: {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    chart: [{
        width: '100%',
        height: '100%',
        '--dhx-gantt-font-family': theme.fonts.medium.fontFamily,
        '--dhx-gantt-font-size': theme.fonts.medium.fontSize,
        '--dhx-gantt-base-colors-background': theme.semanticColors.bodyBackground,
        '--dhx-gantt-base-colors-background-alt': theme.semanticColors.bodyBackgroundChecked,
        '--dhx-gantt-base-colors-text-base': theme.semanticColors.bodyText,
        '--dhx-gantt-base-colors-text-light': theme.semanticColors.bodySubtext,
        '--dhx-gantt-base-colors-border': theme.semanticColors.variantBorder,
        '--dhx-gantt-base-colors-border-light': theme.semanticColors.bodyFrameDivider,
        '--dhx-gantt-base-colors-hover-color': theme.semanticColors.menuItemBackgroundHovered,
        '--dhx-gantt-base-colors-select': 'transparent',
        '--dhx-gantt-base-colors-primary': theme.palette.themePrimary,
        '--dhx-gantt-base-colors-primary-hover': theme.palette.themeDarkAlt,
        '--dhx-gantt-base-colors-primary-active': theme.palette.themeDark,
        '--dhx-gantt-base-colors-primary-lighter': theme.palette.themeLighter,
        '--dhx-gantt-base-colors-error': theme.semanticColors.errorText,
        '--dhx-gantt-task-row-background': theme.semanticColors.bodyBackground,
        '--dhx-gantt-task-row-background--odd': theme.semanticColors.bodyBackground,
        '--dhx-gantt-task-row-border': `1px solid ${theme.semanticColors.variantBorder}`,
        '--dhx-gantt-task-background': theme.palette.themePrimary,
        '--dhx-gantt-milestone-background': theme.palette.themePrimary,
        '--dhx-gantt-task-border': 'none',
        '--dhx-gantt-task-border-radius': theme.effects.roundedCorner4,
        //a task's `color` tints the track and fills the done part
        [`.${GANTT_TASK_LINE_CLASS}`]: {
            '--dhx-gantt-task-progress-color': 'var(--dhx-gantt-task-background)',
            background: `color-mix(in srgb, var(--dhx-gantt-task-background) 24%, ${theme.semanticColors.bodyBackground})`,
        },
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SUMMARY_CLASS}`]: {
            '--dhx-gantt-task-background': theme.palette.teal,
            '--dhx-gantt-task-border-radius': '999px',
        },
        [`.${GANTT_TASK_LINE_CLASS}.gantt_milestone`]: {
            background: 'var(--dhx-gantt-task-background)',
            [`.${GANTT_TASK_CONTENT_CLASS}`]: {
                borderRadius: theme.effects.roundedCorner2,
            },
        },
        '.gantt_task_scale': {
            fontWeight: 600,
        },
        [`.${GANTT_DATA_AREA_CLASS}`]: {
            cursor: 'grab',
        },
        [`.${GANTT_DATA_AREA_CLASS}:active`]: {
            cursor: 'grabbing',
        },
        [`.${GANTT_TASK_CONTAINER_CLASS}`]: {
            overscrollBehaviorX: 'contain',
        },
        [`.${GANTT_TASK_CELL_CLASS}.${GANTT_WEEKEND_CLASS}`]: {
            backgroundColor: theme.palette.neutralLighter,
        },
        [`.gantt_scale_cell.${GANTT_WEEKEND_CLASS}`]: {
            backgroundColor: theme.semanticColors.errorBackground,
        },
        [`.${GANTT_ROW_INACTIVE_CLASS}`]: {
            opacity: 0.5,
        },
    }, ...moduleStyles],
});
