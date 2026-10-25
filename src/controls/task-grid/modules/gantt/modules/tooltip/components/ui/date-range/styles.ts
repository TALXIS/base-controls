import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTaskTooltipUiDateRangeStyles = (theme: ITheme) => mergeStyleSets({
    dateRange: {
        ...theme.fonts.small,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: theme.semanticColors.bodyText,
    },
    icon: {
        color: theme.palette.neutralSecondary,
    },
    range: {
        fontWeight: 600,
    },
    duration: {
        marginLeft: 'auto',
        padding: '1px 8px',
        borderRadius: 10,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        backgroundColor: theme.palette.themeLighterAlt,
        color: theme.palette.themeDark,
        border: `1px solid ${theme.palette.themeLight}`,
    },
});
