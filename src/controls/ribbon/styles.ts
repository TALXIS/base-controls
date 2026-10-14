import { mergeStyleSets } from "@fluentui/react";

export const getRibbonStyles = (align: 'start' | 'end') => mergeStyleSets({
    shimmer: {
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
