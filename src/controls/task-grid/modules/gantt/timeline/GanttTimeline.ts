import type { GanttStatic, Task } from "dhtmlx-gantt";
import { HookRegistry } from "@utils";
import type { IGanttSpan } from "../schedule/GanttSchedule";

/** The rendered date range: wide enough to scroll freely, re-centred only near its edges. */
export interface IGanttTimeline {
    /**
     * Re-centres the range on a date when it no longer leaves room around it at the current scales; renders nothing.
     * @returns Whether the range moved.
     */
    ensureRange(date: Date, millisecondsPerPixel: number): boolean;
    /** Grows the range so a span and a screenful around it fall inside; call before the chart measures a drag. */
    fitRangeTo(startDate: Date, endDate: Date): void;
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
    /** Runs the callback with the timeline's own scroll handling off. */
    executeWithScrollBlock<T>(callback: () => T): T;
    isScrollBlocked(): boolean;
    /**
     * Registers a hook over the class names of each background cell.
     * @param priority Ascending: a higher number gets the later word.
     */
    registerCellClass(hook: GanttCellClassHook, priority?: number): () => void;
    /**
     * Registers a hook over the class names of each scale cell.
     * @param priority Ascending: a higher number gets the later word.
     */
    registerScaleCellClass(hook: GanttCellClassHook, priority?: number): () => void;
}

export interface IGanttCellClassParameters {
    /** Where the cell's column starts. */
    date: Date;
}

/** Adds class names to a cell of the timeline. */
export type GanttCellClassHook = (classNames: string[], parameters: IGanttCellClassParameters) => void;

//the drag_timeline plugin scrolls to its own position, unclamped, and moves it by each pointer move
interface ITimelineDragInternals {
    _mouseDown?: boolean;
    _scrollState?: { x: number; y: number };
}

//the horizontal scrollbar adds each wheel step to the position it last scrolled to itself
interface IScrollbarInternals {
    _oldLeft?: number;
    $scroll_hor?: HTMLElement;
}

interface IDatastoreInternals {
    filter(): void;
    _skipTaskRecalculation?: boolean | string;
}

interface IGanttInternals {
    $ui?: {
        getView(id: string): ({ _timelineDragScroll?: ITimelineDragInternals | null } & IScrollbarInternals) | undefined;
    };
    $services: { getService(name: 'datastores'): string[] };
    getDatastore(name: string): IDatastoreInternals;
    $data: { tasksStore: IDatastoreInternals };
}

const MILLISECONDS_PER_DAY = 86_400_000;
//the chart lays out every column of the range on each render, but draws only the visible ones
const RANGE_COLUMNS = 2000;
const MAX_RANGE_COLUMNS = RANGE_COLUMNS * 1.5;
const MAX_RANGE_DURATION = 100 * 365.25 * MILLISECONDS_PER_DAY;
//the room kept on either side of the viewport before the range re-centres
const EDGE_MARGIN_VIEWPORTS = 8;
const FALLBACK_HEADROOM = 30 * MILLISECONDS_PER_DAY;
//the scrollbar's own write echoes as a DOM event after the call
const SCROLL_ECHO_WINDOW = 100;
//any fixed date; columns of a multi-unit step are counted from it
const LATTICE_ANCHOR = new Date(2000, 0, 1);
const MILLISECONDS_PER_UNIT: Record<string, number> = {
    hour: 3_600_000,
    day: MILLISECONDS_PER_DAY,
    week: 7 * MILLISECONDS_PER_DAY,
};

export interface IGanttTimelineParameters {
    gantt: GanttStatic;
    /** The dates the range never goes past. */
    onGetLimits: () => IGanttSpan;
}

export class GanttTimeline implements IGanttTimeline {
    private _gantt: GanttStatic;
    private _onGetLimits: () => IGanttSpan;
    private _rangeBeforeFitting?: { startDate: Date; endDate: Date };
    private _scrollBlockDepth = 0;
    private _scrollBlockedUntil = 0;
    private _isDestroyed = false;
    private _edgeFrame?: number;
    private _scrollbar?: HTMLElement;
    private _isScrollbarHeld = false;
    private _cellClassHooks = new HookRegistry<GanttCellClassHook>();
    private _scaleCellClassHooks = new HookRegistry<GanttCellClassHook>();

    constructor(parameters: IGanttTimelineParameters) {
        const { gantt } = parameters;
        this._gantt = gantt;
        this._onGetLimits = parameters.onGetLimits;
        this._gantt.templates.timeline_cell_class = (_task: Task, date: Date) => this._getClass(this._cellClassHooks, date);
        this._gantt.templates.scale_cell_class = (date: Date) => this._getClass(this._scaleCellClassHooks, date);
        //scales without a css of their own take scale_cell_class
        this._gantt.config.inherit_scale_class = true;
        this._gantt.attachEvent('onGanttScroll', this._onGanttScroll);
        this._gantt.attachEvent('onGanttReady', this._onGanttReady);
        window.addEventListener('mouseup', this._onPointerUp);
    }

    public registerCellClass(hook: GanttCellClassHook, priority?: number): () => void {
        return this._cellClassHooks.register(hook, priority);
    }

    public registerScaleCellClass(hook: GanttCellClassHook, priority?: number): () => void {
        return this._scaleCellClassHooks.register(hook, priority);
    }

    public ensureRange(date: Date, millisecondsPerPixel: number): boolean {
        const columnDuration = this._getColumnDuration(date);
        if (millisecondsPerPixel <= 0 || !columnDuration) {
            return false;
        }
        const duration = Math.min(RANGE_COLUMNS * columnDuration, MAX_RANGE_DURATION);
        const margin = Math.min(EDGE_MARGIN_VIEWPORTS * this._getViewportWidth() * millisecondsPerPixel, duration / 4);
        const { start_date: startDate, end_date: endDate } = this._gantt.config;
        const limits = this._onGetLimits();
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
                this._gantt.render();
            }
            this._gantt.showDate(today);
        });
    }

    //the chart's own scroll preservation would scroll once more, redrawing every visible row again
    public renderWithDateAt(date: Date, x: number): void {
        this.executeWithScrollBlock(() => {
            const preserveScroll = this._gantt.config.preserve_scroll;
            this._gantt.config.preserve_scroll = false;
            try {
                this._renderGeometry();
            }
            finally {
                this._gantt.config.preserve_scroll = preserveScroll;
            }
            this._gantt.scrollTo(Math.max(0, this._gantt.posFromDate(date) - x), null);
        });
    }

    public getTimelineX(clientX: number): number {
        return this._gantt.getScrollState().x + clientX - this._gantt.$root.getBoundingClientRect().left;
    }

    public isScrollBlocked(): boolean {
        return this._scrollBlockDepth > 0 || Date.now() < this._scrollBlockedUntil;
    }

    //counted, so nested blocks cannot release each other's
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

    public fitRangeTo(startDate: Date, endDate: Date): void {
        const { min_date: renderedStart, max_date: renderedEnd } = this._gantt.getState();
        const headroom = this._getViewportDuration();
        const growStart = !!renderedStart && +startDate - headroom < +renderedStart;
        const growEnd = !!renderedEnd && +endDate + headroom > +renderedEnd;
        if (!growStart && !growEnd) {
            return;
        }
        this._rangeBeforeFitting ??= {
            startDate: this._gantt.config.start_date ?? renderedStart,
            endDate: this._gantt.config.end_date ?? renderedEnd,
        };
        this._setRange(growStart ? new Date(+startDate - headroom) : undefined, growEnd ? new Date(+endDate + headroom) : undefined);
        this._renderKeepingViewport();
    }

    public extendRangeEnd(date: Date): void {
        const { max_date: renderedEnd } = this._gantt.getState();
        const headroom = this._getViewportDuration();
        if (!renderedEnd || +date + headroom <= +renderedEnd) {
            return;
        }
        this._setRange(undefined, new Date(+date + headroom * 2));
        this._rangeBeforeFitting = undefined;
        this._renderKeepingViewport();
    }

    public extendRangeStart(date: Date): number {
        const { min_date: renderedStart } = this._gantt.getState();
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
        this._setRange(previousRange.startDate, previousRange.endDate);
        this._rangeBeforeFitting = undefined;
        this._renderKeepingViewport();
    }

    public destroy(): void {
        this._isDestroyed = true;
        this._scrollbar?.removeEventListener('mousedown', this._onScrollbarDown);
        window.removeEventListener('mouseup', this._onPointerUp);
        if (this._edgeFrame !== undefined) {
            cancelAnimationFrame(this._edgeFrame);
        }
    }

    private get _internals(): IGanttInternals {
        return this._gantt as unknown as IGanttInternals;
    }

    private _getClass(hooks: HookRegistry<GanttCellClassHook>, date: Date): string {
        const classNames: string[] = [];
        hooks.apply(classNames, { date });
        return classNames.join(' ');
    }

    //a render refilters every store and recalculates summary tasks, which a change of scale or range leaves as it was
    private _renderGeometry(): void {
        const internals = this._internals;
        const stores = internals.$services.getService('datastores').map(name => internals.getDatastore(name));
        const ownFilters = stores.map(store => Object.prototype.hasOwnProperty.call(store, 'filter') ? store.filter : undefined);
        stores.forEach(store => store.filter = () => { });
        internals.$data.tasksStore._skipTaskRecalculation = true;
        try {
            this._gantt.render();
        }
        finally {
            stores.forEach((store, index) => {
                const ownFilter = ownFilters[index];
                if (ownFilter) {
                    store.filter = ownFilter;
                }
                else {
                    delete (store as Partial<IDatastoreInternals>).filter;
                }
            });
            internals.$data.tasksStore._skipTaskRecalculation = false;
        }
    }

    private _setRange(startDate: Date | undefined, endDate: Date | undefined): void {
        const limits = this._onGetLimits();
        if (startDate) {
            this._gantt.config.start_date = this._snapRangeStart(new Date(Math.max(+startDate, +limits.start)));
        }
        if (endDate) {
            this._gantt.config.end_date = new Date(Math.min(+endDate, +limits.end));
        }
    }

    //on the lattice of the coarsest scale, so columns keep their boundaries as the range moves
    private _snapRangeStart(date: Date): Date {
        const coarsest = this._gantt.config.scales?.[0];
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
        return this._gantt.date.add(anchor, Math.floor(unitsSinceAnchor / step) * step, coarsest.unit);
    }

    private _getUnitStart(unit: string, date: Date): Date {
        switch (unit) {
            case 'hour': return this._gantt.date.hour_start(date);
            case 'week': return this._gantt.date.week_start(date);
            case 'month': return this._gantt.date.month_start(date);
            case 'quarter': return this._gantt.date.quarter_start(date);
            case 'year': return this._gantt.date.year_start(date);
            default: return this._gantt.date.day_start(date);
        }
    }

    //measured near a date, as months and years vary in length
    private _getColumnDuration(near: Date): number {
        const scales = this._gantt.config.scales ?? [];
        const finest = scales[scales.length - 1];
        return finest ? +this._gantt.date.add(near, finest.step ?? 1, finest.unit) - +near : 0;
    }

    private _getViewportWidth(): number {
        return this._gantt.$task?.offsetWidth ?? 0;
    }

    /**
     * Renders, then scrolls back so the date at the left edge stays where it was.
     * @returns How far every position on the chart moved, in pixels.
     */
    private _renderKeepingViewport(): number {
        const scrollBefore = this._gantt.getScrollState().x;
        const leftEdgeDate = this._gantt.dateFromPos(scrollBefore);
        if (!leftEdgeDate) {
            this.executeWithScrollBlock(() => this._gantt.render());
            return 0;
        }
        this.renderWithDateAt(leftEdgeDate, 0);
        const offset = this._gantt.getScrollState().x - scrollBefore;
        this._shiftTimelineDrag(offset);
        return offset;
    }

    //in place: a scroll the drag plugin has queued holds the same object
    private _shiftTimelineDrag(offset: number): void {
        const drag = this._internals.$ui?.getView('timeline')?._timelineDragScroll;
        if (drag?._mouseDown && drag._scrollState && offset) {
            drag._scrollState.x += offset;
        }
    }

    private _getMillisecondsPerPixel(): number {
        const viewportWidth = this._getViewportWidth();
        return viewportWidth ? this._getViewportDuration() / viewportWidth : 0;
    }

    private _getViewportDuration(): number {
        const left = this._gantt.getScrollState().x;
        const leftDate = this._gantt.dateFromPos(left);
        const rightDate = this._gantt.dateFromPos(left + this._getViewportWidth());
        return leftDate && rightDate ? +rightDate - +leftDate : FALLBACK_HEADROOM;
    }

    //not held back by a scroll block: at the very edge no further scroll event would come
    private _onGanttScroll = (): boolean => {
        //whoever scrolled, the next wheel step goes on from here
        const scrollbar = this._internals.$ui?.getView('scrollHor');
        if (scrollbar?.$scroll_hor) {
            scrollbar._oldLeft = scrollbar.$scroll_hor.scrollLeft;
        }
        if (!this._gantt.getState().drag_mode) {
            this._edgeFrame ??= requestAnimationFrame(this._recentreNearEdge);
        }
        return true;
    };

    //the browser moves a held thumb to the pointer, which would undo a re-centre on the next move
    private _onGanttReady = (): boolean => {
        this._scrollbar?.removeEventListener('mousedown', this._onScrollbarDown);
        this._scrollbar = this._internals.$ui?.getView('scrollHor')?.$scroll_hor;
        this._scrollbar?.addEventListener('mousedown', this._onScrollbarDown);
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
        if (this._isDestroyed || this._isScrollbarHeld || !this._gantt.$task) {
            return;
        }
        const centre = this._gantt.dateFromPos(this._gantt.getScrollState().x + this._getViewportWidth() / 2);
        if (centre && this.ensureRange(centre, this._getMillisecondsPerPixel())) {
            this._renderKeepingViewport();
        }
    };
}
