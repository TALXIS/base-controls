import { describe, expect, it } from 'vitest';
import { IAddress } from '@talxis/client-libraries';
import { getAddressValues, getStreetLine, hasAddressAttributes } from './addressMapping';

const ADDRESS: IAddress = {
    text: 'Václavské náměstí 846/1, 110 00 Praha, Česko',
    country: 'Česko',
    countryCode: 'CZE',
    administrativeArea: 'Hlavní město Praha',
    locality: 'Praha',
    subLocality: 'Praha 1',
    street: 'Václavské náměstí',
    streetNumber: '846/1',
    postalCode: '110 00'
};

const ATTRIBUTES = {
    fullAddress: 'cds_address',
    country: 'cds_country',
    region: 'cds_region',
    city: 'cds_city',
    district: 'cds_district',
    street: 'cds_street',
    streetAndNumber: 'cds_streetline',
    streetNumber: 'cds_number',
    postalCode: 'cds_zip'
};

describe('getStreetLine', () => {
    it('joins the street and its number', () => {
        expect(getStreetLine(ADDRESS)).toBe('Václavské náměstí 846/1');
    });

    it('falls back to whichever half there is', () => {
        expect(getStreetLine({ street: 'Hlavní' })).toBe('Hlavní');
        expect(getStreetLine({ streetNumber: '12' })).toBe('12');
    });

    it('composes nothing from an address with no street', () => {
        expect(getStreetLine({ locality: 'Praha' })).toBeUndefined();
    });
});

describe('getAddressValues', () => {
    it('maps every component onto the attribute it is bound to', () => {
        expect(getAddressValues(ADDRESS, ATTRIBUTES)).toEqual({
            cds_address: 'Václavské náměstí 846/1, 110 00 Praha, Česko',
            cds_country: 'Česko',
            cds_region: 'Hlavní město Praha',
            cds_city: 'Praha',
            cds_district: 'Praha 1',
            cds_street: 'Václavské náměstí',
            cds_streetline: 'Václavské náměstí 846/1',
            cds_number: '846/1',
            cds_zip: '110 00'
        });
    });

    it('writes only the components that have an attribute', () => {
        expect(getAddressValues(ADDRESS, { city: 'cds_city' })).toEqual({ cds_city: 'Praha' });
    });

    it('writes nothing when nothing is bound', () => {
        expect(getAddressValues(ADDRESS, {})).toEqual({});
    });

    it('clears a component the service could not resolve, rather than leaving the old value', () => {
        const values = getAddressValues({ locality: 'Praha' }, ATTRIBUTES);
        expect(values.cds_city).toBe('Praha');
        expect(values.cds_street).toBeNull();
        expect(values.cds_zip).toBeNull();
    });
});

describe('hasAddressAttributes', () => {
    it('knows whether a moved pin needs an address lookup at all', () => {
        expect(hasAddressAttributes({})).toBe(false);
        expect(hasAddressAttributes({ city: '' })).toBe(false);
        expect(hasAddressAttributes({ city: 'cds_city' })).toBe(true);
    });
});
