import { mergeStyleSets } from "@fluentui/react";

export const getRibbonStyles = (align: 'start' | 'end') => mergeStyleSets({
    //the height of the command bar it stands in for
    shimmer: {
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'end' ? 'flex-end' : 'flex-start',
    },
    //as slim as the skeleton's header pills
    shimmerWrapper: {
        height: 26,
        maxWidth: '100%',
    },
});
