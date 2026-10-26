import { EventEmitter, IEventEmitter, IRecord } from "@talxis/client-libraries";
import type { GanttStatic, ZoomLevel } from "dhtmlx-gantt";
import type { IStateStore } from "@utils";
import type { ITaskRuntime } from "../../../runtime";
import type { IGanttSavedZoom, IGanttZoom } from "../interfaces";
import type { IGanttDates } from "../dates/GanttDates";
import type { IGanttTimeline } from "../timeline/GanttTimeline";
import { GanttZoomAnchor } from "./GanttZoomAnchor";
import { getZoomApi, IZoomWheelEvent } from "./zoomApi";
import { getColumnWidths, getZoomLevels } from "./zoomLevels";
import { clampStopIndex, findFitStopIndex, findStopIndex, findStopIndexForScale, getZoomStops, IGanttZoomStop } from "./zoomLadder";
import { getFinestScale, getMillisecondsPerPixel, getSnapLattice, getUsableLevels } from "./zoomScales";

const ZOOM_STATE_KEY = 'zoom';
const ANCHOR_DATE_STATE_KEY = 'anchorDate';

export interface IGanttZoomingEvents {
    onZoomChanged: (stopIndex: number) => void;
}

/** The chart's zoom, as a position on a ladder of levels and column widths. */
export interface IGanttZooming {
    readonly events: IEventEmitter<IGanttZoomingEvents>;
    getStopCount(): number;
    getStopIndex(): number;
    /** Zooms around the middle of the viewport; out of range is clamped. */
    setStopIndex(stopIndex: number): void;
    /** Fits the selected tasks, or every task when none is selected. */
    zoomToFit(): void;
}

export interface IGanttZoomingParameters {
    gantt: GanttStatic;
    taskRuntime: ITaskRuntime;
    dates: IGanttDates;
    timeline: IGanttTimeline;
    state: IStateStore;
}

export class GanttZooming implements IGanttZooming {
    public readonly events = new EventEmitter<IGanttZoomingEvents>();
    private _gantt: GanttStatic;
    private _taskRuntime: ITaskRuntime;
    private _dates: IGanttDates;
    private _timeline: IGanttTimeline;
    private _state: IStateStore;
    private _anchor = new GanttZoomAnchor();
    private _levels: ZoomLevel[];
    private _stops: IGanttZoomStop[];
    private _unsaveWithView?: () => void;

    constructor(parameters: IGanttZoomingParameters) {
        this._gantt = parameters.gantt;
        this._taskRuntime = parameters.taskRuntime;
        this._dates = parameters.dates;
        this._timeline = parameters.timeline;
        this._state = parameters.state;
        const locale = this._taskRuntime.getProvider().getFormatting().locale;
        this._levels = getUsableLevels(getZoomLevels(this._gantt, locale), this._dates.hasTimeOfDay());
        this._stops = getZoomStops(this._levels, getColumnWidths());
        //no `startDate`/`endDate`: the extension would restore its own range on every step
        this._gantt.ext.zoom.init({
            levels: this._levels,
            useKey: 'ctrlKey',
            trigger: 'wheel',
            element: () => this._gantt.$task,
            handler: this._onWheel as unknown as (event: Event) => void,
        });
        this._gantt.attachEvent('onGanttScroll', this._onGanttScroll);
        this._taskRuntime.services.get('datasetControl').modules.whenAvailable('userQueries', userQueries => {
            this._unsaveWithView = userQueries.saveWithView('ganttZoom', this._getSavedZoom);
        });
    }

    public getStopCount(): number {
        return this._stops.length;
    }

    public getStopIndex(): number {
        return findStopIndex(this._stops, this._gantt.ext.zoom.getCurrentLevel(), this._gantt.config.min_column_width ?? 0);
    }

    public setStopIndex(stopIndex: number): void {
        this._applyStop(stopIndex, this._getViewportCentreX());
    }

    public zoomToFit(): void {
        const range = this._dates.getRange(this._getZoomToFitRecords());
        const viewportWidth = this._gantt.$task?.offsetWidth;
        if (!range || !viewportWidth) {
            return;
        }
        const stopIndex = findFitStopIndex(this._gantt, this._stops, this._levels, range, viewportWidth);
        const centreX = this._getViewportCentreX();
        this._anchor.remember(new Date((+range.startDate + +range.endDate) / 2), centreX);
        this._applyStop(stopIndex, centreX);
    }

    /** Puts back the zoom the view was left at, or the one it was saved with, or fits the tasks. */
    public restore(): void {
        const saved = this._taskRuntime.getView()?.data?.ganttZoom;
        const zoom = this._state.get<IGanttZoom>(ZOOM_STATE_KEY) ?? saved?.zoom;
        const stopIndex = zoom && findStopIndexForScale(this._stops, this._levels, zoom);
        if (stopIndex === undefined) {
            this.zoomToFit();
            return;
        }
        const centreX = this._getViewportCentreX();
        const anchorDate = this._state.get<string>(ANCHOR_DATE_STATE_KEY) ?? saved?.anchorDate;
        if (anchorDate) {
            this._anchor.remember(new Date(anchorDate), centreX);
        }
        this._applyStop(stopIndex, centreX);
    }

    public destroy(): void {
        this._unsaveWithView?.();
    }

    //range sized for the coming level first, then the width, then the level, which renders
    private _applyStop(stopIndex: number, anchorX: number): void {
        const stop = this._stops[clampStopIndex(stopIndex, this._stops.length)];
        if (!stop || !this._gantt.$task) {
            return;
        }
        const anchorDate = this._anchor.resolve(this._gantt, anchorX);
        const level = this._levels[stop.levelIndex];
        if (anchorDate) {
            this._timeline.setRangeAround(anchorDate, getMillisecondsPerPixel(this._gantt, level, stop.columnWidth, anchorDate), getSnapLattice(level));
        }
        this._gantt.config.min_column_width = stop.columnWidth;
        this._timeline.executeWithScrollBlock(() => {
            getZoomApi(this._gantt)._setLevel(stop.levelIndex, anchorX);
            //the chart re-reads the date under the pointer each step, which drifts
            if (anchorDate) {
                this._gantt.scrollTo(Math.max(0, this._gantt.posFromDate(anchorDate) - anchorX), null);
            }
        });
        if (anchorDate) {
            this._anchor.remember(anchorDate, anchorX);
            this._state.set(ANCHOR_DATE_STATE_KEY, anchorDate.toISOString());
        }
        const scale = getFinestScale(level);
        if (scale) {
            this._state.set<IGanttZoom>(ZOOM_STATE_KEY, { unit: scale.unit, step: scale.step, columnWidth: stop.columnWidth });
        }
        this.events.dispatchEvent('onZoomChanged', this.getStopIndex());
    }

    private _getSavedZoom = (): IGanttSavedZoom | undefined => {
        const zoom = this._state.get<IGanttZoom>(ZOOM_STATE_KEY);
        return zoom && { zoom, anchorDate: this._state.get<string>(ANCHOR_DATE_STATE_KEY) };
    };

    private _onWheel = (event: IZoomWheelEvent): void => {
        //Firefox binds a different event
        const isZoomIn = (this._gantt.env.isFF ? -40 * event.deltaY : event.wheelDelta) > 0;
        event.preventDefault();
        event.stopPropagation();
        this._applyStop(this.getStopIndex() + (isZoomIn ? 1 : -1), this._getPointerX(event.clientX));
    };

    //a scroll of the user's own picks a new date to hold
    private _onGanttScroll = (): boolean => {
        if (!this._timeline.isScrollBlocked()) {
            this._anchor.forget();
        }
        return true;
    };

    private _getZoomToFitRecords(): IRecord[] {
        const provider = this._taskRuntime.getProvider();
        const recordsMap = provider.getRecordsMap();
        const selected = provider.getSelectedRecordIds().map(recordId => recordsMap[recordId]).filter(Boolean);
        return selected.length > 0 ? selected : provider.getAllRecords();
    }

    private _getPointerX(clientX: number): number {
        const taskArea = this._gantt.$task;
        return taskArea ? clientX - taskArea.getBoundingClientRect().x : this._getViewportCentreX();
    }

    private _getViewportCentreX(): number {
        return (this._gantt.$task?.offsetWidth ?? 0) / 2;
    }
}
