import { mergeStyleSets } from "@fluentui/react";

export const getRowUiLoadingStyles = () => mergeStyleSets({
    root: {
        width: '100%',
        height: '100%',
    },
    shimmerWrapper: {
        height: '100%',
    },
});
