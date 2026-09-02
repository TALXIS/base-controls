import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { IModuleState } from "@components/TaskGrid/providers/state";
import { IGanttServiceLocator } from "../services";

/** How the timeline was left on a view: what the module stores, and reads back when that view reopens. */
export interface IGanttViewState {
    /** The timeline panel's width, as a percentage of the split view. */
    ganttWidth?: number;
    /** The zoom, as the slider's 0-100 value. */
    zoomLevel?: number;
    /** The date the timeline is centred on, as an ISO string. */
    anchorDate?: string;
}

/** The key this module's state is stored under. Part of what a saved view persists, so it is fixed. */
export const GANTT_MODULE_STATE_KEY = 'gantt';

/** What changed, for the parts of the UI that draw it. */
export interface IGanttViewStateEvents {
    /** The slider re-renders on this, and the zooming part applies it to the chart. */
    onZoomLevelChanged: (zoomLevel: number) => void;
}

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
    /** What changed. */
    events: IEventEmitter<IGanttViewStateEvents>;
    getZoomLevel: () => number | undefined;
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
    public readonly events: IEventEmitter<IGanttViewStateEvents> = new EventEmitter<IGanttViewStateEvents>();
    private _services: IGanttServiceLocator;
    private _state: IModuleState<IGanttViewState>;

    constructor(parameters: IGanttViewStateParameters) {
        this._services = parameters.services;
        this._state = parameters.services.get('taskGridServices').get('taskGridState')
            .module<IGanttViewState>(GANTT_MODULE_STATE_KEY, 'view');
    }

    public getZoomLevel(): number | undefined {
        return this._state.get().zoomLevel;
    }

    public setZoomLevel(zoomLevel: number): void {
        this._state.set({ zoomLevel });
        this.events.dispatchEvent('onZoomLevelChanged', zoomLevel);
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

