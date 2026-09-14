import { mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

export const getCellControlStyles = (alignment: IAlignment) => mergeStyleSets({
    control: {
        //a right-aligned column reads outwards from its edge, so the value goes last there and the
        //commands end up on the inside of it
        order: alignment === 'right' ? 2 : 1,
        flex: 1
    },
});
