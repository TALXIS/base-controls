import { ColDef } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import { IGridServiceLocator } from "../../services";

/** The level that locks something. */
export type IGridLockLevel = 'grid' | 'column' | 'record' | 'cell';

/** What is asked about: nothing for the grid, a column, a record's row, or both for a cell. */
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

/** Whether the grid, a column, a record's row or a cell is locked. */
export interface IGridLocks {
    /** Whether what the context names is locked, and at which level. */
    get(context?: IGridLockContext): IGridLockResult;
    /**
     * Registers a hook over any level; it is handed the context it is asked about.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerLockHook(hook: GridLockHook, priority?: number): () => void;
}

export class GridLocks implements IGridLocks {
    private _services: IGridServiceLocator;
    private _hooks = new HookRegistry<GridLockHook>();

    constructor(parameters: IGridLocksParameters) {
        this._services = parameters.services;
    }

    public get(context: IGridLockContext = {}): IGridLockResult {
        const { record, columnName } = context;
        if (!this._services.get('settings').isEditingEnabled()) {
            return { isLocked: true, lockedBy: 'grid' };
        }
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

    public registerLockHook(hook: GridLockHook, priority?: number): () => void {
        return this._hooks.register(hook, priority);
    }

    //a column set as locked is final, no hook can open it
    private _isColumnLocked(columnName: string, colDef: ColDef<IRecord> | undefined): boolean {
        return colDef?.settings?.isLocked === true || this._applyHooks(false, { columnName });
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
        colDef?.settings?.cell?.onGetLock?.(result, { record });
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
