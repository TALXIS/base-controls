import { IColumn, IField, IFieldValidationResult, IRecord } from "@talxis/client-libraries";
import type { GridCellEditableHook, GridCells } from "../cells";

export interface IGridFieldParameters {
    record: IRecord;
    columnName: string;
    /**
     * The cells of the grid this field is drawn in, where it is drawn in one.
     *
     * What the field tells them about itself: a cell knows nothing of fields, so whether the one drawing
     * this field may be edited is the field's to answer.
     */
    cells?: GridCells;
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
    private _unregisterCellEditableHook?: () => void;

    constructor(parameters: IGridFieldParameters) {
        this._record = parameters.record;
        this._columnName = parameters.columnName;
        this._unregisterCellEditableHook = parameters.cells?.registerCellEditableHook(this._onCellEditable);
    }

    public getRecord(): IRecord {
        return this._record;
    }

    public getColumnName(): string {
        return this._columnName;
    }

    /** The column as this record's own provider has it. */
    public getColumn(): IColumn {
        return this._record.getDataProvider().getColumnsMap()[this._columnName];
    }

    public getValue(): any {
        return this._getField().getValue();
    }

    public setValue(newValue: any) {
        this._record.setValue(this._columnName, newValue);
    }

    /**
     * Whether this field's value may be changed at all.
     *
     * The record's own answer, which already covers a host's `disabledExpression`, an inactive record, a
     * group or total row, and what the column's metadata allows.
     */
    public isEditable(): boolean {
        return !this._getField().isDisabled();
    }

    public getFormattedValue(): string | null {
        return this._getField().getFormattedValue();
    }

    /** Whether the value is one the record will accept, and what is wrong with it if it is not. */
    //TODO: FOR CODE REViEW - THIS SHOULD RETURN NO ERROR IF EDITING IS DISABLED
    public isValid(): IFieldValidationResult {
        return this._getField().isValid();
    }
    /**
     * What the record holds for this column.
     *
     * Asked for rather than kept: a record hands back the same field for the same column, and one held on
     * to here would outlive a reload that replaced it.
     */
    /**
     * The field is gone: what it registered goes with it.
     *
     * Called by whoever built it with `cells`, since the hooks there outlive the field otherwise - and a
     * grid mints a field per bound cell it draws.
     */
    public destroy(): void {
        this._unregisterCellEditableHook?.();
    }

    /** The field's word on whether the cell drawing it may be edited, which a cell cannot answer itself. */
    private _onCellEditable: GridCellEditableHook = (result, params) => {
        if (params.record !== this._record || params.columnName !== this._columnName) {
            return;
        }
        result.isEditable = this.isEditable();
    };

    private _getField(): IField {
        return this._record.getField(this._columnName);
    }
}
