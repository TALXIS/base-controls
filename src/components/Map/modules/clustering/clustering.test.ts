import { describe, expect, it } from 'vitest';
import { createMapClusterIndex, WORLD_BOUNDS } from './clustering';
import { IMapLocation } from '../../providers/provider';

//a record pin carries the record it was built from, which is what a cluster lists
const location = (id: string, latitude: number, longitude: number): IMapLocation =>
    ({ id, recordId: id, latitude, longitude, label: id });

/** Four pins a few metres apart, which overlap at every realistic zoom. */
const CO_LOCATED: IMapLocation[] = [
    location('a', 50.0755, 14.4378),
    location('b', 50.07551, 14.43781),
    location('c', 50.07552, 14.43782),
    location('d', 50.07553, 14.43783)
];

/** Four pins in different countries, which never overlap once you are zoomed in. */
const SPREAD: IMapLocation[] = [
    location('prague', 50.0755, 14.4378),
    location('brno', 49.1951, 16.6068),
    location('warsaw', 52.2297, 21.0122),
    location('sarajevo', 43.8563, 18.4067)
];

describe('createMapClusterIndex', () => {
    it('merges overlapping pins into one carrying the exact count', () => {
        const drawn = createMapClusterIndex(CO_LOCATED).getLocations(WORLD_BOUNDS, 8);

        expect(drawn).toHaveLength(1);
        expect(drawn[0].cluster?.count).toBe(4);
        expect(drawn[0].id).toMatch(/^cluster-/);
    });

    it('lists the records behind a cluster, so its card can show them', () => {
        const [cluster] = createMapClusterIndex(CO_LOCATED).getLocations(WORLD_BOUNDS, 8);
        expect(cluster.cluster?.recordIds.sort()).toEqual(['a', 'b', 'c', 'd']);
    });

    it('reports the zoom a cluster breaks apart at, so clicking it can zoom usefully', () => {
        const [cluster] = createMapClusterIndex(SPREAD).getLocations(WORLD_BOUNDS, 3);
        expect(cluster.cluster?.expansionZoom).toBeGreaterThan(3);
    });

    it('draws pins that do not overlap as themselves, keeping their record id and label', () => {
        const drawn = createMapClusterIndex(SPREAD).getLocations(WORLD_BOUNDS, 12);

        expect(drawn).toHaveLength(4);
        expect(drawn.every((pin) => !pin.cluster)).toBe(true);
        expect(drawn.map((pin) => pin.id).sort()).toEqual(['brno', 'prague', 'sarajevo', 'warsaw']);
        expect(drawn.find((pin) => pin.id === 'prague')?.label).toBe('prague');
    });

    it('separates pins as the map zooms in', () => {
        const index = createMapClusterIndex(SPREAD);

        const zoomedOut = index.getLocations(WORLD_BOUNDS, 2);
        const zoomedIn = index.getLocations(WORLD_BOUNDS, 12);

        expect(zoomedOut.length).toBeLessThan(zoomedIn.length);
    });

    it('never merges past the configured zoom ceiling', () => {
        const drawn = createMapClusterIndex(CO_LOCATED, { maxZoom: 4 }).getLocations(WORLD_BOUNDS, 10);
        expect(drawn).toHaveLength(4);
        expect(drawn.every((pin) => !pin.cluster)).toBe(true);
    });

    it('hands back only the pins inside the view it was asked about', () => {
        const index = createMapClusterIndex(SPREAD);
        const aroundPrague = { north: 50.5, south: 49.5, east: 15.0, west: 14.0 };

        const drawn = index.getLocations(aroundPrague, 12);

        expect(drawn.map((pin) => pin.id)).toEqual(['prague']);
    });

    it('caps how many members a cluster lists while keeping the count exact', () => {
        const many = Array.from({ length: 120 }, (_, i) =>
            location(`p${i}`, 50.0755 + i * 0.00001, 14.4378 + i * 0.00001));

        const [cluster] = createMapClusterIndex(many, { maxLeaves: 10 }).getLocations(WORLD_BOUNDS, 8);

        expect(cluster.cluster?.count).toBe(120);
        expect(cluster.cluster?.recordIds).toHaveLength(10);
    });

    it('draws nothing for no pins', () => {
        expect(createMapClusterIndex([]).getLocations(WORLD_BOUNDS, 8)).toEqual([]);
    });

    it('leaves a lone pin alone rather than clustering it with itself', () => {
        const drawn = createMapClusterIndex([location('only', 50, 14)]).getLocations(WORLD_BOUNDS, 8);
        expect(drawn).toHaveLength(1);
        expect(drawn[0].cluster).toBeUndefined();
    });

    it('handles a fractional zoom, which a map between two levels reports', () => {
        const drawn = createMapClusterIndex(CO_LOCATED).getLocations(WORLD_BOUNDS, 8.4);
        expect(drawn).toHaveLength(1);
        expect(drawn[0].cluster?.count).toBe(4);
    });
});

describe('createMapClusterIndex - routed pins', () => {
    const routed = (id: string, latitude: number, longitude: number, routeId: string): IMapLocation =>
        ({ ...location(id, latitude, longitude), routeId });

    const CO_LOCATED_MIX: IMapLocation[] = [
        location('a', 50.0755, 14.4378),
        location('b', 50.0755, 14.4378),
        routed('stop-1', 50.0755, 14.4378, 'route-1'),
        routed('stop-2', 50.0755, 14.4378, 'route-1'),
    ];

    it('never merges a pin of a drawn route into a cluster, even co-located ones', () => {
        const drawn = createMapClusterIndex(CO_LOCATED_MIX).getLocations(WORLD_BOUNDS, 8);

        const cluster = drawn.find((pin) => pin.cluster);
        expect(cluster?.cluster?.count).toBe(2);
        expect(cluster?.cluster?.recordIds).toEqual(['a', 'b']);
        expect(drawn.map((pin) => pin.id)).toContain('stop-1');
        expect(drawn.map((pin) => pin.id)).toContain('stop-2');
    });

    it('clusters an untagged pin like any other, which is what a hidden route leaves behind', () => {
        const drawn = createMapClusterIndex(CO_LOCATED_MIX.map(({ routeId, ...pin }) => pin)).getLocations(WORLD_BOUNDS, 8);

        expect(drawn).toHaveLength(1);
        expect(drawn[0].cluster?.count).toBe(4);
        expect(drawn[0].cluster?.recordIds).toEqual(['a', 'b', 'stop-1', 'stop-2']);
    });

    it('still limits the pins of a drawn route to the view', () => {
        const drawn = createMapClusterIndex([
            routed('inside', 50, 14, 'route-1'),
            routed('outside', 10, -100, 'route-1'),
        ]).getLocations({ north: 51, south: 49, east: 15, west: 13 }, 8);

        expect(drawn.map((pin) => pin.id)).toEqual(['inside']);
    });
});
