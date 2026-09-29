import { IAvailableRelatedColumn, IColumn, IDataset, ILinkEntityExposedExpression, IRecord } from '@talxis/client-libraries';

export interface IFakeDatasetOptions {
    records?: IRecord[];
    /** Columns the dataset carries. Defaults to none. */
    columns?: IColumn[];
    /** Lookups the provider can link through, as `getAvailableRelatedColumns` reports them. */
    relatedColumns?: IAvailableRelatedColumn[];
    /** Columns of the related entities, keyed by entity logical name. */
    availableColumns?: { [entityName: string]: IColumn[] };
    linking?: ILinkEntityExposedExpression[];
}

export interface IFakeDataset {
    dataset: IDataset;
    /** Calls the code under test made, so a test can assert on what the dataset was asked to do. */
    calls: {
        setColumns: IColumn[][];
        setLinking: ILinkEntityExposedExpression[][];
        refresh: number;
    };
}

/**
 * Builds a stand in for a bound dataset carrying only what the Map asks of one.
 */
export const createFakeDataset = (options: IFakeDatasetOptions = {}): IFakeDataset => {
    let columns = options.columns ?? [];
    let linking = options.linking ?? [];
    const calls: IFakeDataset['calls'] = { setColumns: [], setLinking: [], refresh: 0 };

    const provider = {
        getColumns: () => columns,
        getColumnsMap: () => Object.fromEntries(columns.map((column) => [column.name, column])),
        setColumns: (next: IColumn[]) => {
            columns = next;
            calls.setColumns.push(next);
        },
        getLinking: () => linking,
        setLinking: (next: ILinkEntityExposedExpression[]) => {
            linking = next;
            calls.setLinking.push(next);
        },
        getAvailableRelatedColumns: async () => options.relatedColumns ?? [],
        getAvailableColumns: async (columnOptions?: { entityName?: string }) =>
            options.availableColumns?.[columnOptions?.entityName ?? ''] ?? [],
        getRecords: () => options.records ?? []
    };

    const dataset = {
        getDataProvider: () => provider,
        getRecords: () => options.records ?? [],
        refresh: async () => {
            calls.refresh += 1;
            return options.records ?? [];
        }
    };

    return { dataset: dataset as unknown as IDataset, calls };
};
