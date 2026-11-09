import { IMapDirections, IMapRoutePath } from '../../core/directions';
import { IMapDirectionsFactory } from '../provider';
import { buildUrl, getJson } from '../../core/http';
import { IMapCoordinates } from '../../core/coordinates';

const ROUTE_URL = 'https://api.mapy.com/v1/routing/route';

/** Stops one call may carry: the two ends plus the fifteen waypoints Mapy.com accepts. */
const MAX_STOPS = 17;

export interface IMapyRouteResponse {
    length?: number;
    duration?: number;
    geometry?: { geometry?: { coordinates?: [number, number][] } };
}

export interface IMapyDirectionsConfig {
    /** How the route is travelled. Anything Mapy.com's `routeType` accepts. */
    routeType?: 'car_fast' | 'car_fast_traffic' | 'car_short' | 'foot_fast' | 'bike_road' | 'bike_mountain';
    avoidToll?: boolean;
    avoidHighways?: boolean;
}

/**
 * Reads a path out of a Mapy.com routing response.
 *
 * The geometry is GeoJSON, so its coordinates are longitude first.
 */
export const getMapyRoutePath = (response: IMapyRouteResponse): IMapRoutePath | null => {
    const coordinates = response.geometry?.geometry?.coordinates ?? [];
    if (!coordinates.length) {
        return null;
    }
    return {
        coordinates: coordinates.map(([longitude, latitude]) => ({ latitude, longitude })),
        distance: response.length,
        duration: response.duration
    };
};

/** Builds the Mapy.com directions service, backed by their routing API; defaults to the fastest car route. */
export const createMapyDirections = (apiKey: string, config: IMapyDirectionsConfig = {}): IMapDirections => ({
    maxStops: MAX_STOPS,
    getRoute: async (stops, options) => {
        if (stops.length < 2) {
            return null;
        }
        const [start, ...rest] = stops;
        const end = rest.pop() as IMapCoordinates;
        const response = await getJson<IMapyRouteResponse>(
            buildUrl(ROUTE_URL, {
                start: `${start.longitude},${start.latitude}`,
                end: `${end.longitude},${end.latitude}`,
                waypoints: rest.map((stop) => `${stop.longitude},${stop.latitude}`).join(';') || undefined,
                routeType: config.routeType ?? 'car_fast',
                avoidToll: config.avoidToll,
                avoidHighways: config.avoidHighways,
                format: 'geojson',
                lang: options?.language,
                apikey: apiKey
            }),
            { signal: options?.signal }
        );
        return getMapyRoutePath(response);
    }
});

/** Builds the Mapy.com directions service with its defaults, for registration as a provider capability. */
export const createMapyDirectionsService: IMapDirectionsFactory = ({ apiKey = '' }) => createMapyDirections(apiKey);
