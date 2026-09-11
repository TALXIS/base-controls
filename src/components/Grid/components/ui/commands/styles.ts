import { ICommandBarStyles, mergeStyleSets } from "@fluentui/react";

export const getCellCommandsStyles = () => {
    const classNames = mergeStyleSets({
        //`CommandBar` hands its native props to the `ResizeGroup` root, which is the box the bar measures
        //itself against - so this is where a width it can shrink into has to go. Without one the group
        //measures nothing, nothing fits, and the bar never leaves its hidden measuring pass
        commandsRoot: {
            flex: '1 1 auto',
            minWidth: 0,
            height: '100%',
        },
    });
    return {
        commandsRoot: classNames.commandsRoot,
        commandBar: {
            //no surface of its own: the cell's theme is already painting behind the bar
            root: {
                backgroundColor: 'transparent',
                height: '100%',
                padding: 0,
            },
            primarySet: {
                '.ms-Button': {
                    backgroundColor: 'transparent',
                    height: '100%',
                },
            },
        } as ICommandBarStyles,
    };
};
