import { createElement } from "react";
import dayjs, { Dayjs } from "dayjs";
import { mergeStyles } from "@fluentui/react";
import { ILocalizationService, LocalizationService } from "@utils";
import type { ITaskRuntime } from "../../../../runtime";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import { GANTT_MARKERS_LABELS, IGanttMarkersLabels } from "./labels";
import { MarkerLayer } from "./components/adapters/marker-layer";

/** A date marked on the timeline with a line and a chip on the scale. */
export interface IGanttMarker {
    id: string;
    text: string;
    date: Dayjs;
    /** The line's and the chip's colour; the theme's primary colour by default. */
    color?: string;
    /** Draws a diamond on the scale rather than a chip. */
    isMilestone?: boolean;
}

/** Where the markers of the consumer's own come from. */
export interface IGanttMarkersStore {
    /** Called on every mount, before the chart is drawn. */
    onLoadMarkers(): Promise<IGanttMarker[]>;
}

export interface IGanttMarkersParameters {
    /** Defaults to `true`. */
    showToday?: boolean;
    /** The `project` module's start and end; defaults to `true`. */
    showProject?: boolean;
    onCreateStore?: (taskRuntime: ITaskRuntime) => IGanttMarkersStore;
    labels?: Partial<IGanttMarkersLabels>;
}

/** The `markers` module: today, the project's start and end, and the store's own markers. */
export interface IGanttMarkers {
    getMarkers(): IGanttMarker[];
    /** Called as the Gantt goes. */
    destroy(): void;
}

const PROJECT_MARKER_COLOR = '#ffb900';

export class GanttMarkers implements IGanttMarkers {
    private _gantt: IGantt;
    private _parameters: IGanttMarkersParameters;
    private _labels: ILocalizationService<IGanttMarkersLabels>;
    private _storeMarkers: IGanttMarker[] = [];
    private _unregisters: (() => void)[] = [];

    constructor(gantt: IGantt, parameters: IGanttMarkersParameters) {
        this._gantt = gantt;
        this._parameters = parameters;
        this._labels = new LocalizationService<IGanttMarkersLabels>({ ...GANTT_MARKERS_LABELS, ...parameters.labels });
        this._unregisters.push(
            gantt.registerChartConfig(chart => chart.plugins({ marker: true })),
            gantt.surfaces.registerSurface(this._onSurfaces),
        );
        //the chart drops its markers on every parse
        gantt.events.addEventListener('onTasksParsed', this._draw);
        this._unregisters.push(() => gantt.events.removeEventListener('onTasksParsed', this._draw));
    }

    /** Loads the store's markers; the module awaits it before the chart is drawn. */
    public async load(): Promise<void> {
        this._storeMarkers = await this._parameters.onCreateStore?.(this._gantt.getTaskRuntime()).onLoadMarkers() ?? [];
    }

    public getMarkers(): IGanttMarker[] {
        const markers: IGanttMarker[] = [];
        if (this._parameters.showToday ?? true) {
            markers.push({ id: 'today', text: this._labels.getLocalizedString('today'), date: dayjs() });
        }
        const project = this._gantt.getTaskRuntime().services.get('datasetControl').modules.find('project');
        if (this._parameters.showProject ?? true) {
            const startDate = project?.getStartDate();
            const endDate = project?.getEndDate();
            if (startDate) {
                markers.push({ id: 'projectStart', text: this._labels.getLocalizedString('projectStart'), date: startDate, color: PROJECT_MARKER_COLOR });
            }
            if (endDate) {
                markers.push({ id: 'projectEnd', text: this._labels.getLocalizedString('projectEnd'), date: endDate, color: PROJECT_MARKER_COLOR });
            }
        }
        return [...markers, ...this._storeMarkers];
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
    }

    private _draw = (): void => {
        const chart = this._gantt.services.find('chart');
        if (!chart) {
            return;
        }
        for (const marker of this.getMarkers()) {
            if (chart.getMarker(marker.id)) {
                chart.deleteMarker(marker.id);
            }
            chart.addMarker({ id: marker.id, start_date: marker.date.toDate(), text: marker.text, css: getLineClassName(marker.color) });
        }
        chart.renderMarkers();
    };

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        surfaces.push({ key: 'markers', onRender: () => createElement(MarkerLayer) });
    };
}

//doubled to outweigh the chart's own `.gantt_marker` colour
const getLineClassName = (color: string | undefined): string | undefined => {
    return color ? mergeStyles({ selectors: { '&&': { backgroundColor: color } } }) : undefined;
};

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** The dates marked on the timeline. */
        markers: IGanttMarkers;
    }
}
