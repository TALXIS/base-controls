import { EventEmitter, Formatting, IEventEmitter, IRecord } from '@talxis/client-libraries';
import { GanttStatic, ZoomLevel } from 'gantt-trial';
import { ITaskGridServiceLocator } from '@components/TaskGrid/services';
import { IGanttServiceLocator } from '../services';
import { ITaskDataProvider } from '@components/TaskGrid/providers';
import { IGanttDates } from '../gantt-dates';
import { IGanttInfiniteTimeline } from '../gantt-infinite-timeline';
import { ZoomingConfig } from './ZoomingConfig';
import { getZoomApi, IZoomWheelEvent } from './zoomApi';
import { GanttZoomAnchor } from './GanttZoomAnchor';
import {
    clampStopIndex,
    findFitStopIndex,
    findStopIndex,
    findStopIndexForScale,
    getPercentFromStopIndex,
    getStopIndexFromPercent,
    getZoomStops,
    IGanttZoomStop,
} from './zoomLadder';
import { getFinestScale, getMillisecondsPerPixel, getSnapLattice, getUsableLevels } from './zoomScales';
import { IGanttViewStateProvider } from '../gantt-view-state';

/** What changed about the zoom, for the parts of the UI that draw it. */
export interface IGanttZoomingEvents {
    /** The slider redraws on this. Carries where the chart now is on the ladder. */
    onZoomChanged: (stopIndex: number) => void;
}

/** The chart's zoom, as one position on a ladder of everything it can show. */
export interface IGanttZooming {
    events: IEventEmitter<IGanttZoomingEvents>;
    /** How many positions the ladder has. As long as the date columns' precision allows, so not fixed. */
    getStopCount: () => number;
    /** Where the chart is on the ladder, read off the chart itself. */
    getStopIndex: () => number;
    /** Moves the chart to a position, holding the middle of the viewport. Out of range is clamped. */
    setStopIndex: (stopIndex: number) => void;
    /** Zooms out until every task (or every selected one) fits the viewport. */
    zoomToFit: () => void;
}

export interface IGanttZoomingParameters {
    /** Where the chart and the other parts are reached. */
    services: IGanttServiceLocator;
}

/**
 * Drives the chart's zoom.
 *
 * The chart zooms in levels and steps a column width within each one; laid end to end those make a ladder
 * of discrete positions, which is what `zoomLadder` builds and what every gesture here moves along — a
 * wheel notch, the slider, a fit, or a view reopening. All of them go through `_applyStop`, so there is
 * one place that knows the order the chart needs things done in.
 *
 * The chart is what the position is read back from, so a zoom the library performs on its own cannot
 * leave the slider or a saved view saying something else.
 */
export class GanttZooming implements IGanttZooming {
    public readonly events: IEventEmitter<IGanttZoomingEvents> = new EventEmitter<IGanttZoomingEvents>();
    private _services: IGanttServiceLocator;
    private _formatting = Formatting.Get();
    private _anchor = new GanttZoomAnchor();
    private _levels: ZoomLevel[];
    private _stops: IGanttZoomStop[];

    constructor(parameters: IGanttZoomingParameters) {
        this._services = parameters.services;

        const config = ZoomingConfig.getScrollZoomConfig(this._gantt, this._formatting.locale);
        //an hour level only means something against a column that holds a time of day
        this._levels = getUsableLevels(config.levels ?? [], this._dates.hasTimeOfDay());
        this._stops = getZoomStops(this._levels, ZoomingConfig.getColumnWidths());
        //the extension's own wheel handler steps the level and the width by itself, which is the same
        //ladder from the other end - ours is handed over so both cannot happen at once
        this._gantt.ext.zoom.init({
            ...config,
            levels: this._levels,
            handler: this._onWheel as unknown as (event: Event) => void,
        });
        this._registerEventListeners();
    }

    public getStopCount(): number {
        return this._stops.length;
    }

    public getStopIndex(): number {
        const zoom = this._gantt.ext.zoom;
        return findStopIndex(this._stops, zoom.getCurrentLevel(), this._gantt.config.min_column_width ?? 0);
    }

    public setStopIndex(stopIndex: number): void {
        this._applyStop(stopIndex, this._getViewportCentreX());
    }

    public zoomToFit(): void {
        const records = this._getZoomToFitRecords();
        if (!records.length || !this._gantt.$task) {
            return;
        }

        const { startDate, endDate } = this._dates.getStartEndDateFromRecords(records);
        if (!startDate || !endDate) {
            return;
        }

        const stopIndex = findFitStopIndex({
            stops: this._stops,
            levels: this._levels,
            startDate,
            endDate,
            viewportWidth: this._gantt.$task.offsetWidth,
            gantt: this._gantt,
        });
        //the middle of what was fitted, so the range stays centred as the level changes
        const centreX = this._getViewportCentreX();
        this._anchor.remember(new Date(+startDate + (+endDate - +startDate) / 2), centreX);
        this._applyStop(stopIndex, centreX);
    }

    /**
     * Everything a zoom does, in the order the chart needs it.
     *
     * The range comes first and is sized for the scale about to be applied, because the chart builds a
     * column per unit of time across it as it renders — sized for the scale on screen it would be wrong
     * by the whole zoom step. The column width comes next because a write after the level would not be
     * read until something else rendered. Then the level, which is the render.
     *
     * The scroll is ours to finish. The chart anchors the step on whatever date it finds under the
     * pointer at the time, which re-reads it every step and drifts by the rounding; putting the
     * remembered date back at the same position is what makes a run of steps hold one date.
     */
    private _applyStop(stopIndex: number, anchorX: number): void {
        const stop = this._stops[clampStopIndex(stopIndex, this._stops.length)];
        if (!stop || !this._gantt.$task) {
            return;
        }
        const anchorDate = this._anchor.resolve(this._gantt, anchorX);
        const level = this._levels[stop.levelIndex];

        if (anchorDate) {
            this._timeline.setRangeAround({
                date: anchorDate,
                millisecondsPerPixel: getMillisecondsPerPixel({
                    gantt: this._gantt,
                    level,
                    columnWidth: stop.columnWidth,
                    near: anchorDate,
                }),
                //the level about to be applied, not the one on the chart, is what the columns will be
                //phased against
                snapTo: getSnapLattice(level),
            });
        }
        this._gantt.config.min_column_width = stop.columnWidth;
        //our own re-render scrolls the chart, and the timeline should not read that as the user asking
        //for more range
        this._timeline.executeWithScrollBlock(() => {
            getZoomApi(this._gantt)._setLevel(stop.levelIndex, anchorX);
            if (anchorDate) {
                this._gantt.scrollTo(Math.max(0, this._gantt.posFromDate(anchorDate) - anchorX), this._gantt.getScrollState().y);
            }
        });

        if (anchorDate) {
            this._anchor.remember(anchorDate, anchorX);
            this._viewState.setAnchorDate(anchorDate);
        }
        this._storeZoom(stop, stopIndex);
        this.events.dispatchEvent('onZoomChanged', this.getStopIndex());
    }

    private _storeZoom(stop: IGanttZoomStop, stopIndex: number): void {
        const scale = getFinestScale(this._levels[stop.levelIndex]);
        if (scale) {
            this._viewState.setZoom({ unit: scale.unit, step: scale.step, columnWidth: stop.columnWidth });
        }
        //written beside it while a view can still be reopened on a build that only knows the percent
        this._viewState.setZoomLevel(getPercentFromStopIndex(stopIndex, this._stops.length));
    }

    //the extension has already answered whether the ctrl key was held; which property carries the
    //direction is the browser's business, and it binds a different event for Firefox
    private _onWheel = (event: IZoomWheelEvent): void => {
        const zoomIn = (this._gantt.env.isFF ? -40 * event.deltaY : event.wheelDelta) > 0;
        event.preventDefault();
        event.stopPropagation();
        this._applyStop(this.getStopIndex() + (zoomIn ? 1 : -1), this._getPointerX(event.clientX));
    };

    private _onDataParsed = (isFirstLoad: boolean): void => {
        if (!isFirstLoad) {
            return;
        }
        const stopIndex = this._getStoredStopIndex();
        if (stopIndex === undefined) {
            this.zoomToFit();
            return;
        }
        const centreX = this._getViewportCentreX();
        const anchorDate = this._viewState.getAnchorDate();
        if (anchorDate) {
            this._anchor.remember(anchorDate, centreX);
        }
        this._applyStop(stopIndex, centreX);
    };

    /** Where a reopened view left the zoom: what it stored, then what an older build would have stored. */
    private _getStoredStopIndex(): number | undefined {
        const zoom = this._viewState.getZoom();
        const storedStopIndex = zoom && findStopIndexForScale({ stops: this._stops, levels: this._levels, ...zoom });
        if (storedStopIndex !== undefined) {
            return storedStopIndex;
        }
        const percent = this._viewState.getZoomLevel();
        return percent === undefined ? undefined : getStopIndexFromPercent(percent, this._stops.length);
    }

    private _getZoomToFitRecords(): IRecord[] {
        const selectedRecordIds = this._taskDataProvider.getSelectedRecordIds();
        if (selectedRecordIds.length > 0) {
            return selectedRecordIds.map(recordId => this._taskDataProvider.getRecordsMap()[recordId])
        }
        else {
            return this._taskDataProvider.getAllRecords();
        }
    }

    private _getPointerX(clientX: number): number {
        const taskArea = this._gantt.$task;
        return taskArea ? clientX - taskArea.getBoundingClientRect().x : this._getViewportCentreX();
    }

    private _getViewportCentreX(): number {
        return (this._gantt.$task?.offsetWidth ?? 0) / 2;
    }

    private get _taskGridServices(): ITaskGridServiceLocator {
        return this._services.get('taskGridServices');
    }

    private get _gantt(): GanttStatic {
        return this._services.get('ganttChart');
    }

    private get _viewState(): IGanttViewStateProvider {
        return this._services.get('ganttViewState');
    }

    private get _dates(): IGanttDates {
        return this._services.get('ganttDates');
    }

    private get _timeline(): IGanttInfiniteTimeline {
        return this._services.get('ganttInfiniteTimeline');
    }

    private get _taskDataProvider(): ITaskDataProvider {
        return this._taskGridServices.get('taskDataProvider');
    }

    //a scroll of ours is a zoom re-rendering around the anchor; anything else is the user looking
    //somewhere new, and the next zoom should hold that instead
    private _onGanttScroll = () => {
        if (!this._timeline.isScrollBlocked()) {
            this._anchor.forget();
        }
        return true;
    };

    private _registerEventListeners() {
        //registered with the chart's other parts, so it is waited for rather than resolved here
        this._services.whenAvailable('ganttData', ganttData => {
            ganttData.events.addEventListener('onDataParsed', this._onDataParsed);
        });
        this._gantt.attachEvent('onGanttScroll', this._onGanttScroll);
    }
}
