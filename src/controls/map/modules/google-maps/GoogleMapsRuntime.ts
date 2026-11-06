import { EventEmitter } from "@talxis/client-libraries";
import type { IEventSubscriber } from "@core";
import type { IMapLibrary } from "../../interfaces";
import type { IMap } from "../../runtime/MapRuntime";
import type { IMapViewRequest, MapViewport } from "../../runtime/viewport/MapViewport";

export interface IGoogleMapsParameters {
    /** A Google Maps JavaScript API key. */
    apiKey: string;
}

export interface IGoogleMapsEvents {
    /** Fires once Google Maps has drawn the map, with its instance. */
    onInstanceReady: (instance: google.maps.Map) => void;
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
    /** @returns Unsets `instance`. */
    setInstance(instance: google.maps.Map): () => void;
}

export interface IGoogleMapsConstructorParameters {
    map: IMap;
    parameters: IGoogleMapsParameters;
}

export class GoogleMapsRuntime implements IGoogleMapsInternal {
    public readonly events = new EventEmitter<IGoogleMapsEvents>();
    private _viewport: MapViewport;
    private _parameters: IGoogleMapsParameters;
    private _instance?: google.maps.Map;
    private _stopListening: () => void;

    constructor(parameters: IGoogleMapsConstructorParameters) {
        this._viewport = parameters.map.services.get('viewport');
        this._parameters = parameters.parameters;
        this._stopListening = this._viewport.events.addEventListener('onViewRequested', this._onViewRequested);
    }

    public getInstance(): google.maps.Map | undefined {
        return this._instance;
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

    public destroy(): void {
        this._stopListening();
        this.events.clearEventListeners();
    }

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
