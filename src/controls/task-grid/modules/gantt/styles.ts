import { IStyle, ITheme, mergeStyleSets } from "@fluentui/react";
import {
    GANTT_DATA_AREA_CLASS,
    GANTT_TASK_CONTAINER_CLASS,
    GANTT_TASK_CONTENT_CLASS,
    GANTT_TASK_INACTIVE_CLASS,
    GANTT_TASK_LINE_CLASS,
    GANTT_TASK_LOCKED_CLASS,
    GANTT_TASK_SUMMARY_CLASS,
} from "./chart/classNames";

const LOCK_ICON = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M8 1a3 3 0 0 0-3 3v2H4.5A1.5 1.5 0 0 0 3 7.5v6A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 11.5 6H11V4a3 3 0 0 0-3-3Zm-2 5V4a2 2 0 1 1 4 0v2H6Z'/%3E%3C/svg%3E\")";

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
        //the grid draws its lines in bodyDivider
        '--dhx-gantt-task-row-border': `1px solid ${theme.semanticColors.bodyDivider}`,
        '--dhx-gantt-timeline-scale-border-vertical': `1px solid ${theme.semanticColors.bodyDivider}`,
        '--dhx-gantt-scale-border-vertical': `1px solid ${theme.semanticColors.bodyDivider}`,
        '--dhx-gantt-scale-border-horizontal': `1px solid ${theme.semanticColors.bodyDivider}`,
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
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_INACTIVE_CLASS}`]: {
            opacity: 0.5,
        },
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_LOCKED_CLASS}`]: {
            filter: 'saturate(0.45)',
            '::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                pointerEvents: 'none',
                backgroundImage: 'repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0 2px, transparent 2px 6px)',
            },
        },
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_LOCKED_CLASS}:not(.gantt_milestone):not(.${GANTT_TASK_SUMMARY_CLASS}) .${GANTT_TASK_CONTENT_CLASS}::before`]: {
            content: '""',
            position: 'absolute',
            left: 6,
            top: '50%',
            width: 10,
            height: 10,
            transform: 'translateY(-50%)',
            backgroundColor: 'var(--dhx-gantt-task-color)',
            maskImage: LOCK_ICON,
            maskRepeat: 'no-repeat',
            maskSize: 'contain',
        },
    }, ...moduleStyles],
});
