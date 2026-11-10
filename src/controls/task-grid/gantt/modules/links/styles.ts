import { FontWeights, IStyle, ITheme, keyframes } from "@fluentui/react";
import {
    GANTT_DRAG_MARKER_CLASS,
    GANTT_LINK_CONTROL_CLASS,
    GANTT_LINK_CONTROL_END_CLASS,
    GANTT_LINK_CONTROL_START_CLASS,
    GANTT_LINK_DENY_CLASS,
    GANTT_LINK_DIRECTION_CLASS,
    GANTT_LINK_FINISH_ALLOW_CLASS,
    GANTT_LINK_FINISH_DENY_CLASS,
    GANTT_LINK_START_ALLOW_CLASS,
    GANTT_LINK_START_DENY_CLASS,
    GANTT_LINK_TARGET_CLASS,
    GANTT_LINK_TOOLTIP_CLASS,
    GANTT_TASK_CONTENT_CLASS,
    GANTT_TASK_LINE_CLASS,
    GANTT_TASK_LINK_CLASS,
    GANTT_TASK_PROGRESS_WRAPPER_CLASS,
} from "../../chart";
import { LINK_DRAG_POINTER_VARIABLES, LINK_DRAG_REFUSAL_CLASS, LINK_DRAG_TYPE_CLASS, LINK_DROP_ATTRIBUTE, LINK_SAVING_CLASS } from "./classNames";

const LINK_TARGET_GLOW_SELECTOR = ['', GANTT_LINK_START_ALLOW_CLASS, GANTT_LINK_FINISH_ALLOW_CLASS, GANTT_LINK_START_DENY_CLASS, GANTT_LINK_FINISH_DENY_CLASS].map(className => `.${GANTT_LINK_TARGET_CLASS}${className && `.${className}`}`).join(', ');

const SAVING_PULSE = keyframes({
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.35 },
});

const getDropGlow = (color: string): string => `drop-shadow(0 0 3px color-mix(in srgb, ${color} 70%, transparent))`;

export const getLinksStyles = (theme: ITheme): IStyle => ({
    '--dhx-gantt-link-background': theme.semanticColors.bodySubtext,
    '--dhx-gantt-link-background-hover': theme.palette.themePrimary,
    '--dhx-gantt-link-handle-size': '10px',
    //a ring in the colour of its bar, filled on hover
    [`.${GANTT_TASK_LINE_CLASS}`]: {
        '--dhx-gantt-link-handle-border': 'var(--dhx-gantt-task-background)',
        '--dhx-gantt-link-handle-border-hover': 'var(--dhx-gantt-task-background)',
        '--dhx-gantt-link-handle-background': theme.semanticColors.bodyBackground,
        '--dhx-gantt-link-handle-background-hover': 'var(--dhx-gantt-task-background)',
    },
    //the drop attribute replaces the library's handle-only allow and deny glows
    [LINK_TARGET_GLOW_SELECTOR]: {
        boxShadow: 'none',
    },
    //glows as a selected bar does, around its shape
    [`.${GANTT_TASK_LINE_CLASS}[${LINK_DROP_ATTRIBUTE}] .${GANTT_TASK_CONTENT_CLASS}`]: {
        height: '100%',
        borderRadius: 'inherit',
        background: 'inherit',
        filter: getDropGlow(theme.palette.themePrimary),
    },
    [`.${GANTT_TASK_LINE_CLASS}[${LINK_DROP_ATTRIBUTE}$="denied"] .${GANTT_TASK_CONTENT_CLASS}`]: {
        filter: getDropGlow(theme.semanticColors.errorIcon),
    },
    [`.${GANTT_TASK_LINE_CLASS}[${LINK_DROP_ATTRIBUTE}] .${GANTT_TASK_PROGRESS_WRAPPER_CLASS}`]: {
        zIndex: 1,
    },
    [`.${GANTT_TASK_LINE_CLASS}[${LINK_DROP_ATTRIBUTE}] .${GANTT_LINK_CONTROL_CLASS}`]: {
        display: 'flex',
    },
    [`.${GANTT_TASK_LINE_CLASS}[${LINK_DROP_ATTRIBUTE}] .${GANTT_LINK_CONTROL_CLASS} div`]: {
        display: 'block',
    },
    //the end the link would attach to, filled
    [`.${GANTT_TASK_LINE_CLASS}[${LINK_DROP_ATTRIBUTE}^="start"] .${GANTT_LINK_CONTROL_START_CLASS} div, .${GANTT_TASK_LINE_CLASS}[${LINK_DROP_ATTRIBUTE}^="end"] .${GANTT_LINK_CONTROL_END_CLASS} div`]: {
        transform: 'scale(1.4)',
        borderColor: theme.palette.themePrimary,
        background: theme.palette.themePrimary,
    },
    [`.${GANTT_TASK_LINE_CLASS}[${LINK_DROP_ATTRIBUTE}="start-denied"] .${GANTT_LINK_CONTROL_START_CLASS} div, .${GANTT_TASK_LINE_CLASS}[${LINK_DROP_ATTRIBUTE}="end-denied"] .${GANTT_LINK_CONTROL_END_CLASS} div`]: {
        borderColor: theme.semanticColors.errorIcon,
        background: theme.semanticColors.errorIcon,
    },
    [`.${GANTT_TASK_LINK_CLASS}.${LINK_SAVING_CLASS}`]: {
        animation: `${SAVING_PULSE} 1.2s ease-in-out infinite`,
        '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            opacity: 0.5,
        },
    },
    [`.${GANTT_LINK_DIRECTION_CLASS}`]: {
        borderBottom: `2px dashed ${theme.palette.themePrimary}`,
    },
    //the library places the body's tooltip as if it were in the chart
    [`:global(.${GANTT_DRAG_MARKER_CLASS}:has(.${GANTT_LINK_TOOLTIP_CLASS}))`]: {
        left: `var(${LINK_DRAG_POINTER_VARIABLES.x}) !important`,
        top: `var(${LINK_DRAG_POINTER_VARIABLES.y}) !important`,
        maxWidth: 'none !important',
        overflow: 'visible !important',
        background: 'transparent',
        zIndex: 1000000,
        pointerEvents: 'none',
    },
    [`:global(.${GANTT_DRAG_MARKER_CLASS} .${GANTT_LINK_TOOLTIP_CLASS})`]: {
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
    [`:global(.${LINK_DRAG_TYPE_CLASS})`]: {
        marginBottom: 2,
        color: theme.semanticColors.bodySubtext,
    },
    [`:global(.${LINK_DRAG_REFUSAL_CLASS})`]: {
        marginTop: 4,
        color: theme.semanticColors.errorText,
    },
});
