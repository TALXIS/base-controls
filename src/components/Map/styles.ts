import { mergeStyleSets } from "@fluentui/react";

export const getMapStyles = () => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            flexDirection: 'column',
            //a map has no content to be sized by, so it fills the box the host gave it on both axes: it grows
            //along the host's main axis, and stretches across the other even where the host aligns its children
            flexGrow: 1,
            flexShrink: 1,
            alignSelf: 'stretch',
            //flex, not the height property, settles the main size - so a host that stacks the control above
            //siblings hands it what is left instead of being overflowed by a full-height map
            flexBasis: 0,
            //the height covers a host that sizes by height rather than by flex; in a flex host the basis wins
            height: '100%',
            minWidth: 0,
            //a map has no content to be sized by, so it keeps a floor for a host that hands it no height at all
            minHeight: 200,
            //the box the provider picker is positioned against
            position: 'relative'
        }
    });
};
