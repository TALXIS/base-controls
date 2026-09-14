import { mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

export const getCellControlStyles = (alignment: IAlignment) => mergeStyleSets({
    control: {
        //a right-aligned column reads outwards from its edge, so the value goes last there and the
        //commands end up on the inside of it
        order: alignment === 'right' ? 2 : 1,
        //as much of the cell as the value needs and no more, given up last: what it cannot draw is clipped
        //rather than pushed past the edge of the cell
        flex: '0 1 auto',
        minWidth: 0,
        overflow: 'hidden',
    },
});
