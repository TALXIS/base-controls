import { mergeStyleSets } from "@fluentui/react";
import { CELL_VALUE_PADDING } from "../../../constants";

const GAP = 4;

export const getLookupManyUiPillsStyles = () => {
    return mergeStyleSets({
        root: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: GAP,
            width: '100%',
            minWidth: 0,
            paddingLeft: CELL_VALUE_PADDING,
            paddingRight: CELL_VALUE_PADDING,
            boxSizing: 'border-box',
            overflow: 'hidden',
            '& > *': { flexShrink: 0 },
            //the only pill left shrinks to make room for the overflow
            '& > :first-child': { flexShrink: 1, minWidth: 0 },
        },
        measurer: {
            position: 'absolute',
            top: 0,
            left: CELL_VALUE_PADDING,
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
export const LOOKUP_MANY_PILLS_PADDING = CELL_VALUE_PADDING;
