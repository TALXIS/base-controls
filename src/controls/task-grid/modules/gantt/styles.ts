import { IStyle, ITheme, mergeStyleSets } from "@fluentui/react";
import {
    GANTT_DATA_AREA_CLASS,
    GANTT_ROW_INACTIVE_CLASS,
    GANTT_TASK_CELL_CLASS,
    GANTT_TASK_CONTAINER_CLASS,
    GANTT_TASK_LINE_CLASS,
    GANTT_TASK_SUMMARY_CLASS,
    GANTT_WEEKEND_CLASS,
} from "./chart/classNames";

const TASK_COLOR = '#9BCB96';
const TASK_PROGRESS_COLOR = '#69A96B';
const SUMMARY_COLOR = '#8DB7E8';
const SUMMARY_PROGRESS_COLOR = '#6A9AD6';

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
        '--dhx-gantt-link-background': theme.semanticColors.bodySubtext,
        '--dhx-gantt-link-background-hover': theme.palette.themePrimary,
        '--dhx-gantt-link-handle-border': theme.semanticColors.variantBorder,
        '--dhx-gantt-link-handle-background': theme.palette.neutralLight,
        '--dhx-gantt-link-handle-background-hover': theme.semanticColors.bodySubtext,
        '--dhx-gantt-task-background': TASK_COLOR,
        '--dhx-gantt-task-progress-color': TASK_PROGRESS_COLOR,
        '--dhx-gantt-task-border': 'none',
        '--dhx-gantt-task-border-radius': theme.effects.roundedCorner2,
        '--dhx-gantt-milestone-background': SUMMARY_PROGRESS_COLOR,
        [`.${GANTT_TASK_LINE_CLASS}.${GANTT_TASK_SUMMARY_CLASS}`]: {
            '--dhx-gantt-task-background': SUMMARY_COLOR,
            '--dhx-gantt-task-progress-color': SUMMARY_PROGRESS_COLOR,
            background: 'transparent',
            //an 8px band with a bracket end under each corner; the progress takes the same shape
            '.gantt_task_progress_wrapper': {
                background: 'var(--dhx-gantt-task-background)',
                borderRadius: 0,
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, calc(100% - 6px) 8px, 6px 8px, 0 100%)',
            },
            //the name beside it is laid out on the bar's height, so it is centred on the band
            '.gantt_side_content': {
                top: 4,
                height: 'auto',
                lineHeight: 'normal',
                transform: 'translateY(-50%)',
            },
        },
        '.gantt_side_content': {
            color: theme.semanticColors.bodyText,
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
