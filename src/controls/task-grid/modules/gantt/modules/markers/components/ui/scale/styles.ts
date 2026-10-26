import { mergeStyleSets } from "@fluentui/react";

export const getGanttMarkerUiScaleStyles = () => mergeStyleSets({
    scale: {
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'flex-end',
        pointerEvents: 'none',
    },
});
