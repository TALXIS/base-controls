import { Formatting, IRecord } from '@talxis/client-libraries';
import { GanttStatic } from 'gantt-trial';
import { ITaskGridServiceLocator } from '@components/TaskGrid/services';
import { IGanttServiceLocator } from '../services';
import { ITaskDataProvider } from '@components/TaskGrid/providers';
import { IGanttDates } from '../gantt-dates';
import { IGanttInfiniteTimeline } from '../gantt-infinite-timeline';
import { ZoomingConfig } from './ZoomingConfig';
import { getZoomApi, IZoomWheelEvent } from './zoomApi';
import { GanttZoomAnchor } from './GanttZoomAnchor';
import { clampPercent, findFitPercent, getTickStep, getUsableLevels, getZoomState, isDayScaleVisible } from './zoomScale';
import { IGanttViewStateProvider } from '../gantt-view-state';

/** The zoom, as the slider's continuous 0-100 laid over the chart's discrete levels. */
export interface IGanttZooming {
    /** Zooms out until every task (or every selected one) fits the viewport. */
    zoomToFit: () => void;
    /** Whether single days are on the scale — what makes marking weekends meaningful. */
    isLevelWithDaysVisible: () => boolean;
}

export interface IGanttZoomingParameters {
    /** Where the chart and the other parts are reached. */
    services: IGanttServiceLocator;
}

/**
 * Drives the chart's zoom from one continuous 0-100 value.
 *
 * The chart zooms in discrete levels, each with a range of column widths; the slider does not. The mapping
 * between the two lives in `zoomScale`, the date a zoom holds still in `GanttZoomAnchor`, and what is left
 * here is the sequencing: anchor, re-render the range, set the level, restore the scroll.
 */
export class GanttZooming implements IGanttZooming {
    private _services: IGanttServiceLocator;
    private _anchor: GanttZoomAnchor;
    private _tickStep: number;
    private _isMouseWheelZoom = false;
    private _formatting = Formatting.Get();

    constructor(parameters: IGanttZoomingParameters) {
        this._services = parameters.services;
        this._anchor = new GanttZoomAnchor({ services: this._services });

        const config = ZoomingConfig.getScrollZoomConfig(this._gantt, this._formatting.locale);
        //an hour level only means something against a column that holds a time of day
        this._gantt.ext.zoom.init({ ...config, levels: getUsableLevels(config.levels ?? [], this._dates.hasTimeOfDay()) });
        this._tickStep = getTickStep(this._gantt.ext.zoom.getLevels().length);
        this._overrideWheelHandler();
        this._registerEventListeners();
    }

    public isLevelWithDaysVisible(): boolean {
        return isDayScaleVisible(this._gantt);
    }

    public zoomToFit() {
        const records = this._getZoomToFitRecords();
        if (!records.length || !this._gantt.$task) {
            return;
        }

        const { startDate, endDate } = this._dates.getStartEndDateFromRecords(records);
        if (!startDate || !endDate) {
            return;
        }

        const percent = findFitPercent({
            startDate,
            endDate,
            levels: this._gantt.ext.zoom.getLevels(),
            viewportWidth: this._gantt.$task.offsetWidth,
            gantt: this._gantt,
        });
        //the middle of what was fitted, so the range stays centred as the level changes
        this._anchor.set(new Date(+startDate + (+endDate - +startDate) / 2));
        this._viewState.setZoomLevel(percent);
        //this is not a typo, it really needs to be called twice to work properly, dont ask why, I have no idea
        this._setZoomPercent(percent);
        this._setZoomPercent(percent);
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

    private _onDataParsed = (isFirstLoad: boolean) => {
        if (!isFirstLoad) return;
        const zoomLevel = this._viewState.getZoomLevel();
        if (zoomLevel === undefined) {
            this.zoomToFit();
        }
        else {
            this._anchor.set(this._viewState.getAnchorDate());
            this._viewState.setZoomLevel(zoomLevel);
        }
    }

    private _overrideWheelHandler() {
        const zoom = getZoomApi(this._gantt);
        zoom._handler = (event: IZoomWheelEvent) => {
            const zoomIn = (this._gantt.env.isFF ? -40 * event.deltaY : event.wheelDelta) > 0;
            const current = this._viewState.getZoomLevel() ?? 0;
            const next = clampPercent(current + (zoomIn ? this._tickStep : -this._tickStep));

            event.preventDefault();
            event.stopPropagation();

            this._anchor.set(this._getWheelAnchorDate(event.clientX));
            this._isMouseWheelZoom = true;
            this._viewState.setZoomLevel(next);
            this._isMouseWheelZoom = false;
        };
    }

    private _getWheelAnchorDate(clientX: number): Date | undefined {
        const taskArea = this._gantt.$task;
        if (!taskArea) {
            return this._anchor.getStableDate(this._anchor.getAnchorX());
        }

        const anchorX = clientX - taskArea.getBoundingClientRect().x;
        const scrollX = this._gantt.getScrollState().x;
        return this._gantt.dateFromPos(scrollX + anchorX);
    }

    private _setZoomPercent(percent: number) {
        const zoom = getZoomApi(this._gantt);
        if (!zoom._initialized) {
            return;
        }

        const levels = zoom.getLevels();
        if (!levels.length) {
            return;
        }

        const anchorX = this._anchor.getAnchorX();
        const anchorDate = this._anchor.getStableDate(anchorX);
        const { levelIndex, columnWidth } = getZoomState(percent, levels.length);

        //our own re-render scrolls the chart; neither the anchor nor the timeline's range should read that
        //as the user moving
        if (anchorDate) {
            this._timeline.executeWithScrollBlock(() => this._timeline.shrink({ date: anchorDate }));
        }

        zoom._exitFitMode();
        zoom._setScaleDates();
        this._gantt.config.min_column_width = columnWidth;
        zoom._setLevel(levelIndex, anchorX);

        //a wheel zoom already sits under the pointer; anything else has to be scrolled back to its anchor
        if (!this._isMouseWheelZoom && anchorDate) {
            const viewportWidth = this._gantt.$task?.offsetWidth ?? 0;
            const nextLeft = Math.max(0, this._gantt.posFromDate(anchorDate) - viewportWidth / 2);
            this._gantt.scrollTo(nextLeft, this._gantt.getScrollState().y);
        }
    }

    //a scroll of ours, re-rendering the range around an anchor, is not the user choosing somewhere else
    private _onHorizontalScroll(): void {
        if (this._timeline.isScrollBlocked()) {
            return;
        }
        this._anchor.clear();
    }

    private _onMouseMove = (event: MouseEvent) => {
        //if mouse is moved with ctrl key held, clear the zoom anchords
        if (event.ctrlKey) {
            this._anchor.clear();
        }
    }

    private _onKeyDown = (event: KeyboardEvent) => {
        //if ctrl key is pressed, clear the zoom anchors
        if (event.ctrlKey) {
            this._anchor.clear();
        }
    }

    private _onDestroy() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('mousemove', this._onMouseMove);
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

    private _registerEventListeners() {
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('mousemove', this._onMouseMove);
        //registered with the chart's other parts, so it is waited for rather than resolved here
        this._services.whenAvailable('ganttData', ganttData => {
            ganttData.events.addEventListener('onDataParsed', (isFirstLoad) => this._onDataParsed(isFirstLoad));
        });
        this._viewState.events.addEventListener('onZoomLevelChanged', (value) => this._setZoomPercent(value));
        this._taskDataProvider.addEventListener('onDestroyed', () => this._onDestroy());
        this._gantt.attachEvent('onGanttScroll', () => {
            this._onHorizontalScroll();
            return true;
        });
    }
}
