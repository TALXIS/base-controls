import type { GanttStatic } from "dhtmlx-gantt";

const WHEEL_LINE_HEIGHT = 16;

//the chart's vertical scrollbar, which its own wheel handling and dragging move
interface IGanttScrollbarInternals {
    $ui?: { getView(id: string): { $scroll_ver?: HTMLElement } | undefined };
}

/** Keeps the chart and the grid scrolled to the same rows, in the same frame. */
export class GridGanttScrollSync {
    private _gantt: GanttStatic;
    private _gridScroller: HTMLElement;
    private _chartScroller?: HTMLElement;
    private _chartArea: HTMLElement;
    //the top each side was last set to by the other, so its own echo is not sent back
    private _echoedGridTop?: number;
    private _echoedChartTop?: number;
    private _renderEventId: string;

    constructor(gantt: GanttStatic, gridScroller: HTMLElement) {
        this._gantt = gantt;
        this._gridScroller = gridScroller;
        this._chartScroller = (gantt as GanttStatic & IGanttScrollbarInternals).$ui?.getView('scrollVer')?.$scroll_ver;
        this._chartArea = gantt.$task;
        //native events: they fire in the frame the position changed, before it is painted
        this._gridScroller.addEventListener('scroll', this._onGridScroll, { passive: true });
        this._chartScroller?.addEventListener('scroll', this._onChartScroll, { passive: true });
        this._chartArea.addEventListener('wheel', this._onChartWheel, { passive: false });
        this._chartArea.addEventListener('mousewheel', this._onChartLegacyWheel);
        this._renderEventId = this._gantt.attachEvent('onGanttRender', this._matchScrollRange);
        this._matchScrollRange();
        this._scrollChartTo(this._gridScroller.scrollTop);
    }

    public destroy(): void {
        this._gridScroller.removeEventListener('scroll', this._onGridScroll);
        this._chartScroller?.removeEventListener('scroll', this._onChartScroll);
        this._chartArea.removeEventListener('wheel', this._onChartWheel);
        this._chartArea.removeEventListener('mousewheel', this._onChartLegacyWheel);
        this._gantt.detachEvent(this._renderEventId);
        this._gridScroller.style.paddingBottom = '';
    }

    //the chart's horizontal scrollbar takes from its rows' height, so it scrolls further than the grid
    private _matchScrollRange = (): void => {
        const chartScroller = this._chartScroller;
        if (!chartScroller) {
            return;
        }
        const padding = parseFloat(this._gridScroller.style.paddingBottom) || 0;
        const gridRange = this._gridScroller.scrollHeight - this._gridScroller.clientHeight - padding;
        const chartRange = chartScroller.scrollHeight - chartScroller.clientHeight;
        const missing = Math.max(0, chartRange - gridRange);
        if (missing !== padding) {
            this._gridScroller.style.paddingBottom = missing ? `${missing}px` : '';
        }
    };

    private _onGridScroll = (): void => {
        const top = this._gridScroller.scrollTop;
        if (top === this._echoedGridTop) {
            this._echoedGridTop = undefined;
            return;
        }
        this._scrollChartTo(top);
    };

    private _onChartScroll = (): void => {
        const top = this._chartScroller?.scrollTop ?? 0;
        if (top === this._echoedChartTop) {
            this._echoedChartTop = undefined;
            return;
        }
        if (this._gridScroller.scrollTop !== top) {
            this._gridScroller.scrollTop = top;
            //read back: the browser clamps to what the grid can scroll to
            this._echoedGridTop = this._gridScroller.scrollTop;
        }
    };

    private _scrollChartTo(top: number): void {
        if (this._gantt.getScrollState().y === top) {
            return;
        }
        this._gantt.scrollTo(null, top);
        this._echoedChartTop = this._chartScroller?.scrollTop;
    }

    //the grid scrolls natively, so both sides move by the browser's own steps
    private _onChartWheel = (event: WheelEvent): void => {
        if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const lineHeight = event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? this._gridScroller.clientHeight : WHEEL_LINE_HEIGHT;
        this._gridScroller.scrollTop += event.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? event.deltaY : event.deltaY * lineHeight;
    };

    //the chart scrolls itself on the legacy event, which cancelling `wheel` does not stop
    private _onChartLegacyWheel = (event: Event): void => {
        const wheel = event as WheelEvent & { wheelDeltaX?: number; wheelDeltaY?: number };
        if (!wheel.ctrlKey && Math.abs(wheel.wheelDeltaY ?? 0) >= Math.abs(wheel.wheelDeltaX ?? 0)) {
            event.stopPropagation();
        }
    };
}
