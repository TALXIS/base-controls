import { IColumn, IField, IFieldValidationResult, IRecord } from "@talxis/client-libraries";
import type { IGridServiceLocator } from "../../services";

export interface IGridFieldParameters {
    record: IRecord;
    columnName: string;
    /** The grid this field is drawn in, where it is drawn in one. */
    services?: IGridServiceLocator;
}

/** One column of one record, and everything that follows from a component being bound to it. */
export interface IGridField {
    getRecord(): IRecord;
    getColumnName(): string;
    /** The column as this record's own provider has it. */
    getColumn(): IColumn;
    getValue(): any;
    /** The value the field is given: the record takes it, and saves it. */
    setValue(newValue: any): void;
    getFormattedValue(): string | null;
    /** Whether the value is one the record will accept. */
    isValid(): IFieldValidationResult;
}

export class GridField implements IGridField {
    private _record: IRecord;
    private _columnName: string;
    private _services?: IGridServiceLocator;

    constructor(parameters: IGridFieldParameters) {
        this._record = parameters.record;
        this._columnName = parameters.columnName;
        this._services = parameters.services;
    }

    public getRecord(): IRecord {
        return this._record;
    }

    public getColumnName(): string {
        return this._columnName;
    }

    public getColumn(): IColumn {
        return this._record.getDataProvider().getColumnsMap()[this._columnName];
    }

    public getValue(): any {
        return this._getField().getValue();
    }

    public setValue(newValue: any): void {
        this._record.setValue(this._columnName, newValue);
        if (this._services?.get('settings').isAutoSaveEnabled()) {
            this._record.save();
        }
    }

    public getFormattedValue(): string | null {
        return this._getField().getFormattedValue();
    }

    /** Whether the value is one the record will accept. */
    //TODO: FOR CODE REViEW - THIS SHOULD RETURN NO ERROR IF EDITING IS DISABLED
    public isValid(): IFieldValidationResult {
        return this._getField().isValid();
    }

    /** What the record holds for this column. */
    private _getField(): IField {
        return this._record.getField(this._columnName);
    }
}
