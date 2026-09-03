import { IModuleState } from "@components/TaskGrid/providers/state";
import { IGanttServiceLocator } from "../services";

/**
 * A zoom as it is stored: the scale the chart was showing, and how wide its columns were.
 *
 * Stored as the scale itself rather than as a position, because which zoom levels are usable depends on
 * what the mapped date columns hold - so a position means different things on different views.
 */
export interface IGanttZoomState {
    /** The unit of the level's finest scale, and how many of it a column spans. */
    unit: string;
    step: number;
    columnWidth: number;
}

/** How the timeline was left on a view: what the module stores, and reads back when that view reopens. */
export interface IGanttViewState {
    /** The timeline panel's width, as a percentage of the split view. */
    ganttWidth?: number;
    /** The zoom the timeline was showing. */
    zoom?: IGanttZoomState;
    /**
     * The zoom, as the slider's 0-100 value.
     *
     * @deprecated What a zoom was stored as before {@link IGanttZoomState}. Read when a view carries no
     * `zoom`, and still written beside it, so a view saved here reopens on a build that predates it.
     */
    zoomLevel?: number;
    /** The date the timeline is centred on, as an ISO string. */
    anchorDate?: string;
}

/** The key this module's state is stored under. Part of what a saved view persists, so it is fixed. */
export const GANTT_MODULE_STATE_KEY = 'gantt';

export interface IGanttViewStateParameters {
    /** Where the control that carries the state, and the views that persist it, are reached. */
    services: IGanttServiceLocator;
}

/**
 * The timeline's settings on the view that is open: the zoom, the panel width, the anchor.
 *
 * The grid stores the slice opaquely — this is the only code that knows its shape — and hands it back
 * whenever a view's state is captured, which is what makes the zoom survive a remount and a saved view.
 */
export interface IGanttViewStateProvider {
    /** The zoom the view was left on, or nothing on a view that never stored one. */
    getZoom: () => IGanttZoomState | undefined;
    setZoom: (zoom: IGanttZoomState) => void;
    /** @deprecated The zoom as an older build stored it. Read when a view carries no `zoom`. */
    getZoomLevel: () => number | undefined;
    /** @deprecated Written beside `zoom`, so a view saved here reopens on a build that predates it. */
    setZoomLevel: (zoomLevel: number) => void;
    /** The timeline panel's width, as a percentage of the split view. */
    getGanttWidth: () => number | undefined;
    setGanttWidth: (ganttWidth: number) => void;
    /** The date the timeline is centred on, kept so a remount opens where the user left off. */
    getAnchorDate: () => Date | undefined;
    setAnchorDate: (anchorDate?: Date) => void;
}

/** Holds {@link IGanttViewStateProvider}. Built by `createGanttModule`, before there is a chart. */
export class GanttViewState implements IGanttViewStateProvider {
    private _services: IGanttServiceLocator;
    private _state: IModuleState<IGanttViewState>;

    constructor(parameters: IGanttViewStateParameters) {
        this._services = parameters.services;
        this._state = parameters.services.get('taskGridServices').get('taskGridState')
            .module<IGanttViewState>(GANTT_MODULE_STATE_KEY, 'view');
    }

    public getZoom(): IGanttZoomState | undefined {
        return this._state.get().zoom;
    }

    public setZoom(zoom: IGanttZoomState): void {
        this._state.set({ zoom });
    }

    public getZoomLevel(): number | undefined {
        return this._state.get().zoomLevel;
    }

    public setZoomLevel(zoomLevel: number): void {
        this._state.set({ zoomLevel });
    }

    public getGanttWidth(): number | undefined {
        return this._state.get().ganttWidth;
    }

    public setGanttWidth(ganttWidth: number): void {
        this._state.set({ ganttWidth });
    }

    public getAnchorDate(): Date | undefined {
        const anchorDate = this._state.get().anchorDate;
        return anchorDate ? new Date(anchorDate) : undefined;
    }

    public setAnchorDate(anchorDate?: Date): void {
        this._state.set({ anchorDate: anchorDate?.toISOString() });
    }
}

