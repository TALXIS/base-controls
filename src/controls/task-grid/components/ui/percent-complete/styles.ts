import { mergeStyleSets } from "@fluentui/react";

export const getTaskGridUiPercentCompleteStyles = () => mergeStyleSets({
    progress: {
        flex: 1,
        minWidth: 0,
        //the native value renderer's padding
        paddingLeft: 9,
        paddingRight: 9,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    itemProgress: {
        flexGrow: 1,
        padding: 0,
    },
});
