import { createElement } from "react";
import { EventEmitter } from "@talxis/client-libraries";
import type { IEventSubscriber } from "@core";
import type { IMapLibrary } from "../../interfaces";
import type { IMap } from "../../runtime/MapRuntime";
import type { IMapSurface } from "../../runtime/MapSurfaces";
import type { IMapViewRequest, MapViewport } from "../../runtime/viewport/MapViewport";
import { GoogleMaps, IGoogleMapsComponents } from "./adapters/google-maps";

export interface IGoogleMapsParameters {
    /** A Google Maps JavaScript API key. */
    apiKey: string;
    /** The Map ID from Google Cloud's Map management; Google's `DEMO_MAP_ID` when left out. */
    mapId?: string;
    /** Replacements for the map's slots and its pins' slots. */
    components?: IGoogleMapsComponents;
}

export interface IGoogleMapsEvents {
    /** Fires once Google Maps has drawn the map, with its instance. */
    onInstanceReady: (instance: google.maps.Map) => void;
    /** Fires when a pin's popup opens or closes, with the open popup's record id. */
    onPopupChanged: (recordId: string | undefined) => void;
}

/** The map drawn with Google Maps; it is the map's `library` module. */
export interface IGoogleMaps extends IMapLibrary {
    readonly events: IEventSubscriber<IGoogleMapsEvents>;
    /** `undefined` until Google Maps has drawn the map. */
    getInstance(): google.maps.Map | undefined;
}

/** What the adapter reads of the module. */
export interface IGoogleMapsInternal extends IGoogleMaps {
    getParameters(): IGoogleMapsParameters;
    getComponents(): IGoogleMapsComponents;
    /** @returns Unsets `instance`. */
    setInstance(instance: google.maps.Map): () => void;
    /** The record whose pin's popup is open; one at a time, as Leaflet keeps it. */
    getOpenRecordId(): string | undefined;
    openPopup(recordId: string): void;
    closePopup(): void;
}

export interface IGoogleMapsConstructorParameters {
    map: IMap;
    parameters: IGoogleMapsParameters;
}

//the map comes before anything else drawn in the box
const MAP_SURFACE_PRIORITY = -100;

export class GoogleMapsRuntime implements IGoogleMapsInternal {
    public readonly events = new EventEmitter<IGoogleMapsEvents>();
    private _viewport: MapViewport;
    private _parameters: IGoogleMapsParameters;
    private _instance?: google.maps.Map;
    private _openRecordId?: string;
    private _stopListening: () => void;
    private _removeSurface: () => void;

    constructor(parameters: IGoogleMapsConstructorParameters) {
        this._viewport = parameters.map.services.get('viewport');
        this._parameters = parameters.parameters;
        this._stopListening = this._viewport.events.addEventListener('onViewRequested', this._onViewRequested);
        this._removeSurface = parameters.map.surfaces.hooks.surfaces.add(this._onSurfaces, MAP_SURFACE_PRIORITY);
    }

    public getInstance(): google.maps.Map | undefined {
        return this._instance;
    }

    public getComponents(): IGoogleMapsComponents {
        return this._parameters.components ?? {};
    }

    public getParameters(): IGoogleMapsParameters {
        return this._parameters;
    }

    public setInstance(instance: google.maps.Map): () => void {
        this._instance = instance;
        this._viewport.fit();
        this.events.dispatchEvent('onInstanceReady', instance);
        return () => {
            if (this._instance === instance) {
                this._instance = undefined;
            }
        };
    }

    public getOpenRecordId(): string | undefined {
        return this._openRecordId;
    }

    public openPopup(recordId: string): void {
        this._setOpenRecordId(recordId);
    }

    public closePopup(): void {
        this._setOpenRecordId(undefined);
    }

    public destroy(): void {
        this._stopListening();
        this._removeSurface();
        this.events.clearEventListeners();
    }

    private _setOpenRecordId(recordId: string | undefined): void {
        if (this._openRecordId === recordId) {
            return;
        }
        this._openRecordId = recordId;
        this.events.dispatchEvent('onPopupChanged', recordId);
    }

    private _onSurfaces = (surfaces: IMapSurface[]): void => {
        surfaces.push({ key: 'library', onRender: () => createElement(GoogleMaps) });
    };

    private _onViewRequested = (request: IMapViewRequest): void => {
        if (!this._instance) {
            return;
        }
        if ('bounds' in request) {
            this._instance.fitBounds(request.bounds, request.padding);
            return;
        }
        this._instance.setCenter({ lat: request.center.latitude, lng: request.center.longitude });
        this._instance.setZoom(request.zoom);
    };
}
