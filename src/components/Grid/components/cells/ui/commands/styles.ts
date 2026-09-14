import { ICommandBarStyles, mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

//what a bar is down to once everything it holds is in the menu: the button that opens it
const OVERFLOW_BUTTON_WIDTH = 40;

export const getCellCommandsStyles = (alignment: IAlignment) => {
    const classNames = mergeStyleSets({
        commandsRoot: {
            //after the value, or before it where the column reads from the right
            order: alignment === 'right' ? 1 : 2,
            //what the value leaves, near enough all of it: the grow factor outweighs the value's so the
            //room a short value does not need goes to the bar rather than being split with it.
            //
            //Measured from nothing rather than from the bar's own width, because the bar answers a
            //narrower box by moving commands into the overflow menu - a box sized to what it currently
            //draws would collapse to the overflow button and never come back
            flex: '1000 1 0',
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
