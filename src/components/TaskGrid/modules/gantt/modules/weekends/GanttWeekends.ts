import { EventEmitter, IEventEmitter } from '@talxis/client-libraries';
import { GanttStatic } from 'gantt-trial';
import { getModuleState, setModuleState } from '@components/TaskGrid/providers/saved-query';
import { ITaskGridState } from '@components/TaskGrid/TaskGridDatasetControlFactory';
import { ITaskGridServiceLocator } from '@components/TaskGrid/services';
import { IGanttServiceLocator } from '../../services';
import { isWeekend } from '../../gantt-chart-config';
import { isDayScaleVisible } from '../../gantt-zooming';

/** The key the module's state is stored under. Part of what a saved view persists, so it is fixed. */
export const GANTT_WEEKENDS_STATE_KEY = 'ganttWeekends';

/** How weekends were left on a view. */
export interface IGanttWeekendsState {
    showWeekends?: boolean;
}

export interface IGanttWeekendsEvents {
    /** The toggle re-renders on this; the chart has already been told to repaint. */
    onWeekendVisibilityChanged: (visible: boolean) => void;
}

/** Whether weekends are drawn on the timeline, and the setting that says so. */
export interface IGanttWeekends {
    events: IEventEmitter<IGanttWeekendsEvents>;
    isWeekendVisible: () => boolean;
    setWeekendVisible: (visible: boolean) => void;
}

export interface IGanttWeekendsParameters {
    /** Where the chart and the views that persist the setting are reached. */
    services: IGanttServiceLocator;
    /** Whether weekends start drawn, when the view being opened says nothing. */
    visibleByDefault: boolean;
}

/**
 * Drops weekends from the scale, so the bars close up over them.
 *
 * This is the one place the Gantt asks the chart to hide time units, which is a PRO-licensed feature —
 * see https://docs.dhtmlx.com/gantt/guides/custom-scale/. Marking weekends is the core's, and happens
 * whether or not this module is registered.
 */
export class GanttWeekends implements IGanttWeekends {
    public readonly events: IEventEmitter<IGanttWeekendsEvents> = new EventEmitter<IGanttWeekendsEvents>();
    private _services: IGanttServiceLocator;
    private _visibleByDefault: boolean;
    private _state?: IGanttWeekendsState;

    constructor(parameters: IGanttWeekendsParameters) {
        this._services = parameters.services;
        this._visibleByDefault = parameters.visibleByDefault;
        //a closure over the setting rather than a value, so changing it needs a repaint and nothing else
        this._gantt.ignore_time = date => !this.isWeekendVisible() && isWeekend(date) && isDayScaleVisible(this._gantt);
        this._registerStateHook();
    }

    private get _taskGridServices(): ITaskGridServiceLocator {
        return this._services.get('taskGridServices');
    }

    private get _gantt(): GanttStatic {
        return this._services.get('ganttChart');
    }

    public isWeekendVisible(): boolean {
        return this._getState().showWeekends ?? this._visibleByDefault;
    }

    public setWeekendVisible(visible: boolean): void {
        this._getState().showWeekends = visible;
        //the scale itself changes, and nothing else would ask the chart to draw it again
        this._services.find('ganttChart')?.render();
        this.events.dispatchEvent('onWeekendVisibilityChanged', visible);
    }

    //read lazily, and kept: the state the control carries is what brings the setting over from the view
    //that was open before. Missing state is not an error the way it is for the view state's slice - this is
    //read from `ignore_time`, which the chart calls while it renders
    private _getState(): IGanttWeekendsState {
        if (!this._state) {
            const state = this._taskGridServices.get('datasetControl').getState() as ITaskGridState;
            this._state = state.savedQuery
                ? getModuleState<IGanttWeekendsState>(state.savedQuery, GANTT_WEEKENDS_STATE_KEY) ?? {}
                : {};
        }
        return this._state;
    }

    private _registerStateHook(): void {
        this._taskGridServices.whenAvailable('savedQueryDataProvider', provider => {
            provider.registerStateHook(metadata => setModuleState(metadata, GANTT_WEEKENDS_STATE_KEY, this._getState()));
        });
    }
}
