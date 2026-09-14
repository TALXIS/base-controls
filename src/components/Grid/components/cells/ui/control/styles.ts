import { mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

export const getCellControlStyles = (alignment: IAlignment) => mergeStyleSets({
    control: {
        //a right-aligned column reads outwards from its edge, so the value goes last and whatever else the
        //cell draws - the commands - ends up on the inside of it
        order: alignment === 'right' ? 1 : 0,
    },
});
