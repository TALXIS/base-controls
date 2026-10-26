import type { GanttStatic } from "dhtmlx-gantt";
import type { BodyScrollEvent, GridApi } from "ag-grid-community";
import type { IRecord } from "@talxis/client-libraries";
import type { IGridViewport } from "@controls/grid";

//below a pixel the two sides agree; this is also what stops each side echoing the other
const SCROLL_TOLERANCE = 1;

/** Keeps the chart and the grid scrolled to the same rows. */
export class GridGanttScrollSync {
    private _gantt: GanttStatic;
    private _gridApi: GridApi<IRecord>;
    private _viewport: IGridViewport;
    private _eventId: string;
    private _chartTop = 0;

    constructor(gantt: GanttStatic, gridApi: GridApi<IRecord>, viewport: IGridViewport) {
        this._gantt = gantt;
        this._gridApi = gridApi;
        this._viewport = viewport;
        this._gridApi.addEventListener('bodyScroll', this._onGridScroll);
        this._eventId = this._gantt.attachEvent('onGanttScroll', this._onGanttScroll);
        this._gantt.scrollTo(null, this._viewport.getScrollTop());
        this._chartTop = this._gantt.getScrollState().y;
    }

    public destroy(): void {
        if (!this._gridApi.isDestroyed()) {
            this._gridApi.removeEventListener('bodyScroll', this._onGridScroll);
        }
        this._gantt.detachEvent(this._eventId);
    }

    private _onGridScroll = (event: BodyScrollEvent<IRecord>): void => {
        if (event.direction === 'vertical' && Math.abs(this._gantt.getScrollState().y - event.top) > SCROLL_TOLERANCE) {
            this._gantt.scrollTo(null, event.top);
        }
    };

    //the event's arguments are the old position when the scrollbar is dragged
    private _onGanttScroll = (): boolean => {
        const top = this._gantt.getScrollState().y;
        //a horizontal scroll would push the chart's stale top onto a grid that just moved
        if (top === this._chartTop) {
            return true;
        }
        this._chartTop = top;
        if (Math.abs(this._viewport.getScrollTop() - top) > SCROLL_TOLERANCE) {
            this._viewport.setScrollTop(top);
        }
        return true;
    };
}
