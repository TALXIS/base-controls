import type { Map as LeafletMap } from "leaflet";
import { createElement } from "react";
import { EventEmitter } from "@talxis/client-libraries";
import type { IEventSubscriber } from "@core";
import type { IMapLibrary } from "../../interfaces";
import type { IMap } from "../../runtime/MapRuntime";
import type { IMapSurface } from "../../runtime/MapSurfaces";
import type { IMapViewRequest, MapViewport } from "../../runtime/viewport/MapViewport";
import { Leaflet, ILeafletComponents } from "./adapters/leaflet";

export interface ILeafletParameters {
    /** The tile URL template; OpenStreetMap's by default. */
    tileUrl?: string;
    /** The attribution the tiles require; OpenStreetMap's by default. */
    attribution?: string;
    /** Replacements for the map's, its pins' and its popup's slots. */
    components?: ILeafletComponents;
}

export interface ILeafletEvents {
    /** Fires once Leaflet has drawn the map, with its instance. */
    onInstanceReady: (instance: LeafletMap) => void;
}

/** The map drawn with Leaflet; it is the map's `library` module. */
export interface ILeaflet extends IMapLibrary {
    readonly events: IEventSubscriber<ILeafletEvents>;
    /** `undefined` until Leaflet has drawn the map. */
    getInstance(): LeafletMap | undefined;
}

/** What the adapter reads of the module. */
export interface ILeafletInternal extends ILeaflet {
    getTiles(): { tileUrl: string; attribution: string };
    /** @returns Unsets `instance`. */
    setInstance(instance: LeafletMap): () => void;
}

export interface ILeafletConstructorParameters {
    map: IMap;
    parameters: ILeafletParameters;
}

const OPEN_STREET_MAP_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OPEN_STREET_MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

//the map comes before anything else drawn in the box
const MAP_SURFACE_PRIORITY = -100;

export class LeafletRuntime implements ILeafletInternal {
    public readonly events = new EventEmitter<ILeafletEvents>();
    private _viewport: MapViewport;
    private _parameters: ILeafletParameters;
    private _instance?: LeafletMap;
    private _stopListening: () => void;
    private _removeSurface: () => void;

    constructor(parameters: ILeafletConstructorParameters) {
        this._viewport = parameters.map.services.get('viewport');
        this._parameters = parameters.parameters;
        this._stopListening = this._viewport.events.addEventListener('onViewRequested', this._onViewRequested);
        this._removeSurface = parameters.map.surfaces.hooks.surfaces.add(this._onSurfaces, MAP_SURFACE_PRIORITY);
    }

    public getInstance(): LeafletMap | undefined {
        return this._instance;
    }

    public getTiles(): { tileUrl: string; attribution: string } {
        return {
            tileUrl: this._parameters.tileUrl ?? OPEN_STREET_MAP_TILES,
            attribution: this._parameters.attribution ?? OPEN_STREET_MAP_ATTRIBUTION,
        };
    }

    public setInstance(instance: LeafletMap): () => void {
        this._instance = instance;
        this._viewport.fit();
        this.events.dispatchEvent('onInstanceReady', instance);
        return () => {
            if (this._instance === instance) {
                this._instance = undefined;
            }
        };
    }

    public destroy(): void {
        this._stopListening();
        this._removeSurface();
        this.events.clearEventListeners();
    }

    private _onSurfaces = (surfaces: IMapSurface[]): void => {
        surfaces.push({ key: 'library', onRender: () => createElement(Leaflet, { components: this._parameters.components }) });
    };

    private _onViewRequested = (request: IMapViewRequest): void => {
        if (!this._instance) {
            return;
        }
        if ('bounds' in request) {
            const { north, south, east, west } = request.bounds;
            this._instance.fitBounds([[south, west], [north, east]], { padding: [request.padding, request.padding] });
            return;
        }
        this._instance.setView([request.center.latitude, request.center.longitude], request.zoom);
    };
}
