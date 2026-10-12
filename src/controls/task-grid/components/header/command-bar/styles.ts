import { mergeStyleSets } from "@fluentui/react";

export const getCommandBarStyles = () => mergeStyleSets({
    //folds its commands down to the overflow button before anything in the header wraps
    commandBar: {
        flex: '1000 1 44px',
        minWidth: 44,
    },
});
