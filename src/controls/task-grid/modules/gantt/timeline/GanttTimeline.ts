import type { GanttStatic, Task } from "dhtmlx-gantt";
import { IGanttScale, isDayScaleVisible, snapToLattice } from "../zooming/zoomScales";
import { GANTT_WEEKEND_CLASS } from "../chart/classNames";
import { isWeekend } from "../dates/isWeekend";

/** The rendered date range, kept to a pixel budget around what is on screen. */
export interface IGanttTimeline {
    /** Sizes the range for a scale about to be applied, centred on a date; renders nothing. */
    setRangeAround(date: Date, millisecondsPerPixel: number, snapTo?: IGanttScale): void;
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
    /** Runs the callback with the timeline's own scroll handling off. */
    executeWithScrollBlock<T>(callback: () => T): T;
    isScrollBlocked(): boolean;
}

//the chart builds a column per unit across its whole range, so the range bounds a render
const TARGET_TIMELINE_WIDTH = 5000;
const FALLBACK_HEADROOM = 30 * 86_400_000;
const BUDGET_TOLERANCE = 2;
//the scrollbar's own write echoes as a DOM event after the call
const SCROLL_ECHO_WINDOW = 100;

export class GanttTimeline implements IGanttTimeline {
    private _gantt: GanttStatic;
    private _rangeBeforeFitting?: { startDate: Date; endDate: Date };
    private _scrollBlockDepth = 0;
    private _scrollBlockedUntil = 0;
    private _isDestroyed = false;

    constructor(gantt: GanttStatic) {
        this._gantt = gantt;
        this._gantt.templates.timeline_cell_class = (_task: Task, date: Date) => isWeekend(date) && isDayScaleVisible(gantt) ? GANTT_WEEKEND_CLASS : '';
        this._gantt.attachEvent('onGanttScroll', this._onGanttScroll);
    }

    public setRangeAround(date: Date, millisecondsPerPixel: number, snapTo?: IGanttScale): void {
        if (millisecondsPerPixel <= 0 || this._isRangeUsableFor(date, millisecondsPerPixel)) {
            return;
        }
        const duration = this._getBudgetWidth() * millisecondsPerPixel;
        this._gantt.config.start_date = this._snapRangeStart(new Date(+date - duration / 2), snapTo);
        this._gantt.config.end_date = new Date(+date + duration / 2);
    }

    public jumpToToday(): void {
        const today = new Date();
        const { min_date: renderedStart, max_date: renderedEnd } = this._gantt.getState();
        this.executeWithScrollBlock(() => {
            if (!renderedStart || !renderedEnd || today < renderedStart || today > renderedEnd) {
                this.setRangeAround(today, this._getMillisecondsPerPixel());
                this._gantt.render();
            }
            this._gantt.showDate(today);
        });
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
        if (growStart) {
            this._gantt.config.start_date = this._snapRangeStart(new Date(+startDate - headroom));
        }
        if (growEnd) {
            this._gantt.config.end_date = new Date(+endDate + headroom);
        }
        this._renderKeepingViewport();
    }

    public extendRangeEnd(date: Date): void {
        const { max_date: renderedEnd } = this._gantt.getState();
        const headroom = this._getViewportDuration();
        if (!renderedEnd || +date + headroom <= +renderedEnd) {
            return;
        }
        this._gantt.config.end_date = new Date(+date + headroom * 2);
        this._rangeBeforeFitting = undefined;
        this._renderKeepingViewport();
    }

    public extendRangeStart(date: Date): number {
        const { min_date: renderedStart } = this._gantt.getState();
        const headroom = this._getViewportDuration();
        if (!renderedStart || +date - headroom >= +renderedStart) {
            return 0;
        }
        //measured by a date, as the pixel is what moves
        const reference = this._gantt.dateFromPos(this._gantt.getScrollState().x);
        const positionBefore = reference ? this._gantt.posFromDate(reference) : 0;
        this._gantt.config.start_date = this._snapRangeStart(new Date(+date - headroom * 2));
        this._rangeBeforeFitting = undefined;
        this._renderKeepingViewport();
        return reference ? this._gantt.posFromDate(reference) - positionBefore : 0;
    }

    public restoreRange(): void {
        const previousRange = this._rangeBeforeFitting;
        if (!previousRange) {
            return;
        }
        this._gantt.config.start_date = this._snapRangeStart(previousRange.startDate);
        this._gantt.config.end_date = previousRange.endDate;
        this._rangeBeforeFitting = undefined;
        this._renderKeepingViewport();
    }

    public destroy(): void {
        this._isDestroyed = true;
    }

    private _isRangeUsableFor(date: Date, millisecondsPerPixel: number): boolean {
        const { start_date: startDate, end_date: endDate } = this._gantt.config;
        if (!startDate || !endDate) {
            return false;
        }
        const budgetWidth = this._getBudgetWidth();
        const renderedWidth = (+endDate - +startDate) / millisecondsPerPixel;
        if (renderedWidth < budgetWidth / BUDGET_TOLERANCE || renderedWidth > budgetWidth * BUDGET_TOLERANCE) {
            return false;
        }
        const viewportDuration = this._getViewportWidth() * millisecondsPerPixel;
        return +date - +startDate >= viewportDuration && +endDate - +date >= viewportDuration;
    }

    //on the lattice, so columns keep their boundaries as the range moves
    private _snapRangeStart(date: Date, lattice?: IGanttScale): Date {
        const snapTo = lattice ?? this._getRenderedLattice();
        return snapTo ? snapToLattice(this._gantt, date, snapTo) : date;
    }

    private _getRenderedLattice(): IGanttScale | undefined {
        const zoom = this._gantt.ext.zoom;
        const coarsest = zoom.getLevels()?.[zoom.getCurrentLevel()]?.scales?.[0];
        return coarsest && { unit: coarsest.unit, step: coarsest.step ?? 1 };
    }

    private _getBudgetWidth(): number {
        return Math.max(TARGET_TIMELINE_WIDTH, this._getViewportWidth() * 2);
    }

    private _getViewportWidth(): number {
        return this._gantt.$task?.offsetWidth ?? 0;
    }

    //a moved range start moves every position, so the view is put back on its date
    private _renderKeepingViewport(): void {
        const leftEdgeDate = this._gantt.dateFromPos(this._gantt.getScrollState().x);
        this.executeWithScrollBlock(() => {
            this._gantt.render();
            if (leftEdgeDate) {
                this._gantt.scrollTo(this._gantt.posFromDate(leftEdgeDate), null);
            }
        });
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

    private _onGanttScroll = (): boolean => {
        if (!this.isScrollBlocked()) {
            this._growAtEdges();
        }
        return true;
    };

    private _growAtEdges(): void {
        const gantt = this._gantt;
        const unit = gantt.getScale().unit;
        const left = gantt.getScrollState().x;
        const rightDate = gantt.dateFromPos(left + this._getViewportWidth());
        gantt.config.start_date ??= gantt.getState().min_date;
        gantt.config.end_date ??= gantt.getState().max_date;
        const maxAllowedDate = gantt.date.add(gantt.config.end_date, -2, unit);
        let shouldRender = false;
        //a drag grows the start through `extendRangeStart`, which shifts its coordinates
        if (!left && !gantt.getState().drag_mode) {
            gantt.config.start_date = this._snapRangeStart(gantt.date.add(gantt.config.start_date, -2, unit));
            shouldRender = true;
        }
        if (!rightDate || rightDate >= maxAllowedDate) {
            gantt.config.end_date = gantt.date.add(gantt.config.end_date, 2, unit);
            shouldRender = true;
        }
        if (shouldRender) {
            //deferred past the scroll; the chart may be gone by then
            setTimeout(() => {
                if (!this._isDestroyed) {
                    this.executeWithScrollBlock(() => gantt.render());
                }
            }, 20);
        }
    }
}
