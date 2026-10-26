import type { GanttStatic } from "dhtmlx-gantt";

/** The date a run of zoom steps holds still; re-reading it from pixels each step drifts. */
export class GanttZoomAnchor {
    private _date?: Date;
    private _x?: number;

    /** @param x Pixels from the left of the visible chart. */
    public remember(date: Date, x: number): void {
        this._date = date;
        this._x = Math.round(x);
    }

    public forget(): void {
        this._date = undefined;
        this._x = undefined;
    }

    public resolve(gantt: GanttStatic, x: number): Date | undefined {
        if (this._date && this._x === Math.round(x)) {
            return this._date;
        }
        return gantt.dateFromPos(gantt.getScrollState().x + x) ?? undefined;
    }
}
