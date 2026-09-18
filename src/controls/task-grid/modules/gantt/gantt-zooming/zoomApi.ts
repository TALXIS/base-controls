import { GanttStatic } from "gantt-trial";

/** The wheel event the extension's own handler is given. */
export interface IZoomWheelEvent {
    clientX: number;
    deltaY: number;
    /** Not in the standard event: the extension reads it on everything but Firefox. */
    wheelDelta: number;
    preventDefault: () => void;
    stopPropagation: () => void;
}

/**
 * The parts of dhtmlx's zoom extension that are not in its public API.
 *
 * Only the level setter, and only for its second argument: given a position it reads the date under it,
 * re-renders, and scrolls that date back to it — the whole of what a zoom has to do to stay under the
 * pointer, in one scroll. The public `setLevel` always passes `0`, which makes the extension re-centre on
 * a date of its own instead, so it would have to be undone by hand. Everything that depends on the
 * library's internals is named here, so an upgrade has one place to check.
 */
export interface IGanttZoomApi {
    _initialized: boolean;
    _setLevel: (levelIndex: number, anchorX: number) => void;
}

/** The chart's zoom extension, with what {@link IGanttZoomApi} adds to its public surface. */
export const getZoomApi = (gantt: GanttStatic): GanttStatic['ext']['zoom'] & IGanttZoomApi => {
    return gantt.ext.zoom as GanttStatic['ext']['zoom'] & IGanttZoomApi;
};
