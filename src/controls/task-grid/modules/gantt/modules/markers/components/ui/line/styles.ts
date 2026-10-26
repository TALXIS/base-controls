import { mergeStyleSets } from "@fluentui/react";

export const getGanttMarkerUiLineStyles = () => mergeStyleSets({
    line: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: -1,
        width: 2,
        pointerEvents: 'none',
    },
});
