import { IRawRecord, IRecord } from '@talxis/client-libraries';

export interface IFakeRecordOptions {
    id?: string;
    /** Raw data as the data provider holds it, flat aliased keys and OData annotations included. */
    rawData?: IRawRecord;
    /** Columns the dataset registered. Reading anything else throws, the way a real record does. */
    columns?: string[];
    /** Primary name reported through `getNamedReference`. */
    name?: string;
}

/**
 * Builds a stand in for a dataset record carrying only what the Map reads off one.
 *
 * `getValue` and `getFormattedValue` throw for a column the dataset does not carry, matching the real
 * record - which is what makes the control's raw data fallback worth testing.
 */
export const createFakeRecord = (options: IFakeRecordOptions = {}): IRecord => {
    const rawData = options.rawData ?? {};
    const columns = new Set(options.columns ?? Object.keys(rawData));
    const id = options.id ?? 'record-1';

    const assertColumn = (columnName: string) => {
        if (!columns.has(columnName)) {
            throw new Error(`Column ${columnName} is not present on the record.`);
        }
    };

    const record = {
        getRecordId: () => id,
        getNamedReference: () => ({ id: { guid: id }, name: options.name, entityName: 'entity' }),
        getRawData: () => rawData,
        toRawData: () => rawData,
        getValue: (columnName: string) => {
            assertColumn(columnName);
            return rawData[columnName] ?? null;
        },
        getFormattedValue: (columnName: string) => {
            assertColumn(columnName);
            const formatted = rawData[`${columnName}@OData.Community.Display.V1.FormattedValue`];
            if (typeof formatted === 'string') {
                return formatted;
            }
            const value = rawData[columnName];
            return value === null || value === undefined ? null : `${value}`;
        },
        setValue: (columnName: string, value: any) => {
            rawData[columnName] = value;
            columns.add(columnName);
        },
        save: async () => ({ success: true }),
        isNew: () => false,
        isDirty: () => false
    };

    return record as unknown as IRecord;
};
