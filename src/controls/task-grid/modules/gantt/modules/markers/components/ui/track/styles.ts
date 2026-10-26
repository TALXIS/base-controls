import { mergeStyleSets } from "@fluentui/react";

export const getGanttMarkerUiTrackStyles = () => mergeStyleSets({
    track: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        pointerEvents: 'none',
    },
});
