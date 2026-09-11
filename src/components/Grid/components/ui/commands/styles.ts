import { mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

export const getCellCommandsStyles = (alignment: IAlignment) => mergeStyleSets({
    //`CommandBar` hands its native props to the `ResizeGroup` root, so this is the class that lands on it
    commandsRoot: {
        //before the value on a right-aligned column, after it on any other: the value keeps the edge its
        //column reads from
        order: alignment === 'right' ? 0 : 1,
    },
});
