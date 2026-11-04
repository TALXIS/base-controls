import { ITheme, mergeStyleSets } from "@fluentui/react";

/** The class every cell's body carries. */
export const CELL_CONTAINER_CLASS_NAME = 'talxis__baseControl__GridCellBody';

export const getCellUiContainerStyles = (theme: ITheme) => mergeStyleSets({
    //the container sits between `.ag-cell` and the cell's content
    cellContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        color: theme.semanticColors.bodyText,
        fontFamily: theme.fonts.medium.fontFamily,
        fontSize: theme.fonts.medium.fontSize,
        fontWeight: theme.fonts.medium.fontWeight,
        //AG Grid sets the row height as the cell's line height
        lineHeight: 'normal',
        MozOsxFontSmoothing: theme.fonts.medium.MozOsxFontSmoothing,
        WebkitFontSmoothing: theme.fonts.medium.WebkitFontSmoothing,
    },
});
