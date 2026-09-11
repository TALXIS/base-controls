import { mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

export const getCellCommandsStyles = (alignment: IAlignment) => mergeStyleSets({
    commandsRoot: {
        //before the value on a right-aligned column, after it on any other: the value keeps the edge its
        //column reads from
        order: alignment === 'right' ? 0 : 1,
        //a flex item that can shrink, so the bar has a bounded box to fit into rather than the width its
        //buttons would like
        flex: '1 1 auto',
        minWidth: 0,
    },
    //`CommandBar` hands its native props to the `ResizeGroup` root, so this is the class that lands on the
    //box it measures: as wide as what it was given, which is what makes the overflow menu appear
    commandBar: {
        width: '100%',
        minWidth: 0,
    },
});
