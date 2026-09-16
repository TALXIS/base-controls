import { mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

export const getCellControlStyles = (alignment: IAlignment) => mergeStyleSets({
    control: {
        //a right-aligned column reads outwards from its edge
        order: alignment === 'right' ? 2 : 1,
        //its own width, and whatever room nothing else has taken.
        flex: '1 1 auto',
        minWidth: 0,
        overflow: 'hidden',
        display: 'flex',
        height: '100%'
    },
});
