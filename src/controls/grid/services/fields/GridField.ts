import { IColumn, IControlParameters, ICustomColumnControl, IField, IFieldValidationResult, IRecord } from "@talxis/client-libraries";
import { merge } from "merge-anything";
import { getTextColorForBackground, ThemeGenerator } from "@theme";
import type { GridCellEditableHook, GridCellLoadingHook, GridCellThemeHook, GridControlHook, GridControlParametersHook } from "../cells";
import type { IGridServiceLocator } from "../../services";

/** Where the field's own hooks sit: ahead of every module. */
const FIELD_HOOK_PRIORITY = 0;

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
    /** The field is gone: what it registered goes with it. */
    destroy(): void;
}

export class GridField implements IGridField {
    private _record: IRecord;
    private _columnName: string;
    private _services?: IGridServiceLocator;
    private _unregisterCellEditableHook?: () => void;
    private _unregisterCellLoadingHook?: () => void;
    private _unregisterCellThemeHook?: () => void;
    private _unregisterControlHook?: () => void;
    private _unregisterControlParametersHook?: () => void;

    constructor(parameters: IGridFieldParameters) {
        this._record = parameters.record;
        this._columnName = parameters.columnName;
        this._services = parameters.services;
        const cells = parameters.services?.get('cells');
        this._unregisterCellEditableHook = cells?.registerCellEditableHook(this._onCellEditable, FIELD_HOOK_PRIORITY);
        this._unregisterCellLoadingHook = cells?.registerCellLoadingHook(this._onCellLoading, FIELD_HOOK_PRIORITY);
        this._unregisterCellThemeHook = cells?.registerCellThemeHook(this._onCellTheme, FIELD_HOOK_PRIORITY);
        this._unregisterControlHook = cells?.registerControlHook(this._onControl, FIELD_HOOK_PRIORITY);
        this._unregisterControlParametersHook = cells?.registerControlParametersHook(this._onControlParameters, FIELD_HOOK_PRIORITY);
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

    public destroy(): void {
        this._unregisterCellEditableHook?.();
        this._unregisterCellLoadingHook?.();
        this._unregisterCellThemeHook?.();
        this._unregisterControlHook?.();
        this._unregisterControlParametersHook?.();
    }

    /** The field's word on whether the cell drawing it may be edited. */
    private _onCellEditable: GridCellEditableHook = (result, params) => {
        if (!this._isDrawnBy(params)) {
            return;
        }
        //the record already answers for `disabledExpression`, inactive records and group rows
        result.isEditable = !this._getField().isDisabled();
    };

    /** The field's word on whether the cell drawing it is waiting. */
    private _onCellLoading: GridCellLoadingHook = (result, params) => {
        if (!this._isDrawnBy(params)) {
            return;
        }
        result.isLoading = this._getField().ui.isLoading();
    };

    /** The colours the column asks a cell of this field to be drawn in. */
    private _onCellTheme: GridCellThemeHook = (theme, params) => {
        if (!this._isDrawnBy(params)) {
            return;
        }
        const colors = { ...theme.colors };
        //the colours it came in with, not the grid's
        const formatting = this._getField().ui.getCustomFormatting(ThemeGenerator.generate(colors)) ?? {};
        const background = formatting.backgroundColor || colors.background;
        const isRecoloured = background !== colors.background;
        //a background of its own is taken as emphasis
        const contrast = getTextColorForBackground(background);
        theme.colors.primary = formatting.primaryColor || (isRecoloured ? contrast : colors.primary);
        theme.colors.background = background;
        theme.colors.text = formatting.textColor || (isRecoloured ? contrast : colors.text);
    };

    /** The control the column named for a cell of this field. */
    private _onControl: GridControlHook = (result, params) => {
        if (!this._isDrawnBy(params)) {
            return;
        }
        const appliesTo = params.takesInput ? 'editor' : 'renderer';
        //a column may name one control for drawing and another for input
        const customControl = this._getField().ui.getCustomControls([result.control])
            .find(candidate => candidate.appliesTo === 'both' || candidate.appliesTo === appliesTo);
        if (!customControl) {
            return;
        }
        //merged rather than taken
        result.control = merge(result.control, customControl) as Required<ICustomColumnControl>;
    };

    /**
     * What the column makes of the parameters a cell of this field is drawn with.
     */
    private _onControlParameters: GridControlParametersHook = (result, params) => {
        if (!this._isDrawnBy(params)) {
            return;
        }
        //written back into what it was handed
        Object.assign(result, this._getField().ui.getControlParameters({ ...result } as IControlParameters));
    };

    /** Whether a cell hook is running for the cell this field is drawn in. */
    private _isDrawnBy(params: { record: IRecord; columnName: string }): boolean {
        return params.record === this._record && params.columnName === this._columnName;
    }

    /** What the record holds for this column. */
    private _getField(): IField {
        return this._record.getField(this._columnName);
    }
}
