import { createElement } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { GanttStatic } from "dhtmlx-gantt";
import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import type { LabelsOf } from "@utils";
import type { ITaskRuntime } from "../../../../runtime";
import type { ITaskGridSetting } from "../../../../dataset-control/settings";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import type { GanttCellClassHook, IGanttTimeline } from "../../timeline/GanttTimeline";
import type { GanttDurationHook, GanttSnapHook, IGanttSpan } from "../../schedule/GanttSchedule";
import { GANTT_NON_WORKING_DAYS_LABELS } from "./labels";
import { setScaleIgnores } from "./scaleIgnores";
import { GANTT_NON_WORKING_DAY_CLASS } from "./classNames";
import { getGanttNonWorkingDaysStyles } from "./styles";
import { NonWorkingDayCalendar } from "./NonWorkingDayCalendar";
import { NonWorkingDayScaleTooltip } from "./components/adapters/scale-tooltip";
import type { INonWorkingDayTooltipComponents } from "./components/ui/non-working-day-tooltip";

const SHOW_NON_WORKING_DAYS_STATE_KEY = 'showNonWorkingDays';
//a year of non-working days in a row is a calendar to give up on
const MAX_DAYS_SEARCHED = 366;

//the end is exclusive, so the last day worked is the one just before it
const getLastDay = (span: IGanttSpan): Date => new Date(+span.end - 1);
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
    /** Whether a dragged or drawn task may start or end on a non-working day; if not, it snaps to a working one. Defaults to `false`. */
    enableDropOnNonWorkingDays?: boolean;
    onCreateStore?: (taskRuntime: ITaskRuntime) => IGanttNonWorkingDaysStore<TData>;
    components?: IGanttNonWorkingDaysComponents;
}

export interface IGanttNonWorkingDaysEvents {
    onVisibilityChanged: (isVisible: boolean) => void;
    /** The store's days changed, such as after `reload`. */
    onNonWorkingDaysChanged: () => void;
}

/** The `nonWorkingDays` module: weekends and the store's days, shaded on the timeline, hideable and left out of durations. */
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
    private _labels: LabelsOf<typeof GANTT_NON_WORKING_DAYS_LABELS>;
    private _store?: IGanttNonWorkingDaysStore<TData>;
    private _components: IGanttNonWorkingDaysComponents;
    private _calendar: NonWorkingDayCalendar<TData>;
    private _unregisters: (() => void)[] = [];

    constructor(gantt: IGantt, parameters: IGanttNonWorkingDaysParameters<TData>) {
        this._gantt = gantt;
        this._isVisibleByDefault = parameters.isVisibleByDefault ?? true;
        this._isWeekendEnabled = parameters.enableWeekends ?? true;
        this._components = parameters.components ?? {};
        this._labels = gantt.getLabels(GANTT_NON_WORKING_DAYS_LABELS);
        this._store = parameters.onCreateStore?.(gantt.getTaskRuntime());
        this._calendar = new NonWorkingDayCalendar(this._getWeekends());
        this._unregisters.push(
            gantt.services.get('theme').registerStyles((result, theme) => result.styles.push(getGanttNonWorkingDaysStyles(theme))),
            gantt.surfaces.registerSurface(this._onSurfaces),
            gantt.services.get('schedule').registerDuration(this._countWorkingTime),
        );
        if (!parameters.enableDropOnNonWorkingDays) {
            this._unregisters.push(gantt.services.get('schedule').registerSnap(this._keepOffNonWorkingDays));
        }
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
        const errorTitle = this._labels.get('ganttNonWorkingDays.loadNonWorkingDaysFailed');
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
        return this._calendar.isNonWorkingDay(date);
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
        const description = this._labels.get('ganttNonWorkingDays.weekend');
        return [{ id: 'weekend', date: FIRST_WEEKEND, endDate: FIRST_WEEKEND.add(1, 'day'), description, recurrence: 'FREQ=WEEKLY' }];
    }

    private _onChartReady = (chart: GanttStatic): void => {
        setScaleIgnores(chart, date => !this.isVisible() && this.isNonWorkingDay(date) && this._isDayScaleVisible());
    };

    //towards where the pointer went, so a bar dragged back does not jump forward
    private _keepOffNonWorkingDays: GanttSnapHook = (result, { change, original }) => {
        const span = result.span;
        if (change === 'move') {
            const direction = original && span.start < original.start ? -1 : 1;
            result.span = this._shiftOffNonWorkingDays(span, direction);
            return;
        }
        const start = change === 'end' ? span.start : this._toWorkingStart(span, change === 'start' && original && span.start < original.start ? -1 : 1);
        const end = change === 'start' ? span.end : this._toWorkingEnd({ start, end: span.end }, change === 'end' && original && span.end > original.end ? 1 : -1);
        //a span lying wholly on non-working days has no working edge to shrink to
        result.span = this._shiftOffNonWorkingDays({ start, end }, 1);
    };

    //whole days at a time, until neither the first nor the last day is a non-working one
    private _shiftOffNonWorkingDays(span: IGanttSpan, direction: 1 | -1): IGanttSpan {
        let shifted = span;
        for (let days = 0; days < MAX_DAYS_SEARCHED && (this.isNonWorkingDay(shifted.start) || this.isNonWorkingDay(getLastDay(shifted))); days++) {
            shifted = { start: dayjs(shifted.start).add(direction, 'day').toDate(), end: dayjs(shifted.end).add(direction, 'day').toDate() };
        }
        return shifted;
    }

    private _toWorkingStart(span: IGanttSpan, direction: 1 | -1): Date {
        let start = dayjs(span.start);
        for (let days = 0; days < MAX_DAYS_SEARCHED && this.isNonWorkingDay(start.toDate()); days++) {
            start = start.add(direction, 'day').startOf('day');
        }
        //never past the end the other edge keeps
        return start.isBefore(span.end) ? start.toDate() : span.start;
    }

    private _toWorkingEnd(span: IGanttSpan, direction: 1 | -1): Date {
        let end = dayjs(span.end);
        for (let days = 0; days < MAX_DAYS_SEARCHED && this.isNonWorkingDay(getLastDay({ start: span.start, end: end.toDate() })); days++) {
            end = end.add(direction, 'day').startOf('day');
        }
        return end.isAfter(span.start) ? end.toDate() : span.end;
    }

    private _countWorkingTime: GanttDurationHook = (result, { span }) => {
        result.duration = this._calendar.getWorkingDuration(span.start, span.end) / 60_000;
    };

    //week cells start on a Monday, so only day and hour cells are shaded
    private _onTimelineReady = (timeline: IGanttTimeline): void => {
        const addNonWorkingDayClass: GanttCellClassHook = (classNames, { date }) => {
            if (this.isNonWorkingDay(date) && this._isDayScaleVisible()) {
                classNames.push(GANTT_NON_WORKING_DAY_CLASS);
            }
        };
        this._unregisters.push(timeline.registerCellClass(addNonWorkingDayClass), timeline.registerScaleCellClass(addNonWorkingDayClass));
    };

    //read while drawing: the zoom is registered after the chart
    private _isDayScaleVisible(): boolean {
        return this._gantt.services.find('zooming')?.isDayScaleVisible() ?? false;
    }

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        surfaces.push({ key: 'nonWorkingDays', onRender: () => createElement(NonWorkingDayScaleTooltip) });
    };

    private _addSettings = (settings: ITaskGridSetting[]): void => {
        settings.push({
            key: 'hideNonWorkingDays',
            label: this._labels.get('ganttNonWorkingDays.hideNonWorkingDays'),
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
