import { describe, expect, it, vi } from 'vitest';
import { IAvailableRelatedColumn, IColumn } from '@talxis/client-libraries';
import { registerLinkedMapAttributes } from './linking';
import { createFakeDataset } from '../testing/dataset';

const addressLookup = {
    name: 'cds_addressid',
    dataType: 'Lookup.Simple',
    relatedEntityName: 'cds_address',
    relatedEntityPrimaryIdAttribute: 'cds_addressid',
    relatedEntityDisplayName: 'Address'
} as unknown as IAvailableRelatedColumn;

const addressColumns = [
    { name: 'cds_latitude', dataType: 'Decimal', displayName: 'Latitude' },
    { name: 'cds_longitude', dataType: 'Decimal', displayName: 'Longitude' }
] as unknown as IColumn[];

const fullDataset = () => createFakeDataset({
    columns: [{ name: 'name', dataType: 'SingleLine.Text' } as unknown as IColumn],
    relatedColumns: [addressLookup],
    availableColumns: { cds_address: addressColumns }
});

describe('registerLinkedMapAttributes', () => {
    it('adds the link and the aliased column a dot notation path needs, then refreshes', async () => {
        const { dataset, calls } = fullDataset();

        const changed = await registerLinkedMapAttributes(dataset, [
            'cds_addressid.cds_latitude',
            'cds_addressid.cds_longitude'
        ]);

        expect(changed).toBe(true);
        expect(calls.setLinking).toHaveLength(1);
        expect(calls.setLinking[0]).toEqual([{
            alias: 'cds_addressid',
            name: 'cds_address',
            from: 'cds_addressid',
            to: 'cds_addressid',
            linkType: 'outer'
        }]);
        expect(calls.setColumns[0].map((column) => column.name)).toEqual([
            'name',
            'cds_addressid.cds_latitude',
            'cds_addressid.cds_longitude'
        ]);
        expect(calls.refresh).toBe(1);
    });

    it('adds the column hidden, so a sibling control does not start showing it', async () => {
        const { dataset, calls } = fullDataset();
        await registerLinkedMapAttributes(dataset, ['cds_addressid.cds_latitude']);
        const added = calls.setColumns[0].find((column) => column.name === 'cds_addressid.cds_latitude');
        expect(added?.isHidden).toBe(true);
        expect(added?.dataType).toBe('Decimal');
    });

    it('links a related entity once however many of its attributes are named', async () => {
        const { dataset, calls } = fullDataset();
        await registerLinkedMapAttributes(dataset, [
            'cds_addressid.cds_latitude',
            'cds_addressid.cds_longitude'
        ]);
        expect(calls.setLinking[0]).toHaveLength(1);
    });

    it('changes nothing when the dataset already carries the column', async () => {
        const { dataset, calls } = createFakeDataset({
            columns: [{ name: 'cds_addressid.cds_latitude', dataType: 'Decimal' } as unknown as IColumn],
            relatedColumns: [addressLookup],
            availableColumns: { cds_address: addressColumns }
        });

        expect(await registerLinkedMapAttributes(dataset, ['cds_addressid.cds_latitude'])).toBe(false);
        expect(calls.setColumns).toHaveLength(0);
        expect(calls.refresh).toBe(0);
    });

    it('changes nothing for plain attribute names', async () => {
        const { dataset, calls } = fullDataset();
        expect(await registerLinkedMapAttributes(dataset, ['lat', 'lng'])).toBe(false);
        expect(calls.refresh).toBe(0);
    });

    it('changes nothing when the provider reports no related columns', async () => {
        const { dataset, calls } = createFakeDataset({ relatedColumns: [] });
        expect(await registerLinkedMapAttributes(dataset, ['cds_addressid.cds_latitude'])).toBe(false);
        expect(calls.refresh).toBe(0);
    });

    it('warns and skips a path naming a lookup that cannot be linked', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const { dataset, calls } = fullDataset();

        expect(await registerLinkedMapAttributes(dataset, ['cds_otherid.cds_latitude'])).toBe(false);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('cds_otherid.cds_latitude'));
        expect(calls.refresh).toBe(0);
    });

    it('warns and skips a path naming an attribute the related entity does not have', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const { dataset, calls } = fullDataset();

        expect(await registerLinkedMapAttributes(dataset, ['cds_addressid.cds_nowhere'])).toBe(false);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('cds_address does not have'));
        expect(calls.refresh).toBe(0);
    });
});
