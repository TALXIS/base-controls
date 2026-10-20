import { describe, expect, it } from 'vitest';
import { IAvailableRelatedColumn, ILinkEntityExposedExpression } from '@talxis/client-libraries';
import {
    getAttributePathLinking,
    getDistinctAttributePaths,
    getRecordCoordinate,
    getRecordFormattedValue,
    getRecordValue,
    isLinkedAttributePath
} from './attributes';
import { createFakeRecord } from '../testing/records';

const FORMATTED = '@OData.Community.Display.V1.FormattedValue';

describe('getRecordValue', () => {
    it('reads a registered column through the record', () => {
        const record = createFakeRecord({ rawData: { cds_latitude: 50.08 } });
        expect(getRecordValue(record, 'cds_latitude')).toBe(50.08);
    });

    it('reads a registered link entity column named with dot notation', () => {
        const record = createFakeRecord({ rawData: { 'cds_addressid.cds_latitude': 49.19 } });
        expect(getRecordValue(record, 'cds_addressid.cds_latitude')).toBe(49.19);
    });

    it('falls back to the flat aliased key when the column is not registered', () => {
        const record = createFakeRecord({
            rawData: { 'cds_addressid.cds_latitude': 49.19 },
            columns: []
        });
        expect(getRecordValue(record, 'cds_addressid.cds_latitude')).toBe(49.19);
    });

    it('walks an expanded record held as a nested object', () => {
        const record = createFakeRecord({
            rawData: { cds_addressid: { cds_latitude: 48.15 } },
            columns: ['cds_addressid']
        });
        expect(getRecordValue(record, 'cds_addressid.cds_latitude')).toBe(48.15);
    });

    it('resolves an expanded collection through its first row', () => {
        const record = createFakeRecord({
            rawData: { cds_addresses: [{ cds_latitude: 47.5 }, { cds_latitude: 12.1 }] },
            columns: []
        });
        expect(getRecordValue(record, 'cds_addresses.cds_latitude')).toBe(47.5);
    });

    it('prefers a flat key over descending, at any depth', () => {
        const record = createFakeRecord({
            rawData: { cds_addressid: { 'cds_cityid.cds_name': 'Brno' } },
            columns: []
        });
        expect(getRecordValue(record, 'cds_addressid.cds_cityid.cds_name')).toBe('Brno');
    });

    it('keeps falsy values that are real values', () => {
        const record = createFakeRecord({ rawData: { cds_latitude: 0, cds_active: false } });
        expect(getRecordValue(record, 'cds_latitude')).toBe(0);
        expect(getRecordValue(record, 'cds_active')).toBe(false);
    });

    it('reads null, an unknown path and an empty path as nothing', () => {
        const record = createFakeRecord({ rawData: { cds_latitude: null } });
        expect(getRecordValue(record, 'cds_latitude')).toBeUndefined();
        expect(getRecordValue(record, 'cds_missing.cds_deeper')).toBeUndefined();
        expect(getRecordValue(record, '')).toBeUndefined();
    });
});

describe('getRecordFormattedValue', () => {
    it('reads the formatted value of a registered column', () => {
        const record = createFakeRecord({
            rawData: { statecode: 0, [`statecode${FORMATTED}`]: 'Active' }
        });
        expect(getRecordFormattedValue(record, 'statecode')).toBe('Active');
    });

    it('reads the annotation of an unregistered flat aliased key', () => {
        const record = createFakeRecord({
            rawData: { 'cds_addressid.statecode': 0, [`cds_addressid.statecode${FORMATTED}`]: 'Aktivní' },
            columns: []
        });
        expect(getRecordFormattedValue(record, 'cds_addressid.statecode')).toBe('Aktivní');
    });

    it('reads the annotation off a nested expanded record', () => {
        const record = createFakeRecord({
            rawData: { cds_addressid: { statecode: 1, [`statecode${FORMATTED}`]: 'Inactive' } },
            columns: ['cds_addressid']
        });
        expect(getRecordFormattedValue(record, 'cds_addressid.statecode')).toBe('Inactive');
    });

    it('stringifies the raw value when there is no annotation', () => {
        const record = createFakeRecord({ rawData: { cds_count: 12 }, columns: [] });
        expect(getRecordFormattedValue(record, 'cds_count')).toBe('12');
    });

    it('reads an empty, null and unknown value as nothing', () => {
        const record = createFakeRecord({ rawData: { a: '', b: null }, columns: [] });
        expect(getRecordFormattedValue(record, 'a')).toBeUndefined();
        expect(getRecordFormattedValue(record, 'b')).toBeUndefined();
        expect(getRecordFormattedValue(record, 'c')).toBeUndefined();
    });
});

describe('getRecordCoordinate', () => {
    it('reads a numeric coordinate', () => {
        const record = createFakeRecord({ rawData: { lat: 50.0755 } });
        expect(getRecordCoordinate(record, 'lat')).toBe(50.0755);
    });

    it('parses a coordinate held as text', () => {
        const record = createFakeRecord({ rawData: { lat: '14.4378' } });
        expect(getRecordCoordinate(record, 'lat')).toBe(14.4378);
    });

    it('keeps zero, which is a valid coordinate', () => {
        const record = createFakeRecord({ rawData: { lat: 0 } });
        expect(getRecordCoordinate(record, 'lat')).toBe(0);
    });

    it('reads unparseable, empty and missing values as no coordinate', () => {
        const record = createFakeRecord({ rawData: { a: 'Prague', b: '', c: null } });
        expect(getRecordCoordinate(record, 'a')).toBeUndefined();
        expect(getRecordCoordinate(record, 'b')).toBeUndefined();
        expect(getRecordCoordinate(record, 'c')).toBeUndefined();
        expect(getRecordCoordinate(record, 'd')).toBeUndefined();
    });
});

describe('isLinkedAttributePath', () => {
    it('recognises a path across a link entity', () => {
        expect(isLinkedAttributePath('cds_addressid.cds_latitude')).toBe(true);
    });

    it('rejects a plain attribute and an empty path', () => {
        expect(isLinkedAttributePath('cds_latitude')).toBe(false);
        expect(isLinkedAttributePath('')).toBe(false);
    });
});

describe('getAttributePathLinking', () => {
    const relatedColumns = [
        {
            name: 'cds_addressid',
            dataType: 'Lookup.Simple',
            relatedEntityName: 'cds_address',
            relatedEntityPrimaryIdAttribute: 'cds_addressid',
            relatedEntityDisplayName: 'Address'
        }
    ] as unknown as IAvailableRelatedColumn[];

    it('links the target of the lookup the alias names', () => {
        expect(getAttributePathLinking('cds_addressid.cds_latitude', relatedColumns, [])).toEqual({
            alias: 'cds_addressid',
            name: 'cds_address',
            from: 'cds_addressid',
            to: 'cds_addressid',
            linkType: 'outer'
        });
    });

    it('adds nothing for a path the dataset already links', () => {
        const existing = [{ alias: 'cds_addressid' }] as ILinkEntityExposedExpression[];
        expect(getAttributePathLinking('cds_addressid.cds_latitude', relatedColumns, existing)).toBeUndefined();
    });

    it('adds nothing for a plain attribute or an unknown lookup', () => {
        expect(getAttributePathLinking('cds_latitude', relatedColumns, [])).toBeUndefined();
        expect(getAttributePathLinking('cds_otherid.cds_latitude', relatedColumns, [])).toBeUndefined();
    });
});

describe('getDistinctAttributePaths', () => {
    it('drops the unset ones and keeps first mention order', () => {
        expect(getDistinctAttributePaths(['lat', undefined, 'lng', null, 'lat', ''])).toEqual(['lat', 'lng']);
    });
});
