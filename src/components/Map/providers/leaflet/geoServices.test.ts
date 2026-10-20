import { describe, expect, it } from 'vitest';
import { createNominatimGeocoder, getNominatimPlace, INominatimResult } from './geocoder';
import { getOsrmRoutePath } from './directions';

//trimmed from a live Nominatim reverse response for 50.0755, 14.4378
const REVERSE_RESULT: INominatimResult = {
    lat: '50.0756080',
    lon: '14.4377997',
    display_name: 'náměstí Míru, Vyšehrad, obvod Praha 2, Praha, 120 00, Česko',
    address: {
        road: 'náměstí Míru',
        suburb: 'Vyšehrad',
        district: 'obvod Praha 2',
        city: 'Praha',
        postcode: '120 00',
        country: 'Česko',
        country_code: 'cz'
    }
};

describe('getNominatimPlace', () => {
    it('maps a live reverse result onto address components', () => {
        const place = getNominatimPlace(REVERSE_RESULT);

        expect(place?.coordinates.latitude).toBeCloseTo(50.075608, 6);
        expect(place?.coordinates.longitude).toBeCloseTo(14.4377997, 6);
        expect(place?.label).toBe('náměstí Míru, Vyšehrad, obvod Praha 2, Praha, 120 00, Česko');
        expect(place?.address).toMatchObject({
            country: 'Česko',
            countryCode: 'CZ',
            locality: 'Praha',
            subLocality: 'Vyšehrad',
            street: 'náměstí Míru',
            postalCode: '120 00'
        });
    });

    it('reads a house number and a state where the result carries them', () => {
        const place = getNominatimPlace({
            lat: '50.0843218',
            lon: '14.4248309',
            display_name: 'El Emir, 1, Václavské náměstí, Praha',
            address: { house_number: '1', road: 'Václavské náměstí', state: 'Praha', city: 'Praha' }
        });

        expect(place?.address.streetNumber).toBe('1');
        expect(place?.address.administrativeArea).toBe('Praha');
    });

    it('falls back through the settlement keys Nominatim uses by country', () => {
        expect(getNominatimPlace({ lat: '1', lon: '1', address: { town: 'Beroun' } })?.address.locality).toBe('Beroun');
        expect(getNominatimPlace({ lat: '1', lon: '1', address: { village: 'Lhota' } })?.address.locality).toBe('Lhota');
        expect(getNominatimPlace({ lat: '1', lon: '1', address: { municipality: 'Obec' } })?.address.locality).toBe('Obec');
    });

    it('maps nothing for a result with no usable position', () => {
        expect(getNominatimPlace({ display_name: 'Somewhere' })).toBeUndefined();
        expect(getNominatimPlace({ lat: 'north', lon: '1' })).toBeUndefined();
    });
});

describe('getOsrmRoutePath', () => {
    it('reads a GeoJSON route, swapping its longitude first coordinates', () => {
        const path = getOsrmRoutePath({
            code: 'Ok',
            routes: [{
                geometry: { coordinates: [[14.4378, 50.0755], [14.4390, 50.0765]] },
                distance: 250.4,
                duration: 49.1
            }]
        });

        expect(path?.coordinates[0]).toEqual({ latitude: 50.0755, longitude: 14.4378 });
        expect(path?.distance).toBe(250.4);
        expect(path?.duration).toBe(49.1);
    });

    it('raises a code other than Ok, so a misconfigured profile is not silent', () => {
        expect(() => getOsrmRoutePath({ code: 'NoRoute', message: 'Impossible route' }))
            .toThrow(/NoRoute: Impossible route/);
    });

    it('routes nothing when the response carries no geometry', () => {
        expect(getOsrmRoutePath({ code: 'Ok', routes: [] })).toBeNull();
    });
});

describe('createNominatimGeocoder', () => {
    it('holds the public instance to what its usage policy allows', () => {
        const geocoder = createNominatimGeocoder();

        //the policy forbids an auto-complete built on it, and calls a long run of lookups heavy use
        expect(geocoder.allowsTypeAhead).toBe(false);
        expect(geocoder.maxBulkRequests).toBe(25);
    });

    it('lets an instance you run set its own limits, because the policy is not about that one', () => {
        const geocoder = createNominatimGeocoder({
            searchUrl: 'https://nominatim.example.org/search',
            allowsTypeAhead: true,
            maxBulkRequests: 5000
        });

        expect(geocoder.allowsTypeAhead).toBe(true);
        expect(geocoder.maxBulkRequests).toBe(5000);
    });
});
