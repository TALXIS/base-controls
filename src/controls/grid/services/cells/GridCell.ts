import { ColDef, IRowNode } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { IAlignment } from "@utils";
import { IGridServiceLocator } from "../../services";
import { IGridColumnSettings } from "../columns/colDef";
import { IGridCellCommands, IGridCellEditable, IGridCellLoading } from "./GridCells";
import { GridCellTheme, IGridCellTheme } from "./GridCellTheme";
import { IGridField } from "../fields";
import { GridControl, IGridControl } from "./GridControl";

export interface IGridCellParameters {
    services: IGridServiceLocator;
    record: IRecord;
    /** The column AG Grid is drawing, which is what a cell is the cell of. */
    colDef: ColDef<IRecord>;
    /** The row AG Grid is drawing. */
    node?: IRowNode<IRecord>;
    /** Whether this cell draws a control the user can type in. */
    takesInput?: boolean;
    /** The element AG Grid draws this cell in. */
    element?: HTMLElement;
}

//enough to tell two cells apart in the registry, a renderer and its editor included
let instanceCount = 0;

/** One cell of the grid, for as long as it is on screen. */
export interface IGridCell {
    /** What tells this cell apart from every other one, this render of it included. */
    getId(): string;
    getRecord(): IRecord;
    /** The column this cell is in, as AG Grid was given it. */
    getColDef(): ColDef<IRecord>;
    getColumnName(): string;
    /** The element AG Grid draws this cell in, where it is drawn in one. */
    getElement(): HTMLElement | undefined;
    /** The row AG Grid is drawing this cell in. */
    getNode(): IRowNode<IRecord> | undefined;
    /** What this cell is drawn in. */
    getTheme(): IGridCellTheme;
    /** Whether this cell is waiting on something. */
    isLoading(): boolean;
    /** Whether this cell draws a control the user can type in. */
    takesInput(): boolean;
    /** Whether that control is drawn in the cell itself, with no editor to open. */
    hasOneClickEdit(): boolean;
    /** What the column this cell is in says its cells are. */
    getSettings(): IGridColumnSettings;
    /** Which edge this cell reads from. */
    getAlignment(): IAlignment;
    /** Whether the user is editing this cell. */
    isBeingEdited(): boolean;
    /** The user stepped into the control this cell draws. */
    startEditing(): void;
    /** The edit is over. */
    finishEditing(): void;
    /** What draws this cell's value, once {@link IGridCell.createControl} has made one. */
    getControl(): IGridControl | undefined;
    /** Makes what draws this cell's value. */
    createControl(field?: IGridField): IGridControl;
    /** Whether what this cell holds may be changed. */
    isEditable(): boolean;
    /** What this cell offers to do, as buttons and as what the overflow menu holds. */
    getCommands(): IGridCellCommands;
    /** Whether this cell has left the screen, after. */
    isDestroyed(): boolean;
    /** The cell has left the screen: whatever it was holding goes with it. */
    destroy(): void;
}

export class GridCell implements IGridCell {
    private _services: IGridServiceLocator;
    private _record: IRecord;
    private _colDef: ColDef<IRecord>;
    private _node?: IRowNode<IRecord>;
    private _id: string;
    private _theme: IGridCellTheme;
    private _control?: IGridControl;
    private _takesInput: boolean;
    private _element?: HTMLElement;
    private _isDestroyed: boolean = false;

    constructor(parameters: IGridCellParameters) {
        this._services = parameters.services;
        this._record = parameters.record;
        this._colDef = parameters.colDef;
        this._node = parameters.node;
        this._takesInput = !!parameters.takesInput;
        this._element = parameters.element;
        this._id = `${parameters.record.getRecordId()}_${this.getColumnName()}_${++instanceCount}`;
        this._theme = new GridCellTheme({ services: parameters.services, cell: this });
    }

    public getId(): string {
        return this._id;
    }

    public getRecord(): IRecord {
        return this._record;
    }

    public getColDef(): ColDef<IRecord> {
        return this._colDef;
    }

    public getColumnName(): string {
        return this._colDef.colId!;
    }

    public getElement(): HTMLElement | undefined {
        return this._element;
    }

    public getNode(): IRowNode<IRecord> | undefined {
        return this._node;
    }

    public getTheme(): IGridCellTheme {
        return this._theme;
    }

    public isLoading(): boolean {
        const result: IGridCellLoading = { isLoading: false };
        this._cells.applyCellLoadingHooks(result, { record: this._record, columnName: this.getColumnName() });
        return result.isLoading;
    }

    public takesInput(): boolean {
        return this._takesInput;
    }

    public hasOneClickEdit(): boolean {
        return !!this.getSettings().oneClickEdit;
    }

    public getSettings(): IGridColumnSettings {
        return this._colDef.settings ?? {};
    }

    public getAlignment(): IAlignment {
        return this.getSettings().alignment ?? 'left';
    }

    public isBeingEdited(): boolean {
        //an editor was opened because the user asked to type here
        if (this._takesInput && !this.hasOneClickEdit()) {
            return true;
        }
        return this._editing.isEditing(this._record, this.getColumnName());
    }

    public startEditing(): void {
        this._editing.start(this);
    }

    public finishEditing(): void {
        this._editing.finish(this);
    }

    public getControl(): IGridControl | undefined {
        return this._control;
    }

    public createControl(field?: IGridField): IGridControl {
        this._control = new GridControl({ services: this._services, cell: this, field: field, takesInput: this._takesInput });
        return this._control;
    }

    public isEditable(): boolean {
        //the column's word is the last one, and it is not `editable`
        if (this.getSettings().isEditable === false) {
            return false;
        }
        const result: IGridCellEditable = { isEditable: true };
        this._cells.applyCellEditableHooks(result, { record: this._record, columnName: this.getColumnName() });
        return result.isEditable;
    }

    public getCommands(): IGridCellCommands {
        const result: IGridCellCommands = { items: [], overflowItems: [] };
        this._cells.applyCellCommandsHooks(result, { record: this._record, columnName: this.getColumnName() });
        return result;
    }

    public isDestroyed(): boolean {
        return this._isDestroyed;
    }

    public destroy(): void {
        this._isDestroyed = true;
    }

    private get _cells() {
        return this._services.get('cells');
    }

    private get _editing() {
        return this._cells.editing;
    }
}
