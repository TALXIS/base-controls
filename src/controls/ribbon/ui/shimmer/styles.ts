import { mergeStyleSets } from "@fluentui/react";
import { RIBBON_HEIGHT } from "../styles";

export const getRibbonShimmerUiStyles = (align: 'start' | 'end') => mergeStyleSets({
    ribbonShimmer: {
        height: RIBBON_HEIGHT,
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
