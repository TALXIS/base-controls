import { IColumn, IField, IFieldValidationResult, IRecord } from "@talxis/client-libraries";
import { Theming } from "@legacy";
import type { GridCellEditableHook, GridCellLoadingHook, GridCellThemeHook } from "../cells";
import type { IGridServiceLocator } from "../../services";

/** Where the field's own hooks sit: ahead of everything registered for the grid, which argues with them. */
const FIELD_HOOK_PRIORITY = -100;

export interface IGridFieldParameters {
    record: IRecord;
    columnName: string;
    /**
     * The grid this field is drawn in, where it is drawn in one.
     *
     * What the field tells its cells about itself - a cell knows nothing of fields, so whether the one
     * drawing this field may be edited, whether it is waiting, and what colours it asks for are the
     * field's to answer - and what a value written here is saved by.
     */
    services?: IGridServiceLocator;
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
    private _services?: IGridServiceLocator;
    private _unregisterCellEditableHook?: () => void;
    private _unregisterCellLoadingHook?: () => void;
    private _unregisterCellThemeHook?: () => void;

    constructor(parameters: IGridFieldParameters) {
        this._record = parameters.record;
        this._columnName = parameters.columnName;
        this._services = parameters.services;
        const cells = parameters.services?.get('cells');
        this._unregisterCellEditableHook = cells?.registerCellEditableHook(this._onCellEditable, FIELD_HOOK_PRIORITY);
        this._unregisterCellLoadingHook = cells?.registerCellLoadingHook(this._onCellLoading, FIELD_HOOK_PRIORITY);
        this._unregisterCellThemeHook = cells?.registerCellThemeHook(this._onCellTheme, FIELD_HOOK_PRIORITY);
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

    /** The value the field is given: the record takes it, and saves it where the grid saves as it goes. */
    public setValue(newValue: any): void {
        this._record.setValue(this._columnName, newValue);
        if (this._services?.get('settings').isAutoSaveEnabled()) {
            this._record.save();
        }
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
     * The field is gone: what it registered goes with it.
     *
     * Called by whoever built it with `cells`, since the hooks there outlive the field otherwise - and a
     * grid mints a field per bound cell it draws.
     */
    public destroy(): void {
        this._unregisterCellEditableHook?.();
        this._unregisterCellLoadingHook?.();
        this._unregisterCellThemeHook?.();
    }

    /** The field's word on whether the cell drawing it may be edited, which a cell cannot answer itself. */
    private _onCellEditable: GridCellEditableHook = (result, params) => {
        if (!this._isDrawnBy(params)) {
            return;
        }
        //the record's own answer, which already covers a host's `disabledExpression`, an inactive record,
        //a group or total row, and what the column's metadata allows
        result.isEditable = !this._getField().isDisabled();
    };

    /** The field's word on whether the cell drawing it is waiting, which a cell cannot answer itself. */
    private _onCellLoading: GridCellLoadingHook = (result, params) => {
        if (!this._isDrawnBy(params)) {
            return;
        }
        result.isLoading = this._getField().ui.isLoading();
    };

    /**
     * The colours the column asks a cell of this field to be drawn in.
     *
     * Legacy: `getCustomFormatting` is how a host coloured cells by value before the theme hook existed,
     * and the hook is the way to do it now. Goes when nothing needs it.
     */
    private _onCellTheme: GridCellThemeHook = (result, params) => {
        if (!this._isDrawnBy(params)) {
            return;
        }
        const colors = result.colors;
        //the colours it came in with, not the grid's: a formatting that changes nothing hands back the
        //theme it was given, and handing it the grid's would paint every striped row in the grid's surface
        const formatting = this._getField().ui.getCustomFormatting(Theming.GenerateThemeV8(colors.primary, colors.background, colors.text)) ?? {};
        const background = formatting.backgroundColor || colors.background;
        const isRecoloured = background !== colors.background;
        //a background of its own is taken as emphasis: the text goes to whatever reads on it, and so does
        //the primary colour unless the column named one itself
        const contrast = Theming.GetTextColorForBackground(background);
        result.colors = {
            primary: formatting.primaryColor || (isRecoloured ? contrast : colors.primary),
            background: background,
            text: formatting.textColor || (isRecoloured ? contrast : colors.text),
        };
    };

    /** Whether a cell hook is running for the cell this field is drawn in, rather than for another one. */
    private _isDrawnBy(params: { record: IRecord; columnName: string }): boolean {
        return params.record === this._record && params.columnName === this._columnName;
    }

    /**
     * What the record holds for this column.
     *
     * Asked for rather than kept: a record hands back the same field for the same column, and one held on
     * to here would outlive a reload that replaced it.
     */
    private _getField(): IField {
        return this._record.getField(this._columnName);
    }
}
