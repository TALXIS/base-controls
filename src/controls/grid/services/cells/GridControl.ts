import { DataTypes, ICustomColumnControl, IDataProvider, IDataset, IRecord } from "@talxis/client-libraries";
import { BaseControls } from "@utils";
import { IGridCellRenderer, IGridCellRendererParameters } from "@controls/grid/cell-renderer";
import { IParameters } from "@interfaces";
import { IGridServiceLocator } from "../../services";
import { GridField } from "../fields";
import { GridCell } from "./GridCell";
import { GridFieldControl } from "./GridFieldControl";

export interface IGridControlParameters {
    services: IGridServiceLocator;
    /** The cell this draws, which is the one that made it. */
    cell: GridCell;
    /** The field this draws, where the cell is bound to one. */
    field?: GridField;
    takesInput?: boolean;
}

/** What one cell shows, and what it shows it with. */
export class GridControl {
    private _services: IGridServiceLocator;
    private _record: IRecord;
    private _columnName: string;
    private _takesInput: boolean;
    private _cell: GridCell;
    private _fieldControl?: GridFieldControl;
    private _context?: { isDisabled: boolean; value: ComponentFramework.Context<any, any> };

    constructor(parameters: IGridControlParameters) {
        this._services = parameters.services;
        this._cell = parameters.cell;
        this._record = parameters.cell.getRecord();
        this._columnName = parameters.cell.getColumnName();
        this._takesInput = !!parameters.takesInput;
        this._fieldControl = parameters.field
            ? new GridFieldControl({ services: parameters.services, field: parameters.field, takesInput: this._takesInput })
            : undefined;
    }

    /** What the field behind this control draws with, where anything bound one. */
    public getFieldControl(): GridFieldControl | undefined {
        return this._fieldControl;
    }

    /** Whether a field is behind this control, rather than a column the record has no value for. */
    public isBound(): boolean {
        return !!this._fieldControl;
    }

    /** Whether something other than the cell renderer draws this cell. */
    public isCustomRendererEnabled(): boolean {
        return this._isCustomRenderer(this.getCustomControl());
    }

    /** What draws this cell, and what it is given. */
    public getControlProps(): IGridCellRenderer {
        const control = this.getCustomControl();
        const parameters = this._getCellParameters(control);
        return {
            context: this.getContext(),
            //a custom control merges these into its own parameters and finalizes them there
            parameters: this._isCustomRenderer(control) ? parameters : this.getFinalControlParameters(parameters) as IGridCellRendererParameters,
        };
    }

    /** What the host gave the grid, with what a control may do in this cell. */
    public getContext(): ComponentFramework.Context<any, any> {
        const isDisabled = !this._cell.isEditable();
        if (this._context?.isDisabled === isDisabled) {
            return this._context.value;
        }
        const pcfContext = this._services.get('pcfContext');
        const value = {
            ...pcfContext,
            mode: Object.create(pcfContext.mode, { isControlDisabled: { value: isDisabled } }),
            //the cell is drawn in a theme of its own, and what is drawn in it takes that theme
            fluentDesignLanguage: undefined,
        };
        this._context = { isDisabled: isDisabled, value: value };
        return value;
    }

    /** Which control draws this cell: the grid's renderer, unless a hook named another. */
    public getCustomControl(): Required<ICustomColumnControl> {
        const result = { control: this._getDefaultControl() };
        this._cells.applyControlHooks(result, this._hookParams);
        return result.control;
    }

    /** The parameters a control is actually handed. */
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
        const parameters: IGridCellRendererParameters = {
            value: undefined,
            ColumnAlignment: { raw: 'left' },
            CellType: { raw: this._takesInput ? 'editor' : 'renderer' },
            EnableNavigation: { raw: false, type: DataTypes.TwoOptions },
            Column: { raw: undefined },
            Cell: { raw: this._cell },
            Dataset: { raw: this._provider as unknown as IDataset },
            Record: { raw: this._record },
            PrefixIcon: { raw: null, type: DataTypes.SingleLineText },
            SuffixIcon: { raw: null, type: DataTypes.SingleLineText },
            IsPrimaryColumn: { raw: false, type: DataTypes.TwoOptions },
            ShowErrorMessage: { raw: false, type: DataTypes.TwoOptions },
            AutoFocus: { raw: this._cell.isBeingEdited(), type: DataTypes.TwoOptions },
            FillAvailableSpace: { raw: true, type: DataTypes.TwoOptions },
            IsInlineNewEnabled: { raw: false, type: DataTypes.TwoOptions },
            EnableTypeSuffix: { raw: false, type: DataTypes.TwoOptions },
            EnableOptionSetColors: { raw: this._settings.areOptionSetColorsEnabled(), type: DataTypes.TwoOptions },
            CommandButtonIds: { raw: this._settings.getInlineRibbonButtonIds(), type: DataTypes.SingleLineText },
        };
        Object.assign(parameters, this._fieldControl?.getParameters());
        //what the column's bindings ask for wins
        Object.entries(control.bindings ?? {}).forEach(([name, binding]) => {
            parameters[name] = { raw: binding.value, type: binding.type };
        });
        return parameters;
    }

    private _getDefaultControl(): Required<ICustomColumnControl> {
        return {
            name: this._fieldControl?.getControlName() ?? BaseControls.GridCellRenderer,
            appliesTo: 'both',
            bindings: {}
        };
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
