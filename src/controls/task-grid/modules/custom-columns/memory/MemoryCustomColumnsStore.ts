import type { LabelsOf } from "@labels";
import { DatasetConstants, DataType, DataTypes, IColumn, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { MemoryTable } from "@core/state";
import type { ITaskRuntime } from "../../../runtime";
import type { ICustomColumnsStore } from "../CustomColumns";
import { CUSTOM_COLUMNS_LABELS } from "../labels";

/** What a custom column is. */
export interface ICustomColumnDefinition {
    displayName: string;
    dataType: DataType;
    isRequired?: boolean;
    /** Decimal places, for a decimal or currency column. */
    precision?: number;
    /** The labels of a choice column's options, in order. */
    options?: string[];
}

/** A custom column as its table keeps it. */
export interface ICustomColumnRow extends ICustomColumnDefinition {
    /** The column's name; the store adds the custom column suffix where it is missing. */
    name: string;
    /** Orders the columns; a seeded row without it comes first. */
    createdOn?: number;
}

/** One task's custom column values. */
export interface ICustomColumnValuesRow {
    taskId: string;
    values: IRawRecord;
}

export interface IMemoryCustomColumnsStoreParameters {
    taskRuntime: ITaskRuntime;
    columns: MemoryTable<ICustomColumnRow>;
    values: MemoryTable<ICustomColumnValuesRow>;
}

export class MemoryCustomColumnsStore implements ICustomColumnsStore {
    private _parameters: IMemoryCustomColumnsStoreParameters;

    constructor(parameters: IMemoryCustomColumnsStoreParameters) {
        this._parameters = parameters;
    }

    public async loadColumns(): Promise<IColumn[]> {
        const rows = this._parameters.columns.getRows();
        return rows.sort((left, right) => (left.createdOn ?? 0) - (right.createdOn ?? 0)).map(row => this._toColumn(row));
    }

    public async loadValues(taskIds: string[]): Promise<Map<string, IRawRecord>> {
        const taskIdSet = new Set(taskIds);
        const rows = this._parameters.values.getRows(row => taskIdSet.has(row.taskId));
        return new Map(rows.map(row => [row.taskId, row.values]));
    }

    public async saveValue(record: IRecord, column: IColumn, value: unknown): Promise<IRecordSaveOperationResult> {
        const taskId = record.getRecordId();
        const stored = this._parameters.values.getRow(taskId);
        this._parameters.values.insert([{ taskId, values: { ...stored?.values, [column.name]: value } }]);
        return { success: true, recordId: taskId, fields: [column.name] };
    }

    public async createColumn(): Promise<string | null> {
        const count = this._parameters.columns.getRows().length;
        const name = this._toColumnName(crypto.randomUUID());
        this._parameters.columns.insert([{ name, displayName: this._labels.get('customColumns.newColumnName', { number: count + 1 }), dataType: DataTypes.SingleLineText, createdOn: Date.now() }]);
        return name;
    }

    //the store has no dialog to edit a column in
    public async updateColumn(_columnName: string): Promise<string | null> {
        return null;
    }

    public async deleteColumn(columnName: string): Promise<string | null> {
        const { columns, values } = this._parameters;
        columns.delete(columns.getRows(row => this._toColumnName(row.name) === columnName).map(row => row.name));
        values.insert(values.getRows(row => columnName in row.values).map(row => {
            const { [columnName]: _deleted, ...rest } = row.values;
            return { ...row, values: rest };
        }));
        return columnName;
    }

    private _toColumn(row: ICustomColumnRow): IColumn {
        const { displayName, dataType, isRequired, precision, options } = row;
        const metadata: { [key: string]: unknown } = { RequiredLevel: isRequired ? 2 : 0 };
        if (precision !== undefined) {
            metadata.Precision = precision;
        }
        if (dataType === DataTypes.OptionSet) {
            metadata.OptionSet = (options ?? []).map((Label, index) => ({ Value: index + 1, Label, Color: '' }));
        }
        if (dataType === DataTypes.TwoOptions) {
            metadata.OptionSet = [{ Value: 0, Label: this._labels.get('customColumns.no'), Color: '' }, { Value: 1, Label: this._labels.get('customColumns.yes'), Color: '' }];
        }
        return { name: this._toColumnName(row.name), displayName, dataType, isVirtual: true, visualSizeFactor: 200, metadata: metadata as IColumn['metadata'] };
    }

    private get _labels(): LabelsOf<typeof CUSTOM_COLUMNS_LABELS> {
        return this._parameters.taskRuntime.getLabels(CUSTOM_COLUMNS_LABELS);
    }

    private _toColumnName(name: string): string {
        return name.endsWith(DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX) ? name : `${name}${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}`;
    }
}
