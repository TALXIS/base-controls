import { ColDef, IRowNode } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";
import { IGridCellCommands, IGridCellEditable, IGridCellLoading } from "./GridCells";
import { GridCellTheme } from "./GridCellTheme";
import { GridField } from "../fields";
import { GridControl } from "./GridControl";

export interface IGridCellParameters {
    services: IGridServiceLocator;
    record: IRecord;
    /** The column AG Grid is drawing, which is what a cell is the cell of. */
    colDef: ColDef<IRecord>;
    /** The row AG Grid is drawing. */
    node?: IRowNode<IRecord>;
    /** Whether this cell draws a control the user can type in. */
    takesInput?: boolean;
}

//enough to tell two cells apart in the registry, a renderer and its editor included
let instanceCount = 0;

/** One cell of the grid, for as long as it is on screen. */
export class GridCell {
    private _services: IGridServiceLocator;
    private _record: IRecord;
    private _colDef: ColDef<IRecord>;
    private _node?: IRowNode<IRecord>;
    private _id: string;
    private _theme: GridCellTheme;
    private _control?: GridControl;
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

    /** The row AG Grid is drawing this cell in. */
    public getNode(): IRowNode<IRecord> | undefined {
        return this._node;
    }

    /** What this cell is drawn in. */
    public getTheme(): GridCellTheme {
        return this._theme;
    }

    /** Whether this cell is waiting on something. */
    public isLoading(): boolean {
        const result: IGridCellLoading = { isLoading: false };
        this._cells.applyCellLoadingHooks(result, { record: this._record, columnName: this.getColumnName() });
        return result.isLoading;
    }

    /** Whether this cell draws a control the user can type in. */
    public takesInput(): boolean {
        return this._takesInput;
    }

    /** Whether that control is drawn in the cell itself. */
    public takesInputInPlace(): boolean {
        return !!this._colDef.propBag?.column?.oneClickEdit;
    }

    /** Whether the user is editing this cell. */
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

    /** The edit is over: the control has nothing more to take, or the user pressed the key that */
    public finishEditing(): void {
        this._editing.finish(this);
    }

    /** What draws this cell's value, once {@link createControl} has made one. */
    public getControl(): GridControl | undefined {
        return this._control;
    }

    /** Makes what draws this cell's value. */
    public createControl(field?: GridField): GridControl {
        this._control = new GridControl({ services: this._services, cell: this, field: field, takesInput: this._takesInput });
        return this._control;
    }

    /**
     * Whether what this cell holds may be changed.
     */
    public isEditable(): boolean {
        //the column's word is the last one, and it is not `editable`
        if (this._colDef.propBag?.column?.isEditable === false) {
            return false;
        }
        const result: IGridCellEditable = { isEditable: true };
        this._cells.applyCellEditableHooks(result, { record: this._record, columnName: this.getColumnName() });
        return result.isEditable;
    }

    /**
     * What this cell offers to do, as buttons and as what the overflow menu holds.
     */
    public getCommands(): IGridCellCommands {
        const result: IGridCellCommands = { items: [], overflowItems: [] };
        this._cells.applyCellCommandsHooks(result, { record: this._record, columnName: this.getColumnName() });
        return result;
    }

    /** Whether this cell has left the screen, after. */
    public isDestroyed(): boolean {
        return this._isDestroyed;
    }

    /** The cell has left the screen: whatever it was holding goes with it. */
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
