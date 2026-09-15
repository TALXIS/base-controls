import { IColumn, IFieldValidationResult, IRecord } from "@talxis/client-libraries";

export interface IGridFieldParameters {
    record: IRecord;
    columnName: string;
}

/**
 * One column of one record, and everything that follows from a component being bound to it.
 *
 * Answers on every call rather than holding anything: a record changes under whoever is drawing it, and a
 * field that answered once would answer for a value that is gone.
 */
export class GridField {
    private _record: IRecord;
    private _columnName: string;

    constructor(parameters: IGridFieldParameters) {
        this._record = parameters.record;
        this._columnName = parameters.columnName;
    }

    public getRecord(): IRecord {
        return this._record;
    }

    public getColumnName(): string {
        return this._columnName;
    }

    /**
     * The column as this record's own provider has it.
     *
     * `undefined` for a column of the grid's own rather than the dataset's - the checkboxes, the column a
     * save is reported in - which hold nothing of the record's.
     */
    public getColumn(): IColumn | undefined {
        return this._record.getDataProvider().getColumnsMap()[this._columnName];
    }

    public getValue(): any {
        return this._record.getValue(this._columnName);
    }

    public setValue(newValue: any) {
        this._record.setValue(this._columnName, newValue);
    }

    public getFormattedValue(): string | null {
        return this._record.getFormattedValue(this._columnName);
    }

    /** Whether the value is one the record will accept, and what is wrong with it if it is not. */
    //TODO: FOR CODE REViEW - THIS SHOULD RETURN NO ERROR IF EDITING IS DISABLED
    public isValid(): IFieldValidationResult {
        const { error, errorMessage } = this._record.getColumnInfo(this._columnName);
        return { error: error, errorMessage: errorMessage };
    }
}
