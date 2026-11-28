import { describe, expect, it } from 'vitest';
import { getMapViewport, getResolvedLocationViewport, getSafeFitPadding, isFiniteMapViewport } from './viewport';

const PRAGUE = { latitude: 50.0755, longitude: 14.4378 };
const BRNO = { latitude: 49.1951, longitude: 16.6068 };

describe('getMapViewport', () => {
    it('falls back to its configured centre when there are no locations', () => {
        const viewport = getMapViewport([]);
        expect(viewport.center).toEqual({ latitude: 49.8175, longitude: 15.473 });
        expect(viewport.zoom).toBe(6);
        expect(viewport.bounds).toBeUndefined();
    });

    it('centres on a single location without bounds, which would collapse to maximum zoom', () => {
        const viewport = getMapViewport([PRAGUE]);
        expect(viewport.center).toEqual(PRAGUE);
        expect(viewport.zoom).toBe(15);
        expect(viewport.bounds).toBeUndefined();
    });

    it('treats co-located locations as one point, so fitting bounds cannot reach maximum zoom', () => {
        const viewport = getMapViewport([PRAGUE, PRAGUE]);
        expect(viewport.center).toEqual(PRAGUE);
        expect(viewport.zoom).toBe(15);
        expect(viewport.bounds).toBeUndefined();
    });

    it('derives bounds and a fitting zoom from several locations', () => {
        const viewport = getMapViewport([PRAGUE, BRNO]);
        expect(viewport.bounds).toEqual({ north: 50.0755, south: 49.1951, east: 16.6068, west: 14.4378 });
        expect(viewport.center.latitude).toBeCloseTo(49.6353, 4);
        expect(viewport.zoom).toBeGreaterThan(5);
        expect(viewport.zoom).toBeLessThan(10);
    });

    it('honours overridden options', () => {
        const viewport = getMapViewport([], { fallbackCenter: PRAGUE, fallbackZoom: 11, padding: 4 });
        expect(viewport.center).toEqual(PRAGUE);
        expect(viewport.zoom).toBe(11);
        expect(viewport.padding).toBe(4);
    });
});

describe('getResolvedLocationViewport', () => {
    it('stays zoomed out for a location that was only guessed at', () => {
        expect(getResolvedLocationViewport({ ...PRAGUE, isPrecise: false }).zoom).toBe(8);
        expect(getResolvedLocationViewport(PRAGUE).zoom).toBe(8);
    });

    it('zooms in on a location precise enough to trust', () => {
        const viewport = getResolvedLocationViewport({ ...PRAGUE, isPrecise: true });
        expect(viewport.zoom).toBe(14);
        expect(viewport.center).toEqual(PRAGUE);
    });

    it('honours overridden zooms', () => {
        expect(getResolvedLocationViewport({ ...PRAGUE, isPrecise: true }, { preciseLocationZoom: 17 }).zoom).toBe(17);
        expect(getResolvedLocationViewport(PRAGUE, { approximateLocationZoom: 5 }).zoom).toBe(5);
    });
});

describe('isFiniteMapViewport', () => {
    it('accepts a viewport derived from real coordinates', () => {
        expect(isFiniteMapViewport(getMapViewport([PRAGUE, BRNO]))).toBe(true);
        expect(isFiniteMapViewport(getMapViewport([]))).toBe(true);
    });

    it('rejects a centre or zoom that is not a number', () => {
        expect(isFiniteMapViewport({ center: { latitude: NaN, longitude: 14 }, zoom: 6, padding: 0 })).toBe(false);
        expect(isFiniteMapViewport({ center: { latitude: 50, longitude: NaN }, zoom: 6, padding: 0 })).toBe(false);
        expect(isFiniteMapViewport({ center: PRAGUE, zoom: NaN, padding: 0 })).toBe(false);
        expect(isFiniteMapViewport({ center: PRAGUE, zoom: Infinity, padding: 0 })).toBe(false);
    });

    it('rejects bounds that are not numbers, which is what a map of no width reports', () => {
        expect(isFiniteMapViewport({
            center: PRAGUE,
            zoom: 6,
            padding: 0,
            bounds: { north: NaN, south: NaN, east: NaN, west: NaN }
        })).toBe(false);
    });

    it('accepts a viewport with no bounds at all', () => {
        expect(isFiniteMapViewport({ center: PRAGUE, zoom: 6, padding: 0 })).toBe(true);
    });
});

describe('getSafeFitPadding', () => {
    it('keeps the asked padding when the container has room for it', () => {
        expect(getSafeFitPadding(323, 528, 48)).toBe(48);
    });

    it('shrinks the padding when the container is smaller than twice of it', () => {
        expect(getSafeFitPadding(100, 400, 48)).toBe(34);
    });

    it('never returns a negative padding, even for a container of no size', () => {
        expect(getSafeFitPadding(0, 0, 48)).toBe(0);
        expect(getSafeFitPadding(10, 10, 48)).toBe(0);
    });
});
