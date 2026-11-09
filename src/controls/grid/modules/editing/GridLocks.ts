import { ColDef } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { HookRegistry, IHookPoint } from "@core";
import { IGridServiceRegistry } from "../../runtime";
import { getColumnContext } from "../../runtime/columns/colDef";

declare module "../../runtime/columns/colDef" {
    interface IGridColumnContext {
        /** Whether what the cells hold is locked for good. */
        isLocked?: boolean;
    }
    interface IGridColumnCellContext {
        /** Whether the control takes input where the cell stands, with no editor to open. */
        enableOneClickEdit?: boolean;
    }
}

/** The level that locks something. */
export type IGridLockLevel = 'column' | 'record' | 'cell';

/** What is asked about: a column, a record's row, or both for a cell. */
export interface IGridLockHookParameters {
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
export type GridLockHook = (result: IGridLock, parameters: IGridLockHookParameters) => void;

export interface IGridLocksParameters {
    services: IGridServiceRegistry;
}

export interface IGridLocksHooks {
    /** Any level; it is handed the context it is asked about. */
    readonly lock: IHookPoint<GridLockHook>;
}

/** Whether a column, a record's row or a cell is locked. */
export interface IGridLocks {
    /** Whether what the context names is locked, and at which level. */
    get(parameters?: IGridLockHookParameters): IGridLockResult;
    readonly hooks: IGridLocksHooks;
}

export class GridLocks implements IGridLocks {
    private _services: IGridServiceRegistry;
    public readonly hooks = {
        lock: new HookRegistry<GridLockHook>(),
    };

    constructor(parameters: IGridLocksParameters) {
        this._services = parameters.services;
    }

    public get(parameters: IGridLockHookParameters = {}): IGridLockResult {
        const { record, columnName } = parameters;
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

    //a column set as locked is final, no hook can open it
    private _isColumnLocked(columnName: string, colDef: ColDef<IRecord> | undefined): boolean {
        return getColumnContext(colDef).isLocked === true || this._applyHooks(false, { columnName });
    }

    private _isRecordLocked(record: IRecord): boolean {
        const result: IGridLock = { isLocked: !record.isActive() };
        this.hooks.lock.apply(result, { record });
        return result.isLocked;
    }

    private _isCellLocked(record: IRecord, columnName: string, colDef: ColDef<IRecord> | undefined): boolean {
        const result: IGridLock = { isLocked: false };
        this.hooks.lock.apply(result, { record, columnName });
        return result.isLocked;
    }

    private _applyHooks(isLocked: boolean, parameters: IGridLockHookParameters): boolean {
        const result: IGridLock = { isLocked };
        this.hooks.lock.apply(result, parameters);
        return result.isLocked;
    }

    private _getColDef(columnName: string): ColDef<IRecord> | undefined {
        return this._services.find('gridApi')?.getColumn(columnName)?.getColDef();
    }
}
