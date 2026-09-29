import { describe, expect, it, vi } from 'vitest';
import { getMapPins } from './pins';
import { createFakeRecord } from '../testing/records';

const attributes = { latitude: 'lat', longitude: 'lng' };
const options = { attributes };

describe('getMapPins', () => {
    it('reads a pin per record, in dataset order', () => {
        const records = [
            createFakeRecord({ id: 'a', name: 'Prague', rawData: { lat: 50.08, lng: 14.43 } }),
            createFakeRecord({ id: 'b', name: 'Brno', rawData: { lat: 49.19, lng: 16.61 } })
        ];
        expect(getMapPins(records, options).locations).toEqual([
            { id: 'a', recordId: 'a', latitude: 50.08, longitude: 14.43, label: 'Prague' },
            { id: 'b', recordId: 'b', latitude: 49.19, longitude: 16.61, label: 'Brno' }
        ]);
    });

    it('reads coordinates held on a related record through dot notation', () => {
        const records = [
            createFakeRecord({
                id: 'a',
                rawData: { 'cds_addressid.cds_latitude': 50.08, 'cds_addressid.cds_longitude': 14.43 },
                columns: []
            })
        ];
        const pins = getMapPins(records, {
            attributes: {
                latitude: 'cds_addressid.cds_latitude',
                longitude: 'cds_addressid.cds_longitude'
            }
        });
        expect(pins.locations).toEqual([{ id: 'a', recordId: 'a', latitude: 50.08, longitude: 14.43, label: undefined }]);
    });

    it('reports the records it could not place, so the address fallback can try them', () => {
        const records = [
            createFakeRecord({ id: 'placed', rawData: { lat: 50.08, lng: 14.43 } }),
            createFakeRecord({ id: 'unplaced', rawData: { lat: null, lng: null, address: 'Praha' } })
        ];
        const pins = getMapPins(records, options);

        expect(pins.locations.map((location) => location.id)).toEqual(['placed']);
        expect(pins.unplacedRecords.map((record) => record.getRecordId())).toEqual(['unplaced']);
    });

    it('places a record from coordinates resolved elsewhere when it carries none', () => {
        const records = [createFakeRecord({ id: 'geocoded', rawData: { lat: null, lng: null } })];

        const pins = getMapPins(records, {
            attributes,
            fallbackCoordinates: { geocoded: { latitude: 49.19, longitude: 16.61 } }
        });

        expect(pins.locations).toEqual([{ id: 'geocoded', recordId: 'geocoded', latitude: 49.19, longitude: 16.61, label: undefined }]);
        expect(pins.unplacedRecords).toEqual([]);
    });

    it('prefers the record own coordinates over ones resolved elsewhere', () => {
        const records = [createFakeRecord({ id: 'a', rawData: { lat: 50.08, lng: 14.43 } })];

        const pins = getMapPins(records, {
            attributes,
            fallbackCoordinates: { a: { latitude: 0, longitude: 0 } }
        });

        expect(pins.locations[0]).toMatchObject({ latitude: 50.08, longitude: 14.43 });
    });

    it('skips a record whose coordinates cannot be read', () => {
        const records = [
            createFakeRecord({ id: 'a', rawData: { lat: 50.08, lng: 14.43 } }),
            createFakeRecord({ id: 'b', rawData: { lat: null, lng: 14.43 } }),
            createFakeRecord({ id: 'c', rawData: { lat: 'nowhere', lng: 14.43 } })
        ];
        expect(getMapPins(records, options).locations.map((location) => location.id)).toEqual(['a']);
    });

    it('does not let one unreadable record stop the rest', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const broken = createFakeRecord({ id: 'broken', rawData: { lat: 1, lng: 1 } });
        broken.getRecordId = () => { throw new Error('gone'); };
        const records = [broken, createFakeRecord({ id: 'ok', rawData: { lat: 50.08, lng: 14.43 } })];

        expect(getMapPins(records, options).locations.map((location) => location.id)).toEqual(['ok']);
        expect(warn).toHaveBeenCalledOnce();
    });

    it('reads a pin appearance for each record', () => {
        const records = [createFakeRecord({ id: 'a', rawData: { lat: 1, lng: 1, kind: 'depot' } })];

        const pins = getMapPins(records, {
            attributes,
            getAppearance: (record) => record.getValue('kind') === 'depot' ? { color: '#c50f1f' } : undefined
        });

        expect(pins.locations[0].pin).toEqual({ color: '#c50f1f' });
    });

    it('leaves an appearance that changes nothing off the location', () => {
        const records = [createFakeRecord({ id: 'a', rawData: { lat: 1, lng: 1 } })];
        const pins = getMapPins(records, { attributes, getAppearance: () => ({}) });
        expect(pins.locations[0]).not.toHaveProperty('pin');
    });
});
