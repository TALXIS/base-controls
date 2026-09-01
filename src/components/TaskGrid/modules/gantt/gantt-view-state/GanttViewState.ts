import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { getModuleState, setModuleState } from "@components/TaskGrid/providers/saved-query";
import { ITaskGridState } from "@components/TaskGrid/TaskGridDatasetControlFactory";
import { IGanttServiceLocator } from "../services";

/** How the timeline was left on a view: what the module stores, and reads back when that view reopens. */
export interface IGanttViewState {
    /** Whether weekends are drawn on the timeline. */
    showWeekends?: boolean;
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
    /** The settings toggle re-renders on this, and the chart re-renders with weekends in or out. */
    onShowWeekendsChanged: (showWeekends: boolean) => void;
}

/** Constructor parameters for {@link GanttViewState}. */
export interface IGanttViewStateParameters {
    /** Where the control that carries the state, and the views that persist it, are reached. */
    services: IGanttServiceLocator;
}

/**
 * The timeline's settings on the view that is open: the zoom, the weekends, the panel width, the anchor.
 *
 * The grid stores the slice opaquely — this is the only code that knows its shape — and hands it back
 * whenever a view's state is captured, which is what makes the zoom survive a remount and a saved view.
 */
export interface IGanttViewStateProvider {
    /** What changed. */
    events: IEventEmitter<IGanttViewStateEvents>;
    getZoomLevel: () => number | undefined;
    setZoomLevel: (zoomLevel: number) => void;
    isWeekendVisible: () => boolean;
    showWeekend: (showWeekends: boolean) => void;
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
    private _state?: IGanttViewState;

    constructor(parameters: IGanttViewStateParameters) {
        this._services = parameters.services;
        this._registerStateHook();
    }

    public getZoomLevel(): number | undefined {
        return this._getState().zoomLevel;
    }

    public setZoomLevel(zoomLevel: number): void {
        this._getState().zoomLevel = zoomLevel;
        this.events.dispatchEvent('onZoomLevelChanged', zoomLevel);
    }

    public isWeekendVisible(): boolean {
        return this._getState().showWeekends ?? false;
    }

    public showWeekend(showWeekends: boolean): void {
        this._getState().showWeekends = showWeekends;
        this.events.dispatchEvent('onShowWeekendsChanged', showWeekends);
    }

    public getGanttWidth(): number | undefined {
        return this._getState().ganttWidth;
    }

    public setGanttWidth(ganttWidth: number): void {
        this._getState().ganttWidth = ganttWidth;
    }

    public getAnchorDate(): Date | undefined {
        const anchorDate = this._getState().anchorDate;
        return anchorDate ? new Date(anchorDate) : undefined;
    }

    public setAnchorDate(anchorDate?: Date): void {
        this._getState().anchorDate = anchorDate?.toISOString();
    }

    /**
     * Read once and then held.
     *
     * Read lazily rather than in the constructor: this is built before the control exists, and it is the
     * control's state that carries the slice over from the previous mount.
     */
    private _getState(): IGanttViewState {
        if (!this._state) {
            const state = this._services.get('taskGridServices').get('datasetControl').getState() as ITaskGridState;
            if (!state.savedQuery) {
                throw new Error('Cannot access gantt state before the control is initialized with a saved query.');
            }
            this._state = getModuleState<IGanttViewState>(state.savedQuery, GANTT_MODULE_STATE_KEY) ?? {};
        }
        return this._state;
    }

    /** Hands the state back whenever the grid captures a view's — a remount, or a save into a view. */
    private _registerStateHook(): void {
        this._services.get('taskGridServices').whenAvailable('savedQueryDataProvider', provider => {
            provider.registerStateHook(metadata => setModuleState(metadata, GANTT_MODULE_STATE_KEY, this._getState()));
        });
    }
}
