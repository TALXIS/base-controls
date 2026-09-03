import { GanttStatic } from 'gantt-trial';
import { IGanttServiceLocator } from '../services';
//by file rather than through the folder, which would import the zoom itself and close a circle back here
import { IGanttScaleLattice, snapToLattice } from '../gantt-zooming/zoomScales';

/** The rendered date range, and where in it the viewport sits. */
export interface IGanttInfiniteTimeline {
    /**
     * Sizes the rendered range to the render budget, centred on a date.
     *
     * Writes the range and renders nothing — the caller owns the render, because a zoom has to apply the
     * range and the scale it was sized for together. Left alone when the range already serves that scale.
     *
     * @param millisecondsPerPixel The scale the range is sized for: the one about to be applied, not the
     * one on screen. A range sized for what is on screen is wrong by the whole zoom step.
     * @param snapTo The lattice to put the range's start on, again the one about to be applied. The level
     * on the chart is still the old one at this point, so it cannot be read from there.
     */
    setRangeAround: (params: { date: Date, millisecondsPerPixel: number, snapTo?: IGanttScaleLattice }) => void;
    /**
     * Grows the rendered range so a span falls inside it, for a gesture the chart measures in pixels.
     *
     * Call it before the chart takes any measurement of its own - growing the range's start moves the
     * content's origin, and a coordinate taken before that means something else afterwards.
     */
    fitRangeTo: (params: { startDate: Date, endDate: Date }) => void;
    /**
     * Grows the rendered range forward so a date keeps a screenful of room ahead of it.
     *
     * For a gesture that has to be able to reach past the end of what is drawn: the chart stops scrolling
     * once the viewport reaches the end of the content, and the range only grows on a scroll, so a drag
     * towards the end would otherwise have nothing to travel into. Only the end moves - see
     * {@link IGanttInfiniteTimeline.fitRangeTo} for why the start cannot.
     */
    extendRangeEnd: (params: { date: Date }) => void;
    /**
     * Grows the rendered range backwards so a date keeps a screenful of room behind it.
     *
     * @returns How far every position on the chart moved, in pixels. The range's start is the origin
     * positions are measured from, so a gesture holding coordinates of its own has to shift them by this
     * much - otherwise what it is dragging jumps by the same amount.
     */
    extendRangeStart: (params: { date: Date }) => number;
    /** Puts the range back to the one before {@link IGanttInfiniteTimeline.fitRangeTo} grew it. */
    restoreRange: () => void;
    /** Scrolls to today, widening the range first when today is outside it. */
    jumpToToday: () => void;
    /** Runs the callback with this class's own scroll reactions suppressed. */
    executeWithScrollBlock: (callback: () => any) => void;
    /** Whether the chart is being scrolled by us rather than by the user. */
    isScrollBlocked: () => boolean;
}

export interface IGanttInfiniteTimelineParameters {
    /** Where the chart and the other parts are reached. */
    services: IGanttServiceLocator;
}

/**
 * How much of the timeline is drawn at once, and how it follows the viewport.
 *
 * The chart materialises one column per unit of time across its whole configured range, so what bounds
 * the cost of a render is the range - not the chart's own culling, which only decides how much of that
 * becomes DOM. So the range is kept to a pixel budget around wherever the user is, and grown as they
 * scroll towards either end.
 */
export class GanttInfiniteTimeline implements IGanttInfiniteTimeline {
    private static readonly _targetTimelineWidth = 5000;
    private static readonly _fallbackDragHeadroom = 30 * 86_400_000;
    /** How far a rendered range may drift from the budget before it is worth rebuilding. */
    private static readonly _budgetTolerance = 2;
    /** The scrollbar's own write echoes as a DOM event after the fact, so a block has to outlive the call. */
    private static readonly _scrollEchoWindowMs = 100;

    private _services: IGanttServiceLocator;
    private _rangeBeforeFitting?: { startDate: Date, endDate: Date };
    private _scrollBlockDepth = 0;
    private _scrollBlockedUntil = 0;

    constructor(parameters: IGanttInfiniteTimelineParameters) {
        this._services = parameters.services;
        this._registerEventListeners();
    }

    private get _gantt(): GanttStatic {
        return this._services.get('ganttChart');
    }

    public setRangeAround(params: { date: Date, millisecondsPerPixel: number, snapTo?: IGanttScaleLattice }) {
        const { date, millisecondsPerPixel, snapTo } = params;
        if (millisecondsPerPixel <= 0) {
            return;
        }
        if (this._isRangeUsableFor(params)) {
            return;
        }
        const duration = this._getBudgetWidth() * millisecondsPerPixel;
        this._gantt.config.start_date = this._snapRangeStart(new Date(+date - duration / 2), snapTo);
        this._gantt.config.end_date = new Date(+date + duration / 2);
    }

    //measured off the scale on screen, which is all `jumpToToday` needs: it does not change the zoom
    private _shrink(params: { date: Date }) {
        this.setRangeAround({ date: params.date, millisecondsPerPixel: this._getMillisecondsPerPixel() });
        this._gantt.render();
    }

    /**
     * Scrolls to today. The range is only rebuilt when today falls outside it, so the common case is a
     * plain scroll.
     */
    public jumpToToday(): void {
        const today = new Date();
        const { min_date: renderedStart, max_date: renderedEnd } = this._gantt.getState();
        this.executeWithScrollBlock(() => {
            //what is rendered is what to test against: the configured range is empty until something
            //writes it, and then every comparison against it answers no
            if (!renderedStart || !renderedEnd || +today < +renderedStart || +today > +renderedEnd) {
                this._shrink({ date: today });
            }
            this._gantt.showDate(today);
        });
    }

    public isScrollBlocked(): boolean {
        return this._scrollBlockDepth > 0 || Date.now() < this._scrollBlockedUntil;
    }

    //counted rather than flagged, so back-to-back and nested blocks cannot release each other's
    public executeWithScrollBlock(callback: () => any) {
        this._scrollBlockDepth++;
        try {
            return callback();
        } finally {
            this._scrollBlockDepth--;
            this._scrollBlockedUntil = Date.now() + GanttInfiniteTimeline._scrollEchoWindowMs;
        }
    }

    /**
     * The chart works a drag out from pixels, and a position off the rendered scale has no date at all -
     * so a bar reaching past either end of the scale cannot be dragged or resized towards that end until
     * the scale reaches it. Grown by a screenful, which is as far as one gesture can travel.
     */
    public fitRangeTo(params: { startDate: Date, endDate: Date }) {
        const { min_date: renderedStart, max_date: renderedEnd } = this._gantt.getState();
        const headroom = this._getViewportDuration();
        //a screenful either side of the bar, not just the bar: a gesture needs somewhere to drag it to
        const growStart = !!renderedStart && +params.startDate - headroom < +renderedStart;
        const growEnd = !!renderedEnd && +params.endDate + headroom > +renderedEnd;
        if (!growStart && !growEnd) {
            return;
        }
        //what is on screen rather than what is configured: the configured range can still be empty, and
        //restoring to that would hand the range back to the data instead of to the view
        this._rangeBeforeFitting ??= {
            startDate: this._gantt.config.start_date ?? renderedStart!,
            endDate: this._gantt.config.end_date ?? renderedEnd!,
        };
        if (growStart) {
            this._gantt.config.start_date = this._snapRangeStart(new Date(+params.startDate - headroom));
        }
        if (growEnd) {
            this._gantt.config.end_date = new Date(+params.endDate + headroom);
        }
        this._renderKeepingViewport();
    }

    public extendRangeEnd(params: { date: Date }) {
        const { max_date: renderedEnd } = this._gantt.getState();
        if (!renderedEnd) {
            return;
        }
        const headroom = this._getViewportDuration();
        if (+params.date + headroom <= +renderedEnd) {
            return;
        }
        this._gantt.config.end_date = new Date(+params.date + headroom * 2);
        //the range the gesture started in is gone, and putting it back would drop what it grew
        this._rangeBeforeFitting = undefined;
        this._renderKeepingViewport();
    }

    public extendRangeStart(params: { date: Date }): number {
        const { min_date: renderedStart } = this._gantt.getState();
        if (!renderedStart) {
            return 0;
        }
        const headroom = this._getViewportDuration();
        if (+params.date - headroom >= +renderedStart) {
            return 0;
        }
        //measured against a date rather than a pixel, because the pixel is what is about to move
        const reference = this._gantt.dateFromPos(this._gantt.getScrollState().x);
        const positionBefore = reference && this._gantt.posFromDate(reference);
        this._gantt.config.start_date = this._snapRangeStart(new Date(+params.date - headroom * 2));
        //the range the gesture started in is gone, and putting it back would drop what it grew
        this._rangeBeforeFitting = undefined;
        this._renderKeepingViewport();
        return reference ? this._gantt.posFromDate(reference) - positionBefore! : 0;
    }

    public restoreRange() {
        const previousRange = this._rangeBeforeFitting;
        if (!previousRange) {
            return;
        }
        this._gantt.config.start_date = this._snapRangeStart(previousRange.startDate);
        this._gantt.config.end_date = previousRange.endDate;
        this._rangeBeforeFitting = undefined;
        this._renderKeepingViewport();
    }

    /**
     * Whether the range on the chart already serves a scale, so that a zoom step can leave it alone.
     *
     * Two ways it does not: rendering it would cost too far from the budget either way, or the date being
     * zoomed around sits too close to an end for the chart to scroll it where it belongs.
     */
    private _isRangeUsableFor(params: { date: Date, millisecondsPerPixel: number }): boolean {
        const { date, millisecondsPerPixel } = params;
        const { start_date: startDate, end_date: endDate } = this._gantt.config;
        if (!startDate || !endDate) {
            return false;
        }
        const budgetWidth = this._getBudgetWidth();
        const renderedWidth = (+endDate - +startDate) / millisecondsPerPixel;
        if (renderedWidth < budgetWidth / GanttInfiniteTimeline._budgetTolerance
            || renderedWidth > budgetWidth * GanttInfiniteTimeline._budgetTolerance) {
            return false;
        }
        const viewportDuration = this._getViewportWidth() * millisecondsPerPixel;
        return +date - +startDate >= viewportDuration && +endDate - +date >= viewportDuration;
    }

    /**
     * Every range start goes through here, so the columns of whatever level is on the chart keep their
     * boundaries as the range moves - which it now does on a zoom, on a scroll and during a drag.
     *
     * @param lattice What to snap to, when the caller is about to change the level. Otherwise the level on
     * the chart answers for itself.
     */
    private _snapRangeStart(date: Date, lattice?: IGanttScaleLattice): Date {
        const snapTo = lattice ?? this._getRenderedLattice();
        return snapTo ? snapToLattice(this._gantt, date, snapTo) : date;
    }

    private _getRenderedLattice(): IGanttScaleLattice | undefined {
        const zoom = this._gantt.ext.zoom;
        const coarsest = zoom.getLevels()?.[zoom.getCurrentLevel()]?.scales?.[0];
        return coarsest && { unit: coarsest.unit, step: coarsest.step ?? 1 };
    }

    //a viewport wider than half the budget would leave nothing either side of the anchor to scroll into
    private _getBudgetWidth(): number {
        return Math.max(GanttInfiniteTimeline._targetTimelineWidth, this._getViewportWidth() * 2);
    }

    private _getViewportWidth(): number {
        return this._gantt.$task?.offsetWidth ?? 0;
    }

    //a range whose start moves takes every position on the chart with it, so the view is put back on the
    //date it was showing rather than on the pixel it was showing
    private _renderKeepingViewport() {
        const leftEdgeDate = this._gantt.dateFromPos(this._gantt.getScrollState().x);
        this.executeWithScrollBlock(() => {
            this._gantt.render();
            if (leftEdgeDate) {
                this._gantt.scrollTo(this._gantt.posFromDate(leftEdgeDate));
            }
        });
    }

    private _getMillisecondsPerPixel(): number {
        const viewportWidth = this._getViewportWidth();
        return viewportWidth ? this._getViewportDuration() / viewportWidth : 0;
    }

    private _getViewportDuration(): number {
        const leftPos = this._gantt.getScrollState().x;
        const leftDate = this._gantt.dateFromPos(leftPos);
        const rightDate = this._gantt.dateFromPos(leftPos + this._getViewportWidth());
        if (!leftDate || !rightDate) {
            return GanttInfiniteTimeline._fallbackDragHeadroom;
        }
        return +rightDate - +leftDate;
    }

    private _registerEventListeners() {
        this._gantt.attachEvent('onGanttScroll', this._onGanttScroll);
    }

    //where the scroll came from is no help in telling one of ours from the user's: the chart reports the
    //position the browser clamped it to, so at either end - where the range has to grow - a scroll that
    //went nowhere looks the same as one that did nothing
    private _onGanttScroll = () => {
        if (this.isScrollBlocked()) {
            return true;
        }
        this._onHorizontalScroll();
        return true;
    };

    private _onHorizontalScroll() {
        const unit = this._gantt.getScale().unit;
        const leftPos = this._gantt.getScrollState().x;
        const rightDate = this._gantt.dateFromPos(leftPos + this._getViewportWidth());

        this._gantt.config.start_date = this._gantt.config.start_date || this._gantt.getState().min_date;
        this._gantt.config.end_date = this._gantt.config.end_date || this._gantt.getState().max_date;

        const maxAllowedDate = this._gantt.date.add(this._gantt.config.end_date, -2, unit);

        let repaint = false;
        //a drag grows the range through `extendRangeStart`, which shifts the coordinates it holds; a
        //scroll cannot, so the near end waits until the gesture is over
        const isDragging = !!this._gantt.getState().drag_mode;
        if (!leftPos && !isDragging) {
            this._gantt.config.start_date = this._snapRangeStart(this._gantt.date.add(this._gantt.config.start_date, -2, unit));
            repaint = true;
        }
        if ((+rightDate! >= +maxAllowedDate) || !rightDate) {
            this._gantt.config.end_date = this._gantt.date.add(this._gantt.config.end_date, 2, unit);
            repaint = true;
        }
        if (repaint) {
            //deferred, so the chart can be torn down before it runs - a scroll that lands on unmount
            setTimeout(() => {
                const gantt = this._services.find('ganttChart');
                if (!gantt) {
                    return;
                }
                //blocked, or this render's own scroll restoration reads as the user asking for more range
                this.executeWithScrollBlock(() => gantt.render());
            }, 20)
        }
    }
}
