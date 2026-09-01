import { GanttStatic } from "gantt-trial";
import { ITaskGridServiceLocator } from '@components/TaskGrid/services';
import { ErrorHelper, ILocalizationService } from "@utils";
import { IProjectProvider } from '@components/TaskGrid/modules/project';
import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { IGanttServiceLocator } from '../../services';
import { IGanttMarkersLabels } from "./labels";
import { getMarkerLineStyles } from "./styles";

/** Where the timeline's own markers are read from. */
export interface IGanttMarkersStrategy {
    /** Wherever the truth lives, the server included, this is where the markers are read. */
    onGetMarkers: () => Promise<ICustomMarker[]>;
}

/** One of the markers the module draws itself: whether it is drawn, and in what colour. */
export interface IGanttMarkerOptions {
    /** Draw it. Defaults to `false`. */
    enabled?: boolean;
    /** What the line is coloured, and the chip on the scale with it. Defaults to the module's own. */
    color?: string;
}

/** The markers the module draws itself, as opposed to the ones a strategy returns. */
export interface IGanttMarkersSettings {
    /** The line marking today. */
    today: IGanttMarkerOptions;
    /** The project's start and end, drawn when the project module is registered too. */
    project: IGanttMarkerOptions;
}

export interface IGanttMarkersProviderParameters {
    /** Where the chart and the project are reached. */
    services: IGanttServiceLocator;
    /** Which of the module's own markers to draw, and in what colour. */
    settings: IGanttMarkersSettings;
    /** The module's own strings. */
    labels: ILocalizationService<IGanttMarkersLabels>;
    /** Where markers of the consumer's own come from. Omitted draws only what the settings ask for. */
    strategy?: IGanttMarkersStrategy;
}

export interface IGanttMarkersProviderEvents {
    onBeforeMarkersRefreshed: () => void;
    /** @param markers The markers as they now stand — the same set `getMarkers` returns. */
    onAfterMarkersRefreshed: (markers: IGanttMarker[]) => void;
    /**
     * The chart holds a freshly drawn set: after a refresh, and after the chart cleared its own and they
     * were drawn again. Separate from the refresh events because a redraw reads nothing — the chips on the
     * scale follow this one.
     */
    onMarkersDrawn: () => void;
    onError: (error: any, message: string) => void;
}

export interface IGanttMarkersProvider {
    events: IEventEmitter<IGanttMarkersProviderEvents>;
    /** Builds the whole set again and draws it. Driven by the manager as the chart loads. */
    refresh: () => Promise<void>;
    getMarkers(): IGanttMarker[];
}

/** One marker: where it sits on the timeline, what it says, and what colour it is drawn in. */
export interface IGanttMarker {
    id: number | string;
    text: string;
    start_date: Date;
    /** What the line is coloured. The chip drawn on the scale follows it. */
    color?: string;
    /** Draws a band between the two dates rather than a line. */
    end_date?: Date;
}

/**
 * A marker of the consumer's own, from {@link IGanttMarkersStrategy}. The id is the provider's to assign.
 *
 * What it looks like is not part of it: that is `IGanttMarkersComponents.onRenderMarker`'s to decide.
 */
export type ICustomMarker = Omit<IGanttMarker, 'id'>;

const DEFAULT_PROJECT_MARKER_COLOR = 'rgb(255, 185, 0)';
const DEFAULT_TODAY_MARKER_COLOR = '#0078d4';

/** The two markers the project module's dates drive, by the id each is drawn under. */
const PROJECT_MARKER_LABELS: Record<'project_start' | 'project_end', keyof IGanttMarkersLabels> = {
    project_start: 'projectStart',
    project_end: 'projectEnd',
};

/**
 * The markers drawn over the timeline: today, the project's two ends, and whatever the strategy returns.
 *
 * Every draw rebuilds the set from scratch and hands the chart ids of our own, so nothing here tracks what
 * changed since the last one. What a marker *looks* like is not decided here at all — this owns where the
 * markers are and what they say. Drawing needs the `marker` plugin, which the manager enables only when
 * this module is registered.
 */
export class GanttMarkersProvider implements IGanttMarkersProvider {
    private _services: IGanttServiceLocator;
    private _settings: IGanttMarkersSettings;
    private _labelsService: ILocalizationService<IGanttMarkersLabels>;
    private _strategy?: IGanttMarkersStrategy;
    private _projectProvider: IProjectProvider | null;
    private _markers: IGanttMarker[] = [];
    public readonly events: IEventEmitter<IGanttMarkersProviderEvents> = new EventEmitter<IGanttMarkersProviderEvents>();

    constructor(parameters: IGanttMarkersProviderParameters) {
        this._services = parameters.services;
        this._settings = parameters.settings;
        this._labelsService = parameters.labels;
        this._strategy = parameters.strategy;
        this._projectProvider = this._settings.project.enabled
            ? this._taskGridServices.find('projectModule')?.provider ?? null
            : null;
        this._registerEventListeners();
    }

    public getMarkers(): IGanttMarker[] {
        return this._markers;
    }

    public async refresh(): Promise<void> {
        await ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                this.events.dispatchEvent('onBeforeMarkersRefreshed');
                this._draw([...this._getOwnMarkers(), ...await this._getStrategyMarkers()]);
                this.events.dispatchEvent('onAfterMarkersRefreshed', this._markers);
            },
            onError: (error, message) => this.events.dispatchEvent('onError', error, message),
        });
    }

    /** Today and the project's ends: what the settings ask for, needing nothing loaded. */
    private _getOwnMarkers(): IGanttMarker[] {
        const markers: IGanttMarker[] = [];
        if (this._settings.today.enabled) {
            markers.push({
                id: 'today',
                start_date: new Date(),
                text: this._labels.getLocalizedString('today'),
                color: this._settings.today.color ?? DEFAULT_TODAY_MARKER_COLOR,
            });
        }
        //null unless the settings asked for them, so this is where both that and the project module's
        //absence land
        const project = this._projectProvider?.getProject();
        for (const id of ['project_start', 'project_end'] as const) {
            const date = id === 'project_start' ? project?.startDate : project?.endDate;
            if (!date) {
                continue;
            }
            markers.push({
                id: id,
                start_date: date,
                text: this._labels.getLocalizedString(PROJECT_MARKER_LABELS[id]),
                color: this._settings.project.color ?? DEFAULT_PROJECT_MARKER_COLOR,
            });
        }

        return markers;
    }

    private async _getStrategyMarkers(): Promise<IGanttMarker[]> {
        const markers = await this._strategy?.onGetMarkers() ?? [];
        //the id is what an onRenderMarker override tells these apart by, so it says where they came from
        return markers.map((marker, index) => ({ ...marker, id: `custom_${index}` }));
    }

    /** Clears what is drawn, then draws these. The old set has to go before the new one is held. */
    private _draw(markers: IGanttMarker[]): void {
        this._clear();
        this._markers = markers;
        for (const marker of this._markers) {
            this._gantt.addMarker({ ...marker, css: marker.color && getMarkerLineStyles(marker.color) });
        }

        this.events.dispatchEvent('onMarkersDrawn');
    }

    private _clear(): void {
        for (const marker of this._markers) {
            //already gone when the chart dropped its own on a clear, which is one of the ways we get here
            if (this._gantt.getMarker(marker.id)) {
                this._gantt.deleteMarker(marker.id);
            }
        }
    }

    private _registerEventListeners() {
        this._projectProvider?.events.addEventListener('onAfterProjectRefreshed', () => void this.refresh());
        //the chart drops every marker it holds on a clear, so what is held here is drawn again
        this._gantt.attachEvent('onClear', () => this._draw(this._markers));
    }

    private get _taskGridServices(): ITaskGridServiceLocator {
        return this._services.get('taskGridServices');
    }

    private get _gantt(): GanttStatic {
        return this._services.get('ganttChart');
    }

    private get _labels(): ILocalizationService<IGanttMarkersLabels> {
        return this._labelsService;
    }
}
