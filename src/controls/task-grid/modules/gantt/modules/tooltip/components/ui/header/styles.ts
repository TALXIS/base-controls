import { FontWeights, ITheme, mergeStyleSets } from "@fluentui/react";

export const getTaskTooltipUiHeaderStyles = (theme: ITheme) => mergeStyleSets({
    header: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 12,
    },
    title: {
        ...theme.fonts.mediumPlus,
        fontWeight: FontWeights.semibold,
        lineHeight: '22px',
        color: theme.semanticColors.bodyText,
        wordBreak: 'break-word',
    },
    status: {
        ...theme.fonts.small,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
        marginTop: 1,
        padding: '2px 8px',
        borderRadius: 999,
        fontWeight: FontWeights.semibold,
        whiteSpace: 'nowrap',
        backgroundColor: theme.palette.neutralLighter,
        color: theme.palette.neutralSecondary,
        '::before': {
            content: '""',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
        },
    },
});
