import { describe, expect, it } from 'vitest';
import { createGoogleMapsGeocoder, getGooglePlace, getGooglePlaces, IGoogleGeocodeResponse } from './geocoder';
import { getGoogleRoutePath } from './directions';

//trimmed from a live Geocoding API response for "Václavské náměstí 1, Praha"
const GEOCODE_RESPONSE: IGoogleGeocodeResponse = {
    status: 'OK',
    results: [{
        formatted_address: 'Václavské nám. 1, 110 00 Praha 1-Můstek, Česko',
        geometry: { location: { lat: 50.0841919, lng: 14.4242272 } },
        address_components: [
            { long_name: '1', short_name: '1', types: ['street_number'] },
            { long_name: 'Václavské náměstí', short_name: 'Václavské nám.', types: ['route'] },
            { long_name: 'Můstek', short_name: 'Můstek', types: ['neighborhood', 'political'] },
            { long_name: 'Praha 1', short_name: 'Praha 1', types: ['political', 'sublocality', 'sublocality_level_1'] },
            { long_name: 'Hlavní město Praha', short_name: 'Hlavní město Praha', types: ['administrative_area_level_2', 'political'] },
            { long_name: 'Hlavní město Praha', short_name: 'Hlavní město Praha', types: ['administrative_area_level_1', 'political'] },
            { long_name: 'Česko', short_name: 'CZ', types: ['country', 'political'] },
            { long_name: '110 00', short_name: '110 00', types: ['postal_code'] }
        ]
    }]
};

describe('getGooglePlace', () => {
    it('maps a live geocoding result onto address components', () => {
        const place = getGooglePlace(GEOCODE_RESPONSE.results![0]);

        expect(place?.coordinates).toEqual({ latitude: 50.0841919, longitude: 14.4242272 });
        expect(place?.label).toBe('Václavské nám. 1, 110 00 Praha 1-Můstek, Česko');
        expect(place?.address).toMatchObject({
            country: 'Česko',
            countryCode: 'CZ',
            locality: 'Hlavní město Praha',
            subLocality: 'Praha 1',
            street: 'Václavské náměstí',
            streetNumber: '1',
            postalCode: '110 00',
            latitude: 50.0841919,
            longitude: 14.4242272
        });
    });

    it('prefers the most specific administrative area Google reported', () => {
        //level_2 comes before level_1 in the preference list, and both are present above
        expect(getGooglePlace(GEOCODE_RESPONSE.results![0])?.address.administrativeArea).toBe('Hlavní město Praha');
    });

    it('maps nothing for a result with no position', () => {
        expect(getGooglePlace({ formatted_address: 'somewhere' })).toBeUndefined();
    });
});

describe('getGooglePlaces', () => {
    it('reads the places out of an accepted response', () => {
        expect(getGooglePlaces(GEOCODE_RESPONSE)).toHaveLength(1);
    });

    it('reads no results as no places rather than as a failure', () => {
        expect(getGooglePlaces({ status: 'ZERO_RESULTS', results: [] })).toEqual([]);
    });

    it('raises a rejected request, so a disabled api is not read as no results', () => {
        expect(() => getGooglePlaces({ status: 'REQUEST_DENIED', error_message: 'legacy API' }))
            .toThrow(/REQUEST_DENIED: legacy API/);
    });
});

describe('getGoogleRoutePath', () => {
    it('decodes the encoded polyline the Routes API returns', () => {
        const path = getGoogleRoutePath({
            routes: [{
                polyline: { encodedPolyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@' },
                distanceMeters: 4059,
                duration: '1050s'
            }]
        });

        expect(path?.coordinates).toHaveLength(3);
        expect(path?.coordinates[0]).toEqual({ latitude: 38.5, longitude: -120.2 });
        expect(path?.distance).toBe(4059);
        expect(path?.duration).toBe(1050);
    });

    it('routes nothing when the response carries no route', () => {
        expect(getGoogleRoutePath({})).toBeNull();
        expect(getGoogleRoutePath({ routes: [{}] })).toBeNull();
    });
});

describe('createGoogleMapsGeocoder', () => {
    it('declines type-ahead, which Google bills per request and licenses through Places Autocomplete', () => {
        expect(createGoogleMapsGeocoder({ apiKey: 'test-key' }).allowsTypeAhead).toBe(false);
    });
});
