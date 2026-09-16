import { ColDef, IRowNode } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";
import { IGridCellCommands, IGridCellEditable, IGridCellLoading } from "./GridCells";
import { GridCellTheme } from "./GridCellTheme";
import { GridField } from "../fields";
import { GridFieldControl } from "./GridFieldControl";

export interface IGridCellParameters {
    services: IGridServiceLocator;
    record: IRecord;
    /** The column AG Grid is drawing, which is what a cell is the cell of. */
    colDef: ColDef<IRecord>;
    /** The row AG Grid is drawing, where the cell is one being drawn rather than one being asked about. */
    node?: IRowNode<IRecord>;
    /**
     * Whether this cell draws a control the user can type in rather than the value it holds.
     *
     * True of an editor, and of a one-click-edit column's cell, whose control takes input without an
     * editor ever being opened.
     */
    takesInput?: boolean;
}

//enough to tell two cells apart in a registry, including the same one drawn twice while AG Grid swaps a
//renderer for an editor
let instanceCount = 0;

/**
 * One cell of the grid, for as long as it is on screen.
 *
 * Created by `CellRoot` and by nothing else: a cell that draws without one is a cell the grid cannot see.
 * Whatever belongs to a single cell lives here, and goes when the cell does.
 */
export class GridCell {
    private _services: IGridServiceLocator;
    private _record: IRecord;
    private _colDef: ColDef<IRecord>;
    private _node?: IRowNode<IRecord>;
    private _id: string;
    private _theme: GridCellTheme;
    private _control?: GridFieldControl;
    private _takesInput: boolean;
    private _isDestroyed: boolean = false;

    constructor(parameters: IGridCellParameters) {
        this._services = parameters.services;
        this._record = parameters.record;
        this._colDef = parameters.colDef;
        this._node = parameters.node;
        this._takesInput = !!parameters.takesInput;
        this._id = `${parameters.record.getRecordId()}_${this.getColumnName()}_${++instanceCount}`;
        this._theme = new GridCellTheme({ services: parameters.services, record: parameters.record, columnName: this.getColumnName(), node: parameters.node });
    }

    /** What tells this cell apart from every other one, this render of it included. */
    public getId(): string {
        return this._id;
    }

    public getRecord(): IRecord {
        return this._record;
    }

    /** The column this cell is in, as AG Grid was given it. */
    public getColDef(): ColDef<IRecord> {
        return this._colDef;
    }

    public getColumnName(): string {
        return this._colDef.colId!;
    }

    /** The row AG Grid is drawing this cell in, where the cell is one being drawn rather than asked about. */
    public getNode(): IRowNode<IRecord> | undefined {
        return this._node;
    }

    /** What this cell is drawn in. */
    public getTheme(): GridCellTheme {
        return this._theme;
    }

    /**
     * Whether this cell is waiting on something. `false` unless a hook says otherwise.
     *
     * Answered on every call: a hook reads state that changes under it, and a cell holding on to the first
     * answer would never stop shimmering.
     */
    public isLoading(): boolean {
        const result: IGridCellLoading = { isLoading: false };
        this._cells.applyCellLoadingHooks(result, { record: this._record, columnName: this.getColumnName() });
        return result.isLoading;
    }

    /** Whether this cell draws a control the user can type in rather than the value it holds. */
    public takesInput(): boolean {
        return this._takesInput;
    }

    /** Whether that control is drawn in the cell itself rather than in an editor opened over it. */
    public takesInputInPlace(): boolean {
        return !!this._colDef.propBag?.column?.oneClickEdit;
    }

    /** Whether the user is editing this cell, which is what its control is handed as `AutoFocus`. */
    public isBeingEdited(): boolean {
        //an editor was opened because the user asked to type here
        if (this._takesInput && !this.takesInputInPlace()) {
            return true;
        }
        return this._editing.isEditing(this._record, this.getColumnName());
    }

    /** The user stepped into the control this cell draws. */
    public startEditing(): void {
        this._editing.start(this);
    }

    /**
     * The edit is over: the control has nothing more to take, or the user pressed the key that leaves.
     * Whatever was opened over the cell closes and the highlight comes back.
     */
    public finishEditing(): void {
        this._editing.finish(this);
    }

    /** What draws this cell's value, once {@link createControl} has made one. */
    public getControl(): GridFieldControl | undefined {
        return this._control;
    }

    /**
     * Makes what draws this cell's value, which is the control adapter's to do: the field it draws is the
     * adapter's to hand over, and nothing else about it is the adapter's to decide.
     */
    public createControl(field: GridField): GridFieldControl {
        this._control = new GridFieldControl({ services: this._services, field: field, cell: this, takesInput: this._takesInput });
        return this._control;
    }

    /**
     * Whether what this cell holds may be changed. `true` unless the definition or a hook says otherwise.
     *
     * Answered on every call, for the same reason as {@link isLoading}: a hook reads state that changes
     * under it.
     */
    public isEditable(): boolean {
        //the column's word is the last one, and it is not `editable` - that is AG Grid's question about
        //opening an editor, which a one-click-edit column answers no to while changing its value happily
        if (this._colDef.propBag?.column?.isEditable === false) {
            return false;
        }
        const result: IGridCellEditable = { isEditable: true };
        this._cells.applyCellEditableHooks(result, { record: this._record, columnName: this.getColumnName() });
        return result.isEditable;
    }

    /**
     * What this cell offers to do, as buttons and as what the overflow menu holds. Nothing of either,
     * unless a hook says otherwise.
     *
     * Answered on every call, for the same reason as {@link isLoading}: a hook reads state that changes
     * under it.
     */
    public getCommands(): IGridCellCommands {
        const result: IGridCellCommands = { items: [], overflowItems: [] };
        this._cells.applyCellCommandsHooks(result, { record: this._record, columnName: this.getColumnName() });
        return result;
    }

    /** Whether this cell has left the screen, after which nothing should be asked of it. */
    public isDestroyed(): boolean {
        return this._isDestroyed;
    }

    /**
     * The cell has left the screen: whatever it was holding goes with it.
     *
     * Called by `GridCells.removeCell`, so a destroyed cell is never one the registry still hands out.
     */
    public destroy(): void {
        this._isDestroyed = true;
    }

    private get _cells() {
        return this._services.get('cells');
    }

    private get _editing() {
        return this._services.get('editing');
    }
}
