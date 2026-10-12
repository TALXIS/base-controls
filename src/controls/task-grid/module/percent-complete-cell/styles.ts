import { mergeStyleSets } from "@fluentui/react";

export const getPercentCompleteCellStyles = () => mergeStyleSets({
    root: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        paddingLeft: 9,
        paddingRight: 9,
    },
    itemProgress: {
        flexGrow: 1,
    },
    itemDescription: {
        flexShrink: 0,
    },
});
