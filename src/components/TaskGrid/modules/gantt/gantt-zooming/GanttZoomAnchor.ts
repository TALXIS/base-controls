import { GanttStatic } from "gantt-trial";
import { IGanttServiceLocator } from "../services";
import { IGanttViewStateProvider } from "../gantt-view-state";

/** Constructor parameters for {@link GanttZoomAnchor}. */
export interface IGanttZoomAnchorParameters {
    /** Where the chart and the view's state are reached. */
    services: IGanttServiceLocator;
}

/**
 * The date a zoom keeps under the pointer.
 *
 * Zooming re-renders the scale, which would otherwise leave the user looking at a different part of the
 * project than the one they were pointing at. The anchor is remembered until they scroll — that is them
 * choosing somewhere else — and written through to the view's state so a remount reopens there.
 */
export class GanttZoomAnchor {
    private _services: IGanttServiceLocator;
    private _pendingDate: Date | undefined;

    constructor(parameters: IGanttZoomAnchorParameters) {
        this._services = parameters.services;
        this._pendingDate = this._viewState.getAnchorDate();
    }

    /** Where the next zoom should keep the timeline, in pixels from the left of the visible chart. */
    public getAnchorX(): number {
        if (!this._pendingDate) {
            return this._getViewportCentreX();
        }

        const anchorX = this._gantt.posFromDate(this._pendingDate) - this._gantt.getScrollState().x;
        return Math.max(0, Math.min(this._getViewportWidth(), anchorX));
    }

    /**
     * The date to hold at `anchorX` — the one already pending, or the date now under it.
     *
     * Taking the pending one first is what keeps a run of zoom steps anchored to the same date instead of
     * drifting with each re-render. There is nothing to anchor to until the chart has rendered a scale, so
     * the first zoom of a mount can come back empty.
     */
    public getStableDate(anchorX: number): Date | undefined {
        if (this._pendingDate) {
            return this._pendingDate;
        }
        const date = this._gantt.dateFromPos(this._gantt.getScrollState().x + anchorX);
        this.set(date);
        return date;
    }

    public set(date: Date | undefined): void {
        if (date) {
            this._viewState.setAnchorDate(date);
        }
        this._pendingDate = date;
    }

    /** Forgets the anchor: the next zoom picks up wherever the user is looking now. */
    public clear(): void {
        this.set(undefined);
    }

    private _getViewportCentreX(): number {
        return this._getViewportWidth() / 2;
    }

    private _getViewportWidth(): number {
        return this._gantt.$task?.offsetWidth ?? 0;
    }

    private get _gantt(): GanttStatic {
        return this._services.get('ganttChart');
    }

    private get _viewState(): IGanttViewStateProvider {
        return this._services.get('ganttViewState');
    }
}
