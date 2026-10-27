import { mergeStyleSets } from "@fluentui/react";

const GAP = 4;
//as the grid's own value renderer
const PADDING = 9;

export const getLookupManyPillsStyles = () => {
    return mergeStyleSets({
        root: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: GAP,
            width: '100%',
            minWidth: 0,
            paddingLeft: PADDING,
            paddingRight: PADDING,
            boxSizing: 'border-box',
            overflow: 'hidden',
            '& > *': { flexShrink: 0 },
            //the only pill left shrinks to make room for the overflow
            '& > :first-child': { flexShrink: 1, minWidth: 0 },
        },
        measurer: {
            position: 'absolute',
            top: 0,
            left: PADDING,
            display: 'flex',
            gap: GAP,
            visibility: 'hidden',
            pointerEvents: 'none',
            '& > *': { flexShrink: 0 },
        },
        overflow: {
            display: 'inline-flex',
            flexGrow: 0,
            height: 22,
            cursor: 'default',
        },
        overflowList: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: GAP,
            maxWidth: 280,
            padding: 4,
        },
    });
};

export const LOOKUP_MANY_PILLS_GAP = GAP;
export const LOOKUP_MANY_PILLS_PADDING = PADDING;
