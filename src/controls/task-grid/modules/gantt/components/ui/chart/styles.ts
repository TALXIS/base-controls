import { IStyle, ITheme, keyframes, mergeStyleSets } from "@fluentui/react";
import { getTextColorForBackground } from "@theme";
import {
    GANTT_DATA_AREA_CLASS,
    GANTT_LINK_CONTROL_CLASS,
    GANTT_MILESTONE_CLASS,
    GANTT_TASK_DRAG_HANDLE_CLASS,
    GANTT_TASK_CONTAINER_CLASS,
    GANTT_TASK_CONTENT_CLASS,
    GANTT_TASK_DONE_CLASS,
    GANTT_TASK_INACTIVE_CLASS,
    GANTT_TASK_LINE_CLASS,
    GANTT_TASK_LOCKED_CLASS,
    GANTT_TASK_SAVING_CLASS,
    GANTT_TASK_STARTED_CLASS,
    GANTT_TASK_SCALE_CLASS,
    GANTT_TASK_SUMMARY_CLASS,
} from "../../../chart";

const SAVING_SWEEP = keyframes({
    from: { backgroundPosition: '100% 0' },
    to: { backgroundPosition: '-100% 0' },
});

//a shade off the primary, so a bar stands apart from the selection and links drawn in it
const getTaskColor = (theme: ITheme) => theme.palette.themeSecondary;

const SUMMARY_CAP_WIDTH = 7;
const SUMMARY_CAP_HEIGHT = 6;

//DHTMLX's own definitions, unchanged
const DERIVED_GANTT_VARIABLES = {
    '--dhx-gantt-container-background': 'var(--dhx-gantt-base-colors-background)',
    '--dhx-gantt-container-color': 'var(--dhx-gantt-base-colors-text-base)',
    '--dhx-gantt-offtime-background': 'var(--dhx-gantt-base-colors-background-alt)',
    '--dhx-gantt-scale-background': 'var(--dhx-gantt-container-background)',
    '--dhx-gantt-scale-color': 'var(--dhx-gantt-base-colors-text-light)',
    '--dhx-gantt-grid-scale-background': 'var(--dhx-gantt-scale-background)',
    '--dhx-gantt-grid-scale-color': 'var(--dhx-gantt-scale-color)',
    '--dhx-gantt-grid-scale-border-vertical': 'var(--dhx-gantt-scale-border-vertical)',
    '--dhx-gantt-timeline-scale-background': 'var(--dhx-gantt-scale-background)',
    '--dhx-gantt-timeline-scale-color': 'var(--dhx-gantt-scale-color)',
    '--dhx-gantt-grid-row-border': 'var(--dhx-gantt-scale-border-horizontal)',
    '--dhx-gantt-default-border': '1px solid var(--dhx-gantt-base-colors-border)',
    '--dhx-gantt-task-color': 'var(--dhx-gantt-base-colors-text-on-fill)',
    '--dhx-gantt-task-line-text': 'var(--dhx-gantt-container-color)',
    '--dhx-gantt-popup-background': 'var(--dhx-gantt-container-background)',
    '--dhx-gantt-popup-color': 'var(--dhx-gantt-container-color)',
    '--dhx-gantt-tooltip-background': 'var(--dhx-gantt-base-colors-text-base)',
    '--dhx-gantt-tooltip-color': 'var(--dhx-gantt-container-background)',
    '--dhx-gantt-link-background': 'var(--dhx-gantt-base-colors-icons)',
    '--dhx-gantt-link-background-hover': 'var(--dhx-gantt-base-colors-text-light)',
    '--dhx-gantt-link-critical-background': 'var(--dhx-gantt-base-colors-error)',
    '--dhx-gantt-link-handle-border': 'var(--dhx-gantt-base-colors-icons)',
    '--dhx-gantt-link-handle-border-hover': 'var(--dhx-gantt-base-colors-border)',
    '--dhx-gantt-link-handle-background': 'var(--dhx-gantt-base-colors-border)',
    '--dhx-gantt-link-handle-background-hover': 'var(--dhx-gantt-base-colors-text-light)',
    '--dhx-gantt-progress-handle-border': 'var(--dhx-gantt-base-colors-border)',
    '--dhx-gantt-progress-handle-background': 'var(--dhx-gantt-base-colors-icons)',
    '--dhx-gantt-btn-color-disabled': 'var(--dhx-gantt-base-colors-icons)',
    '--dhx-gantt-btn-background-disabled': 'var(--dhx-gantt-base-colors-disabled)',
};

//a task's `color` tints the track and fills the done part
const getTrackColor = (theme: ITheme) => `color-mix(in srgb, var(--dhx-gantt-task-background) 24%, ${theme.semanticColors.bodyBackground})`;

export const getGanttUiChartStyles = (theme: ITheme, moduleStyles: IStyle[]) => mergeStyleSets({
    root: {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    chart: [{
        width: '100%',
        height: '100%',
        //the browser draws the chart's scrollbars in it
        colorScheme: theme.isInverted ? 'dark' : 'light',
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
        '--dhx-gantt-base-colors-icons': theme.semanticColors.bodySubtext,
        '--dhx-gantt-base-colors-disabled': theme.semanticColors.disabledBackground,
        '--dhx-gantt-base-colors-text-on-fill': getTextColorForBackground(getTaskColor(theme)),
        '--dhx-gantt-base-colors-white': theme.semanticColors.bodyBackground,
        //DHTMLX works these out on :root, so they resolve against its own colours unless declared again here
        ...DERIVED_GANTT_VARIABLES,
        '--dhx-gantt-task-row-background': theme.semanticColors.bodyBackground,
        '--dhx-gantt-task-row-background--odd': theme.semanticColors.bodyBackground,
        //the grid draws its lines in bodyDivider
        '--dhx-gantt-task-row-border': `1px solid ${theme.semanticColors.bodyDivider}`,
        '--dhx-gantt-timeline-scale-border-vertical': `1px solid ${theme.semanticColors.bodyDivider}`,
        '--dhx-gantt-scale-border-vertical': `1px solid ${theme.semanticColors.bodyDivider}`,
        '--dhx-gantt-scale-border-horizontal': `1px solid ${theme.semanticColors.bodyDivider}`,
        '--dhx-gantt-task-background': getTaskColor(theme),
        '--dhx-gantt-milestone-background': getTaskColor(theme),
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
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_MILESTONE_CLASS}`]: {
            background: 'var(--dhx-gantt-task-background)',
            [`.${GANTT_TASK_CONTENT_CLASS}`]: {
                borderRadius: theme.effects.roundedCorner2,
            },
        },
        [`.${GANTT_TASK_SCALE_CLASS}`]: {
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
                backgroundImage: `repeating-linear-gradient(135deg, color-mix(in srgb, ${getTextColorForBackground(getTaskColor(theme))} 35%, transparent) 0 2px, transparent 2px 6px)`,
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
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SAVING_CLASS} .${GANTT_LINK_CONTROL_CLASS}, .${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SAVING_CLASS} .${GANTT_TASK_DRAG_HANDLE_CLASS}`]: {
            display: 'none !important',
        },
    }, ...moduleStyles],
});
