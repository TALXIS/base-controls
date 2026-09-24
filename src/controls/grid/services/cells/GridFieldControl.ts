import { DataProvider, DataType, DataTypes, IColumn } from "@talxis/client-libraries";
import { BaseControls } from "@utils";
import { IGridValueRendererParameters } from "@controls/grid/value-renderer";
import { IGridServiceLocator } from "../../services";
import { IGridField } from "../fields";

export interface IGridFieldControlParameters {
    services: IGridServiceLocator;
    /** The field this draws. */
    field: IGridField;
    takesInput?: boolean;
}

/** What a cell bound to a record's column draws with. */
export interface IGridFieldControl {
    getField(): IGridField;
    /** The column as this record's own provider has it. */
    getColumn(): IColumn;
    /** The control this column's data type asks for. */
    getControlName(): string;
    /** What the field adds to the parameters a control is drawn with. */
    getParameters(): Partial<IGridValueRendererParameters>;
}

export class GridFieldControl implements IGridFieldControl {
    private _services: IGridServiceLocator;
    private _field: IGridField;
    private _takesInput: boolean;

    constructor(parameters: IGridFieldControlParameters) {
        this._services = parameters.services;
        this._field = parameters.field;
        this._takesInput = !!parameters.takesInput;
    }

    public getField(): IGridField {
        return this._field;
    }

    public getColumn(): IColumn {
        return this._field.getColumn();
    }

    public getControlName(): string {
        const column = this.getColumn();
        switch (column.dataType) {
            //file and image have no editor, so they draw whether or not the cell takes input
            case DataTypes.File:
            case DataTypes.Image: {
                return BaseControls.GridValueRenderer;
            }
        }
        if (column.name === DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME) {
            return BaseControls.GridInlineRibbon;
        }
        return this._takesInput ? BaseControls.GetControlNameForDataType(column.dataType as DataType) : BaseControls.GridValueRenderer;
    }

    public getParameters(): Partial<IGridValueRendererParameters> {
        const column = this.getColumn();
        return {
            value: this._field.getValue(),
            Column: { raw: column },
            ColumnAlignment: { raw: column.alignment ?? 'left' },
            IsPrimaryColumn: { raw: !!column.isPrimary, type: DataTypes.TwoOptions },
            EnableNavigation: { raw: this._isNavigationSupported(), type: DataTypes.TwoOptions },
        };
    }

    /** Whether this column's value is one that can be followed at all. */
    private _isNavigationSupported(): boolean {
        if (!this._services.get('settings').isNavigationEnabled()) {
            return false;
        }
        const column = this.getColumn();
        switch (column.dataType) {
            case DataTypes.LookupCustomer:
            case DataTypes.LookupRegarding:
            case DataTypes.LookupOwner:
            case DataTypes.LookupSimple:
            case DataTypes.File:
            case DataTypes.Image:
            case DataTypes.SingleLineEmail:
            case DataTypes.SingleLineUrl:
            case DataTypes.SingleLinePhone: {
                return true;
            }
            default: {
                const metadata = this._field.getRecord().getDataProvider().getMetadata() as Xrm.Metadata.EntityMetadata | undefined;
                return !!column.isPrimary || column.name === metadata?.PrimaryNameAttribute;
            }
        }
    }
}
