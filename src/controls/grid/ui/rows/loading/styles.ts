import { mergeStyleSets } from "@fluentui/react";

export const getRowUiLoadingStyles = () => mergeStyleSets({
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        boxSizing: 'border-box',
    },
    shimmerWrapper: {
        height: 8,
    },
});
