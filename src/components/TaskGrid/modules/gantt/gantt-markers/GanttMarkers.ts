import { GanttStatic } from "gantt-trial";
import { ITaskGridServiceLocator } from '@components/TaskGrid/services';
import { IGanttServiceLocator } from '../services';
import { ILocalizationService } from "@utils";
import { IGanttLabels } from "../labels";
import { IProjectProvider } from '@components/TaskGrid/modules/project';
import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";

export interface IGanttMarkersParameters {
    /** Where the chart, the project and the labels are reached. */
    services: IGanttServiceLocator;
    /** Extra markers to draw on the timeline, from `IGanttModuleOptions.onGetCustomMarkers`. */
    onGetCustomMarkers?: () => ICustomMarker[];
}

export interface IGanttMarkersEvents {
    onMarkersUpdated: () => void;
}

export interface IGanttMarkers {
    events: IEventEmitter<IGanttMarkersEvents>;
    getMarkers(): IGanttMarker[];
}

export type MarkerType = 'milestone' | 'project_start' | 'project_end' | 'today' | 'custom';

export interface IGanttMarker {
    id: number | string;
    text: string;
    type: MarkerType;
    start_date: Date;
    css?: string;
    color?: string;
    end_date?: Date;
}

/**
 * A marker of the consumer's own, from `IGanttModuleOptions.onGetCustomMarkers`. Omit the type for the
 * plain chip; `milestone` draws the diamond instead.
 */
export interface ICustomMarker extends Omit<IGanttMarker, 'id' | 'type'> {
    type?: Extract<MarkerType, 'custom' | 'milestone'>;
}

export const LABEL_OVERLAY_ATTR = 'data-marker-label-overlay';
export const TODAY_MARKER_CLASS = 'gantt_marker_today';
export const PROJECT_START_MARKER_CLASS = 'gantt_marker_project_start';
export const PROJECT_END_MARKER_CLASS = 'gantt_marker_project_end';
export const SCALE_LABEL_ATTR = 'data-gantt-marker-label';
export const MILESTONE_MARKER_CLASS = 'gantt_marker_milestone';
export const CUSTOM_MARKER_CLASS = 'gantt_marker_custom';

/** The two markers the project module's dates drive. */
type ProjectMarkerType = Extract<MarkerType, 'project_start' | 'project_end'>;

const PROJECT_MARKER_COLOR = 'rgb(255, 185, 0)';
const TODAY_MARKER_COLOR = '#0078d4';

const PROJECT_MARKERS: Record<ProjectMarkerType, { className: string, labelKey: keyof IGanttLabels }> = {
    project_start: { className: PROJECT_START_MARKER_CLASS, labelKey: 'projectStart' },
    project_end: { className: PROJECT_END_MARKER_CLASS, labelKey: 'projectEnd' },
};

/**
 * The markers drawn over the timeline: today, the project's two ends, and whatever the consumer adds.
 *
 * Markers are a dhtmlx PRO feature — the `marker` plugin the manager enables. The chart forgets them on
 * every `clear`, so they are held here and drawn again.
 */
export class GanttMarkers implements IGanttMarkers {
    private _services: IGanttServiceLocator;
    private _onGetCustomMarkers: () => ICustomMarker[];
    private _projectProvider: IProjectProvider | null;
    private _markers: Map<string | number, IGanttMarker> = new Map();
    public readonly events: IEventEmitter<IGanttMarkersEvents> = new EventEmitter<IGanttMarkersEvents>();

    constructor(parameters: IGanttMarkersParameters) {
        this._services = parameters.services;
        this._onGetCustomMarkers = parameters.onGetCustomMarkers ?? (() => []);
        this._projectProvider = this._taskGridServices.find('projectModule')?.provider ?? null;
        this._registerEventListeners();
    }

    public getMarkers(): IGanttMarker[] {
        return Array.from(this._markers.values());
    }

    private _addMarker(marker: Omit<IGanttMarker, 'id'>): IGanttMarker {
        const id = this._gantt.addMarker(marker);
        const stored: IGanttMarker = { ...marker, id };
        this._markers.set(id, stored);
        if (marker.color) {
            //the chip the scale renders is a React component, and it reads its colour from here
            this._gantt.$root?.style.setProperty(`--${marker.type}-marker-color`, marker.color);
        }

        this.events.dispatchEvent('onMarkersUpdated');
        return stored;
    }

    private _deleteMarker(id: string | number) {
        if (!this._markers.has(id)) return;
        this._gantt.deleteMarker(id);
        this._markers.delete(id);
        this.events.dispatchEvent('onMarkersUpdated');
    }

    private _updateMarker(id: string | number, patch: Partial<Omit<IGanttMarker, 'id'>>) {
        const stored = this._markers.get(id)!;
        const ganttMarker = this._gantt.getMarker(id);
        Object.assign(ganttMarker, patch);
        this._gantt.updateMarker(id);
        this._markers.set(id, { ...stored, ...patch });
        this.events.dispatchEvent('onMarkersUpdated');
    }

    private _findByType(type: MarkerType): IGanttMarker | undefined {
        for (const marker of this._markers.values()) {
            if (marker.type === type) return marker;
        }
        return undefined;
    }

    private _addTodayMarker() {
        this._addMarker({
            start_date: new Date(),
            text: this._labels.getLocalizedString('today'),
            css: TODAY_MARKER_CLASS,
            type: 'today',
            color: TODAY_MARKER_COLOR,
        });
    }

    private _addCustomMarkers() {
        for (const marker of this._onGetCustomMarkers()) {
            const css = [CUSTOM_MARKER_CLASS, marker.css].filter(Boolean).join(' ');
            this._addMarker({ ...marker, css, type: marker.type ?? 'custom' });
        }
    }

    private _setProjectMarker(type: ProjectMarkerType, date: Date | null) {
        const existing = this._findByType(type);
        if (existing && !date) {
            this._deleteMarker(existing.id);
            return;
        }
        if (existing && date) {
            this._updateMarker(existing.id, { start_date: date });
            return;
        }
        if (date) {
            this._addMarker({
                start_date: date,
                text: this._labels.getLocalizedString(PROJECT_MARKERS[type].labelKey),
                css: PROJECT_MARKERS[type].className,
                type: type,
                color: PROJECT_MARKER_COLOR,
            });
        }
    }

    private _registerEventListeners() {
        this._projectProvider?.events.addEventListener('onAfterProjectRefreshed', project => {
            this._setProjectMarker('project_start', project.startDate);
            this._setProjectMarker('project_end', project.endDate);
        });
        //the chart drops every marker it holds on a clear, so they are drawn again from what is held here
        this._gantt.attachEvent('onClear', () => this._redraw());
        this._gantt.attachEvent('onGanttReady', () => this._draw());
    }

    private _draw() {
        this._addTodayMarker();
        this._setProjectMarker('project_start', this._projectProvider?.getStartDate() ?? null);
        this._setProjectMarker('project_end', this._projectProvider?.getEndDate() ?? null);
        this._addCustomMarkers();
    }

    private _redraw() {
        for (const marker of this._markers.values()) {
            this._addMarker(marker);
        }
    }

    private get _taskGridServices(): ITaskGridServiceLocator {
        return this._services.get('taskGridServices');
    }

    private get _gantt(): GanttStatic {
        return this._services.get('ganttChart');
    }

    private get _labels(): ILocalizationService<IGanttLabels> {
        return this._services.get('labels');
    }
}