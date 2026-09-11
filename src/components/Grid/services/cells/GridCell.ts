import { IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";
import { IGridCellLoading } from "./GridCells";
import { GridCellTheme } from "./GridCellTheme";

export interface IGridCellParameters {
    services: IGridServiceLocator;
    record: IRecord;
    columnName: string;
}

//enough to tell two cells apart in a registry, including the same one drawn twice while AG Grid swaps a
//renderer for an editor
let instanceCount = 0;

/**
 * One cell of the grid, for as long as it is on screen.
 *
 * Created by `CellHost` and by nothing else: a cell that draws without one is a cell the grid cannot see.
 * Whatever belongs to a single cell lives here, and goes when the cell does.
 */
export class GridCell {
    private _services: IGridServiceLocator;
    private _record: IRecord;
    private _columnName: string;
    private _id: string;
    private _theme: GridCellTheme;
    private _isDestroyed: boolean = false;

    constructor(parameters: IGridCellParameters) {
        this._services = parameters.services;
        this._record = parameters.record;
        this._columnName = parameters.columnName;
        this._id = `${parameters.record.getRecordId()}_${parameters.columnName}_${++instanceCount}`;
        this._theme = new GridCellTheme(parameters);
    }

    /** What tells this cell apart from every other one, this render of it included. */
    public getId(): string {
        return this._id;
    }

    public getRecord(): IRecord {
        return this._record;
    }

    public getColumnName(): string {
        return this._columnName;
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
        this._cells.applyCellLoadingHooks(result, { record: this._record, columnName: this._columnName });
        return result.isLoading;
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
}
