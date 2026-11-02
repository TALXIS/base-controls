import { ITheme, mergeStyleSets } from "@fluentui/react";
import { CELL_VALUE_PADDING } from "../../../../constants";

export const getDependencyCountStyles = (theme: ITheme) => mergeStyleSets({
    root: {
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        height: '100%',
        paddingLeft: CELL_VALUE_PADDING,
        paddingRight: CELL_VALUE_PADDING,
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
