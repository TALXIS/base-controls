import { EventEmitter } from "@talxis/client-libraries";
import type { IMapBounds, IMapPoint } from "../../interfaces";
import type { IMap } from "../MapRuntime";

export type IMapViewRequest =
    | { center: IMapPoint; zoom: number }
    | { bounds: IMapBounds; padding: number };

export interface IMapViewportEvents {
    /** Fires when the view should move, for the library to move its map. */
    onViewRequested: (request: IMapViewRequest) => void;
}

export interface IMapViewportParameters {
    map: IMap;
}

//fitBounds on a single point collapses to the max zoom level, so it needs its own fixed zoom
const SINGLE_POINT_ZOOM = 15;
const BOUNDS_PADDING = 48;
//IP-based geolocation is coarse, so the guessed view stays zoomed out enough to tolerate it being off by a city or two
const IP_GUESS_ZOOM = 8;
//lets a fast-loading dataset win the race and skip the network call entirely
const IP_GUESS_DEBOUNCE_MS = 400;
const IP_GUESS_TIMEOUT_MS = 2500;

/** Asks for the view to move to the pins, or without pins to where the user probably is. */
export class MapViewport {
    public readonly events = new EventEmitter<IMapViewportEvents>();
    private _map: IMap;
    private _cancelGuess?: () => void;
    private _stopListening: () => void;

    constructor(parameters: IMapViewportParameters) {
        this._map = parameters.map;
        this._stopListening = this._map.services.get('provider').addEventListener('onNewDataLoaded', this._onNewDataLoaded);
    }

    /** The view for the records the provider holds now; `undefined` while none has a position. */
    public getView(): IMapViewRequest | undefined {
        const points = this._map.services.get('provider').getRecords().flatMap(record => this._map.getPoint(record) ?? []);
        if (points.length === 0) {
            return undefined;
        }
        if (points.length === 1) {
            return { center: points[0], zoom: SINGLE_POINT_ZOOM };
        }
        return { bounds: this._getBounds(points), padding: BOUNDS_PADDING };
    }

    /** Asks for the view of the current records, or guesses one when there are none. */
    public fit(): void {
        this._cancelGuess?.();
        const view = this.getView();
        if (view) {
            this.events.dispatchEvent('onViewRequested', view);
            return;
        }
        this._guessFromIp();
    }

    public destroy(): void {
        this._stopListening();
        this._cancelGuess?.();
        this.events.clearEventListeners();
    }

    private _onNewDataLoaded = (): void => {
        this.fit();
    };

    private _guessFromIp(): void {
        const controller = new AbortController();
        const debounce = setTimeout(async () => {
            const timeout = setTimeout(() => controller.abort(), IP_GUESS_TIMEOUT_MS);
            const point = await this._fetchIpLocation(controller.signal);
            clearTimeout(timeout);
            if (point && !controller.signal.aborted) {
                this.events.dispatchEvent('onViewRequested', { center: point, zoom: IP_GUESS_ZOOM });
            }
        }, IP_GUESS_DEBOUNCE_MS);
        this._cancelGuess = () => {
            clearTimeout(debounce);
            controller.abort();
            this._cancelGuess = undefined;
        };
    }

    private async _fetchIpLocation(signal: AbortSignal): Promise<IMapPoint | null> {
        try {
            const response = await fetch('https://get.geojs.io/v1/ip/geo.json', { signal });
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            const latitude = parseFloat(data.latitude);
            const longitude = parseFloat(data.longitude);
            return isNaN(latitude) || isNaN(longitude) ? null : { latitude, longitude };
        }
        catch {
            return null;
        }
    }

    private _getBounds(points: IMapPoint[]): IMapBounds {
        const latitudes = points.map(point => point.latitude);
        const longitudes = points.map(point => point.longitude);
        return { north: Math.max(...latitudes), south: Math.min(...latitudes), east: Math.max(...longitudes), west: Math.min(...longitudes) };
    }
}
