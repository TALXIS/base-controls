import { mergeStyleSets } from "@fluentui/react";

export const getMarkerLayerStyles = () => mergeStyleSets({
    chart: {
        '.gantt_marker_area': {
            zIndex: 3,
        },
        '.gantt_marker': {
            width: 2,
            marginLeft: -1,
            opacity: 1,
            pointerEvents: 'none',
        },
        //the chips draw the labels on the scale
        '.gantt_marker .gantt_marker_content': {
            display: 'none',
        },
    },
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
