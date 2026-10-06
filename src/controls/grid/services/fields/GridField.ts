import { IColumn, IField, IFieldValidationResult, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { IGridServiceLocator } from "../../services";

export interface IGridFieldParameters {
    record: IRecord;
    columnName: string;
    services: IGridServiceLocator;
}

/** One column of one record. */
export interface IGridField {
    getRecord(): IRecord;
    getColumnName(): string;
    /** The column as this record's own provider has it. */
    getColumn(): IColumn;
    getValue(): any;
    /** Returns the record's save, or null without auto-save. */
    setValue(newValue: any): Promise<IRecordSaveOperationResult> | null;
    getFormattedValue(): string | null;
    /** Whether the value is one the record will accept. */
    isValid(): IFieldValidationResult;
}

export class GridField implements IGridField {
    private _record: IRecord;
    private _columnName: string;
    private _services: IGridServiceLocator;

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

    public setValue(newValue: any): Promise<IRecordSaveOperationResult> | null {
        this._record.setValue(this._columnName, newValue);
        if (this._services.find('editing')?.isAutoSaveEnabled()) {
            return this._record.save();
        }
        return null;
    }

    public getFormattedValue(): string | null {
        return this._getField().getFormattedValue();
    }

    /** Whether the value is one the record will accept. */
    public isValid(): IFieldValidationResult {
        return this._getField().isValid();
    }

    /** What the record holds for this column. */
    private _getField(): IField {
        return this._record.getField(this._columnName);
    }
}
