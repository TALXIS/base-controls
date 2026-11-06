import type { GanttStatic, Task } from "dhtmlx-gantt";
import { HookRegistry, IHookPoint } from "@core";
import { DAYS_PER_UNIT, IGanttSpan, MILLISECONDS_PER_DAY, MILLISECONDS_PER_HOUR, MILLISECONDS_PER_WEEK } from "../schedule";
import { getHorizontalScrollbar, renderGeometry, shiftTimelineDrag, syncWheelScrollOrigin } from "../chart";

export interface IGanttTimelineHooks {
    /** The class names of each background cell. */
    readonly cellClass: IHookPoint<GanttCellClassHook>;
    /** The class names of each scale cell. */
    readonly scaleCellClass: IHookPoint<GanttScaleCellClassHook>;
}

/** The rendered date range: wide enough to scroll freely, re-centred only near its edges. */
export interface IGanttTimeline {
    /**
     * Re-centres the range around a date that lacks room, without rendering.
     * @returns Whether the range moved.
     */
    ensureRange(date: Date, millisecondsPerPixel: number): boolean;
    /** Grows the range to hold a span and a screenful around it. */
    fitRangeTo(span: IGanttSpan): void;
    /** Grows the range forward so a date keeps a screenful ahead of it. */
    extendRangeEnd(date: Date): void;
    /**
     * Grows the range backwards so a date keeps a screenful behind it.
     * @returns How far every position on the chart moved, in pixels.
     */
    extendRangeStart(date: Date): number;
    /** Puts back the range `fitRangeTo` grew. */
    restoreRange(): void;
    jumpToToday(): void;
    /** Renders, then scrolls so a date sits that many pixels from the viewport's left edge. */
    renderWithDateAt(date: Date, x: number): void;
    /** A client x as a position on the timeline, so it stays put while the chart scrolls. */
    getTimelineX(clientX: number): number;
    /** How wide the visible part of the timeline is, in pixels. */
    getViewportWidth(): number;
    /** Runs the callback with the timeline's own scroll handling off. */
    executeWithScrollBlock<T>(callback: () => T): T;
    isScrollBlocked(): boolean;
    readonly hooks: IGanttTimelineHooks;
}

export interface IGanttCellClassHookParameters {
    /** Where the cell's column starts. */
    date: Date;
}

/** Adds class names to a cell of the timeline. */
export type GanttCellClassHook = (classNames: string[], parameters: IGanttCellClassHookParameters) => void;

export type GanttScaleCellClassHook = (classNames: string[], parameters: IGanttCellClassHookParameters) => void;

//the chart lays out every column of the range on each render
const RANGE_COLUMNS = 2000;
const MAX_RANGE_COLUMNS = RANGE_COLUMNS * 1.5;
const MAX_RANGE_DURATION = 100 * DAYS_PER_UNIT.year * MILLISECONDS_PER_DAY;
//the room kept on either side of the viewport before the range re-centres
const EDGE_MARGIN_VIEWPORTS = 8;
const FALLBACK_HEADROOM = 30 * MILLISECONDS_PER_DAY;
//the scrollbar's own write echoes as a DOM event after the call
const SCROLL_ECHO_WINDOW = 100;
//columns of a multi-unit step are counted from this date
const LATTICE_ANCHOR = new Date(2000, 0, 1);
const MILLISECONDS_PER_UNIT: Record<string, number> = {
    hour: MILLISECONDS_PER_HOUR,
    day: MILLISECONDS_PER_DAY,
    week: MILLISECONDS_PER_WEEK,
};

export interface IGanttTimelineParameters {
    chart: GanttStatic;
    /** The dates the range never goes past. */
    getLimits: () => IGanttSpan;
}

export class GanttTimeline implements IGanttTimeline {
    private _chart: GanttStatic;
    private _getLimits: () => IGanttSpan;
    private _rangeBeforeFitting?: IGanttSpan;
    private _scrollBlockDepth = 0;
    private _scrollBlockedUntil = 0;
    private _isDestroyed = false;
    private _edgeFrame?: number;
    private _view?: Window;
    private _isScrollbarHeld = false;
    public readonly hooks = {
        cellClass: new HookRegistry<GanttCellClassHook>(),
        scaleCellClass: new HookRegistry<GanttScaleCellClassHook>(),
    };

    constructor(parameters: IGanttTimelineParameters) {
        this._chart = parameters.chart;
        this._getLimits = parameters.getLimits;
        this._chart.templates.timeline_cell_class = (_task: Task, date: Date) => this._getClass(this.hooks.cellClass, date);
        this._chart.templates.scale_cell_class = (date: Date) => this._getClass(this.hooks.scaleCellClass, date);
        //scales without a css of their own take scale_cell_class
        this._chart.config.inherit_scale_class = true;
        this._chart.attachEvent('onGanttScroll', this._onGanttScroll);
        this._chart.attachEvent('onGanttReady', this._onGanttReady);
    }

    public ensureRange(date: Date, millisecondsPerPixel: number): boolean {
        const columnDuration = this._getColumnDuration(date);
        if (millisecondsPerPixel <= 0 || !columnDuration) {
            return false;
        }
        const duration = Math.min(RANGE_COLUMNS * columnDuration, MAX_RANGE_DURATION);
        const margin = Math.min(EDGE_MARGIN_VIEWPORTS * this.getViewportWidth() * millisecondsPerPixel, duration / 4);
        const { start_date: startDate, end_date: endDate } = this._chart.config;
        const limits = this._getLimits();
        //a side clamped to its limit has all the room it can get
        const isUsable = !!startDate && !!endDate
            && (+date - +startDate >= margin || +startDate <= +this._snapRangeStart(limits.start))
            && (+endDate - +date >= margin || +endDate >= +limits.end)
            && (+endDate - +startDate) / columnDuration <= MAX_RANGE_COLUMNS;
        if (isUsable) {
            return false;
        }
        this._setRange(new Date(+date - duration / 2), new Date(+date + duration / 2));
        this._rangeBeforeFitting = undefined;
        return true;
    }

    public jumpToToday(): void {
        const today = new Date();
        this.executeWithScrollBlock(() => {
            if (this.ensureRange(today, this._getMillisecondsPerPixel())) {
                this._chart.render();
            }
            this._chart.showDate(today);
        });
    }

    //the chart's own scroll preservation would redraw every visible row again
    public renderWithDateAt(date: Date, x: number): void {
        this.executeWithScrollBlock(() => {
            const preserveScroll = this._chart.config.preserve_scroll;
            this._chart.config.preserve_scroll = false;
            try {
                renderGeometry(this._chart);
            }
            finally {
                this._chart.config.preserve_scroll = preserveScroll;
            }
            this._chart.scrollTo(Math.max(0, this._chart.posFromDate(date) - x), null);
        });
    }

    public getTimelineX(clientX: number): number {
        return this._chart.getScrollState().x + clientX - this._chart.$root.getBoundingClientRect().left;
    }

    public getViewportWidth(): number {
        return this._chart.$task?.offsetWidth ?? 0;
    }

    public isScrollBlocked(): boolean {
        return this._scrollBlockDepth > 0 || Date.now() < this._scrollBlockedUntil;
    }

    //counted so nested blocks cannot release each other's
    public executeWithScrollBlock<T>(callback: () => T): T {
        this._scrollBlockDepth++;
        try {
            return callback();
        }
        finally {
            this._scrollBlockDepth--;
            this._scrollBlockedUntil = Date.now() + SCROLL_ECHO_WINDOW;
        }
    }

    public fitRangeTo(span: IGanttSpan): void {
        const { min_date: renderedStart, max_date: renderedEnd } = this._chart.getState();
        const headroom = this._getViewportDuration();
        const growStart = !!renderedStart && +span.start - headroom < +renderedStart;
        const growEnd = !!renderedEnd && +span.end + headroom > +renderedEnd;
        if (!growStart && !growEnd) {
            return;
        }
        this._rangeBeforeFitting ??= {
            start: this._chart.config.start_date ?? renderedStart,
            end: this._chart.config.end_date ?? renderedEnd,
        };
        this._setRange(growStart ? new Date(+span.start - headroom) : undefined, growEnd ? new Date(+span.end + headroom) : undefined);
        this._renderKeepingViewport();
    }

    public extendRangeEnd(date: Date): void {
        const { max_date: renderedEnd } = this._chart.getState();
        const headroom = this._getViewportDuration();
        if (!renderedEnd || +date + headroom <= +renderedEnd) {
            return;
        }
        this._setRange(undefined, new Date(+date + headroom * 2));
        this._rangeBeforeFitting = undefined;
        this._renderKeepingViewport();
    }

    public extendRangeStart(date: Date): number {
        const { min_date: renderedStart } = this._chart.getState();
        const headroom = this._getViewportDuration();
        if (!renderedStart || +date - headroom >= +renderedStart) {
            return 0;
        }
        this._setRange(new Date(+date - headroom * 2), undefined);
        this._rangeBeforeFitting = undefined;
        return this._renderKeepingViewport();
    }

    public restoreRange(): void {
        const previousRange = this._rangeBeforeFitting;
        if (!previousRange) {
            return;
        }
        this._setRange(previousRange.start, previousRange.end);
        this._rangeBeforeFitting = undefined;
        this._renderKeepingViewport();
    }

    public destroy(): void {
        this._isDestroyed = true;
        this._view?.removeEventListener('mouseup', this._onPointerUp);
        if (this._edgeFrame !== undefined) {
            cancelAnimationFrame(this._edgeFrame);
        }
    }

    private _getClass(hooks: HookRegistry<GanttCellClassHook>, date: Date): string {
        const classNames: string[] = [];
        hooks.apply(classNames, { date });
        return classNames.join(' ');
    }

    private _setRange(startDate: Date | undefined, endDate: Date | undefined): void {
        const limits = this._getLimits();
        if (startDate) {
            this._chart.config.start_date = this._snapRangeStart(new Date(Math.max(+startDate, +limits.start)));
        }
        if (endDate) {
            this._chart.config.end_date = new Date(Math.min(+endDate, +limits.end));
        }
    }

    //snapped to the coarsest scale's lattice so columns keep their boundaries as the range moves
    private _snapRangeStart(date: Date): Date {
        const coarsest = this._chart.config.scales?.[0];
        if (!coarsest) {
            return date;
        }
        const step = coarsest.step ?? 1;
        const unitStart = this._getUnitStart(coarsest.unit, date);
        const unitDuration = MILLISECONDS_PER_UNIT[coarsest.unit];
        if (step === 1 || !unitDuration) {
            return unitStart;
        }
        const anchor = this._getUnitStart(coarsest.unit, LATTICE_ANCHOR);
        //rounded: a local day is not always 24 hours
        const unitsSinceAnchor = Math.round((+unitStart - +anchor) / unitDuration);
        return this._chart.date.add(anchor, Math.floor(unitsSinceAnchor / step) * step, coarsest.unit);
    }

    private _getUnitStart(unit: string, date: Date): Date {
        switch (unit) {
            case 'hour': return this._chart.date.hour_start(date);
            case 'week': return this._chart.date.week_start(date);
            case 'month': return this._chart.date.month_start(date);
            case 'quarter': return this._chart.date.quarter_start(date);
            case 'year': return this._chart.date.year_start(date);
            default: return this._chart.date.day_start(date);
        }
    }

    //months and years vary in length
    private _getColumnDuration(near: Date): number {
        const scales = this._chart.config.scales ?? [];
        const finest = scales[scales.length - 1];
        return finest ? +this._chart.date.add(near, finest.step ?? 1, finest.unit) - +near : 0;
    }

    //returns how far every position on the chart moved, in pixels
    private _renderKeepingViewport(): number {
        const scrollBefore = this._chart.getScrollState().x;
        const leftEdgeDate = this._chart.dateFromPos(scrollBefore);
        if (!leftEdgeDate) {
            this.executeWithScrollBlock(() => this._chart.render());
            return 0;
        }
        this.renderWithDateAt(leftEdgeDate, 0);
        const offset = this._chart.getScrollState().x - scrollBefore;
        shiftTimelineDrag(this._chart, offset);
        return offset;
    }

    private _getMillisecondsPerPixel(): number {
        const viewportWidth = this.getViewportWidth();
        return viewportWidth ? this._getViewportDuration() / viewportWidth : 0;
    }

    private _getViewportDuration(): number {
        const left = this._chart.getScrollState().x;
        const leftDate = this._chart.dateFromPos(left);
        const rightDate = this._chart.dateFromPos(left + this.getViewportWidth());
        return leftDate && rightDate ? +rightDate - +leftDate : FALLBACK_HEADROOM;
    }

    //runs even under a scroll block since no scroll event follows at the very edge
    private _onGanttScroll = (): boolean => {
        syncWheelScrollOrigin(this._chart);
        if (!this._chart.getState().drag_mode) {
            this._edgeFrame ??= requestAnimationFrame(this._recentreNearEdge);
        }
        return true;
    };

    //a held thumb follows the pointer and would undo a re-centre
    private _onGanttReady = (): boolean => {
        this._view = this._chart.$root.ownerDocument.defaultView ?? undefined;
        getHorizontalScrollbar(this._chart)?.addEventListener('mousedown', this._onScrollbarDown);
        this._view?.addEventListener('mouseup', this._onPointerUp);
        return true;
    };

    private _onScrollbarDown = (): void => {
        this._isScrollbarHeld = true;
    };

    private _onPointerUp = (): void => {
        if (this._isScrollbarHeld) {
            this._isScrollbarHeld = false;
            this._edgeFrame ??= requestAnimationFrame(this._recentreNearEdge);
        }
    };

    private _recentreNearEdge = (): void => {
        this._edgeFrame = undefined;
        if (this._isDestroyed || this._isScrollbarHeld || !this._chart.$task) {
            return;
        }
        const centre = this._chart.dateFromPos(this._chart.getScrollState().x + this.getViewportWidth() / 2);
        if (centre && this.ensureRange(centre, this._getMillisecondsPerPixel())) {
            this._renderKeepingViewport();
        }
    };
}
