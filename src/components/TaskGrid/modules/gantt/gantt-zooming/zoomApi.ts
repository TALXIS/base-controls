import { GanttStatic } from "gantt-trial";

/** One scale row of a zoom level — a unit, and how many of it per column. */
export interface IGanttScaleDefinition {
    unit: string;
    step?: number;
}

/** One zoom level, as the chart's zoom extension holds it. */
export interface IGanttZoomLevelDefinition {
    scales?: IGanttScaleDefinition[];
}

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
 * The slider maps 0-100 onto *both* the level and the column width inside it, which the extension has no
 * public way to do — so the level setter and the wheel handler are reached directly. The width bounds are
 * not read back from here: they are values we hand to `zoom.init` ourselves, and `ZoomingConfig` is where
 * they live. Everything that depends on the library's internals is named here, so an upgrade has one place
 * to check.
 */
export interface IGanttZoomApi {
    _initialized: boolean;
    _exitFitMode: () => void;
    _setScaleDates: () => void;
    _setLevel: (levelIndex: number, anchorX: number) => void;
    _handler: (event: IZoomWheelEvent) => void;
    getLevels: () => IGanttZoomLevelDefinition[];
    getCurrentLevel: () => number;
}

/** The chart's zoom extension, with what {@link IGanttZoomApi} adds to its public surface. */
export const getZoomApi = (gantt: GanttStatic): GanttStatic['ext']['zoom'] & IGanttZoomApi => {
    return gantt.ext.zoom as GanttStatic['ext']['zoom'] & IGanttZoomApi;
};
