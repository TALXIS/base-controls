import { createElement } from "react";
import dayjs, { Dayjs } from "dayjs";
import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import type { LabelsOf } from "@labels";
import type { ITaskRuntime } from "../../../../runtime";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import { MARKERS_LABELS } from "./labels";
import type { MarkerLineStyle, IMarkerUiChipComponents, IMarkerUiColumnComponents, IMarkerUiLayerComponents, IMarkerUiLineComponents, IMarkerUiScaleComponents, IMarkerUiTrackComponents } from "./ui";
import { MarkerLayer } from "./adapters/marker-layer";
import { getMarkersStyles } from "./styles";

/** A date marked on the timeline with a line and a chip on the scale. */
export interface IMarker {
    id: string;
    text: string;
    date: Dayjs;
    /** The line's and the chip's colour, the theme's primary by default. */
    color?: string;
    /** How the line is drawn, dotted by default. */
    lineStyle?: MarkerLineStyle;
}

/** Where the markers of the consumer's own come from. */
export interface IMarkersStore {
    /** Called on every mount and on `reload` while the chart draws without these markers. */
    onLoadMarkers(): Promise<IMarker[]>;
}

/** The replaceable pieces of every marker, by the part they belong to. */
export interface IMarkersComponents {
    layer?: Partial<IMarkerUiLayerComponents>;
    column?: Partial<IMarkerUiColumnComponents>;
    track?: Partial<IMarkerUiTrackComponents>;
    scale?: Partial<IMarkerUiScaleComponents>;
    line?: Partial<IMarkerUiLineComponents>;
    chip?: Partial<IMarkerUiChipComponents>;
}

/** Today, marked on the timeline. */
export interface ITodayMarkerParameters {
    /** Defaults to `true`. */
    enableMarker?: boolean;
    color?: string;
    lineStyle?: MarkerLineStyle;
}

/** The `project` module's start and end, marked on the timeline. */
export interface IProjectMarkersParameters {
    /** Defaults to `true`. */
    enableMarkers?: boolean;
    color?: string;
    lineStyle?: MarkerLineStyle;
}

export interface IMarkersParameters {
    today?: ITodayMarkerParameters;
    project?: IProjectMarkersParameters;
    onCreateStore?: (taskRuntime: ITaskRuntime) => IMarkersStore;
    components?: IMarkersComponents;
}

export interface IMarkersEvents {
    /** The markers changed, such as after `reload`. */
    onMarkersChanged: () => void;
}

/** The `markers` module: today, the project's start and end, and the store's own markers. */
export interface IMarkers {
    readonly events: IEventEmitter<IMarkersEvents>;
    getMarkers(): IMarker[];
    /** Reads the store's markers again and redraws every marker. */
    reload(): Promise<void>;
    getComponents(): IMarkersComponents;
}


export class Markers implements IMarkers {
    public readonly events = new EventEmitter<IMarkersEvents>();
    private _gantt: IGantt;
    private _parameters: IMarkersParameters;
    private _store?: IMarkersStore;
    private _storeMarkers: IMarker[] = [];

    constructor(gantt: IGantt, parameters: IMarkersParameters) {
        this._gantt = gantt;
        this._parameters = parameters;
        this._store = parameters.onCreateStore?.(gantt.getTaskRuntime());
        gantt.surfaces.registerSurface(this._onSurfaces);
        gantt.services.get('theme').registerStyles(result => result.styles.push(getMarkersStyles()));
        //not awaited so the chart draws before the store's markers load
        this.reload();
    }

    private get _labels(): LabelsOf<typeof MARKERS_LABELS> {
        return this._gantt.getLabels(MARKERS_LABELS);
    }

    public async reload(): Promise<void> {
        if (this._store) {
            const store = this._store;
            const errorTitle = this._labels.get('markers.loadMarkersFailed');
            const markers = await this._gantt.getTaskRuntime().execute(() => store.onLoadMarkers(), { loading: { show: false }, error: { title: errorTitle, rethrow: false } });
            if (!markers) {
                return;
            }
            this._storeMarkers = markers;
        }
        this.events.dispatchEvent('onMarkersChanged');
    }

    public getMarkers(): IMarker[] {
        const markers: IMarker[] = [];
        if (this._parameters.today?.enableMarker ?? true) {
            markers.push({ id: 'today', text: this._labels.get('markers.today'), date: dayjs(), color: this._parameters.today?.color ?? this._gantt.getTaskRuntime().services.get('datasetControl').getTheme().palette.red, lineStyle: this._parameters.today?.lineStyle });
        }
        if (this._parameters.project?.enableMarkers ?? true) {
            const { color, lineStyle } = this._parameters.project ?? {};
            const project = this._gantt.getTaskRuntime().services.get('datasetControl').modules.find('project');
            const startDate = project?.getStartDate();
            const endDate = project?.getEndDate();
            if (startDate) {
                markers.push({ id: 'projectStart', text: this._labels.get('markers.projectStart'), date: startDate, color, lineStyle });
            }
            if (endDate) {
                markers.push({ id: 'projectEnd', text: this._labels.get('markers.projectEnd'), date: endDate, color, lineStyle });
            }
        }
        return [...markers, ...this._storeMarkers];
    }

    public getComponents(): IMarkersComponents {
        return this._parameters.components ?? {};
    }

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        surfaces.push({ key: 'markers', onRender: () => createElement(MarkerLayer) });
    };
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** The dates marked on the timeline. */
        markers: IMarkers;
    }
}
