import { DataTypes, ICustomColumnControl, IDataProvider, IRecord } from "@talxis/client-libraries";
import { BaseControls } from "@utils";
import { IGridValueRenderer, IGridValueRendererParameters } from "@controls/grid/value-renderer";
import { IParameters } from "@interfaces";
import { IGridServiceLocator } from "../../services";
import { IGridField } from "../fields";
import type { IGridCell } from "./GridCell";
import { GridFieldControl, IGridFieldControl } from "./GridFieldControl";
import { hasResizeGrip } from "../../components/cells/resize-grip/hasResizeGrip";

export interface IGridControlParameters {
    services: IGridServiceLocator;
    /** The cell this draws. */
    cell: IGridCell;
    /** The field this draws, where the cell is bound to one. */
    field?: IGridField;
    takesInput?: boolean;
}

/** What one cell shows and what it shows it with. */
export interface IGridControl {
    /** What the field behind this control draws with. */
    getFieldControl(): IGridFieldControl | undefined;
    /** Whether something other than the cell renderer draws this cell. */
    isCustomRendererEnabled(): boolean;
    /** What draws this cell and what it is given. */
    getControlProps(): IGridValueRenderer;
    /** What the host gave the grid, with what a control may do in this cell. */
    getContext(): ComponentFramework.Context<any, any>;
    /** The control a hook named for this cell, or the grid's renderer. */
    getCustomControl(): Required<ICustomColumnControl>;
    /** The parameters a control is actually handed. */
    getFinalControlParameters(parameters: IParameters): IParameters;
}

export class GridControl implements IGridControl {
    private _services: IGridServiceLocator;
    private _record: IRecord;
    private _columnName: string;
    private _takesInput: boolean;
    private _cell: IGridCell;
    private _fieldControl?: IGridFieldControl;
    private _context?: { isDisabled: boolean; value: ComponentFramework.Context<any, any> };

    constructor(parameters: IGridControlParameters) {
        this._services = parameters.services;
        this._cell = parameters.cell;
        this._record = parameters.cell.getRecord();
        this._columnName = parameters.cell.getColumnName();
        this._takesInput = !!parameters.takesInput;
        this._fieldControl = parameters.field
            ? new GridFieldControl({ services: parameters.services, field: parameters.field, cell: parameters.cell, takesInput: this._takesInput })
            : undefined;
    }

    public getFieldControl(): IGridFieldControl | undefined {
        return this._fieldControl;
    }

    public isCustomRendererEnabled(): boolean {
        return this._isCustomRenderer(this.getCustomControl());
    }

    public getControlProps(): IGridValueRenderer {
        const control = this.getCustomControl();
        const parameters = this._getCellParameters(control);
        return {
            context: this.getContext(),
            //a custom control merges these into its own parameters and finalizes them there
            parameters: this._isCustomRenderer(control) ? parameters : this.getFinalControlParameters(parameters) as IGridValueRendererParameters,
        };
    }

    public getContext(): ComponentFramework.Context<any, any> {
        const isDisabled = this._cell.isLocked();
        if (this._context?.isDisabled === isDisabled) {
            return this._context.value;
        }
        const pcfContext = this._services.get('pcfContext');
        const value = {
            ...pcfContext,
            mode: Object.create(pcfContext.mode, { isControlDisabled: { value: isDisabled } }),
        };
        this._context = { isDisabled: isDisabled, value: value };
        return value;
    }

    public getCustomControl(): Required<ICustomColumnControl> {
        const result = { control: this._getDefaultControl() };
        this._cells.applyControlHooks(result, this._hookParams);
        return result.control;
    }

    public getFinalControlParameters(parameters: IParameters): IParameters {
        this._cells.applyControlParametersHooks(parameters, this._hookParams);
        this._cell.getSettings().cell?.onGetControlParameters?.(parameters, { record: this._record });
        return parameters;
    }

    private _isCustomRenderer(control: ICustomColumnControl): boolean {
        //a cell taking input needs a control since the renderer only draws
        return this._takesInput || control.name !== BaseControls.GridValueRenderer;
    }

    /** What a cell hands whatever draws it, before the hooks have their say. */
    private _getCellParameters(control: ICustomColumnControl): IGridValueRendererParameters {
        const parameters: IGridValueRendererParameters = {
            value: undefined,
            ColumnAlignment: { raw: this._cell.getAlignment() },
            CellType: { raw: this._takesInput ? 'editor' : 'renderer' },
            EnableNavigation: { raw: false, type: DataTypes.TwoOptions },
            Column: { raw: undefined },
            Cell: { raw: this._cell },
            Provider: { raw: this._provider },
            Record: { raw: this._record },
            PrefixIcon: { raw: null, type: DataTypes.SingleLineText },
            SuffixIcon: { raw: null, type: DataTypes.SingleLineText },
            IsPrimaryColumn: { raw: !!this._cell.getSettings().isPrimary, type: DataTypes.TwoOptions },
            //wrapped wherever the row can grow to show it
            IsMultiline: { raw: hasResizeGrip(this._cell.getColDef()), type: DataTypes.TwoOptions },
            ShowErrorMessage: { raw: false, type: DataTypes.TwoOptions },
            AutoFocus: { raw: this._cell.isBeingEdited(), type: DataTypes.TwoOptions },
            FillAvailableSpace: { raw: true, type: DataTypes.TwoOptions },
            IsInlineNewEnabled: { raw: false, type: DataTypes.TwoOptions },
            EnableTypeSuffix: { raw: false, type: DataTypes.TwoOptions },
            EnableOptionSetColors: { raw: this._settings.areOptionSetColorsEnabled(), type: DataTypes.TwoOptions },
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
            name: this._fieldControl?.getControlName() ?? BaseControls.GridValueRenderer,
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
