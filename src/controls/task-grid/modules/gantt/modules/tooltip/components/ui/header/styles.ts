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
        alignSelf: 'flex-start',
        flexShrink: 0,
        marginTop: 1,
    },
});
