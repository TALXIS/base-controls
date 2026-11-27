import { describe, expect, it } from 'vitest';
import { IMapDirections } from '../core/directions';
import { IMapGeocoder } from '../core/geocoding';
import { getMapDirections, getMapGeocoder } from './geoServices';
import { IMapProvider, IMapProviderOption } from './provider';

const provider = (() => null) as unknown as IMapProvider;
const geocoder = (name: string) => ({ name } as unknown as IMapGeocoder);
const directions = (name: string) => ({ name } as unknown as IMapDirections);

const option = (id: string, services: Partial<IMapProviderOption> = {}): IMapProviderOption =>
    ({ id, provider, ...services });

describe('getMapGeocoder', () => {
    it('prefers the geocoder of the provider drawing the map', () => {
        const options = [
            option('leaflet', { geocoder: geocoder('nominatim') }),
            option('here', { geocoder: geocoder('here') })
        ];
        expect(getMapGeocoder(options, 'here')).toEqual(geocoder('here'));
    });

    it('borrows from another configured provider when the drawing one has none', () => {
        const options = [option('custom'), option('here', { geocoder: geocoder('here') })];
        expect(getMapGeocoder(options, 'custom')).toEqual(geocoder('here'));
    });

    it('borrows from the first provider that has one', () => {
        const options = [
            option('custom'),
            option('leaflet', { geocoder: geocoder('nominatim') }),
            option('here', { geocoder: geocoder('here') })
        ];
        expect(getMapGeocoder(options, 'custom')).toEqual(geocoder('nominatim'));
    });

    it('resolves nothing when no configured provider has one', () => {
        expect(getMapGeocoder([option('custom')], 'custom')).toBeUndefined();
        expect(getMapGeocoder([], undefined)).toBeUndefined();
    });

    it('falls back when the selected id is not on the list', () => {
        const options = [option('here', { geocoder: geocoder('here') })];
        expect(getMapGeocoder(options, 'gone')).toEqual(geocoder('here'));
    });
});

describe('getMapDirections', () => {
    it('prefers the directions of the provider drawing the map, and borrows otherwise', () => {
        const options = [
            option('leaflet', { directions: directions('osrm') }),
            option('mapy', { directions: directions('mapy') })
        ];
        expect(getMapDirections(options, 'mapy')).toEqual(directions('mapy'));
        expect(getMapDirections([option('custom'), ...options], 'custom')).toEqual(directions('osrm'));
    });

    it('resolves nothing when no configured provider has one', () => {
        expect(getMapDirections([option('custom')], 'custom')).toBeUndefined();
    });
});
