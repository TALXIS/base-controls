import { EventEmitter, IEventEmitter, IFormatting, IRecord } from "@talxis/client-libraries";
import type { GanttStatic, ZoomLevel } from "dhtmlx-gantt";
import { HookRegistry, IStateStore } from "@utils";
import type { ITaskRuntime } from "../../../runtime";
import type { IGanttSavedZoom, IGanttZoom } from "../interfaces";
import type { IGanttSchedule } from "../schedule/GanttSchedule";
import type { IGanttTimeline } from "../timeline/GanttTimeline";

const ZOOM_STATE_KEY = 'zoom';
const ANCHOR_DATE_STATE_KEY = 'anchorDate';
const MILLISECONDS_PER_DAY = 86_400_000;
//a wheel notch of 100 zooms by about 14%; a pinch sends many small deltas
const WHEEL_ZOOM_SPEED = 0.0015;
const WHEEL_LINE_HEIGHT = 16;
const FIT_VIEWPORT_MARGIN = 0.1;
const MIN_COLUMN_WIDTH = 60;
const MAX_COLUMN_WIDTH = 160;
//a level is left only past these, so a zoom held at a boundary does not flicker between two
const FINER_LEVEL_MARGIN = 1.15;
const COARSER_LEVEL_MARGIN = 0.85;

//averages for the units of varying length
const UNIT_DAYS: Record<string, number> = {
    hour: 1 / 24,
    day: 1,
    week: 7,
    month: 30.4375,
    quarter: 91.3125,
    year: 365.25,
};

export interface IGanttZoomingEvents {
    onZoomChanged: () => void;
}

/** The chart's zoom, as a continuous number of pixels per day. */
export interface IGanttZooming {
    readonly events: IEventEmitter<IGanttZoomingEvents>;
    /** How far in the zoom is, from `0` at the widest view to `1` at the closest. */
    getPosition(): number;
    /** Zooms around the middle of the viewport; out of range is clamped. */
    setPosition(position: number): void;
    /** Fits the selected tasks, or every task when none is selected. */
    zoomToFit(): void;
    /** Zooms so the task's bar fills the timeline, or its one date's day when it has a single date. */
    showTask(record: IRecord): void;
    /** Whether whole days are columns at the current zoom. */
    isDayScaleVisible(): boolean;
    /** How wide a day is drawn, in pixels. */
    getPixelsPerDay(): number;
    /**
     * Registers a hook over the label of each scale cell.
     * @param priority Ascending: a higher number gets the later word.
     */
    registerScaleLabel(hook: GanttScaleLabelHook, priority?: number): () => void;
}

export interface IGanttScaleLabelParameters {
    /** Where the cell starts. */
    date: Date;
    /** Such as `year`, `quarter`, `month`, `week`, `day` or `hour`. */
    unit: string;
    /** How many units the cell spans. */
    step: number;
    /** `0` for the scale's top row, `1` for its bottom one. */
    row: number;
}

/** Changes the label of a scale cell, which starts as the built-in one. */
export type GanttScaleLabelHook = (result: { label: string }, parameters: IGanttScaleLabelParameters) => void;

export interface IGanttZoomingParameters {
    gantt: GanttStatic;
    taskRuntime: ITaskRuntime;
    schedule: IGanttSchedule;
    timeline: IGanttTimeline;
    state: IStateStore;
}

interface IPendingZoom {
    pixelsPerDay: number;
    anchorX: number;
}

/** A zoom older views saved, as their level's scale and column width. */
interface ILegacyZoom {
    unit?: string;
    step?: number;
    columnWidth?: number;
}

export class GanttZooming implements IGanttZooming {
    public readonly events = new EventEmitter<IGanttZoomingEvents>();
    private _gantt: GanttStatic;
    private _taskRuntime: ITaskRuntime;
    private _schedule: IGanttSchedule;
    private _timeline: IGanttTimeline;
    private _state: IStateStore;
    //coarsest first, each with its finest scale last
    private _levels: ZoomLevel[];
    private _minPixelsPerDay: number;
    private _maxPixelsPerDay: number;
    private _pixelsPerDay = 0;
    private _levelIndex = -1;
    //held through a run of zoom steps: re-reading it from pixels each step drifts
    private _anchorDate?: Date;
    private _anchorX?: number;
    private _pending?: IPendingZoom;
    private _frame?: number;
    private _wheelTarget?: HTMLElement;
    private _unsaveWithView?: () => void;
    private _scaleLabelHooks = new HookRegistry<GanttScaleLabelHook>();

    constructor(parameters: IGanttZoomingParameters) {
        this._gantt = parameters.gantt;
        this._taskRuntime = parameters.taskRuntime;
        this._schedule = parameters.schedule;
        this._timeline = parameters.timeline;
        this._state = parameters.state;
        const levels = this._createLevels(this._taskRuntime.getProvider().getFormatting());
        //an hour level means nothing without a time of day
        this._levels = this._schedule.hasTimeOfDay() ? levels : levels.filter(level => this._getFinestScale(level).unit !== 'hour');
        this._minPixelsPerDay = MIN_COLUMN_WIDTH / this._getLevelDays(this._levels[0]);
        this._maxPixelsPerDay = MAX_COLUMN_WIDTH / this._getLevelDays(this._levels[this._levels.length - 1]);
        this._gantt.attachEvent('onGanttReady', this._onGanttReady);
        this._gantt.attachEvent('onGanttScroll', this._onGanttScroll);
        this._taskRuntime.services.get('datasetControl').modules.whenAvailable('userQueries', userQueries => {
            this._unsaveWithView = userQueries.saveWithView('ganttZoom', this._getSavedZoom);
        });
    }

    public getPosition(): number {
        const span = Math.log(this._maxPixelsPerDay) - Math.log(this._minPixelsPerDay);
        return this._pixelsPerDay ? (Math.log(this._pixelsPerDay) - Math.log(this._minPixelsPerDay)) / span : 0;
    }

    public setPosition(position: number): void {
        const span = Math.log(this._maxPixelsPerDay) - Math.log(this._minPixelsPerDay);
        const clamped = Math.min(1, Math.max(0, position));
        this._zoomTo(Math.exp(Math.log(this._minPixelsPerDay) + clamped * span), this._getViewportCentreX());
    }

    public zoomToFit(): void {
        const range = this._schedule.getRange(this._getZoomToFitRecords());
        const viewportWidth = this._gantt.$task?.offsetWidth;
        if (!range || !viewportWidth) {
            return;
        }
        const days = Math.max(1, (+range.end - +range.start) / MILLISECONDS_PER_DAY);
        const centreX = this._getViewportCentreX();
        this._rememberAnchor(new Date((+range.start + +range.end) / 2), centreX);
        this._applyNow(viewportWidth * (1 - FIT_VIEWPORT_MARGIN) / days, centreX);
    }

    public showTask(record: IRecord): void {
        const viewportWidth = this._gantt.$task?.offsetWidth;
        const date = this._schedule.getDate(record, 'start') ?? this._schedule.getDate(record, 'end');
        const span = this._schedule.getSpan(record) ?? (date && { start: date, end: new Date(+date + MILLISECONDS_PER_DAY) });
        if (!span || !viewportWidth) {
            return;
        }
        const days = Math.max(1, (+span.end - +span.start) / MILLISECONDS_PER_DAY);
        const centreX = this._getViewportCentreX();
        this._rememberAnchor(new Date((+span.start + +span.end) / 2), centreX);
        this._applyNow(viewportWidth * (1 - FIT_VIEWPORT_MARGIN) / days, centreX);
    }

    public getPixelsPerDay(): number {
        return this._pixelsPerDay;
    }

    public isDayScaleVisible(): boolean {
        const scales = this._gantt.config.scales ?? [];
        if (scales.some(scale => scale.unit === 'day' && (scale.step ?? 1) === 1)) {
            return true;
        }
        const finest = scales[scales.length - 1];
        return finest?.unit === 'hour' && 24 % (finest.step ?? 1) === 0;
    }

    public registerScaleLabel(hook: GanttScaleLabelHook, priority?: number): () => void {
        return this._scaleLabelHooks.register(hook, priority);
    }

    /** Puts back the zoom the view was left at, or the one it was saved with, or fits the tasks. */
    public restore(): void {
        const saved = this._taskRuntime.getView()?.data?.ganttZoom;
        const pixelsPerDay = this._toPixelsPerDay(this._state.get<IGanttZoom>(ZOOM_STATE_KEY)) ?? this._toPixelsPerDay(saved?.zoom);
        if (!pixelsPerDay) {
            this.zoomToFit();
            return;
        }
        const centreX = this._getViewportCentreX();
        const anchorDate = this._state.get<string>(ANCHOR_DATE_STATE_KEY) ?? saved?.anchorDate;
        if (anchorDate) {
            this._rememberAnchor(new Date(anchorDate), centreX);
        }
        this._applyNow(pixelsPerDay, centreX);
    }

    public destroy(): void {
        this._unsaveWithView?.();
        this._detachWheel();
        if (this._frame !== undefined) {
            cancelAnimationFrame(this._frame);
        }
    }

    //batched to one render a frame, however many wheel events arrive in it
    private _zoomTo(pixelsPerDay: number, anchorX: number): void {
        this._pending = { pixelsPerDay: this._clamp(pixelsPerDay), anchorX };
        this._frame ??= requestAnimationFrame(this._flush);
    }

    private _flush = (): void => {
        this._frame = undefined;
        const pending = this._pending;
        this._pending = undefined;
        if (pending) {
            this._apply(pending.pixelsPerDay, pending.anchorX);
        }
    };

    private _applyNow(pixelsPerDay: number, anchorX: number): void {
        this._pending = undefined;
        this._apply(this._clamp(pixelsPerDay), anchorX);
    }

    //scales first, as the range is sized in their columns
    private _apply(pixelsPerDay: number, anchorX: number): void {
        if (!this._gantt.$task) {
            return;
        }
        const anchorDate = this._resolveAnchor(anchorX);
        const levelIndex = this._chooseLevel(pixelsPerDay);
        const level = this._levels[levelIndex];
        this._gantt.config.scales = level.scales;
        //whole pixels: the chart spreads a fraction over the columns, by where the range starts
        this._gantt.config.min_column_width = Math.round(pixelsPerDay * this._getLevelDays(level));
        if (anchorDate) {
            this._timeline.ensureRange(anchorDate, MILLISECONDS_PER_DAY / pixelsPerDay);
            this._timeline.renderWithDateAt(anchorDate, anchorX);
            this._rememberAnchor(anchorDate, anchorX);
            this._state.set(ANCHOR_DATE_STATE_KEY, anchorDate.toISOString());
        }
        else {
            this._timeline.executeWithScrollBlock(() => this._gantt.render());
        }
        this._pixelsPerDay = pixelsPerDay;
        this._levelIndex = levelIndex;
        this._state.set<IGanttZoom>(ZOOM_STATE_KEY, { pixelsPerDay });
        this.events.dispatchEvent('onZoomChanged');
    }

    //the finest level whose columns are still wide enough, kept until a neighbour clearly fits better
    private _chooseLevel(pixelsPerDay: number): number {
        const finestWiderThan = (minimumWidth: number) => {
            let chosen = 0;
            this._levels.forEach((level, index) => {
                if (pixelsPerDay * this._getLevelDays(level) >= minimumWidth) {
                    chosen = index;
                }
            });
            return chosen;
        };
        if (this._levelIndex < 0) {
            return finestWiderThan(MIN_COLUMN_WIDTH);
        }
        const finerIndex = finestWiderThan(MIN_COLUMN_WIDTH * FINER_LEVEL_MARGIN);
        const coarserIndex = finestWiderThan(MIN_COLUMN_WIDTH * COARSER_LEVEL_MARGIN);
        return Math.min(Math.max(this._levelIndex, finerIndex), coarserIndex);
    }

    private _getFinestScale(level: ZoomLevel): { unit: string; step: number } {
        const finest = level.scales[level.scales.length - 1];
        return { unit: finest.unit, step: finest.step ?? 1 };
    }

    //how many days a column of the level spans, on average
    private _getLevelDays(level: ZoomLevel): number {
        const { unit, step } = this._getFinestScale(level);
        return (UNIT_DAYS[unit] ?? 1) * step;
    }

    private _toPixelsPerDay(zoom: (Partial<IGanttZoom> & ILegacyZoom) | undefined): number | undefined {
        if (zoom?.pixelsPerDay) {
            return zoom.pixelsPerDay;
        }
        return zoom?.unit && zoom.columnWidth ? zoom.columnWidth / ((UNIT_DAYS[zoom.unit] ?? 1) * (zoom.step ?? 1)) : undefined;
    }

    private _clamp(pixelsPerDay: number): number {
        return Math.min(this._maxPixelsPerDay, Math.max(this._minPixelsPerDay, pixelsPerDay));
    }

    private _rememberAnchor(date: Date, x: number): void {
        this._anchorDate = date;
        this._anchorX = Math.round(x);
    }

    private _resolveAnchor(x: number): Date | undefined {
        if (this._anchorDate && this._anchorX === Math.round(x)) {
            return this._anchorDate;
        }
        return this._gantt.dateFromPos(this._gantt.getScrollState().x + x) ?? undefined;
    }

    private _getSavedZoom = (): IGanttSavedZoom | undefined => {
        return this._pixelsPerDay ? { zoom: { pixelsPerDay: this._pixelsPerDay }, anchorDate: this._state.get<string>(ANCHOR_DATE_STATE_KEY) } : undefined;
    };

    private _onGanttReady = (): boolean => {
        this._detachWheel();
        this._wheelTarget = this._gantt.$task;
        //not passive: Ctrl+wheel and a pinch would otherwise zoom the page
        this._wheelTarget?.addEventListener('wheel', this._onWheel, { passive: false });
        this._wheelTarget?.addEventListener('mousewheel', this._onLegacyWheel);
        return true;
    };

    private _detachWheel(): void {
        this._wheelTarget?.removeEventListener('wheel', this._onWheel);
        this._wheelTarget?.removeEventListener('mousewheel', this._onLegacyWheel);
    }

    //the chart scrolls on the legacy event, which cancelling `wheel` does not stop
    private _onLegacyWheel = (event: Event): void => {
        if ((event as MouseEvent).ctrlKey) {
            event.stopPropagation();
        }
    };

    private _onWheel = (event: WheelEvent): void => {
        if (!event.ctrlKey) {
            return;
        }
        //Firefox scrolls the chart on `wheel` itself
        event.stopPropagation();
        event.preventDefault();
        const delta = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * WHEEL_LINE_HEIGHT : event.deltaY;
        const current = this._pending?.pixelsPerDay ?? this._pixelsPerDay;
        if (current) {
            this._zoomTo(current * Math.exp(-delta * WHEEL_ZOOM_SPEED), this._getPointerX(event.clientX));
        }
    };

    //a scroll of the user's own picks a new date to hold
    private _onGanttScroll = (): boolean => {
        if (!this._timeline.isScrollBlocked()) {
            this._anchorDate = undefined;
            this._anchorX = undefined;
        }
        return true;
    };

    private _getZoomToFitRecords(): IRecord[] {
        const provider = this._taskRuntime.getProvider();
        const recordsMap = provider.getRecordsMap();
        const selected = provider.getSelectedRecordIds().map(recordId => recordsMap[recordId]).filter(Boolean);
        return selected.length > 0 ? selected : provider.getAllRecords();
    }

    private _getPointerX(clientX: number): number {
        const taskArea = this._gantt.$task;
        return taskArea ? clientX - taskArea.getBoundingClientRect().x : this._getViewportCentreX();
    }

    private _getViewportCentreX(): number {
        return (this._gantt.$task?.offsetWidth ?? 0) / 2;
    }

    private _withLabelHooks(scale: ZoomLevel['scales'][number], row: number): ZoomLevel['scales'][number] {
        const builtIn = scale.format as (date: Date) => string;
        const unit = scale.unit;
        const step = scale.step ?? 1;
        return {
            ...scale,
            format: (date: Date) => {
                const result = { label: builtIn(date) };
                this._scaleLabelHooks.apply(result, { date, unit, step, row });
                return result.label;
            },
        };
    }

    //labelled the way the user's settings format dates
    private _createLevels(formatting: IFormatting): ZoomLevel[] {
        const gantt = this._gantt;
        const monthNames = formatting.dateFormattingInfo.abbreviatedMonthNames;
        const dayNames = formatting.dateFormattingInfo.abbreviatedDayNames;
        const addDays = (date: Date, days: number) => gantt.date.add(date, days, 'day');
        const year = (date: Date) => String(date.getFullYear());
        const month = (date: Date) => monthNames[date.getMonth()];
        const shortDate = (date: Date) => formatting.formatDateShort(date);
        const dateSpan = (days: number) => (date: Date) => `${shortDate(date)} – ${shortDate(addDays(date, days))}`;
        const daySpan = (days: number) => (date: Date) => `${date.getDate()} – ${addDays(date, days).getDate()}`;
        const dayHeader = { unit: 'day', step: 1, format: (date: Date) => formatting.formatDateLongAbbreviated(date) };
        //the formatting's own formatTime writes the date too; the hour cycle comes from the user's pattern
        const timeFormat = new Intl.DateTimeFormat(formatting.locale, { hour: 'numeric', minute: '2-digit', hour12: !formatting.dateFormattingInfo.shortTimePattern.includes('H') });
        const time = (date: Date) => timeFormat.format(date);

        const levels: ZoomLevel[] = [
            { name: 'year-quarter', scales: [{ unit: 'year', step: 1, format: year }, { unit: 'quarter', step: 1, format: (date: Date) => `Q${Math.floor(date.getMonth() / 3) + 1}` }] },
            { name: 'year-2month', scales: [{ unit: 'year', step: 1, format: year }, { unit: 'month', step: 2, format: (date: Date) => `${month(date)} – ${month(gantt.date.add(date, 1, 'month'))}` }] },
            { name: 'year-month', scales: [{ unit: 'year', step: 1, format: year }, { unit: 'month', step: 1, format: month }] },
            { name: '8week-2week', scales: [{ unit: 'week', step: 8, format: dateSpan(55) }, { unit: 'week', step: 2, format: daySpan(13) }] },
            { name: '4week-week', scales: [{ unit: 'week', step: 4, format: dateSpan(27) }, { unit: 'week', step: 1, format: daySpan(6) }] },
            { name: '4week-4day', scales: [{ unit: 'week', step: 4, format: dateSpan(27) }, { unit: 'day', step: 4, format: daySpan(3) }] },
            { name: '2week-2day', scales: [{ unit: 'day', step: 14, format: dateSpan(13) }, { unit: 'day', step: 2, format: daySpan(1) }] },
            { name: 'week-day', scales: [{ unit: 'week', step: 1, format: dateSpan(6) }, { unit: 'day', step: 1, format: (date: Date) => `${dayNames[date.getDay()]} ${date.getDate()}` }] },
            { name: 'day-12h', scales: [dayHeader, { unit: 'hour', step: 12, format: time }] },
            { name: 'day-6h', scales: [dayHeader, { unit: 'hour', step: 6, format: time }] },
            { name: 'day-3h', scales: [dayHeader, { unit: 'hour', step: 3, format: time }] },
            { name: 'day-2h', scales: [dayHeader, { unit: 'hour', step: 2, format: time }] },
            { name: 'day-hour', scales: [dayHeader, { unit: 'hour', step: 1, format: time }] },
        ];
        return levels.map(level => ({ ...level, scales: level.scales.map((scale, row) => this._withLabelHooks(scale, row)) as ZoomLevel['scales'] }));
    }
}
