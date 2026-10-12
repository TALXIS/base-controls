import { mergeStyleSets } from "@fluentui/react";

export const getAddTaskCellStyles = () => mergeStyleSets({
    commands: {
        alignSelf: 'stretch',
        display: 'flex',
    },
    button: {
        width: '100%',
        height: '100%',
    },
});
