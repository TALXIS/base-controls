import { describe, expect, it } from 'vitest';
import { IRecord } from '@talxis/client-libraries';
import { getMapPins } from '../../core/pins';
import { createFakeRecord } from '../../testing/records';
import { getMapRoutes, IMapRouteAttributes } from './routes';

const coordinates = { latitude: 'lat', longitude: 'lng' };

/** Places the records the way the core does, then groups them the way the module does. */
const route = (records: IRecord[], attributes: IMapRouteAttributes, isRouteVisible?: Parameters<typeof getMapRoutes>[3]) => {
    const pins = getMapPins(records, { attributes: coordinates });
    return getMapRoutes(records, pins.locations, attributes, isRouteVisible);
};

describe('getMapRoutes', () => {
    it('groups records sharing a route attribute value, keeping dataset order', () => {
        const records = [
            createFakeRecord({ id: 'a', rawData: { lat: 1, lng: 1, trip: 'north' } }),
            createFakeRecord({ id: 'b', rawData: { lat: 2, lng: 2, trip: 'south' } }),
            createFakeRecord({ id: 'c', rawData: { lat: 3, lng: 3, trip: 'north' } })
        ];
        const { routes } = route(records, { route: 'trip' });
        expect(routes).toHaveLength(1);
        expect(routes[0].id).toBe('north');
        expect(routes[0].locations.map((location) => location.id)).toEqual(['a', 'c']);
    });

    it('tags the pins of a drawn route and leaves the rest alone', () => {
        const records = [
            createFakeRecord({ id: 'a', rawData: { lat: 1, lng: 1, trip: 'north' } }),
            createFakeRecord({ id: 'b', rawData: { lat: 2, lng: 2 } }),
            createFakeRecord({ id: 'c', rawData: { lat: 3, lng: 3, trip: 'north' } })
        ];
        const { locations } = route(records, { route: 'trip' });
        expect(locations.map((location) => location.routeId)).toEqual(['north', undefined, 'north']);
    });

    it('drops a route of a single pin and a record with an empty route value', () => {
        const records = [
            createFakeRecord({ id: 'a', rawData: { lat: 1, lng: 1, trip: 'lonely' } }),
            createFakeRecord({ id: 'b', rawData: { lat: 2, lng: 2, trip: '' } })
        ];
        const { routes, locations } = route(records, { route: 'trip' });
        expect(routes).toEqual([]);
        expect(locations.every((location) => !location.routeId)).toBe(true);
    });

    it('leaves out a record the core could not place', () => {
        const records = [
            createFakeRecord({ id: 'a', rawData: { lat: 1, lng: 1, trip: 'north' } }),
            createFakeRecord({ id: 'b', rawData: { lat: null, lng: null, trip: 'north' } }),
            createFakeRecord({ id: 'c', rawData: { lat: 3, lng: 3, trip: 'north' } })
        ];
        const { routes } = route(records, { route: 'trip' });
        expect(routes[0].locations.map((location) => location.id)).toEqual(['a', 'c']);
    });

    it('orders a route by its sequence attribute rather than by dataset order', () => {
        const records = [
            createFakeRecord({ id: 'c', rawData: { lat: 3, lng: 3, trip: 'north', stop: 3 } }),
            createFakeRecord({ id: 'a', rawData: { lat: 1, lng: 1, trip: 'north', stop: 1 } }),
            createFakeRecord({ id: 'b', rawData: { lat: 2, lng: 2, trip: 'north', stop: 2 } })
        ];
        const [first] = route(records, { route: 'trip', sequence: 'stop' }).routes;
        expect(first.locations.map((location) => location.id)).toEqual(['a', 'b', 'c']);
    });

    it('sorts a numeric sequence as numbers, so ten follows nine', () => {
        const records = [9, 10, 2].map((stop) => createFakeRecord({
            id: `s${stop}`,
            rawData: { lat: stop, lng: stop, trip: 'north', stop }
        }));
        const [first] = route(records, { route: 'trip', sequence: 'stop' }).routes;
        expect(first.locations.map((location) => location.id)).toEqual(['s2', 's9', 's10']);
    });

    it('puts the stops with no sequence last, keeping their dataset order', () => {
        const records = [
            createFakeRecord({ id: 'none1', rawData: { lat: 1, lng: 1, trip: 'north' } }),
            createFakeRecord({ id: 'second', rawData: { lat: 2, lng: 2, trip: 'north', stop: 2 } }),
            createFakeRecord({ id: 'none2', rawData: { lat: 3, lng: 3, trip: 'north' } }),
            createFakeRecord({ id: 'first', rawData: { lat: 4, lng: 4, trip: 'north', stop: 1 } })
        ];
        const [first] = route(records, { route: 'trip', sequence: 'stop' }).routes;
        expect(first.locations.map((location) => location.id)).toEqual(['first', 'second', 'none1', 'none2']);
    });

    it('colours a route from the first stop that names one', () => {
        const records = [
            createFakeRecord({ id: 'a', rawData: { lat: 1, lng: 1, trip: 'north' } }),
            createFakeRecord({ id: 'b', rawData: { lat: 2, lng: 2, trip: 'north', shade: '#c50f1f' } })
        ];
        const [first] = route(records, { route: 'trip', color: 'shade' }).routes;
        expect(first.color).toBe('#c50f1f');
    });

    it('leaves a route uncoloured when no stop names one', () => {
        const records = [
            createFakeRecord({ id: 'a', rawData: { lat: 1, lng: 1, trip: 'north' } }),
            createFakeRecord({ id: 'b', rawData: { lat: 2, lng: 2, trip: 'north' } })
        ];
        const [first] = route(records, { route: 'trip', color: 'shade' }).routes;
        expect(first.color).toBeUndefined();
    });

    it('drops the routes the host hides, and untags their pins so they cluster again', () => {
        const records = [
            createFakeRecord({ id: 'a', rawData: { lat: 1, lng: 1, trip: 'north' } }),
            createFakeRecord({ id: 'b', rawData: { lat: 2, lng: 2, trip: 'north' } }),
            createFakeRecord({ id: 'c', rawData: { lat: 3, lng: 3, trip: 'south' } }),
            createFakeRecord({ id: 'd', rawData: { lat: 4, lng: 4, trip: 'south' } })
        ];
        const { routes, locations } = route(records, { route: 'trip' }, (candidate) => candidate.id === 'south');
        expect(routes.map((candidate) => candidate.id)).toEqual(['south']);
        expect(locations.map((location) => location.routeId)).toEqual([undefined, undefined, 'south', 'south']);
    });
});
