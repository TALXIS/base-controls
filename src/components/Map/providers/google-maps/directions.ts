import { IMapDirections, IMapRoutePath } from '../../core/directions';
import { IMapDirectionsFactory } from '../provider';
import { getJson } from '../../core/http';
import { decodeEncodedPolyline } from '../../core/polyline';
import { IMapCoordinates } from '../../core/coordinates';

const ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

/** Stops one call may carry: the two ends plus the intermediates the Routes API accepts. */
const MAX_STOPS = 25;

/** Fields the response should carry. The Routes API rejects a call that does not ask for any. */
const FIELD_MASK = 'routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration';

export interface IGoogleRoutesResponse {
    routes?: {
        polyline?: { encodedPolyline?: string };
        distanceMeters?: number;
        duration?: string;
    }[];
}

export interface IGoogleDirectionsConfig {
    /** How the route is travelled. Anything the Routes API's `travelMode` accepts. */
    travelMode?: 'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER' | 'TRANSIT';
}

/** Turns a Routes API duration - a number of seconds followed by `s` - into seconds, or `undefined` when there is nothing to read. */
const getDurationSeconds = (duration?: string): number | undefined => {
    const seconds = parseFloat(duration ?? '');
    return Number.isFinite(seconds) ? seconds : undefined;
};

/** Reads a path out of a Routes API response, or `null` when Google routed nothing. */
export const getGoogleRoutePath = (response: IGoogleRoutesResponse): IMapRoutePath | null => {
    const route = response.routes?.[0];
    const coordinates = decodeEncodedPolyline(route?.polyline?.encodedPolyline ?? '');
    if (!coordinates.length) {
        return null;
    }
    return {
        coordinates,
        distance: route?.distanceMeters,
        duration: getDurationSeconds(route?.duration)
    };
};

/** Shapes one stop the way the Routes API expects a waypoint. */
const toWaypoint = (stop: IMapCoordinates) => ({
    location: { latLng: { latitude: stop.latitude, longitude: stop.longitude } }
});

/**
 * Builds the Google Maps directions service, backed by the Routes API.
 *
 * The Routes API is a separate api from the one that draws the map and from the Geocoding API, so a project
 * that has not enabled `routes.googleapis.com` answers 403 - which the control reports and then falls back
 * to a straight line for.
 */
export const createGoogleMapsDirections = (apiKey: string, config: IGoogleDirectionsConfig = {}): IMapDirections => ({
    maxStops: MAX_STOPS,
    getRoute: async (stops, options) => {
        if (stops.length < 2) {
            return null;
        }
        const [origin, ...rest] = stops;
        const destination = rest.pop() as IMapCoordinates;
        const response = await getJson<IGoogleRoutesResponse>(ROUTES_URL, {
            signal: options?.signal,
            headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELD_MASK },
            body: {
                origin: toWaypoint(origin),
                destination: toWaypoint(destination),
                intermediates: rest.map(toWaypoint),
                travelMode: config.travelMode ?? 'DRIVE',
                languageCode: options?.language
            }
        });
        return getGoogleRoutePath(response);
    }
});

/** Builds the Google Maps directions service with its defaults, for registration as a provider capability. */
export const createGoogleMapsDirectionsService: IMapDirectionsFactory = ({ apiKey = '' }) => createGoogleMapsDirections(apiKey);
