import { mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

/** What the grid tells a click on a cell's commands apart by. */
export const CELL_COMMANDS_CLASS_NAME = 'talxis__baseControl__GridCellCommands';

//what a bar is down to once everything it holds is in the menu: the button that opens it
const OVERFLOW_BUTTON_WIDTH = 40;

export const getCellUiCommandsStyles = (alignment: IAlignment) => mergeStyleSets({
    commandsRoot: {
        //after the value, or before it where the column reads from the right
        order: alignment === 'right' ? 1 : 2,
        //near enough all the width the value leaves
        flex: '1000 1 0',
        minWidth: OVERFLOW_BUTTON_WIDTH,
    },
    //`CommandBar` hands its native props to the `ResizeGroup` root
    commandBar: {
        width: '100%',
        minWidth: 0,
    },
    //the bar brings no inset of its own
    commandBarRoot: {
        padding: 0,
    },
    primarySet: {
        justifyContent: alignment === 'right' ? 'flex-start' : 'flex-end',
    },
});
