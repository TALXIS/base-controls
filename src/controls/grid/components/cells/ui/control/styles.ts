import { mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

export const getCellUiControlStyles = (alignment: IAlignment) => mergeStyleSets({
    control: {
        //a right-aligned column reads outwards from its edge
        order: alignment === 'right' ? 2 : 1,
        //its own width, and whatever room nothing else has taken.
        flex: '1 1 auto',
        minWidth: 0,
        overflow: 'hidden',
        height: '100%',
        //a grid: what it holds fills it and shrinks with it
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(0, 1fr)',
    },
});
