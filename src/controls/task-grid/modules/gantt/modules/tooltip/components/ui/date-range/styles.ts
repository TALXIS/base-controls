import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTaskTooltipUiDateRangeStyles = (theme: ITheme) => mergeStyleSets({
    dateRange: {
        ...theme.fonts.small,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingTop: 10,
        borderTop: `1px solid ${theme.semanticColors.bodyDivider}`,
        color: theme.semanticColors.bodyText,
    },
    icon: {
        color: theme.palette.neutralSecondary,
    },
    range: {
        whiteSpace: 'nowrap',
    },
    duration: {
        marginLeft: 'auto',
        padding: '2px 8px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
        backgroundColor: theme.palette.neutralLighter,
        color: theme.palette.neutralPrimary,
    },
});
