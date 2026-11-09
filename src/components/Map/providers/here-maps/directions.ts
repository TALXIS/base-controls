import { IMapDirections, IMapRoutePath } from '../../core/directions';
import { IMapDirectionsFactory } from '../provider';
import { buildUrl, getJson } from '../../core/http';
import { decodeFlexiblePolyline } from '../../core/polyline';
import { IMapCoordinates } from '../../core/coordinates';

const ROUTES_URL = 'https://router.hereapi.com/v8/routes';

/** Stops one call may carry. HERE takes many more `via` points than a drawn route ever needs. */
const MAX_STOPS = 50;

export interface IHereRouteSection {
    polyline?: string;
    summary?: { length?: number; duration?: number };
}

export interface IHereRoutesResponse {
    routes?: { sections?: IHereRouteSection[] }[];
}

export interface IHereDirectionsConfig {
    /** How the route is travelled. Anything HERE's `transportMode` accepts. */
    transportMode?: 'car' | 'truck' | 'pedestrian' | 'bicycle' | 'scooter' | 'taxi' | 'bus' | 'privateBus';
}

/**
 * Reads a path out of a HERE routing response.
 *
 * A route with `via` points comes back as one section per leg, each with its own polyline, so the sections
 * are joined and the stop they share is not drawn twice.
 */
export const getHereRoutePath = (response: IHereRoutesResponse): IMapRoutePath | null => {
    const sections = response.routes?.[0]?.sections ?? [];
    if (!sections.length) {
        return null;
    }
    const coordinates: IMapCoordinates[] = [];
    let distance = 0;
    let duration = 0;
    sections.forEach((section) => {
        const decoded = section.polyline ? decodeFlexiblePolyline(section.polyline) : [];
        coordinates.push(...(coordinates.length ? decoded.slice(1) : decoded));
        distance += section.summary?.length ?? 0;
        duration += section.summary?.duration ?? 0;
    });
    if (!coordinates.length) {
        return null;
    }
    return { coordinates, distance: distance || undefined, duration: duration || undefined };
};

/** Builds the HERE directions service, backed by the Routing API v8. */
export const createHereMapsDirections = (apiKey: string, config: IHereDirectionsConfig = {}): IMapDirections => ({
    maxStops: MAX_STOPS,
    getRoute: async (stops, options) => {
        if (stops.length < 2) {
            return null;
        }
        const [origin, ...rest] = stops;
        const destination = rest.pop() as IMapCoordinates;
        const url = buildUrl(ROUTES_URL, {
            transportMode: config.transportMode ?? 'car',
            origin: `${origin.latitude},${origin.longitude}`,
            destination: `${destination.latitude},${destination.longitude}`,
            return: 'polyline,summary',
            lang: options?.language,
            apiKey
        });
        //via is repeated rather than joined, which URLSearchParams cannot express through a single value
        const withVia = rest.reduce(
            (current, stop) => `${current}&via=${encodeURIComponent(`${stop.latitude},${stop.longitude}`)}`,
            url
        );
        return getHereRoutePath(await getJson<IHereRoutesResponse>(withVia, { signal: options?.signal }));
    }
});

/** Builds the HERE directions service with its defaults, for registration as a provider capability. */
export const createHereMapsDirectionsService: IMapDirectionsFactory = ({ apiKey = '' }) => createHereMapsDirections(apiKey);
