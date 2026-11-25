import { IRecord } from "@talxis/client-libraries";
import { HookRegistry, IHookPoint } from "@core";
import { IGridServiceRegistry } from "../../runtime";

declare module "../../runtime/columns/colDef" {
    interface IGridColumnContext {
        /** Whether the control takes input where the cell stands, with no editor to open. */
        oneClickEdit?: boolean;
    }
}

/** The level that locks a cell. */
export type IGridLockLevel = 'column' | 'row' | 'cell';

export interface IGridLock {
    isLocked: boolean;
}

export interface IGridColumnLockParameters {
    columnName: string;
}

export interface IGridRowLockParameters {
    record: IRecord;
}

export interface IGridCellLockParameters {
    record: IRecord;
    columnName: string;
}

export type GridColumnLockHook = (result: IGridLock, parameters: IGridColumnLockParameters) => void;
export type GridRowLockHook = (result: IGridLock, parameters: IGridRowLockParameters) => void;
export type GridCellLockHook = (result: IGridLock, parameters: IGridCellLockParameters) => void;

export interface IGridLocksParameters {
    services: IGridServiceRegistry;
}

export interface IGridLocksHooks {
    /** Locks or opens a column; it starts locked when not valid for update. */
    readonly column: IHookPoint<GridColumnLockHook>;
    /** Locks or opens a row; it starts locked when its record is inactive. */
    readonly row: IHookPoint<GridRowLockHook>;
    /** Locks or opens one cell; it starts locked when its column or row is. */
    readonly cell: IHookPoint<GridCellLockHook>;
}

/** Whether a column, a row or a cell is locked. */
export interface IGridLocks {
    readonly hooks: IGridLocksHooks;
    isColumnLocked(columnName: string): boolean;
    isRowLocked(record: IRecord): boolean;
    /** Whether the cell is locked by its column, its row or its own hooks. */
    isCellLocked(record: IRecord, columnName: string): boolean;
    /** The level that locks the cell, or `undefined` when it is open. */
    getCellLockLevel(record: IRecord, columnName: string): IGridLockLevel | undefined;
}

export class GridLocks implements IGridLocks {
    private _services: IGridServiceRegistry;
    private _isLockedByColumn = new Map<string, boolean>();
    public readonly hooks = {
        column: new HookRegistry<GridColumnLockHook>({ onChange: () => this.clearColumnCache() }),
        row: new HookRegistry<GridRowLockHook>(),
        cell: new HookRegistry<GridCellLockHook>(),
    };

    constructor(parameters: IGridLocksParameters) {
        this._services = parameters.services;
    }

    public isColumnLocked(columnName: string): boolean {
        let isLocked = this._isLockedByColumn.get(columnName);
        if (isLocked === undefined) {
            const column = this._services.get('provider').getColumnsMap()[columnName];
            const result: IGridLock = { isLocked: !!column && !column.metadata?.IsValidForUpdate };
            this.hooks.column.apply(result, { columnName });
            isLocked = result.isLocked;
            this._isLockedByColumn.set(columnName, isLocked);
        }
        return isLocked;
    }

    public isRowLocked(record: IRecord): boolean {
        const result: IGridLock = { isLocked: !record.isActive() };
        this.hooks.row.apply(result, { record });
        return result.isLocked;
    }

    public isCellLocked(record: IRecord, columnName: string): boolean {
        return this._getCellLock(record, columnName).isCellLocked;
    }

    public getCellLockLevel(record: IRecord, columnName: string): IGridLockLevel | undefined {
        const { isColumnLocked, isRowLocked, isCellLocked } = this._getCellLock(record, columnName);
        if (!isCellLocked) {
            return undefined;
        }
        if (isColumnLocked) {
            return 'column';
        }
        return isRowLocked ? 'row' : 'cell';
    }

    /** Forgets the columns' cached locks. */
    public clearColumnCache(): void {
        this._isLockedByColumn.clear();
    }

    private _getCellLock(record: IRecord, columnName: string) {
        const isColumnLocked = this.isColumnLocked(columnName);
        const isRowLocked = this.isRowLocked(record);
        const result: IGridLock = { isLocked: isColumnLocked || isRowLocked };
        this.hooks.cell.apply(result, { record, columnName });
        return { isColumnLocked, isRowLocked, isCellLocked: result.isLocked };
    }
}
