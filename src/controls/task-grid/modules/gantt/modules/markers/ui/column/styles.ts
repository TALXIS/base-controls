import { mergeStyleSets } from "@fluentui/react";

export const getMarkerUiColumnStyles = () => mergeStyleSets({
    column: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 0,
        pointerEvents: 'none',
    },
});
