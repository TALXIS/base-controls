import { describe, expect, it, vi } from 'vitest';
import { getDirectionsLegs, getRouteThroughStops, IMapDirections, IMapRoutePath } from './directions';
import { IMapCoordinates } from './coordinates';

const stop = (index: number): IMapCoordinates => ({ latitude: index, longitude: index });
const stops = (count: number) => Array.from({ length: count }, (_, index) => stop(index));

const createDirections = (
    maxStops: number,
    getRoute: (legStops: IMapCoordinates[]) => Promise<IMapRoutePath | null>
): IMapDirections => ({ maxStops, getRoute: vi.fn((legStops) => getRoute(legStops)) });

/** Answers with the stops themselves, which makes the joining of legs easy to assert on. */
const passThrough = (maxStops: number) =>
    createDirections(maxStops, async (legStops) => ({ coordinates: legStops, distance: 10, duration: 5 }));

describe('getDirectionsLegs', () => {
    it('keeps a run the service accepts whole', () => {
        expect(getDirectionsLegs(stops(5), 15)).toEqual([stops(5)]);
    });

    it('splits a longer run into legs that overlap by their joining stop', () => {
        const legs = getDirectionsLegs(stops(5), 3);
        expect(legs).toEqual([[stop(0), stop(1), stop(2)], [stop(2), stop(3), stop(4)]]);
    });

    it('splits a run that does not divide evenly', () => {
        const legs = getDirectionsLegs(stops(6), 3);
        expect(legs.map((leg) => leg.length)).toEqual([3, 3, 2]);
        expect(legs[2]).toEqual([stop(4), stop(5)]);
    });

    it('routes nothing for fewer than two stops', () => {
        expect(getDirectionsLegs([], 10)).toEqual([]);
        expect(getDirectionsLegs([stop(0)], 10)).toEqual([]);
    });

    it('treats a cap below two as two, so it always makes progress', () => {
        expect(getDirectionsLegs(stops(3), 1)).toEqual([[stop(0), stop(1)], [stop(1), stop(2)]]);
    });
});

describe('getRouteThroughStops', () => {
    it('routes a short run in one call', async () => {
        const directions = passThrough(15);
        const path = await getRouteThroughStops(directions, stops(3));

        expect(directions.getRoute).toHaveBeenCalledOnce();
        expect(path?.coordinates).toEqual(stops(3));
        expect(path?.distance).toBe(10);
    });

    it('joins split legs without repeating the stop they share', async () => {
        const directions = passThrough(3);
        const path = await getRouteThroughStops(directions, stops(5));

        expect(directions.getRoute).toHaveBeenCalledTimes(2);
        expect(path?.coordinates).toEqual(stops(5));
    });

    it('adds up what each leg reported', async () => {
        const path = await getRouteThroughStops(passThrough(3), stops(5));
        expect(path?.distance).toBe(20);
        expect(path?.duration).toBe(10);
    });

    it('routes nothing when a leg cannot be routed', async () => {
        const directions = createDirections(3, async (legStops) =>
            legStops[0].latitude === 0 ? { coordinates: legStops } : null);

        expect(await getRouteThroughStops(directions, stops(5))).toBeNull();
    });

    it('routes nothing for fewer than two stops', async () => {
        const directions = passThrough(15);
        expect(await getRouteThroughStops(directions, [stop(0)])).toBeNull();
        expect(directions.getRoute).not.toHaveBeenCalled();
    });

    it('reports no distance when no leg carried one', async () => {
        const directions = createDirections(15, async (legStops) => ({ coordinates: legStops }));
        const path = await getRouteThroughStops(directions, stops(3));
        expect(path?.distance).toBeUndefined();
        expect(path?.duration).toBeUndefined();
    });
});
