import { mergeStyleSets } from "@fluentui/react";

export const getMarkerLayerStyles = () => mergeStyleSets({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 5,
        pointerEvents: 'none',
    },
    slot: {
        position: 'absolute',
        bottom: 0,
        pointerEvents: 'auto',
    },
});
