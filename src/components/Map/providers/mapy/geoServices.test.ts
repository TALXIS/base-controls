import { describe, expect, it } from 'vitest';
import { getMapyPlace, getMapyPlaces, IMapyGeocodeResponse } from './geocoder';
import { getMapyRoutePath } from './directions';

//trimmed from a live rgeocode response for 50.0755, 14.4378
const REVERSE_RESPONSE: IMapyGeocodeResponse = {
    items: [{
        name: 'náměstí Míru 820/9',
        label: 'Adresa',
        position: { lon: 14.43794, lat: 50.07563 },
        location: 'Praha 2 - Vinohrady, Česko',
        zip: '120 00',
        regionalStructure: [
            { name: '820/9', type: 'regional.address' },
            { name: 'náměstí Míru', type: 'regional.street' },
            { name: 'Vinohrady', type: 'regional.municipality_part' },
            { name: 'Praha 2', type: 'regional.municipality_part' },
            { name: 'Praha', type: 'regional.municipality' },
            { name: 'okres Hlavní město Praha', type: 'regional.region' },
            { name: 'kraj Hlavní město Praha', type: 'regional.region' },
            { name: 'Česko', type: 'regional.country', isoCode: 'CZ' }
        ]
    }]
};

describe('getMapyPlace', () => {
    it('maps a live reverse geocoding item onto address components', () => {
        const place = getMapyPlace(REVERSE_RESPONSE.items![0]);

        expect(place?.coordinates).toEqual({ latitude: 50.07563, longitude: 14.43794 });
        expect(place?.label).toBe('náměstí Míru 820/9, Praha 2 - Vinohrady, Česko');
        expect(place?.address).toMatchObject({
            country: 'Česko',
            countryCode: 'CZ',
            locality: 'Praha',
            street: 'náměstí Míru',
            streetNumber: '820/9',
            postalCode: '120 00'
        });
    });

    it('reads the outermost region as the administrative area and the innermost as the district', () => {
        const address = getMapyPlace(REVERSE_RESPONSE.items![0])!.address;
        expect(address.administrativeArea).toBe('kraj Hlavní město Praha');
        expect(address.region).toBe('okres Hlavní město Praha');
    });

    it('reads the most specific municipality part as the sub locality', () => {
        expect(getMapyPlace(REVERSE_RESPONSE.items![0])?.address.subLocality).toBe('Vinohrady');
    });

    it('maps a street level result, which carries no house number or postal code', () => {
        const place = getMapyPlace({
            name: 'Václavské náměstí',
            position: { lon: 14.42667, lat: 50.08149 },
            location: 'Praha, Česko',
            regionalStructure: [
                { name: 'Václavské náměstí', type: 'regional.street' },
                { name: 'Praha', type: 'regional.municipality' },
                { name: 'Česko', type: 'regional.country', isoCode: 'CZ' }
            ]
        });

        expect(place?.address.street).toBe('Václavské náměstí');
        expect(place?.address.streetNumber).toBeUndefined();
        expect(place?.address.postalCode).toBeUndefined();
        expect(place?.label).toBe('Václavské náměstí, Praha, Česko');
    });

    it('maps nothing for an item with no position', () => {
        expect(getMapyPlace({ name: 'Somewhere' })).toBeUndefined();
    });
});

describe('getMapyPlaces', () => {
    it('reads the places out of a response, and an empty one as none', () => {
        expect(getMapyPlaces(REVERSE_RESPONSE)).toHaveLength(1);
        expect(getMapyPlaces({ items: [] })).toEqual([]);
        expect(getMapyPlaces({})).toEqual([]);
    });
});

describe('getMapyRoutePath', () => {
    it('reads a GeoJSON route, swapping its longitude first coordinates', () => {
        const path = getMapyRoutePath({
            length: 254,
            duration: 60,
            geometry: {
                geometry: {
                    coordinates: [[14.437741, 50.075498], [14.437741, 50.075532], [14.437732, 50.075619]]
                }
            }
        });

        expect(path?.coordinates[0]).toEqual({ latitude: 50.075498, longitude: 14.437741 });
        expect(path?.coordinates).toHaveLength(3);
        expect(path?.distance).toBe(254);
        expect(path?.duration).toBe(60);
    });

    it('routes nothing when the response carries no geometry', () => {
        expect(getMapyRoutePath({})).toBeNull();
        expect(getMapyRoutePath({ geometry: { geometry: { coordinates: [] } } })).toBeNull();
    });
});
