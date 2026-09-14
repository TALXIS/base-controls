import { ICommandBarStyles, mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

export const getCellCommandsStyles = (alignment: IAlignment) => {
    const classNames = mergeStyleSets({
        commandsRoot: {
            //before the value on a right-aligned column, after it on any other: the value keeps the edge
            //its column reads from
            order: alignment === 'right' ? 0 : 1,
            //a flex item that can shrink, so the bar has a bounded box to fit into rather than the width
            //its buttons would like
            flex: '1 1 auto',
            minWidth: 0,
        },
        //`CommandBar` hands its native props to the `ResizeGroup` root, so this is the class that lands on
        //the box it measures: as wide as what it was given, which is what makes the overflow menu appear
        commandBar: {
            width: '100%',
            minWidth: 0,
        },
    });
    return {
        commandsRoot: classNames.commandsRoot,
        commandBar: classNames.commandBar,
        //the bar takes the width the value does not, so its buttons sit against the value rather than
        //drifting off across the cell: beside it on the inside, whichever edge the column reads from
        commandBarStyles: {
            //the bar brings no inset of its own: what a cell has around its content is the cell's to say
            root: {
                padding: 0,
            },
            primarySet: {
                justifyContent: alignment === 'right' ? 'flex-start' : 'flex-end',
            },
        } as ICommandBarStyles,
    };
};
