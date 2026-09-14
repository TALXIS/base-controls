import { mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

export const getCellControlStyles = (alignment: IAlignment) => mergeStyleSets({
    control: {
        //a right-aligned column reads outwards from its edge, so the value goes last there and the
        //commands end up on the inside of it
        order: alignment === 'right' ? 2 : 1,
        //its own width, and whatever room nothing else has taken - a cell drawing no commands leaves the
        //rest to the value, which is how a value aligned to an edge reaches it. What it still cannot draw
        //is clipped rather than pushed past the edge of the cell
        flex: '1 1 auto',
        minWidth: 0,
        overflow: 'hidden',
    },
});
