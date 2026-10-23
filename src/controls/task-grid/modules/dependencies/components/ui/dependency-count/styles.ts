import { ITheme, mergeStyleSets } from "@fluentui/react";

//as the grid's own value renderer
const PADDING = 9;

export const getDependencyCountStyles = (theme: ITheme) => mergeStyleSets({
    root: {
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        height: '100%',
        paddingLeft: PADDING,
        paddingRight: PADDING,
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
