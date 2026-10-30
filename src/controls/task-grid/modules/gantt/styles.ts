import { IStyle, ITheme, keyframes, mergeStyleSets } from "@fluentui/react";
import {
    GANTT_DATA_AREA_CLASS,
    GANTT_TASK_CONTAINER_CLASS,
    GANTT_TASK_CONTENT_CLASS,
    GANTT_TASK_DONE_CLASS,
    GANTT_TASK_INACTIVE_CLASS,
    GANTT_TASK_LINE_CLASS,
    GANTT_TASK_LOCKED_CLASS,
    GANTT_TASK_SAVING_CLASS,
    GANTT_TASK_STARTED_CLASS,
    GANTT_TASK_SUMMARY_CLASS,
} from "./chart/classNames";

const SAVING_SWEEP = keyframes({
    from: { backgroundPosition: '100% 0' },
    to: { backgroundPosition: '-100% 0' },
});

const SUMMARY_CAP_WIDTH = 7;
const SUMMARY_CAP_HEIGHT = 6;

//a task's `color` tints the track and fills the done part
const getTrackColor = (theme: ITheme) => `color-mix(in srgb, var(--dhx-gantt-task-background) 24%, ${theme.semanticColors.bodyBackground})`;

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
        [`.${GANTT_TASK_LINE_CLASS}`]: {
            '--dhx-gantt-task-progress-color': 'var(--dhx-gantt-task-background)',
            background: getTrackColor(theme),
        },
        //flat underneath, where the end caps hang from
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SUMMARY_CLASS}`]: {
            '--dhx-gantt-task-background': theme.palette.teal,
            '--dhx-gantt-task-border-radius': `${theme.effects.roundedCorner2} ${theme.effects.roundedCorner2} 0 0`,
        },
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SUMMARY_CLASS} .${GANTT_TASK_CONTENT_CLASS}`]: {
            height: '100%',
            padding: 0,
            overflow: 'visible',
        },
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SUMMARY_CLASS} .${GANTT_TASK_CONTENT_CLASS}::before`]: {
            content: '""',
            position: 'absolute',
            top: '100%',
            left: 0,
            width: SUMMARY_CAP_WIDTH,
            height: SUMMARY_CAP_HEIGHT,
            background: getTrackColor(theme),
            clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        },
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SUMMARY_CLASS} .${GANTT_TASK_CONTENT_CLASS}::after`]: {
            content: '""',
            position: 'absolute',
            top: '100%',
            right: 0,
            width: SUMMARY_CAP_WIDTH,
            height: SUMMARY_CAP_HEIGHT,
            background: getTrackColor(theme),
            clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
        },
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SUMMARY_CLASS}.${GANTT_TASK_STARTED_CLASS} .${GANTT_TASK_CONTENT_CLASS}::before`]: {
            background: 'var(--dhx-gantt-task-background)',
        },
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SUMMARY_CLASS}.${GANTT_TASK_DONE_CLASS} .${GANTT_TASK_CONTENT_CLASS}::after`]: {
            background: 'var(--dhx-gantt-task-background)',
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
        //Fluent's shimmer, swept across the bar while its record saves
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SAVING_CLASS}::before`]: {
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            backgroundImage: `linear-gradient(90deg, transparent 25%, color-mix(in srgb, ${theme.semanticColors.bodyBackground} 70%, transparent) 50%, transparent 75%)`,
            backgroundSize: '200% 100%',
            animation: `${SAVING_SWEEP} 1.2s linear infinite`,
            '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
                backgroundImage: 'none',
                background: `color-mix(in srgb, ${theme.semanticColors.bodyBackground} 40%, transparent)`,
            },
        },
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SAVING_CLASS}`]: {
            cursor: 'progress',
        },
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SAVING_CLASS} .gantt_link_control, .${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SAVING_CLASS} .gantt_task_drag`]: {
            display: 'none !important',
        },
    }, ...moduleStyles],
});
