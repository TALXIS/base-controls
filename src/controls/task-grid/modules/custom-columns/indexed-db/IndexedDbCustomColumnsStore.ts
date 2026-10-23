import { DatasetConstants, DataType, DataTypes, IColumn, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { ICustomColumnsStore } from "../CustomColumns";

/** A custom column as the IndexedDB store keeps it. */
export interface ICustomColumnDefinition {
    displayName: string;
    dataType: DataType;
    isRequired?: boolean;
    /** Decimal places, for a decimal or currency column. */
    precision?: number;
    /** The labels of a choice column's options, in order. */
    options?: string[];
}

export interface IIndexedDbCustomColumnsStoreParameters {
    /** The IndexedDB database the columns and their values are kept in; one per control. */
    databaseName: string;
    /** The columns a new database starts with. */
    columns?: ICustomColumnDefinition[];
    /** The labels of a Yes/No column's two options. */
    labels?: { no?: string; yes?: string };
}

interface IStoredColumn {
    name: string;
    definition: ICustomColumnDefinition;
    /** Keeps the columns in the order they were made. */
    createdOn: number;
}

interface IStoredValues {
    taskId: string;
    values: IRawRecord;
}

const COLUMNS_STORE = 'columns';
const VALUES_STORE = 'values';
//raised whenever what the stores hold changes shape
const DATABASE_VERSION = 2;

const toPromise = <T,>(request: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

/** Custom columns kept in the browser's IndexedDB with their values by task; a new one is a sample text column. */
export class IndexedDbCustomColumnsStore implements ICustomColumnsStore {
    private _parameters: IIndexedDbCustomColumnsStoreParameters;
    private _database?: Promise<IDBDatabase>;

    constructor(parameters: IIndexedDbCustomColumnsStoreParameters) {
        this._parameters = parameters;
    }

    public async onLoadColumns(): Promise<IColumn[]> {
        const stored = await toPromise<IStoredColumn[]>((await this._getStore(COLUMNS_STORE)).getAll());
        return stored.sort((left, right) => left.createdOn - right.createdOn).map(entry => this._toColumn(entry));
    }

    public async onLoadValues(taskIds: string[]): Promise<Map<string, IRawRecord>> {
        const taskIdSet = new Set(taskIds);
        const stored = await toPromise<IStoredValues[]>((await this._getStore(VALUES_STORE)).getAll());
        return new Map(stored.filter(entry => taskIdSet.has(entry.taskId)).map(entry => [entry.taskId, entry.values]));
    }

    public async onSaveValue(record: IRecord, column: IColumn, value: unknown): Promise<IRecordSaveOperationResult> {
        const taskId = record.getRecordId();
        const store = await this._getStore(VALUES_STORE, 'readwrite');
        const stored = await toPromise<IStoredValues | undefined>(store.get(taskId));
        await toPromise(store.put({ taskId, values: { ...stored?.values, [column.name]: value } } satisfies IStoredValues));
        return { success: true, recordId: taskId, fields: [column.name] };
    }

    public async onCreateColumn(): Promise<string | null> {
        const store = await this._getStore(COLUMNS_STORE, 'readwrite');
        const count = await toPromise(store.count());
        const name = this._toColumnName(crypto.randomUUID());
        const definition: ICustomColumnDefinition = { displayName: `Custom column ${count + 1}`, dataType: DataTypes.SingleLineText };
        await toPromise(store.put({ name, definition, createdOn: Date.now() } satisfies IStoredColumn));
        return name;
    }

    public async onUpdateColumn(_columnName: string): Promise<string | null> {
        throw new Error('Not implemented.');
    }

    public async onDeleteColumn(columnName: string): Promise<string | null> {
        await toPromise((await this._getStore(COLUMNS_STORE, 'readwrite')).delete(columnName));
        const values = await this._getStore(VALUES_STORE, 'readwrite');
        for (const entry of await toPromise<IStoredValues[]>(values.getAll())) {
            if (columnName in entry.values) {
                const { [columnName]: _deleted, ...rest } = entry.values;
                await toPromise(values.put({ ...entry, values: rest } satisfies IStoredValues));
            }
        }
        return columnName;
    }

    private async _getStore(name: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
        return (await this._getDatabase()).transaction(name, mode).objectStore(name);
    }

    //the seed columns go in as the database is made or upgraded, and only then
    private _getDatabase(): Promise<IDBDatabase> {
        this._database ??= new Promise((resolve, reject) => {
            const request = indexedDB.open(this._parameters.databaseName, DATABASE_VERSION);
            request.onupgradeneeded = () => {
                const database = request.result;
                [...database.objectStoreNames].forEach(name => database.deleteObjectStore(name));
                const columns = database.createObjectStore(COLUMNS_STORE, { keyPath: 'name' });
                database.createObjectStore(VALUES_STORE, { keyPath: 'taskId' });
                (this._parameters.columns ?? []).forEach((definition, index) => {
                    columns.put({ name: this._toColumnName(crypto.randomUUID()), definition, createdOn: index } satisfies IStoredColumn);
                });
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        return this._database;
    }

    private _toColumn(stored: IStoredColumn): IColumn {
        const { displayName, dataType, isRequired, precision, options } = stored.definition;
        const metadata: { [key: string]: unknown } = { RequiredLevel: isRequired ? 2 : 0 };
        if (precision !== undefined) {
            metadata.Precision = precision;
        }
        if (dataType === DataTypes.OptionSet) {
            metadata.OptionSet = (options ?? []).map((Label, index) => ({ Value: index + 1, Label, Color: '' }));
        }
        if (dataType === DataTypes.TwoOptions) {
            metadata.OptionSet = [{ Value: 0, Label: this._parameters.labels?.no ?? 'No', Color: '' }, { Value: 1, Label: this._parameters.labels?.yes ?? 'Yes', Color: '' }];
        }
        return { name: stored.name, displayName, dataType, isVirtual: true, visualSizeFactor: 200, metadata: metadata as IColumn['metadata'] };
    }

    private _toColumnName(name: string): string {
        return name.endsWith(DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX) ? name : `${name}${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}`;
    }
}
