import { ITheme, mergeStyleSets } from "@fluentui/react";

/** What the grid's own styles hang a cell's state overlays off. */
export const CELL_CONTAINER_CLASS_NAME = 'talxis__baseControl__GridCellBody';

export const getCellContainerStyles = (theme: ITheme) => mergeStyleSets({
    //the container sits between `.ag-cell` and the cell's content
    cellContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        //what a `ThemeProvider` paints on the element it is given
        backgroundColor: theme.semanticColors.bodyBackground,
        color: theme.semanticColors.bodyText,
        fontFamily: theme.fonts.medium.fontFamily,
        fontSize: theme.fonts.medium.fontSize,
        fontWeight: theme.fonts.medium.fontWeight,
        MozOsxFontSmoothing: theme.fonts.medium.MozOsxFontSmoothing,
        WebkitFontSmoothing: theme.fonts.medium.WebkitFontSmoothing,
    },
});
