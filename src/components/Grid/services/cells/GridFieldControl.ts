import { DataProvider, DataType, DataTypes, IColumn, IControlParameters, ICustomColumnControl, IDataProvider, IDataset, IRecord } from "@talxis/client-libraries";
import { merge } from "merge-anything";
import { BaseControls } from "@utils";
import { IGridCellRenderer, IGridCellRendererParameters } from "@components/GridCellRenderer";
import { IParameters } from "@interfaces";
import { IGridServiceLocator } from "../../services";
import { IGridField } from "./GridCells";

export interface IGridControlParameters {
    services: IGridServiceLocator;
    record: IRecord;
    columnName: string;
    /** Whether the control takes input rather than only drawing the value. */
    takesInput?: boolean;
}

/**
 * What one cell shows, and what it shows it with.
 *
 * Built for a cell and asked about that cell, so nothing here is told which record or column it is talking
 * about. `getField` is the one place a cell's value is worked out, whoever is asking: the renderer, the
 * bindings a control is built from, and what AG Grid reads. A module changes any of it through a hook on
 * `GridCells` rather than the grid knowing the feature exists.
 */
export class GridControl {
    private _services: IGridServiceLocator;
    private _record: IRecord;
    private _columnName: string;
    private _takesInput: boolean;

    constructor(parameters: IGridControlParameters) {
        this._services = parameters.services;
        this._record = parameters.record;
        this._columnName = parameters.columnName;
        this._takesInput = !!parameters.takesInput;
    }

    /** What this cell draws: the record's own, and whatever a module made of it. */
    public getField(): IGridField {
        const field: IGridField = {
            value: this._record.getValue(this._columnName),
            formattedValue: this._record.getFormattedValue(this._columnName),
            loading: this._record.getColumnInfo(this._columnName).ui.isLoading(),
            isResizable: !!this._column?.autoHeight,
        };
        this._cells.applyFieldHooks(field, this._hookParams);
        return field;
    }

    /** What this cell holds. */
    public getValue(): any {
        return this.getField().value;
    }

    /** What this cell shows when it is not rendering a control of its own. */
    public getFormattedValue(): string {
        return this.getField().formattedValue ?? '';
    }

    /** A cell reported a new value: the record takes it, and saves it where the grid saves as it goes. */
    public setValue(value: any): void {
        this._record.setValue(this._columnName, value);
        if (this._settings.isAutoSaveEnabled()) {
            this._record.save();
        }
    }

    /**
     * Whether this cell takes input: the column must allow it, and so must the record's security.
     *
     * A column the dataset does not have - one of the grid's own - is never editable, and neither is the
     * inline ribbon, a file or an image.
     */
    public isEditable(): boolean {
        const column = this._column;
        //a column of the grid's own rather than the dataset's - the checkboxes, the column a save is
        //reported in - holds nothing of the record's, so there is nothing in it to edit
        if (!column) {
            return false;
        }
        switch (true) {
            case !this._settings.isEditingEnabled():
            //a one-click-edit column's control is the cell, so there is no edit mode to enter
            case column.oneClickEdit:
            case column.name === DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME:
            case column.dataType === DataTypes.File:
            case column.dataType === DataTypes.Image: {
                return false;
            }
        }
        //undefined means the record says nothing about it, and the column already said yes
        return this._record.getColumnInfo(column.name)?.security.editable ?? true;
    }

    /**
     * Whether something other than the cell renderer draws this cell, which is what tells a caller to go
     * through the nested-control registry rather than rendering the cell renderer itself.
     */
    public isCustomRendererEnabled(): boolean {
        return this._isCustomRenderer(this.getCustomControl());
    }

    /**
     * What draws this cell, and what it is given.
     *
     * The cell renderer draws the value wherever it can, which is most cells. A column that named a control
     * of its own, one that holds the inline ribbon, and a cell taking input go through the nested-control
     * registry instead, which is the only thing that can resolve a control by name - and which takes these
     * same props.
     */
    public getControlProps(): IGridCellRenderer {
        const control = this.getCustomControl();
        const parameters = this._getCellParameters(control);
        return {
            context: this._services.get('pcfContext'),
            //a custom control merges these into its own parameters and finalizes them there, so the
            //record's expression and the hooks run once over the whole bag rather than twice over half
            parameters: this._isCustomRenderer(control) ? parameters : this.getFinalControlParameters(parameters) as IGridCellRendererParameters,
        };
    }

    /**
     * Which control draws this cell: the column's own where it named one, the grid's renderer otherwise,
     * and whatever a hook made of that.
     *
     * The one way in: what a cell renders with, and whether that counts as a custom renderer, are the same
     * question asked twice.
     */
    public getCustomControl(): Required<ICustomColumnControl> {
        const result = { control: this._getDefaultControl() };
        this._cells.applyControlHooks(result, this._hookParams);
        return result.control;
    }

    /**
     * The parameters a control is actually handed: what was built for it, what the record made of that, and
     * what a hook made of that.
     *
     * The record's expression comes first, so a hook has the last word on a column that overrides its own
     * parameters.
     */
    public getFinalControlParameters(parameters: IParameters): IParameters {
        //legacy, kept for back compat: the record's expression is how a host changed a control's parameters
        //before hooks existed, and a hook is the way to do it now
        const overridden = this._record.getColumnInfo(this._columnName).ui.getControlParameters(parameters as IControlParameters);
        this._cells.applyControlParametersHooks(overridden, this._hookParams);
        return overridden;
    }

    private _isCustomRenderer(control: ICustomColumnControl): boolean {
        //a cell taking input is a control whatever the column named: the renderer only ever draws
        return this._takesInput || control.name !== BaseControls.GridCellRenderer;
    }

    /** What a cell hands whatever draws it, before the record and the hooks have their say. */
    private _getCellParameters(control: ICustomColumnControl): IGridCellRendererParameters {
        const column = this._column!;
        const field = this.getField();
        const parameters: IGridCellRendererParameters = {
            value: field.value,
            ColumnAlignment: { raw: column.alignment ?? 'left' },
            CellType: { raw: this._takesInput ? 'editor' : 'renderer' },
            EnableNavigation: { raw: this._isNavigationSupported(), type: DataTypes.TwoOptions },
            Column: { raw: column },
            Dataset: { raw: this._provider as unknown as IDataset },
            Record: { raw: this._record },
            PrefixIcon: { raw: null, type: DataTypes.SingleLineText },
            SuffixIcon: { raw: null, type: DataTypes.SingleLineText },
            IsPrimaryColumn: { raw: column.isPrimary, type: DataTypes.TwoOptions },
            ShowErrorMessage: { raw: false, type: DataTypes.TwoOptions },
            AutoFocus: { raw: this._takesInput, type: DataTypes.TwoOptions },
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

    private _getDefaultControl(): Required<ICustomColumnControl> {
        const control: Required<ICustomColumnControl> = {
            name: this._getDefaultControlName(),
            appliesTo: 'both',
            bindings: {}
        };
        //legacy, kept for back compat: naming a control on the column is how a host replaced a cell's
        //control before hooks existed, and a hook is the way to do it now
        const customControls = this._record.getColumnInfo(this._columnName).ui.getCustomControls([control]);
        const appliesTo = this._takesInput ? 'editor' : 'renderer';
        //a column may name one control for drawing and another for input, so it is not simply the first
        const customControl = customControls.find(candidate => candidate.appliesTo === 'both' || candidate.appliesTo === appliesTo);
        //merged rather than taken: a custom control that names only a name keeps the default's bindings
        return customControl ? merge(control, customControl) as Required<ICustomColumnControl> : control;
    }

    private _getDefaultControlName(): string {
        const column = this._column!;
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
        return this._takesInput ? BaseControls.GetControlNameForDataType(column.dataType as DataType) : BaseControls.GridCellRenderer;
    }

    /** Whether this column's value is one that can be followed at all. */
    private _isNavigationSupported(): boolean {
        if (!this._settings.isNavigationEnabled()) {
            return false;
        }
        const column = this._column!;
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
                const metadata = this._record.getDataProvider().getMetadata() as Xrm.Metadata.EntityMetadata | undefined;
                return !!column.isPrimary || column.name === metadata?.PrimaryNameAttribute;
            }
        }
    }

    /**
     * The column as this record's own provider has it: a group's children are a provider of their own, and
     * its copy of the column is what governs that row.
     */
    private get _column(): IColumn | undefined {
        return this._record.getDataProvider().getColumnsMap()[this._columnName];
    }

    private get _hookParams() {
        return { record: this._record, columnName: this._columnName, takesInput: this._takesInput };
    }

    private get _cells() {
        return this._services.get('cells');
    }

    private get _settings() {
        return this._services.get('settings');
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
