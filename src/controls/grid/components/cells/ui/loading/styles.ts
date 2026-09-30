import { mergeStyleSets } from "@fluentui/react";

export const getCellUiLoadingStyles = () => mergeStyleSets({
    shimmerRoot: {
        width: '100%',
        paddingLeft: 10,
        paddingRight: 10,
    },
    shimmerWrapper: {
        height: 10,
    },
});
