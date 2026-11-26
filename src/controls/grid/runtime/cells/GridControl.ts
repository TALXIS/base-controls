import { IPcfContext, IParameters } from "@pcf/interfaces";
import { DataTypes, IDataProvider, IRecord } from "@talxis/client-libraries";
import { BaseControls } from "@pcf";
import { IGridValueRenderer, IGridValueRendererParameters } from "../../adapters/value-renderer";
import { IGridServiceRegistryInternal } from "..";
import { IGridField } from "../fields";
import type { IGridCell } from "./GridCell";
import { GridFieldControl, IGridFieldControl } from "./GridFieldControl";
import { hasResizeGrip } from "../../adapters/cells/resize-grip/hasResizeGrip";
import type { IGridCellControl } from "./GridCells";

export interface IGridControlParameters {
    services: IGridServiceRegistryInternal;
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
    getContext(): IPcfContext;
    /** The control this cell is drawn or edited with, and its parameters, after the hooks. */
    getControl(): IGridCellControl;
}

export class GridControl implements IGridControl {
    private _services: IGridServiceRegistryInternal;
    private _record: IRecord;
    private _columnName: string;
    private _takesInput: boolean;
    private _cell: IGridCell;
    private _fieldControl?: IGridFieldControl;
    private _context?: { isDisabled: boolean; value: IPcfContext };

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
        return this._isCustomRenderer(this.getControl());
    }

    public getControlProps(): IGridValueRenderer {
        return {
            context: this.getContext(),
            parameters: this.getControl().parameters as IGridValueRendererParameters,
        };
    }

    public getContext(): IPcfContext {
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

    public getControl(): IGridCellControl {
        const columnControl = this._cell.getContext().control;
        const modeControl = this._takesInput ? columnControl?.editor : columnControl?.renderer;
        const result = {
            control: {
                name: modeControl?.name ?? this._fieldControl?.getControlName() ?? BaseControls.GridValueRenderer,
                parameters: { ...this._getCellParameters(), ...columnControl?.parameters, ...modeControl?.parameters },
            },
        };
        this._cells.applyControlHooks(result, this._hookParams);
        return result.control;
    }

    private _isCustomRenderer(control: IGridCellControl): boolean {
        //a cell taking input needs a control since the renderer only draws
        return this._takesInput || control.name !== BaseControls.GridValueRenderer;
    }

    /** What a cell hands whatever draws it, before the column and the hooks have their say. */
    private _getCellParameters(): IParameters {
        const parameters: IGridValueRendererParameters = {
            value: { raw: undefined },
            ColumnAlignment: { raw: this._cell.getAlignment() },
            CellType: { raw: this._takesInput ? 'editor' : 'renderer' },
            EnableNavigation: { raw: false, type: DataTypes.TwoOptions },
            Column: { raw: undefined },
            Cell: { raw: this._cell },
            Provider: { raw: this._provider },
            Record: { raw: this._record },
            Runtime: { raw: this._services.get('grid') },
            PrefixIcon: { raw: null, type: DataTypes.SingleLineText },
            SuffixIcon: { raw: null, type: DataTypes.SingleLineText },
            IsPrimaryColumn: { raw: !!this._cell.getContext().isPrimary, type: DataTypes.TwoOptions },
            //wrapped wherever the row can grow to show it
            IsMultiline: { raw: hasResizeGrip(this._cell.getColDef()), type: DataTypes.TwoOptions },
            ShowErrorMessage: { raw: false, type: DataTypes.TwoOptions },
            AutoFocus: { raw: this._cell.isBeingEdited(), type: DataTypes.TwoOptions },
            FillAvailableSpace: { raw: true, type: DataTypes.TwoOptions },
            IsInlineNewEnabled: { raw: false, type: DataTypes.TwoOptions },
            EnableTypeSuffix: { raw: false, type: DataTypes.TwoOptions },
            EnableOptionSetColors: { raw: this._settings.isOptionSetColorsEnabled(), type: DataTypes.TwoOptions },
        };
        return { ...parameters, ...this._fieldControl?.getParameters() };
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
