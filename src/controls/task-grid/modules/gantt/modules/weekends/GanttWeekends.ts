import { EventEmitter, IEventEmitter } from '@talxis/client-libraries';
import { GanttStatic } from 'gantt-trial';
import { IModuleState } from '@components/TaskGrid/providers/state';
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
    private _state: IModuleState<IGanttWeekendsState>;

    constructor(parameters: IGanttWeekendsParameters) {
        this._services = parameters.services;
        this._visibleByDefault = parameters.visibleByDefault;
        this._state = parameters.services.get('taskGridServices').get('taskGridState')
            .module<IGanttWeekendsState>(GANTT_WEEKENDS_STATE_KEY, 'view');
        //a closure over the setting rather than a value, so changing it needs a repaint and nothing else
        this._gantt.ignore_time = date => !this.isWeekendVisible() && isWeekend(date) && isDayScaleVisible(this._gantt);
    }

    private get _gantt(): GanttStatic {
        return this._services.get('ganttChart');
    }

    public isWeekendVisible(): boolean {
        return this._state.get().showWeekends ?? this._visibleByDefault;
    }

    public setWeekendVisible(visible: boolean): void {
        this._state.set({ showWeekends: visible });
        //the scale itself changes, and nothing else would ask the chart to draw it again
        this._services.find('ganttChart')?.render();
        this.events.dispatchEvent('onWeekendVisibilityChanged', visible);
    }
}
