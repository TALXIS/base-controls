import { FontWeights, ITheme, mergeStyleSets } from "@fluentui/react";

export const getTaskTooltipUiProgressStyles = (theme: ITheme) => mergeStyleSets({
    progress: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    track: {
        flexGrow: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: theme.palette.neutralLighter,
    },
    fill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: theme.palette.themePrimary,
    },
    text: {
        ...theme.fonts.small,
        flexShrink: 0,
        minWidth: 32,
        textAlign: 'right',
        fontWeight: FontWeights.semibold,
        color: theme.semanticColors.bodyText,
    },
});
