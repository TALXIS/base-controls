import { createElement } from "react";
import dayjs, { Dayjs } from "dayjs";
import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import type { LabelsOf } from "@utils";
import type { ITaskRuntime } from "../../../../runtime";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import { GANTT_MARKERS_LABELS } from "./labels";
import type { IGanttMarkerUiChipComponents, IGanttMarkerUiColumnComponents, IGanttMarkerUiLayerComponents, IGanttMarkerUiLineComponents, IGanttMarkerUiScaleComponents, IGanttMarkerUiTrackComponents } from "./components/ui";
import { GanttMarkerLayer } from "./components/adapters/marker-layer";

/** A date marked on the timeline with a line and a chip on the scale. */
export interface IGanttMarker {
    id: string;
    text: string;
    date: Dayjs;
    /** The line's and the chip's colour; the theme's red by default. */
    color?: string;
}

/** Where the markers of the consumer's own come from. */
export interface IGanttMarkersStore {
    /** Called on every mount and on `reload`; its markers appear once it resolves. */
    onLoadMarkers(): Promise<IGanttMarker[]>;
}

/** The replaceable pieces of every marker, by the part they belong to. */
export interface IGanttMarkersComponents {
    layer?: Partial<IGanttMarkerUiLayerComponents>;
    column?: Partial<IGanttMarkerUiColumnComponents>;
    track?: Partial<IGanttMarkerUiTrackComponents>;
    scale?: Partial<IGanttMarkerUiScaleComponents>;
    line?: Partial<IGanttMarkerUiLineComponents>;
    chip?: Partial<IGanttMarkerUiChipComponents>;
}

/** Today, marked on the timeline. */
export interface IGanttTodayMarkerParameters {
    /** Defaults to `true`. */
    enableMarker?: boolean;
    color?: string;
}

/** The `project` module's start and end, marked on the timeline. */
export interface IGanttProjectMarkersParameters {
    /** Defaults to `true`. */
    enableMarkers?: boolean;
    color?: string;
}

export interface IGanttMarkersParameters {
    today?: IGanttTodayMarkerParameters;
    project?: IGanttProjectMarkersParameters;
    onCreateStore?: (taskRuntime: ITaskRuntime) => IGanttMarkersStore;
    components?: IGanttMarkersComponents;
}

export interface IGanttMarkersEvents {
    /** The markers changed, such as after `reload`. */
    onMarkersChanged: () => void;
}

/** The `markers` module: today, the project's start and end, and the store's own markers. */
export interface IGanttMarkers {
    readonly events: IEventEmitter<IGanttMarkersEvents>;
    getMarkers(): IGanttMarker[];
    /** Reads the store's markers again and redraws every marker. */
    reload(): Promise<void>;
    getComponents(): IGanttMarkersComponents;
    /** Called as the Gantt goes. */
    destroy(): void;
}


export class GanttMarkers implements IGanttMarkers {
    public readonly events = new EventEmitter<IGanttMarkersEvents>();
    private _gantt: IGantt;
    private _parameters: IGanttMarkersParameters;
    private _labels: LabelsOf<typeof GANTT_MARKERS_LABELS>;
    private _store?: IGanttMarkersStore;
    private _storeMarkers: IGanttMarker[] = [];
    private _unregisterSurface: () => void;

    constructor(gantt: IGantt, parameters: IGanttMarkersParameters) {
        this._gantt = gantt;
        this._parameters = parameters;
        this._labels = gantt.getLabels(GANTT_MARKERS_LABELS);
        this._store = parameters.onCreateStore?.(gantt.getTaskRuntime());
        this._unregisterSurface = gantt.surfaces.registerSurface(this._onSurfaces);
        //not awaited: the chart draws without the store's markers, which join it once loaded
        this.reload();
    }

    public async reload(): Promise<void> {
        if (this._store) {
            const store = this._store;
            const errorTitle = this._labels.get('ganttMarkers.loadMarkersFailed');
            const markers = await this._gantt.getTaskRuntime().execute(() => store.onLoadMarkers(), { loading: { show: false }, error: { title: errorTitle, rethrow: false } });
            if (!markers) {
                return;
            }
            this._storeMarkers = markers;
        }
        this.events.dispatchEvent('onMarkersChanged');
    }

    public getMarkers(): IGanttMarker[] {
        const markers: IGanttMarker[] = [];
        if (this._parameters.today?.enableMarker ?? true) {
            markers.push({ id: 'today', text: this._labels.get('ganttMarkers.today'), date: dayjs(), color: this._parameters.today?.color });
        }
        if (this._parameters.project?.enableMarkers ?? true) {
            const color = this._parameters.project?.color;
            const project = this._gantt.getTaskRuntime().services.get('datasetControl').modules.find('project');
            const startDate = project?.getStartDate();
            const endDate = project?.getEndDate();
            if (startDate) {
                markers.push({ id: 'projectStart', text: this._labels.get('ganttMarkers.projectStart'), date: startDate, color });
            }
            if (endDate) {
                markers.push({ id: 'projectEnd', text: this._labels.get('ganttMarkers.projectEnd'), date: endDate, color });
            }
        }
        return [...markers, ...this._storeMarkers];
    }

    public getComponents(): IGanttMarkersComponents {
        return this._parameters.components ?? {};
    }

    public destroy(): void {
        this._unregisterSurface();
        this.events.clearEventListeners();
    }

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        surfaces.push({ key: 'markers', onRender: () => createElement(GanttMarkerLayer) });
    };
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** The dates marked on the timeline. */
        markers: IGanttMarkers;
    }
}
