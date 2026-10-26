import type { GanttStatic } from "dhtmlx-gantt";

/** The wheel event the zoom extension hands its handler. */
export interface IZoomWheelEvent {
    clientX: number;
    deltaY: number;
    wheelDelta: number;
    preventDefault: () => void;
    stopPropagation: () => void;
}

//the private setter keeps the date under `anchorX` still; the public one always passes 0
interface IGanttZoomInternals {
    _setLevel: (levelIndex: number, anchorX: number) => void;
}

export const getZoomApi = (gantt: GanttStatic): GanttStatic['ext']['zoom'] & IGanttZoomInternals => {
    return gantt.ext.zoom as GanttStatic['ext']['zoom'] & IGanttZoomInternals;
};
