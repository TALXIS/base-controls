import { mergeStyleSets } from "@fluentui/react";

export const getGanttMarkerUiLayerStyles = () => mergeStyleSets({
    layer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 5,
        pointerEvents: 'none',
    },
});
