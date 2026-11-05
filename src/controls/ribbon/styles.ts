import { mergeStyleSets } from "@fluentui/react";
import { RIBBON_HEIGHT } from "./ui/styles";

export const getRibbonStyles = (align: 'start' | 'end') => mergeStyleSets({
    shimmer: {
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
