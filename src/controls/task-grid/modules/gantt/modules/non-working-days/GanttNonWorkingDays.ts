import { createElement } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { GanttStatic } from "dhtmlx-gantt";
import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { ILocalizationService, LocalizationService } from "@utils";
import type { ITaskRuntime } from "../../../../runtime";
import type { ITaskGridSetting } from "../../../../dataset-control/settings";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import { isDayScaleVisible } from "../../zooming/zoomScales";
import type { GanttCellClassHook, IGanttTimeline } from "../../timeline/GanttTimeline";
import { GANTT_NON_WORKING_DAYS_LABELS, IGanttNonWorkingDaysLabels } from "./labels";
import { setScaleIgnores } from "./scaleIgnores";
import { GANTT_NON_WORKING_DAY_CLASS } from "./classNames";
import { getGanttNonWorkingDaysStyles } from "./styles";
import { NonWorkingDayCalendar } from "./NonWorkingDayCalendar";
import { NonWorkingDayScaleTooltip } from "./components/adapters/scale-tooltip";
import type { INonWorkingDayTooltipComponents } from "./components/ui/non-working-day-tooltip";

const SHOW_NON_WORKING_DAYS_STATE_KEY = 'showNonWorkingDays';
//a Saturday, so the weekly rule lands on every Saturday and Sunday
const FIRST_WEEKEND = dayjs('1970-01-03');

/** A day, or a run of days, on which tasks are not worked on. */
export interface IGanttNonWorkingDay<TData = { [key: string]: unknown }> {
    id: string;
    /** The first day, of the first occurrence when it recurs. */
    date: Dayjs;
    /** The last day, inclusive; leave it out for a single day. */
    endDate?: Dayjs;
    /** What the scale says when its day is pointed at. */
    description?: string;
    /** An RRULE, such as `FREQ=YEARLY`, whose start is `date`. */
    recurrence?: string;
    /** What else the day carries, such as its own columns. */
    data?: TData;
}

/** Where the consumer's non-working days come from. */
export interface IGanttNonWorkingDaysStore<TData = { [key: string]: unknown }> {
    /** Called on every mount, before the chart is drawn, and on `reload`. */
    onLoadNonWorkingDays(): Promise<IGanttNonWorkingDay<TData>[]>;
}

/** The replaceable pieces of the non-working days, by the part they belong to. */
export interface IGanttNonWorkingDaysComponents {
    tooltip?: Partial<INonWorkingDayTooltipComponents>;
}

export interface IGanttNonWorkingDaysParameters<TData = { [key: string]: unknown }> {
    /** Whether Saturdays and Sundays are non-working days. Defaults to `true`. */
    enableWeekends?: boolean;
    /** Whether non-working days are on the scale until the user hides them. Defaults to `true`. */
    isVisibleByDefault?: boolean;
    onCreateStore?: (taskRuntime: ITaskRuntime) => IGanttNonWorkingDaysStore<TData>;
    components?: IGanttNonWorkingDaysComponents;
    labels?: Partial<IGanttNonWorkingDaysLabels>;
}

export interface IGanttNonWorkingDaysEvents {
    onVisibilityChanged: (isVisible: boolean) => void;
    /** The store's days changed, such as after `reload`. */
    onNonWorkingDaysChanged: () => void;
}

/** The `nonWorkingDays` module: weekends and the store's days, shaded on the timeline and hideable. */
export interface IGanttNonWorkingDays<TData = { [key: string]: unknown }> {
    readonly events: IEventEmitter<IGanttNonWorkingDaysEvents>;
    isVisible(): boolean;
    setVisible(isVisible: boolean): void;
    /** Reads the store's days again and redraws the chart. */
    reload(): Promise<void>;
    /** The days that cover a date, the weekend among them. */
    getNonWorkingDays(date: Date): IGanttNonWorkingDay<TData>[];
    isNonWorkingDay(date: Date): boolean;
    getComponents(): IGanttNonWorkingDaysComponents;
    /** Called as the Gantt goes. */
    destroy(): void;
}

export class GanttNonWorkingDays<TData = { [key: string]: unknown }> implements IGanttNonWorkingDays<TData> {
    public readonly events = new EventEmitter<IGanttNonWorkingDaysEvents>();
    private _gantt: IGantt;
    private _isVisibleByDefault: boolean;
    private _isWeekendEnabled: boolean;
    private _labels: ILocalizationService<IGanttNonWorkingDaysLabels>;
    private _store?: IGanttNonWorkingDaysStore<TData>;
    private _components: IGanttNonWorkingDaysComponents;
    private _calendar: NonWorkingDayCalendar<TData>;
    private _unregisters: (() => void)[] = [];

    constructor(gantt: IGantt, parameters: IGanttNonWorkingDaysParameters<TData>) {
        this._gantt = gantt;
        this._isVisibleByDefault = parameters.isVisibleByDefault ?? true;
        this._isWeekendEnabled = parameters.enableWeekends ?? true;
        this._components = parameters.components ?? {};
        this._labels = new LocalizationService<IGanttNonWorkingDaysLabels>({ ...GANTT_NON_WORKING_DAYS_LABELS, ...parameters.labels });
        this._store = parameters.onCreateStore?.(gantt.getTaskRuntime());
        this._calendar = new NonWorkingDayCalendar(this._getWeekends());
        this._unregisters.push(
            gantt.services.get('theme').registerStyles((result, theme) => result.styles.push(getGanttNonWorkingDaysStyles(theme))),
            gantt.surfaces.registerSurface(this._onSurfaces),
        );
        gantt.services.whenAvailable('chart', this._onChartReady);
        gantt.services.whenAvailable('timeline', this._onTimelineReady);
        gantt.getTaskRuntime().services.get('datasetControl').modules.whenAvailable('userQueries', userQueries => {
            this._unregisters.push(userQueries.saveWithView('ganttShowNonWorkingDays', () => this.isVisible()));
        });
        gantt.getTaskRuntime().services.get('datasetControl').parts.whenAvailable('taskSettings', settings => {
            this._unregisters.push(settings.registerSettings(this._addSettings));
        });
    }

    public isVisible(): boolean {
        const state = this._gantt.services.get('state').get<boolean>(SHOW_NON_WORKING_DAYS_STATE_KEY);
        return state ?? this._gantt.getTaskRuntime().getView()?.data?.ganttShowNonWorkingDays ?? this._isVisibleByDefault;
    }

    public setVisible(isVisible: boolean): void {
        this._gantt.services.get('state').set(SHOW_NON_WORKING_DAYS_STATE_KEY, isVisible);
        this._gantt.render();
        this.events.dispatchEvent('onVisibilityChanged', isVisible);
    }

    public async reload(): Promise<void> {
        if (!this._store) {
            return;
        }
        const store = this._store;
        const errorTitle = this._labels.getLocalizedString('loadNonWorkingDaysFailed');
        const calendar = await this._gantt.getTaskRuntime().execute(async () => new NonWorkingDayCalendar([...this._getWeekends(), ...await store.onLoadNonWorkingDays()]), { loading: { show: false }, error: { title: errorTitle, rethrow: false } });
        if (!calendar) {
            return;
        }
        this._calendar = calendar;
        this._gantt.render();
        this.events.dispatchEvent('onNonWorkingDaysChanged');
    }

    public getNonWorkingDays(date: Date): IGanttNonWorkingDay<TData>[] {
        return this._calendar.getDays(date);
    }

    public isNonWorkingDay(date: Date): boolean {
        return this._calendar.getDays(date).length > 0;
    }

    public getComponents(): IGanttNonWorkingDaysComponents {
        return this._components;
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
        this.events.clearEventListeners();
    }

    private _getWeekends(): IGanttNonWorkingDay<TData>[] {
        if (!this._isWeekendEnabled) {
            return [];
        }
        const description = this._labels.getLocalizedString('weekend');
        return [{ id: 'weekend', date: FIRST_WEEKEND, endDate: FIRST_WEEKEND.add(1, 'day'), description, recurrence: 'FREQ=WEEKLY' }];
    }

    private _onChartReady = (chart: GanttStatic): void => {
        setScaleIgnores(chart, date => !this.isVisible() && this.isNonWorkingDay(date) && isDayScaleVisible(chart));
    };

    //week cells start on a Monday, so only day and hour cells are shaded
    private _onTimelineReady = (timeline: IGanttTimeline): void => {
        const chart = this._gantt.services.get('chart');
        const addNonWorkingDayClass: GanttCellClassHook = (classNames, { date }) => {
            if (this.isNonWorkingDay(date) && isDayScaleVisible(chart)) {
                classNames.push(GANTT_NON_WORKING_DAY_CLASS);
            }
        };
        this._unregisters.push(timeline.registerCellClass(addNonWorkingDayClass), timeline.registerScaleCellClass(addNonWorkingDayClass));
    };

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        surfaces.push({ key: 'nonWorkingDays', onRender: () => createElement(NonWorkingDayScaleTooltip) });
    };

    private _addSettings = (settings: ITaskGridSetting[]): void => {
        settings.push({
            key: 'hideNonWorkingDays',
            label: this._labels.getLocalizedString('hideNonWorkingDays'),
            isChecked: !this.isVisible(),
            onChange: isChecked => this.setVisible(!isChecked),
        });
    };
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** The days tasks are not worked on. */
        nonWorkingDays: IGanttNonWorkingDays<unknown>;
    }
}

declare module "@controls/dataset-control/modules/user-queries/interfaces" {
    interface IUserQuerySavedValueMap {
        /** Whether non-working days are on the Gantt's scale. */
        ganttShowNonWorkingDays: boolean;
    }
}
