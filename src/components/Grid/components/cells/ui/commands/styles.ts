import { ICommandBarStyles, mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

//what a bar is down to once everything it holds is in the menu: the button that opens it
const OVERFLOW_BUTTON_WIDTH = 40;

export const getCellCommandsStyles = (alignment: IAlignment) => {
    const classNames = mergeStyleSets({
        commandsRoot: {
            //after the value, or before it where the column reads from the right
            order: alignment === 'right' ? 1 : 2,
            //the bar takes the room the value leaves, and is the first to give it back: a shrink factor
            //nothing else can outweigh, so the bar answers a value that needs the room by moving its
            //commands into the overflow menu, down to the width of the button that opens it. What the
            //value still cannot fit in is clipped instead
            flex: '1 1000 auto',
            minWidth: OVERFLOW_BUTTON_WIDTH,
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
