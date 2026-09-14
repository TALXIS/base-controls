import { ITheme, mergeStyleSets } from "@fluentui/react";

/** What the grid's own styles hang a cell's state overlays off, since the hashed class cannot be named. */
export const CELL_CONTAINER_CLASS_NAME = 'talxis__baseControl__GridCellBody';

export const getCellContainerStyles = (theme: ITheme) => mergeStyleSets({
    //the container sits between `.ag-cell` and the cell's content, and both size themselves against it.
    cellContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        //the cell's surface: AG Grid paints the row, and this is what a cell of its own theme paints over it
        backgroundColor: theme.semanticColors.bodyBackground,
        color: theme.semanticColors.bodyText,
    },
});
