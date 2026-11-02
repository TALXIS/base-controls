import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTaskTooltipUiFieldRowStyles = (theme: ITheme) => mergeStyleSets({
    fieldRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: theme.fonts.small.fontSize,
        lineHeight: '20px',
    },
    icon: {
        color: theme.palette.neutralSecondary,
        width: 14,
        textAlign: 'center',
    },
    label: {
        width: 96,
        flexShrink: 0,
        color: theme.palette.neutralSecondary,
    },
    value: {
        flexGrow: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: theme.semanticColors.bodyText,
    },
});
