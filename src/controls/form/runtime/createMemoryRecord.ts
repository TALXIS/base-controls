import { IColumn, IRecord, IRecordSaveOperationResult, MemoryDataProvider } from "@talxis/client-libraries";

export interface IMemoryRecordParameters {
    columns: IColumn[];
    data: { [key: string]: any };
    metadata: { PrimaryIdAttribute: string; PrimaryNameAttribute: string };
    /** Saves the record somewhere else first; without it a save only commits in memory. */
    save?: (record: IRecord) => Promise<IRecordSaveOperationResult>;
}

/** A record held in memory, for a form that has no data provider of its own. */
export const createMemoryRecord = (parameters: IMemoryRecordParameters): IRecord => {
    const { columns, data, metadata, save: onSave } = parameters;
    const provider = new MemoryDataProvider({ dataSource: [data], metadata });
    provider.setColumns(columns);
    if (onSave) {
        provider.setInterceptor('onRecordSave', async (record, defaultAction) => {
            const result = await onSave(record);
            return result.success ? defaultAction(record) : result;
        });
    }
    provider.refreshSync();
    return provider.getRecords()[0];
};
