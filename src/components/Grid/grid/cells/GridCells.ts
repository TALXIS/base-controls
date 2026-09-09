import { CellDoubleClickedEvent, ValueFormatterParams, ValueGetterParams } from "@ag-grid-community/core";
import { DataProvider, DataType, DataTypes, IColumn, IControlParameters, ICustomColumnControl, IDataProvider, IDataset, IRecord } from "@talxis/client-libraries";
import { merge } from "merge-anything";
import { BaseControls, HookRegistry } from "@utils";
import { IGridCellRenderer, IGridCellRendererParameters } from "@components/GridCellRenderer";
import { IControl, IParameters } from "@interfaces";
import { IGridColumn } from "../columns/interfaces";
import { IGridServiceLocator } from "../../services";

/** What a cell draws, once every module has had its say. */
export interface IGridField {
    /** What the record holds for this column. */
    value: any;
    /** What it reads as. */
    formattedValue: string | null;
    /** Whether the value is still being fetched. */
    loading: boolean;
    /** Whether the row may be dragged taller from this cell. */
    isResizable: boolean;
}

/**
 * A hook over what a cell draws.
 *
 * Handed the defaults and mutates them: what a cell shows, whether it is still waiting, whether the row may
 * be dragged taller from it. The grid knows nothing of why.
 */
export type GridFieldHook = (field: IGridField, params: { record: IRecord; columnName: string }) => void;

/**
 * A hook over which control draws a cell.
 *
 * Handed the control the column resolved to and replaces `result.control` to draw the cell with another.
 * A control other than `GridCellRenderer` is what makes a cell go through the nested-control registry.
 */
export type GridControlHook = (result: { control: Required<ICustomColumnControl> }, params: { record: IRecord; columnName: string; takesInput: boolean }) => void;

/**
 * A hook over the parameters the control drawing a cell is handed.
 *
 * Mutates them, and reaches the control itself rather than the wrapper around it: the cell renderer's own
 * parameters on the native path, and the nested control's - not its `ControlName` and `Bindings` - on the
 * other.
 */
export type GridControlParametersHook = (parameters: IParameters, params: { record: IRecord; columnName: string; takesInput: boolean }) => void;

export interface IGridCellsParameters {
    services: IGridServiceLocator;
}

/**
 * What a cell shows, and what it shows it with.
 *
 * `getField` is the one place a cell's value is worked out, whoever is asking: the renderer, the bindings a
 * control is built from, and the bag AG Grid compares to decide on a refresh. A module changes what a cell
 * draws through a field hook rather than the grid knowing the feature exists.
 */
export class GridCells {
    private _services: IGridServiceLocator;
    private _fieldHooks = new HookRegistry<GridFieldHook>();
    private _controlHooks = new HookRegistry<GridControlHook>();
    private _controlParametersHooks = new HookRegistry<GridControlParametersHook>();

    constructor(parameters: IGridCellsParameters) {
        this._services = parameters.services;
    }

    /**
     * Registers a hook over what a cell draws. Runs per cell per render, so keep it cheap.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerFieldHook(hook: GridFieldHook, priority?: number): void {
        this._fieldHooks.register(hook, priority);
    }

    /**
     * Registers a hook over what draws a cell. Runs per cell per render, so keep it cheap.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerControlHook(hook: GridControlHook, priority?: number): void {
        this._controlHooks.register(hook, priority);
    }

    /** What this cell draws: the record's own, and whatever a module made of it. */
    public getField(record: IRecord, columnName: string): IGridField {
        const column = record.getDataProvider().getColumnsMap()[columnName]!;
        const field: IGridField = {
            value: record.getValue(columnName),
            formattedValue: record.getFormattedValue(columnName),
            loading: record.getColumnInfo(columnName).ui.isLoading(),
            isResizable: !!column.autoHeight,
        };
        this._fieldHooks.apply(field, { record: record, columnName: columnName });
        return field;
    }

    /**
     * Whether this cell takes input: the column must allow it, and so must the record's security.
     *
     * A column the dataset does not have - one of the grid's own - is never editable, and neither is the
     * inline ribbon, a file or an image.
     */
    public isCellEditable(record: IRecord, columnName: string): boolean {
        //the record's own provider: a group's children are a provider of their own, and its copy of the
        //column is what governs that row
        const column = record.getDataProvider().getColumnsMap()[columnName];
        //a column of the grid's own rather than the dataset's - the checkboxes, the column a save is
        //reported in - holds nothing of the record's, so there is nothing in it to edit
        if (!column) {
            return false;
        }
        switch (true) {
            case !this._settings.isEditingEnabled():
            case record.isSaving():
            //a one-click-edit column's control is the cell, so there is no edit mode to enter
            case column.oneClickEdit:
            case column.name === DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME:
            case column.dataType === DataTypes.File:
            case column.dataType === DataTypes.Image: {
                return false;
            }
        }
        //undefined means the record says nothing about it, and the column already said yes
        return record.getColumnInfo(column.name)?.security.editable ?? true;
    }

    /** A cell reported a new value: the record takes it, and saves it where the grid saves as it goes. */
    public setValue(record: IRecord, columnName: string, value: any): void {
        record.setValue(columnName, value);
        if (this._settings.isAutoSaveEnabled()) {
            record.save();
        }
    }

    /** What a cell holds, for the column it is in. */
    public getValue(params: ValueGetterParams<IRecord>, column: IGridColumn): any {
        if (!params.data) {
            return null;
        }
        return this.getField(params.data, column.name).value;
    }

    /** What a cell shows when it is not rendering a control of its own. */
    public getFormattedValue(params: ValueFormatterParams<IRecord>): string {
        if (!params.data) {
            return '';
        }
        return this.getField(params.data, params.colDef.colId!).formattedValue ?? '';
    }

    /**
     * Registers a hook over the parameters the control drawing a cell is handed. Runs per cell per render,
     * so keep it cheap.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerControlParametersHook(hook: GridControlParametersHook, priority?: number): void {
        this._controlParametersHooks.register(hook, priority);
    }

    /**
     * Whether something other than the cell renderer draws this cell, which is what tells a caller to go
     * through the nested-control registry rather than rendering the cell renderer itself.
     */
    public isCustomRendererEnabled(record: IRecord, column: IGridColumn, takesInput: boolean): boolean {
        return this._isCustomRenderer(this.getCustomControl(record, column, takesInput), takesInput);
    }

    /**
     * What draws this cell, and what it is given.
     *
     * The cell renderer draws the value wherever it can, which is most cells. A column that named a control
     * of its own, one that holds the inline ribbon, and a cell taking input go through the nested-control
     * registry instead, which is the only thing that can resolve a control by name - and which takes these
     * same props.
     */
    public getControlProps(record: IRecord, column: IGridColumn, takesInput: boolean): IGridCellRenderer {
        const control = this.getCustomControl(record, column, takesInput);
        const parameters = this._getCellParameters(record, column, control, takesInput);
        return {
            context: this._services.get('pcfContext'),
            //a custom control merges these into its own parameters and finalizes them there, so the
            //record's expression and the hooks run once over the whole bag rather than twice over half
            parameters: this._isCustomRenderer(control, takesInput) ? parameters : this.getFinalControlParameters(parameters, record, column, takesInput) as IGridCellRendererParameters,
        };
    }

    private _isCustomRenderer(control: ICustomColumnControl, takesInput: boolean): boolean {
        //a cell taking input is a control whatever the column named: the renderer only ever draws
        return takesInput || control.name !== BaseControls.GridCellRenderer;
    }

    /** What a cell hands whatever draws it, before the record and the hooks have their say. */
    private _getCellParameters(record: IRecord, column: IGridColumn, control: ICustomColumnControl, takesInput: boolean): IGridCellRendererParameters {
        const field = this.getField(record, column.name);
        const parameters: IGridCellRendererParameters = {
            value: field.value,
            ColumnAlignment: { raw: column.alignment ?? 'left' },
            CellType: { raw: takesInput ? 'editor' : 'renderer' },
            EnableNavigation: { raw: this._isNavigationSupported(record, column), type: DataTypes.TwoOptions },
            Column: { raw: record.getDataProvider().getColumnsMap()[column.name]! },
            Dataset: { raw: this._provider as unknown as IDataset },
            Record: { raw: record },
            PrefixIcon: { raw: null, type: DataTypes.SingleLineText },
            SuffixIcon: { raw: null, type: DataTypes.SingleLineText },
            IsPrimaryColumn: { raw: column.isPrimary, type: DataTypes.TwoOptions },
            ShowErrorMessage: { raw: false, type: DataTypes.TwoOptions },
            AutoFocus: { raw: takesInput, type: DataTypes.TwoOptions },
            IsInlineNewEnabled: { raw: false, type: DataTypes.TwoOptions },
            EnableTypeSuffix: { raw: false, type: DataTypes.TwoOptions },
            EnableOptionSetColors: { raw: this._settings.areOptionSetColorsEnabled(), type: DataTypes.TwoOptions },
            CommandButtonIds: { raw: this._settings.getInlineRibbonButtonIds(), type: DataTypes.SingleLineText },
            ShouldUnmountWhenOutputChanges: {
                raw: (() => {
                    switch (column.dataType) {
                        //these report a partial change as a value, so an editor of theirs stays open
                        case DataTypes.DateAndTimeDateAndTime:
                        case DataTypes.MultiSelectOptionSet: {
                            return false;
                        }
                        default: {
                            return true;
                        }
                    }
                })(),
                type: DataTypes.TwoOptions
            },
        };
        //what the column asked for wins: the icons and the placeholder are its to name, and a binding is
        //where it names them
        Object.entries(control.bindings ?? {}).forEach(([name, binding]) => {
            parameters[name] = { raw: binding.value, type: binding.type };
        });
        return parameters;
    }

    /**
     * The parameters a control is actually handed: what was built for it, what the record made of that, and
     * what a hook made of that.
     *
     * The record's expression comes first, so a hook has the last word on a column that overrides its own
     * parameters.
     */
    public getFinalControlParameters(parameters: IParameters, record: IRecord, column: IColumn, takesInput: boolean): IParameters {
        //legacy, kept for back compat: the record's expression is how a host changed a control's parameters
        //before hooks existed, and a hook is the way to do it now
        const overridden = record.getColumnInfo(column.name).ui.getControlParameters(parameters as IControlParameters);
        this._controlParametersHooks.apply(overridden, { record: record, columnName: column.name, takesInput: takesInput });
        return overridden;
    }

    /**
     * Which control draws this cell: the column's own where it named one, the grid's renderer otherwise,
     * and whatever a hook made of that.
     *
     * The one way in: what a cell renders with, and whether that counts as a custom renderer, are the same
     * question asked twice.
     */
    public getCustomControl(record: IRecord, column: IColumn, takesInput: boolean): Required<ICustomColumnControl> {
        const result = { control: this._getDefaultControl(record, column, takesInput) };
        this._controlHooks.apply(result, { record: record, columnName: column.name, takesInput: takesInput });
        return result.control;
    }

    private _getDefaultControl(record: IRecord, column: IColumn, takesInput: boolean): Required<ICustomColumnControl> {
        const control: Required<ICustomColumnControl> = {
            name: this._getDefaultControlName(column, takesInput),
            appliesTo: 'both',
            bindings: {}
        };
        //legacy, kept for back compat: naming a control on the column is how a host replaced a cell's
        //control before hooks existed, and a hook is the way to do it now
        const customControls = record.getColumnInfo(column.name).ui.getCustomControls([control]);
        const appliesTo = takesInput ? 'editor' : 'renderer';
        //a column may name one control for drawing and another for input, so it is not simply the first
        const customControl = customControls.find(candidate => candidate.appliesTo === 'both' || candidate.appliesTo === appliesTo);
        //merged rather than taken: a custom control that names only a name keeps the default's bindings
        return customControl ? merge(control, customControl) as Required<ICustomColumnControl> : control;
    }

    private _getDefaultControlName(column: IColumn, takesInput: boolean): string {
        switch (column.dataType) {
            //file and image have no editor, so they draw whether or not the cell takes input
            case DataTypes.File:
            case DataTypes.Image: {
                return BaseControls.GridCellRenderer;
            }
        }
        if (column.name === DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME) {
            return BaseControls.GridInlineRibbon;
        }
        return takesInput ? BaseControls.GetControlNameForDataType(column.dataType as DataType) : BaseControls.GridCellRenderer;
    }

    /**
     * Navigation on a double click, for the definitions the columns part builds.
     *
     * An editable grid never navigates: a double click there means "edit this" on some columns and "open
     * this" on others, and one gesture cannot mean both. Neither does a column whose cell is not a value
     * at all.
     */
    public onCellDoubleClick(event: CellDoubleClickedEvent<IRecord>): void {
        const record = event.data;
        //a row with no record of its own stands for nothing to open
        if (!record) {
            return;
        }
        const column = this._provider.getColumnsMap()[event.colDef.colId!]!;
        switch (true) {
            case !this._settings.isNavigationEnabled():
            case this._settings.isEditingEnabled():
            case this.isCellEditable(record, column.name):
            case !!this._services.find('selection')?.isSelectionColumn(column.name): {
                return;
            }
        }
        record.getDataProvider().openDatasetItem(record.getNamedReference());
    }

    /** Whether this column's value is one that can be followed at all. */
    private _isNavigationSupported(record: IRecord, column: IColumn): boolean {
        if (!this._settings.isNavigationEnabled()) {
            return false;
        }
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
                const metadata = record.getDataProvider().getMetadata() as Xrm.Metadata.EntityMetadata | undefined;
                return !!column.isPrimary || column.name === metadata?.PrimaryNameAttribute;
            }
        }
    }

    private get _settings() {
        return this._services.get('settings');
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
