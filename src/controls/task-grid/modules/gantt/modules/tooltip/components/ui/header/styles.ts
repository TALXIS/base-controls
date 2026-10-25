import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTaskTooltipUiHeaderStyles = (theme: ITheme) => mergeStyleSets({
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 8,
    },
    title: {
        ...theme.fonts.mediumPlus,
        fontWeight: 600,
        color: theme.semanticColors.bodyText,
        wordBreak: 'break-word',
    },
    status: {
        ...theme.fonts.small,
        flexShrink: 0,
        padding: '1px 8px',
        borderRadius: 10,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        backgroundColor: theme.palette.neutralLighter,
        color: theme.palette.neutralPrimary,
    },
});
