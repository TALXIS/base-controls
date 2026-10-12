import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getDependenciesCellStyles = (theme: ITheme) => mergeStyleSets({
    root: {
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        paddingLeft: 9,
        paddingRight: 9,
        color: theme.semanticColors.bodyText,
    },
    icon: {
        fontSize: 14,
        color: theme.palette.themePrimary,
    },
    arrow: {
        fontSize: 12,
    },
});
