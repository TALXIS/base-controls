import { describe, expect, it } from 'vitest';
import { decodeEncodedPolyline, decodeFlexiblePolyline } from './polyline';

describe('decodeEncodedPolyline', () => {
    it('decodes the reference polyline from the Google encoding specification', () => {
        const coordinates = decodeEncodedPolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
        expect(coordinates).toEqual([
            { latitude: 38.5, longitude: -120.2 },
            { latitude: 40.7, longitude: -120.95 },
            { latitude: 43.252, longitude: -126.453 }
        ]);
    });

    it('decodes an empty polyline to no coordinates', () => {
        expect(decodeEncodedPolyline('')).toEqual([]);
    });

    it('honours a precision other than the default five', () => {
        const [first] = decodeEncodedPolyline('_p~iF~ps|U', 6);
        expect(first.latitude).toBeCloseTo(3.85, 6);
        expect(first.longitude).toBeCloseTo(-12.02, 6);
    });
});

describe('decodeFlexiblePolyline', () => {
    //captured from a live HERE Routing v8 response, together with the endpoints it reported
    const HERE_ROUTE = 'BG62rw_C63mxbiDGkNrEkDvCwC_EwC7L0U8G4c0KwCoB7LghC9DoQ';

    it('decodes a route HERE returned, matching the endpoints it reported alongside', () => {
        const coordinates = decodeFlexiblePolyline(HERE_ROUTE);

        expect(coordinates.length).toBeGreaterThan(2);
        expect(coordinates[0].latitude).toBeCloseTo(50.075501, 5);
        expect(coordinates[0].longitude).toBeCloseTo(14.4377568, 5);
        expect(coordinates[coordinates.length - 1].latitude).toBeCloseTo(50.0764668, 5);
        expect(coordinates[coordinates.length - 1].longitude).toBeCloseTo(14.4389802, 5);
    });

    it('stays within the bounding box of its own endpoints', () => {
        const coordinates = decodeFlexiblePolyline(HERE_ROUTE);
        coordinates.forEach((coordinate) => {
            expect(coordinate.latitude).toBeGreaterThan(50.07);
            expect(coordinate.latitude).toBeLessThan(50.08);
            expect(coordinate.longitude).toBeGreaterThan(14.43);
            expect(coordinate.longitude).toBeLessThan(14.45);
        });
    });

    it('decodes an empty polyline to no coordinates', () => {
        expect(decodeFlexiblePolyline('')).toEqual([]);
    });

    it('rejects a version it does not know', () => {
        //'C' is 2, so the version reads as 2; 'G' is 6, a complete header of precision 6
        expect(() => decodeFlexiblePolyline('CG')).toThrow(/version 2/);
    });

    it('rejects a character outside the alphabet', () => {
        expect(() => decodeFlexiblePolyline('BG*')).toThrow(/Unexpected character/);
    });
});
