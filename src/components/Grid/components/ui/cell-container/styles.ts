import { mergeStyleSets } from "@fluentui/react";
import { getJustifyContent, IAlignment } from "@utils";

/** What the grid's own styles hang a cell's state overlays off, since the hashed class cannot be named. */
export const CELL_CONTAINER_CLASS_NAME = 'talxis__baseControl__GridCellBody';

export const getCellContainerStyles = (alignment: IAlignment) => mergeStyleSets({
    //the container sits between `.ag-cell` and the cell's content, and both size themselves against it.
    cellContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        //whatever is in the cell - the control, the commands, anything a consumer put there - sits where
        //the cell was told to put it
        justifyContent: getJustifyContent(alignment),
    },
});
