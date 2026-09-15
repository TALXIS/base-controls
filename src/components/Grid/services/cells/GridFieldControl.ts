import { DataProvider, DataType, DataTypes, IColumn, ICustomColumnControl, IDataProvider, IDataset, IRecord } from "@talxis/client-libraries";
import { BaseControls } from "@utils";
import { IGridCellRenderer, IGridCellRendererParameters } from "@components/GridCellRenderer";
import { IParameters } from "@interfaces";
import { IGridServiceLocator } from "../../services";
import { GridField } from "../fields";

export interface IGridFieldControlParameters {
    services: IGridServiceLocator;
    /** The field this draws, which is what makes it a control of anything. */
    field: GridField;
    /** Whether the control takes input rather than only drawing the value. */
    takesInput?: boolean;
}

/**
 * What one cell shows, and what it shows it with.
 *
 * Built for a cell and asked about that cell, so nothing here is told which record or column it is talking
 * about. What it draws comes off the field it is bound to; which control draws it, and what that control
 * is handed, is what a hook on `GridCells` decides - the field's own among them - rather than the grid
 * knowing the feature exists.
 */
export class GridFieldControl {
    private _services: IGridServiceLocator;
    private _record: IRecord;
    private _columnName: string;
    private _takesInput: boolean;
    private _field: GridField;

    constructor(parameters: IGridFieldControlParameters) {
        this._services = parameters.services;
        this._field = parameters.field;
        this._record = parameters.field.getRecord();
        this._columnName = parameters.field.getColumnName();
        this._takesInput = !!parameters.takesInput;
    }

    /** What this cell is bound to. */
    public getField(): GridField {
        return this._field;
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
     * Which control draws this cell: the grid's renderer, unless a hook named another - which is how the
     * column's own control reaches it, the field registering that.
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
     * The parameters a control is actually handed: what was built for it, and what the hooks made of that.
     *
     * The field's own hook runs first, so a module or a consumer has the later word on a column that
     * overrides its own parameters.
     */
    public getFinalControlParameters(parameters: IParameters): IParameters {
        this._cells.applyControlParametersHooks(parameters, this._hookParams);
        return parameters;
    }

    private _isCustomRenderer(control: ICustomColumnControl): boolean {
        //a cell taking input is a control whatever the column named: the renderer only ever draws
        return this._takesInput || control.name !== BaseControls.GridCellRenderer;
    }

    /** What a cell hands whatever draws it, before the hooks have their say. */
    private _getCellParameters(control: ICustomColumnControl): IGridCellRendererParameters {
        const column = this._column!;
        const parameters: IGridCellRendererParameters = {
            value: this._field.getValue(),
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
            FillAvailableSpace: { raw: true, type: DataTypes.TwoOptions },
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
        return {
            name: this._getDefaultControlName(),
            appliesTo: 'both',
            bindings: {}
        };
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
