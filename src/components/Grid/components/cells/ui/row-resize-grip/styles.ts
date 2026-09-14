import { mergeStyleSets } from "@fluentui/react";

export const getRowResizeGripStyles = () => mergeStyleSets({
    //what the cell draws goes inside it, and the grip is placed against its bottom edge
    gripRoot: {
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
    },
    grip: {
        position: 'absolute',
        left: '50%',
        bottom: 1,
        transform: 'translateX(-50%)',
        width: 24,
        height: 4,
        borderRadius: 2,
        cursor: 'ns-resize',
        opacity: 0,
        backgroundColor: 'color-mix(in srgb, currentColor 40%, transparent)',
        selectors: {
            '.ag-cell:hover &': {
                opacity: 1,
            },
        },
    },
});
