import { ICommandBarStyles, mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

//what a bar is down to once everything it holds is in the menu: the button that opens it
const OVERFLOW_BUTTON_WIDTH = 40;

export const getCellCommandsStyles = (alignment: IAlignment) => {
    const classNames = mergeStyleSets({
        commandsRoot: {
            //after the value, or before it where the column reads from the right
            order: alignment === 'right' ? 1 : 2,
            //what the value leaves, near enough all of it.
            flex: '1000 1 0',
            minWidth: OVERFLOW_BUTTON_WIDTH,
        },
        //`CommandBar` hands its native props to the `ResizeGroup` root
        commandBar: {
            width: '100%',
            minWidth: 0,
        },
    });
    return {
        commandsRoot: classNames.commandsRoot,
        commandBar: classNames.commandBar,
        //the bar takes the width the value does not
        commandBarStyles: {
            //the bar brings no inset of its own
            root: {
                padding: 0,
            },
            primarySet: {
                justifyContent: alignment === 'right' ? 'flex-start' : 'flex-end',
            },
        } as ICommandBarStyles,
    };
};
