import { ColDef } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import { IGridServiceLocator } from "../../services";
import { getColumnContext } from "../../services/columns/colDef";

declare module "../../services/columns/colDef" {
    interface IGridColumnContext {
        /** Whether what the cells hold is locked for good. */
        isLocked?: boolean;
    }
    interface IGridColumnCellContext {
        /** Whether the control takes input where the cell stands, with no editor to open. */
        oneClickEdit?: boolean;
        /** Decides whether a cell is locked, after the cell-level `registerLock` hooks. */
        onGetLock?: (result: IGridLock, params: { record: IRecord }) => void;
    }
}

declare module "../../services/rows/GridRows" {
    interface IGridRowSettings {
        /** Locks a record as a whole, after the record-level `registerLock` hooks. */
        onGetLock?: (result: IGridLock, params: { record: IRecord }) => void;
    }
}

/** The level that locks something. */
export type IGridLockLevel = 'column' | 'record' | 'cell';

/** What is asked about: a column, a record's row, or both for a cell. */
export interface IGridLockContext {
    record?: IRecord;
    columnName?: string;
}

export interface IGridLockResult {
    isLocked: boolean;
    /** The level that locked it, where something did. */
    lockedBy?: IGridLockLevel;
}

export interface IGridLock {
    isLocked: boolean;
}

/** A hook over whether something is locked, handed the context it is asked about. */
export type GridLockHook = (result: IGridLock, context: IGridLockContext) => void;

export interface IGridLocksParameters {
    services: IGridServiceLocator;
}

/** Whether a column, a record's row or a cell is locked. */
export interface IGridLocks {
    /** Whether what the context names is locked, and at which level. */
    get(context?: IGridLockContext): IGridLockResult;
    /**
     * Registers a hook over any level; it is handed the context it is asked about.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerLock(hook: GridLockHook, priority?: number): () => void;
}

export class GridLocks implements IGridLocks {
    private _services: IGridServiceLocator;
    private _hooks = new HookRegistry<GridLockHook>();

    constructor(parameters: IGridLocksParameters) {
        this._services = parameters.services;
    }

    public get(context: IGridLockContext = {}): IGridLockResult {
        const { record, columnName } = context;
        const colDef = columnName ? this._getColDef(columnName) : undefined;
        if (columnName && this._isColumnLocked(columnName, colDef)) {
            return { isLocked: true, lockedBy: 'column' };
        }
        if (record && this._isRecordLocked(record)) {
            return { isLocked: true, lockedBy: 'record' };
        }
        if (record && columnName && this._isCellLocked(record, columnName, colDef)) {
            return { isLocked: true, lockedBy: 'cell' };
        }
        return { isLocked: false };
    }

    public registerLock(hook: GridLockHook, priority?: number): () => void {
        return this._hooks.register(hook, priority);
    }

    //a column set as locked is final, no hook can open it
    private _isColumnLocked(columnName: string, colDef: ColDef<IRecord> | undefined): boolean {
        return getColumnContext(colDef).isLocked === true || this._applyHooks(false, { columnName });
    }

    private _isRecordLocked(record: IRecord): boolean {
        const result: IGridLock = { isLocked: !record.isActive() };
        this._hooks.apply(result, { record });
        this._services.get('settings').getRowSettings().onGetLock?.(result, { record });
        return result.isLocked;
    }

    private _isCellLocked(record: IRecord, columnName: string, colDef: ColDef<IRecord> | undefined): boolean {
        const result: IGridLock = { isLocked: false };
        this._hooks.apply(result, { record, columnName });
        getColumnContext(colDef).cell?.onGetLock?.(result, { record });
        return result.isLocked;
    }

    private _applyHooks(isLocked: boolean, context: IGridLockContext): boolean {
        const result: IGridLock = { isLocked };
        this._hooks.apply(result, context);
        return result.isLocked;
    }

    private _getColDef(columnName: string): ColDef<IRecord> | undefined {
        return this._services.find('gridApi')?.getColumn(columnName)?.getColDef();
    }
}
