import { describe, expect, it, vi } from 'vitest';
import { Dataset, DataTypes, IColumn, IRawRecord, MemoryDataProvider } from '@talxis/client-libraries';
import { ALL_RECORDS_PAGE_SIZE, loadAllDatasetRecords } from './records';

const columns: IColumn[] = [
    { name: 'name', alias: 'name', displayName: 'Name', dataType: DataTypes.SingleLineText, order: 0, visualSizeFactor: 100, isPrimary: true },
    { name: 'lat', alias: 'lat', displayName: 'Latitude', dataType: DataTypes.Decimal, order: 1, visualSizeFactor: 100 }
];

/** A dataset of `count` rows, showing `pageSize` of them - the state a bound Map starts from. */
const createDataset = async (count: number, pageSize: number) => {
    const dataSource: IRawRecord[] = Array.from({ length: count }, (_, index) => ({
        name: `row-${index}`,
        lat: index
    }));
    const provider = new MemoryDataProvider({
        dataSource,
        metadata: {
            PrimaryIdAttribute: 'name',
            PrimaryNameAttribute: 'name',
            LogicalName: 'location',
            EntitySetName: 'locations'
        }
    });
    const dataset = new Dataset(provider);
    dataset.setColumns(columns);
    dataset.paging.setPageSize(pageSize);
    await dataset.refresh();
    return dataset;
};

describe('loadAllDatasetRecords', () => {
    it('loads every page, not just the one the dataset is showing', async () => {
        const dataset = await createDataset(250, 25);
        expect(dataset.getRecords()).toHaveLength(25);

        const { records, isTruncated, dispose } = await loadAllDatasetRecords(dataset);

        expect(records).toHaveLength(250);
        expect(isTruncated).toBe(false);
        dispose();
    });

    it('hands back records that still know their columns, so a card can label them', async () => {
        const dataset = await createDataset(60, 25);

        const { records, dispose } = await loadAllDatasetRecords(dataset);

        expect(records[0].getColumns().map((column) => column.displayName)).toContain('Latitude');
        expect(records[0].getFormattedValue('name')).toBe('row-0');
        dispose();
    });

    it('leaves the bound dataset showing exactly what it was', async () => {
        const dataset = await createDataset(250, 25);
        const before = dataset.getRecords().map((record) => record.getRecordId());

        await loadAllDatasetRecords(dataset);

        expect(dataset.getRecords().map((record) => record.getRecordId())).toEqual(before);
        expect(dataset.paging.pageSize).toBe(25);
    });

    it('reports progress after every page', async () => {
        const dataset = await createDataset(250, 25);
        const onProgress = vi.fn();

        await loadAllDatasetRecords(dataset, { maxRecords: 100, onProgress });

        expect(onProgress).toHaveBeenCalled();
        expect(onProgress.mock.calls[onProgress.mock.calls.length - 1][0]).toBeGreaterThan(0);
    });

    it('stops at the cap and says so', async () => {
        const dataset = await createDataset(250, 25);

        const { records, isTruncated } = await loadAllDatasetRecords(dataset, { maxRecords: 40 });

        expect(records).toHaveLength(40);
        expect(isTruncated).toBe(true);
    });

    it('returns what it had when it is cancelled mid load', async () => {
        const dataset = await createDataset(250, 25);
        let pages = 0;

        const { records, isTruncated } = await loadAllDatasetRecords(dataset, {
            pageSize: 50,
            onProgress: () => { pages += 1; },
            isCancelled: () => pages >= 2
        });

        expect(records).toHaveLength(100);
        expect(isTruncated).toBe(true);
    });

    it('loads a dataset smaller than one page in a single request', async () => {
        const dataset = await createDataset(10, 25);
        const onProgress = vi.fn();

        const { records, isTruncated } = await loadAllDatasetRecords(dataset, { onProgress });

        expect(records).toHaveLength(10);
        expect(isTruncated).toBe(false);
        expect(onProgress).toHaveBeenCalledTimes(1);
    });

    it('fetches in the page size it was given', async () => {
        const dataset = await createDataset(250, 25);
        const onProgress = vi.fn();

        await loadAllDatasetRecords(dataset, { pageSize: 50, onProgress });

        expect(onProgress.mock.calls.map(([loaded]) => loaded)).toEqual([50, 100, 150, 200, 250]);
    });

    it('never asks for more per request than the cap allows, so a small cap is one request', async () => {
        const dataset = await createDataset(250, 25);
        const onProgress = vi.fn();

        const { records } = await loadAllDatasetRecords(dataset, { maxRecords: 7, pageSize: 5000, onProgress });

        expect(records).toHaveLength(7);
        expect(onProgress).toHaveBeenCalledTimes(1);
        expect(ALL_RECORDS_PAGE_SIZE).toBeGreaterThan(7);
    });
});
