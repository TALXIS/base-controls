import { mergeStyleSets } from "@fluentui/react";

export const getRibbonStyles = () => mergeStyleSets({
    //the height of the command bar it stands in for
    shimmerWrapper: {
        height: 44,
    },
});
