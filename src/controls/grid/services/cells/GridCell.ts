import { ColDef, IRowNode } from "@ag-grid-community/core";
import { EventEmitter, IEventEmitter, IRecord } from "@talxis/client-libraries";
import { IAlignment } from "@utils";
import { IGridServiceLocator } from "../../services";
import { IGridColumnSettings } from "../columns/colDef";
import { IGridCellCommands, IGridCellLoading } from "./GridCells";
import { GridCellTheme, IGridCellTheme } from "./GridCellTheme";
import { IGridField } from "../fields";
import { GridControl, IGridControl } from "./GridControl";

export interface IGridCellParameters {
    services: IGridServiceLocator;
    record: IRecord;
    /** The column AG Grid is drawing. */
    colDef: ColDef<IRecord>;
    /** The row AG Grid is drawing. */
    node?: IRowNode<IRecord>;
    /** Whether this cell draws a control the user can type in. */
    takesInput?: boolean;
    /** The element AG Grid draws this cell in. */
    element?: HTMLElement;
    field?: IGridField;
}

//enough to tell two cells apart in the registry, a renderer and its editor included
let instanceCount = 0;

export interface IGridCellEvents {
    /** The cell is to be drawn again. */
    onRenderRequested: () => void;
}

/** One cell of the grid, for as long as it is on screen. */
export interface IGridCell {
    readonly events: IEventEmitter<IGridCellEvents>;
    /** Draws the cell again, for a change its record does not carry. */
    render(): void;
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
    /** Whether the cell's control takes input instead of showing the value. */
    takesInput(): boolean;
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
    /** The record's field this cell is bound to, where it is bound to one. */
    getField(): IGridField | undefined;
    /** Makes what draws this cell's value. */
    createControl(): IGridControl;
    /** Whether what this cell holds may be changed. */
    isLocked(): boolean;
    /** What this cell offers to do, as buttons and as what the overflow menu holds. */
    getCommands(): IGridCellCommands;
}

export class GridCell implements IGridCell {
    public readonly events: IEventEmitter<IGridCellEvents> = new EventEmitter<IGridCellEvents>();
    private _services: IGridServiceLocator;
    private _record: IRecord;
    private _colDef: ColDef<IRecord>;
    private _node?: IRowNode<IRecord>;
    private _id: string;
    private _theme: IGridCellTheme;
    private _takesInput: boolean;
    private _element?: HTMLElement;
    private _field?: IGridField;

    constructor(parameters: IGridCellParameters) {
        this._services = parameters.services;
        this._record = parameters.record;
        this._colDef = parameters.colDef;
        this._node = parameters.node;
        this._takesInput = !!parameters.takesInput;
        this._element = parameters.element;
        this._field = parameters.field;
        this._id = `${parameters.record.getRecordId()}_${this.getColumnName()}_${++instanceCount}`;
        this._theme = new GridCellTheme({ services: parameters.services, cell: this });
    }

    public render(): void {
        this.events.dispatchEvent('onRenderRequested');
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
        this.getSettings().cell?.onGetLoading?.(result, { record: this._record });
        return result.isLoading;
    }

    public takesInput(): boolean {
        return this._takesInput;
    }

    public getSettings(): IGridColumnSettings {
        return this._colDef.settings ?? {};
    }

    public getAlignment(): IAlignment {
        return this.getSettings().alignment ?? 'left';
    }

    public isBeingEdited(): boolean {
        return !!this._editing?.isBeingEdited(this);
    }

    public startEditing(): void {
        this._editing?.start(this);
    }

    public finishEditing(): void {
        this._editing?.finish(this);
    }

    public getField(): IGridField | undefined {
        return this._field;
    }

    public createControl(): IGridControl {
        return new GridControl({ services: this._services, cell: this, field: this._field, takesInput: this._takesInput });
    }

    public isLocked(): boolean {
        //a grid without the editing module is read-only
        return this._services.find('editing')?.locks.get({ record: this._record, columnName: this.getColumnName() }).isLocked ?? true;
    }

    public getCommands(): IGridCellCommands {
        const result: IGridCellCommands = { items: [], overflowItems: [] };
        this._cells.applyCellCommandsHooks(result, { record: this._record, columnName: this.getColumnName() });
        this.getSettings().cell?.onGetCommands?.(result, { record: this._record });
        return result;
    }

    private get _cells() {
        return this._services.get('cells');
    }

    //a grid without the editing module edits nothing
    private get _editing() {
        return this._services.find('editing');
    }
}
