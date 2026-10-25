import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTaskTooltipUiFieldRowStyles = (theme: ITheme) => mergeStyleSets({
    fieldRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: theme.fonts.small.fontSize,
    },
    icon: {
        color: theme.palette.neutralSecondary,
        width: 14,
        textAlign: 'center',
    },
    label: {
        flexGrow: 1,
        color: theme.palette.neutralSecondary,
    },
    value: {
        textAlign: 'right',
        color: theme.semanticColors.bodyText,
        fontWeight: 600,
    },
});
