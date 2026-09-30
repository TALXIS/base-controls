import { ColDef } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import { IGridServiceLocator } from "../../services";

/** The level that keeps something from being edited. */
export type IGridEditabilityLevel = 'grid' | 'column' | 'record' | 'cell';

/** What is asked about: nothing for the grid, a column, a record's row, or both for a cell. */
export interface IGridEditabilityContext {
    record?: IRecord;
    columnName?: string;
}

export interface IGridEditabilityResult {
    isEditable: boolean;
    /** The level that locked it, where something did. */
    lockedBy?: IGridEditabilityLevel;
}

export interface IGridEditable {
    isEditable: boolean;
}

/** Whether a record is locked as a whole, as `rowSettings.onGetLock` leaves it. */
export interface IGridRecordLock {
    isLocked: boolean;
}

/** A hook over whether something can be edited, handed the context it is asked about. */
export type GridEditableHook = (result: IGridEditable, context: IGridEditabilityContext) => void;

export interface IGridEditabilityParameters {
    services: IGridServiceLocator;
}

/** Whether the grid, a column, a record's row or a cell can be edited. */
export interface IGridEditability {
    /** Whether what the context names can be edited, and which level locked it if not. */
    get(context?: IGridEditabilityContext): IGridEditabilityResult;
    /**
     * Registers a hook over any level; it is handed the context it is asked about.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerEditableHook(hook: GridEditableHook, priority?: number): () => void;
}

export class GridEditability implements IGridEditability {
    private _services: IGridServiceLocator;
    private _hooks = new HookRegistry<GridEditableHook>();

    constructor(parameters: IGridEditabilityParameters) {
        this._services = parameters.services;
    }

    public get(context: IGridEditabilityContext = {}): IGridEditabilityResult {
        const { record, columnName } = context;
        if (!this._services.get('settings').isEditingEnabled()) {
            return { isEditable: false, lockedBy: 'grid' };
        }
        const colDef = columnName ? this._getColDef(columnName) : undefined;
        if (columnName && !this._isColumnEditable(columnName, colDef)) {
            return { isEditable: false, lockedBy: 'column' };
        }
        if (record && !this._isRecordEditable(record)) {
            return { isEditable: false, lockedBy: 'record' };
        }
        if (record && columnName && !this._isCellEditable(record, columnName, colDef)) {
            return { isEditable: false, lockedBy: 'cell' };
        }
        return { isEditable: true };
    }

    public registerEditableHook(hook: GridEditableHook, priority?: number): () => void {
        return this._hooks.register(hook, priority);
    }

    //a column set as uneditable is final, no hook can open it
    private _isColumnEditable(columnName: string, colDef: ColDef<IRecord> | undefined): boolean {
        return colDef?.settings?.isEditable !== false && this._applyHooks(true, { columnName });
    }

    private _isRecordEditable(record: IRecord): boolean {
        const result: IGridEditable = { isEditable: record.isActive() };
        this._hooks.apply(result, { record });
        const lock: IGridRecordLock = { isLocked: !result.isEditable };
        this._services.get('settings').getRowSettings().onGetLock?.(lock, { record });
        return !lock.isLocked;
    }

    private _isCellEditable(record: IRecord, columnName: string, colDef: ColDef<IRecord> | undefined): boolean {
        const result: IGridEditable = { isEditable: true };
        this._hooks.apply(result, { record, columnName });
        colDef?.settings?.cell?.onGetEditable?.(result, { record });
        return result.isEditable;
    }

    private _applyHooks(isEditable: boolean, context: IGridEditabilityContext): boolean {
        const result: IGridEditable = { isEditable };
        this._hooks.apply(result, context);
        return result.isEditable;
    }

    private _getColDef(columnName: string): ColDef<IRecord> | undefined {
        return this._services.find('gridApi')?.getColumn(columnName)?.getColDef();
    }
}
