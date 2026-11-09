import { describe, expect, it } from 'vitest';
import { getHerePlace, getHerePlaces, IHereGeocodeResponse } from './geocoder';
import { getHereRoutePath } from './directions';

//trimmed from a live Geocoding and Search response for "Václavské náměstí 1, Praha"
const GEOCODE_RESPONSE: IHereGeocodeResponse = {
    items: [{
        title: 'Václavské náměstí 846/1, 110 00 Praha, Česko',
        position: { lat: 50.08418, lng: 14.42403 },
        address: {
            label: 'Václavské náměstí 846/1, 110 00 Praha, Česko',
            countryCode: 'CZE',
            countryName: 'Česko',
            state: 'Hlavní město Praha',
            county: 'Hlavní město Praha',
            city: 'Praha',
            district: 'Praha 1',
            street: 'Václavské náměstí',
            postalCode: '110 00',
            houseNumber: '846/1'
        }
    }]
};

describe('getHerePlace', () => {
    it('maps a live geocoding item onto address components', () => {
        const place = getHerePlace(GEOCODE_RESPONSE.items![0]);

        expect(place?.coordinates).toEqual({ latitude: 50.08418, longitude: 14.42403 });
        expect(place?.label).toBe('Václavské náměstí 846/1, 110 00 Praha, Česko');
        expect(place?.address).toMatchObject({
            country: 'Česko',
            countryCode: 'CZE',
            administrativeArea: 'Hlavní město Praha',
            region: 'Hlavní město Praha',
            locality: 'Praha',
            subLocality: 'Praha 1',
            street: 'Václavské náměstí',
            streetNumber: '846/1',
            postalCode: '110 00'
        });
    });

    it('falls back to the title when the address carries no label', () => {
        expect(getHerePlace({ title: 'Somewhere', position: { lat: 1, lng: 2 } })?.label).toBe('Somewhere');
    });

    it('maps nothing for an item with no position', () => {
        expect(getHerePlace({ title: 'Somewhere' })).toBeUndefined();
    });
});

describe('getHerePlaces', () => {
    it('reads the places out of a response, and an empty one as none', () => {
        expect(getHerePlaces(GEOCODE_RESPONSE)).toHaveLength(1);
        expect(getHerePlaces({ items: [] })).toEqual([]);
        expect(getHerePlaces({})).toEqual([]);
    });
});

describe('getHereRoutePath', () => {
    //captured live: one leg of a two section route through a via point
    const FIRST_LEG = 'BG62rw_C63mxbiDGkNrEkDvCwC_EwC7L0U8G4c0KwCoB7LghC9DoQ';

    it('decodes a single section route and its summary', () => {
        const path = getHereRoutePath({
            routes: [{ sections: [{ polyline: FIRST_LEG, summary: { length: 250, duration: 49 } }] }]
        });

        expect(path?.coordinates[0].latitude).toBeCloseTo(50.075501, 5);
        expect(path?.distance).toBe(250);
        expect(path?.duration).toBe(49);
    });

    it('joins the sections of a route with via points without drawing the shared stop twice', () => {
        const single = getHereRoutePath({ routes: [{ sections: [{ polyline: FIRST_LEG }] }] });
        const joined = getHereRoutePath({
            routes: [{
                sections: [
                    { polyline: FIRST_LEG, summary: { length: 250, duration: 49 } },
                    { polyline: FIRST_LEG, summary: { length: 250, duration: 49 } }
                ]
            }]
        });

        expect(joined?.coordinates).toHaveLength(single!.coordinates.length * 2 - 1);
        expect(joined?.distance).toBe(500);
        expect(joined?.duration).toBe(98);
    });

    it('routes nothing when the response carries no sections or no geometry', () => {
        expect(getHereRoutePath({})).toBeNull();
        expect(getHereRoutePath({ routes: [{ sections: [] }] })).toBeNull();
        expect(getHereRoutePath({ routes: [{ sections: [{ summary: { length: 1 } }] }] })).toBeNull();
    });
});
