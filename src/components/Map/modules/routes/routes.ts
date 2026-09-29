import { IRecord } from '@talxis/client-libraries';
import { getRecordValue } from '../../core/attributes';
import { IMapLocation, IMapRoute } from '../../providers/provider';

/** Attributes a route is read from. Every path accepts dot notation across a lookup. */
export interface IMapRouteAttributes {
    /** Groups pins into one line by shared, non empty value. */
    route: string;
    /** Orders the pins within a line. Without it they are drawn in dataset order. */
    sequence?: string;
    /** Colours the line. The first pin on the route that has a value wins. */
    color?: string;
}

/** The pins tagged with their route, and the routes worth drawing. */
export interface IMapRoutedPins {
    /** The locations handed in, with `routeId` set on every pin of a returned route. */
    locations: IMapLocation[];
    /** Routes of two pins or more, in the order their first pin appears in the dataset. */
    routes: IMapRoute[];
}

/** One pin on a route, with what the route needs to order and colour itself. */
interface IRouteStop {
    location: IMapLocation;
    /** Value of the sequence attribute, or `undefined` where none is configured or the record has none. */
    sequence?: number | string;
    color?: string;
    /** Position in the dataset, which orders stops that share a sequence value or have none. */
    index: number;
}

/** Reads an attribute as text, treating an empty value as no value at all. */
const getText = (record: IRecord, path?: string): string | undefined => {
    if (!path) {
        return undefined;
    }
    const value = getRecordValue(record, path);
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    return `${value}`;
};

/** Reads the value a route orders its stops by, as a number where the value parses as one, else as text. */
const getSequence = (record: IRecord, path?: string): number | string | undefined => {
    const text = getText(record, path);
    if (text === undefined) {
        return undefined;
    }
    const numeric = Number(text);
    return Number.isFinite(numeric) ? numeric : text;
};

/**
 * Orders the stops of one route. Stops with a sequence come first, in that order; numbers sort as numbers
 * so `10` follows `9`. Anything without one keeps its dataset position at the end, which is what an
 * unconfigured route already did.
 */
const orderStops = (stops: IRouteStop[]): IRouteStop[] => [...stops].sort((left, right) => {
    if (left.sequence === undefined && right.sequence === undefined) {
        return left.index - right.index;
    }
    if (left.sequence === undefined) {
        return 1;
    }
    if (right.sequence === undefined) {
        return -1;
    }
    if (typeof left.sequence === 'number' && typeof right.sequence === 'number') {
        return left.sequence - right.sequence || left.index - right.index;
    }
    return `${left.sequence}`.localeCompare(`${right.sequence}`) || left.index - right.index;
});

/**
 * Groups the placed pins into routes by the value their records share, ordered and coloured by the other
 * two attributes. A route needs at least two pins to be drawable; `isRouteVisible` drops whole routes
 * before they are returned, and a pin whose route was dropped is left untagged so it clusters like any other.
 */
export const getMapRoutes = (
    records: IRecord[],
    locations: IMapLocation[],
    attributes: IMapRouteAttributes,
    isRouteVisible?: (route: IMapRoute) => boolean
): IMapRoutedPins => {
    const locationsById = new Map(locations.map((location) => [location.id, location]));
    //a Map, not an object - object keys that look like integers would reorder the routes
    const routeStops = new Map<string, IRouteStop[]>();

    records.forEach((record, index) => {
        const location = locationsById.get(record.getRecordId());
        if (!location) {
            return;
        }
        const routeId = getText(record, attributes.route);
        if (!routeId) {
            return;
        }
        const stop: IRouteStop = {
            location,
            sequence: getSequence(record, attributes.sequence),
            color: getText(record, attributes.color),
            index
        };
        const stops = routeStops.get(routeId);
        if (stops) {
            stops.push(stop);
        } else {
            routeStops.set(routeId, [stop]);
        }
    });

    const routes: IMapRoute[] = [...routeStops]
        .filter(([, stops]) => stops.length > 1)
        .map(([id, stops]) => {
            const ordered = orderStops(stops);
            return {
                id,
                //tagged copies, so the pins the core memoized are left as they were
                locations: ordered.map((stop) => ({ ...stop.location, routeId: id })),
                color: ordered.find((stop) => stop.color)?.color
            };
        })
        .filter((route) => !isRouteVisible || isRouteVisible(route));

    const taggedById = new Map(routes.flatMap((route) => route.locations.map((location) => [location.id, location] as const)));
    return {
        locations: locations.map((location) => taggedById.get(location.id) ?? location),
        routes
    };
};
