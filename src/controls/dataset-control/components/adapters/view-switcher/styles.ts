import { mergeStyleSets } from "@fluentui/react";
import { HEADER_PART_HEIGHT } from "../../ui/layout";

export const getViewSwitcherStyles = () => mergeStyleSets({
    //the region gives a shimmer no width of its own
    shimmer: {
        width: 120,
        height: HEADER_PART_HEIGHT,
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
