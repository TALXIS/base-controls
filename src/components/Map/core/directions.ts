import { IMapCoordinates } from './coordinates';

export interface IMapDirectionsOptions {
    /** BCP 47 tag the service should answer in, where it puts language in the response at all. */
    language?: string;
    signal?: AbortSignal;
}

/** A path following the road network, as the coordinates to draw and what the service said about them. */
export interface IMapRoutePath {
    coordinates: IMapCoordinates[];
    /** Metres, when the service reports them. */
    distance?: number;
    /** Seconds, when the service reports them. */
    duration?: number;
}

/**
 * Snaps a run of stops to the road network.
 *
 * Every vendor that has a directions service implements this - and a vendor without one simply does not
 * build one, which is what lets the control fall back to a straight line.
 */
export interface IMapDirections {
    /** Most stops one call may carry, including the two ends. Longer runs are split across calls. */
    readonly maxStops: number;
    /** The path through the stops, or `null` when the service cannot route them. */
    getRoute(stops: IMapCoordinates[], options?: IMapDirectionsOptions): Promise<IMapRoutePath | null>;
}

/**
 * Splits a run of stops into legs no longer than a service accepts (a `maxStops` below two is treated as
 * two). Legs overlap by one stop, so putting their paths back together leaves no gap at the joins.
 */
export const getDirectionsLegs = (stops: IMapCoordinates[], maxStops: number): IMapCoordinates[][] => {
    const limit = Math.max(2, Math.floor(maxStops));
    if (stops.length < 2) {
        return [];
    }
    const legs: IMapCoordinates[][] = [];
    for (let start = 0; start < stops.length - 1; start += limit - 1) {
        legs.push(stops.slice(start, start + limit));
    }
    return legs;
};

/** Routes a whole run of stops, splitting it across calls when the service caps how many it takes; returns `null` when any leg could not be routed. */
export const getRouteThroughStops = async (
    directions: IMapDirections,
    stops: IMapCoordinates[],
    options?: IMapDirectionsOptions
): Promise<IMapRoutePath | null> => {
    const legs = getDirectionsLegs(stops, directions.maxStops);
    if (!legs.length) {
        return null;
    }
    const paths: IMapRoutePath[] = [];
    for (const leg of legs) {
        const path = await directions.getRoute(leg, options);
        if (!path) {
            return null;
        }
        paths.push(path);
    }
    return {
        //legs share their joining stop, so every leg after the first drops its own first coordinate
        coordinates: paths.flatMap((path, index) => (index ? path.coordinates.slice(1) : path.coordinates)),
        distance: paths.reduce((total, path) => total + (path.distance ?? 0), 0) || undefined,
        duration: paths.reduce((total, path) => total + (path.duration ?? 0), 0) || undefined
    };
};
