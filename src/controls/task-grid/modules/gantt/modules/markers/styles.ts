import type { IStyle } from "@fluentui/react";

export const getGanttMarkersStyles = (): IStyle => ({
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
});
