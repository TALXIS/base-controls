import { mergeStyleSets } from "@fluentui/react";
import { GANTT_LAYERS } from "../layers";

export const getGanttUiSkeletonStyles = () => mergeStyleSets({
    root: {
        position: 'absolute',
        inset: 0,
        zIndex: GANTT_LAYERS.skeleton,
    },
});
