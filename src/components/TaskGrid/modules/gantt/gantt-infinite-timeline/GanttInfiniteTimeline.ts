import { GanttStatic } from 'gantt-trial';
import { IGanttServiceLocator } from '../services';

/** The rendered date range, and where in it the viewport sits. */
export interface IGanttInfiniteTimeline {
    /** Rebuilds the rendered range around a date, keeping the visible span. */
    shrink: (params: { date: Date }) => void;
    /** Scrolls to today, widening the range first when today is outside it. */
    jumpToToday: () => void;
    /** Runs the callback with this class's own scroll reactions suppressed. */
    executeWithScrollBlock: (callback: () => any) => void;
    /** Whether a scroll right now is one of ours rather than the user's. */
    isScrollBlocked: () => boolean;
}

export interface IGanttInfiniteTimelineParameters {
    /** Where the chart and the other parts are reached. */
    services: IGanttServiceLocator;
}

export class GanttInfiniteTimeline implements IGanttInfiniteTimeline {
    private static readonly _targetTimelineWidth = 5000;

    private _services: IGanttServiceLocator;
    private _blockScrollHandler = false;
    private _isLayoutReady = true;

    constructor(parameters: IGanttInfiniteTimelineParameters) {
        this._services = parameters.services;
        this._registerEventListeners();
    }

    private get _gantt(): GanttStatic {
        return this._services.get('ganttChart');
    }

    /**
     * Scrolls to today. The range is only rebuilt when today falls outside it, so the common case is a
     * plain scroll.
     */
    public jumpToToday(): void {
        const today = new Date();
        if (today > this._gantt.config.end_date! || today < this._gantt.config.start_date!) {
            this.shrink({ date: today });
        }
        this._gantt.showDate(today);
    }

    public isScrollBlocked(): boolean {
        return this._blockScrollHandler;
    }

    public executeWithScrollBlock(callback: () => any) {
        this._blockScrollHandler = true;
        try {
            return callback();
        } finally {
            setTimeout(() => {
                this._blockScrollHandler = false;
            }, 100);
        }
    }

    public shrink(params: { date: Date }) {
        const { date: anchorDate } = params;
        const scrollState = this._gantt.getScrollState();
        const viewportWidth = this._gantt.$task?.offsetWidth ?? 0;
        const leftPos = scrollState.x;
        const currentLeftDate = this._gantt.dateFromPos(leftPos);
        const currentRightDate = this._gantt.dateFromPos(leftPos + viewportWidth);
        //positions only map to dates once a scale has been rendered; an unrenderable range would be worse
        //than no rebuild at all
        if (!currentLeftDate || !currentRightDate || !viewportWidth) {
            return;
        }
        const visibleDuration = +currentRightDate - +currentLeftDate;

        const left_date = new Date(+anchorDate - visibleDuration / 2)
        const right_date = new Date(+anchorDate + visibleDuration / 2);
        const targetDuration = visibleDuration * (GanttInfiniteTimeline._targetTimelineWidth / viewportWidth);
        const start_date = new Date(+left_date - ((targetDuration - visibleDuration) / 2));
        start_date.setHours(0, 0, 0, 0);
        const end_date = new Date(+right_date + ((targetDuration - visibleDuration) / 2));

        this._gantt.config.start_date = start_date;
        this._gantt.config.end_date = end_date;
        this._gantt.render();
    }


    private _registerEventListeners() {
        this._gantt.attachEvent('onGanttScroll', (left: number, _top: number) => {
            if (this._blockScrollHandler || !this._isLayoutReady) return;
            this._onHorizontalScroll();
        });
        this._gantt.attachEvent('onGanttReady', () => {
            setTimeout(() => {
                this._isLayoutReady = true;
            }, 1000);
            return true;
        });
    }

    private _onHorizontalScroll() {
        const unit = this._gantt.getScale().unit;
        const leftPos = this._gantt.getScrollState().x;
        const left_date = this._gantt.dateFromPos(leftPos)
        const right_date = this._gantt.dateFromPos(leftPos + this._gantt.$task.offsetWidth);

        this._gantt.config.start_date = this._gantt.config.start_date || this._gantt.getState().min_date;
        this._gantt.config.end_date = this._gantt.config.end_date || this._gantt.getState().max_date;

        const max_allowed_date = this._gantt.date.add(this._gantt.config.end_date, -2, unit);

        let repaint = false;
        if (!leftPos) {
            const startDate = this._gantt.date.add(this._gantt.config.start_date, -2, unit);
            startDate.setHours(0, 0, 0, 0);
            this._gantt.config.start_date = startDate;
            repaint = true;
        }
        if ((+right_date >= +max_allowed_date) || !right_date) {
            this._gantt.config.end_date = this._gantt.date.add(this._gantt.config.end_date, 2, unit);
            repaint = true;
        }
        if (repaint) {
            //deferred, so the chart can be torn down before it runs - a scroll that lands on unmount
            setTimeout(() => {
                this._services.find('ganttChart')?.render();
            }, 20)
        }
    }
}
