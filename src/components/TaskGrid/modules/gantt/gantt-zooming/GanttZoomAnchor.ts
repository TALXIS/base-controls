import { GanttStatic } from "gantt-trial";

/**
 * The date a zoom holds still, and where it is held.
 *
 * Remembered across a run of zoom steps rather than read from the chart each time: the chart works the
 * date out from pixels and lands the scroll on a whole one, so re-deriving it every step drifts — over a
 * wheel spin by days, and a zoom in and back out stops coming home. Dropped when the user scrolls, or
 * when the pointer moves to a different position, because either is them choosing a new date to hold.
 */
export class GanttZoomAnchor {
    private _date?: Date;
    private _x?: number;

    /** @param x Where the date is held, in pixels from the left of the visible chart. */
    public remember(date: Date, x: number): void {
        this._date = date;
        this._x = Math.round(x);
    }

    public forget(): void {
        this._date = undefined;
        this._x = undefined;
    }

    /**
     * The date to hold at `x` — the remembered one, or the one the chart has there now.
     *
     * Nothing until the chart has rendered a scale to read positions from.
     */
    public resolve(gantt: GanttStatic, x: number): Date | undefined {
        if (this._date && this._x === Math.round(x)) {
            return this._date;
        }
        return gantt.dateFromPos(gantt.getScrollState().x + x) ?? undefined;
    }
}
