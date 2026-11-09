import { describe, expect, it, vi } from 'vitest';
import { IAddress } from '@talxis/client-libraries';
import { getAddressLabel, getGeocodingRequestLimit } from './geocoding';


describe('getAddressLabel', () => {
    it('composes street, postal code, locality and country', () => {
        const address: IAddress = {
            street: 'Václavské náměstí',
            streetNumber: '846/1',
            postalCode: '110 00',
            locality: 'Praha',
            country: 'Česko'
        };
        expect(getAddressLabel(address)).toBe('Václavské náměstí 846/1, 110 00 Praha, Česko');
    });

    it('leaves out the components that are missing', () => {
        expect(getAddressLabel({ locality: 'Brno', country: 'Česko' })).toBe('Brno, Česko');
        expect(getAddressLabel({ street: 'Hlavní' })).toBe('Hlavní');
    });

    it('describes an empty address as nothing', () => {
        expect(getAddressLabel({})).toBe('');
    });
});

describe('getGeocodingRequestLimit', () => {
    const limit = (options: Partial<Parameters<typeof getGeocodingRequestLimit>[0]>) =>
        getGeocodingRequestLimit({ defaultLimit: 250, canPersist: false, ...options });

    it('holds a run to what the service allows while the coordinates are thrown away', () => {
        expect(limit({ serviceLimit: 25 })).toBe(25);
    });

    it('lifts that limit once each address is written back, because it is then asked once ever', () => {
        expect(limit({ serviceLimit: 25, canPersist: true })).toBe(250);
    });

    it('leaves a service that names no limit on the default either way', () => {
        expect(limit({})).toBe(250);
        expect(limit({ canPersist: true })).toBe(250);
    });

    it('lets the host have the last word, including turning geo-coding off', () => {
        expect(limit({ maxRequests: 1000, serviceLimit: 25 })).toBe(1000);
        expect(limit({ maxRequests: 10, serviceLimit: 25, canPersist: true })).toBe(10);
        expect(limit({ maxRequests: 0, canPersist: true })).toBe(0);
    });
});
