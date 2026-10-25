import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTaskTooltipUiProgressStyles = (theme: ITheme) => mergeStyleSets({
    progress: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    track: {
        flexGrow: 1,
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: theme.palette.neutralLighter,
    },
    fill: {
        height: '100%',
        borderRadius: 2,
        backgroundColor: theme.palette.themePrimary,
    },
    text: {
        ...theme.fonts.small,
        flexShrink: 0,
        minWidth: 32,
        textAlign: 'right',
        color: theme.palette.neutralSecondary,
    },
});
