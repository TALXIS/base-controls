import { mergeStyleSets } from "@fluentui/react";

export const getCommandBarStyles = (align: 'start' | 'end' = 'start') => mergeStyleSets({
    //lets the bar shrink in a flex row, so it folds its commands rather than overflowing
    resizeGroup: {
        minWidth: 0,
    },
    //the first and last button line up with whatever holds the bar
    root: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    primarySet: {
        justifyContent: align === 'end' ? 'flex-end' : 'flex-start',
    },
});
