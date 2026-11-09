import { IMapDirections, IMapRoutePath } from '../../core/directions';
import { buildUrl, getJson } from '../../core/http';
import { IMapCoordinates } from '../../core/coordinates';

const OSRM_URL = 'https://router.project-osrm.org/route/v1';

/** Stops one call may carry. The demo server takes more, but a url has to stay a sane length. */
const MAX_STOPS = 25;

export interface IOsrmRouteResponse {
    code?: string;
    message?: string;
    routes?: {
        geometry?: { coordinates?: [number, number][] };
        distance?: number;
        duration?: number;
    }[];
}

export interface IOsrmDirectionsConfig {
    /** Service to call. Point this at your own OSRM instance for anything but development. */
    baseUrl?: string;
    /** Routing profile the service was built with. The demo server serves `driving` alone. */
    profile?: string;
}

/**
 * Reads a path out of an OSRM response.
 *
 * The geometry is GeoJSON, so its coordinates are longitude first.
 *
 * @throws When OSRM answered with a code other than `Ok`, so a misconfigured profile is not silent.
 */
export const getOsrmRoutePath = (response: IOsrmRouteResponse): IMapRoutePath | null => {
    if (response.code && response.code !== 'Ok') {
        throw new Error(`OSRM routing failed with ${response.code}${response.message ? `: ${response.message}` : ''}`);
    }
    const route = response.routes?.[0];
    const coordinates = route?.geometry?.coordinates ?? [];
    if (!coordinates.length) {
        return null;
    }
    return {
        coordinates: coordinates.map(([longitude, latitude]) => ({ latitude, longitude })),
        distance: route?.distance,
        duration: route?.duration
    };
};

/**
 * Builds the OpenStreetMap directions service, backed by OSRM.
 *
 * The public demo server carries no availability guarantee and asks that it not be used in production, so
 * point `baseUrl` at your own instance for anything real - the same caveat the OpenStreetMap tiles carry.
 */
export const createOsrmDirections = (config: IOsrmDirectionsConfig = {}): IMapDirections => ({
    maxStops: MAX_STOPS,
    getRoute: async (stops, options) => {
        if (stops.length < 2) {
            return null;
        }
        const path = stops.map((stop: IMapCoordinates) => `${stop.longitude},${stop.latitude}`).join(';');
        const response = await getJson<IOsrmRouteResponse>(
            buildUrl(`${config.baseUrl ?? OSRM_URL}/${config.profile ?? 'driving'}/${path}`, {
                overview: 'full',
                geometries: 'geojson'
            }),
            { signal: options?.signal }
        );
        return getOsrmRoutePath(response);
    }
});
