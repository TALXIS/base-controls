import { mergeStyleSets } from "@fluentui/react";

export const getViewSwitcherStyles = () => mergeStyleSets({
    //the region gives a shimmer no width of its own
    shimmer: {
        width: 120,
        height: 44,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
    },
    //as slim as the skeleton's header pills
    shimmerWrapper: {
        height: 26,
        width: '100%',
    },
});
