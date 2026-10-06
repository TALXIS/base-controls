import { ColDef, GridApi } from "@ag-grid-community/core";
import { IDataProvider, IFieldValidationResult, IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import { IGridServiceLocator } from "../../services";

/** A hook over whether a record's value in a column is valid. */
export type GridValidationHook = (result: IFieldValidationResult, params: { record: IRecord; columnName: string }) => void;

export interface IGridValidationParameters {
    services: IGridServiceLocator;
}

/** What the grid says about the values its records hold, registered into each record it loads. */
export interface IGridValidation {
    /** Whether the record's value in the column is valid, after the hooks and the column's `onGetValidation`. */
    get(params: { record: IRecord; columnName: string }): IFieldValidationResult;
    /**
     * Registers a hook over every column of every record.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerValidation(hook: GridValidationHook, priority?: number): () => void;
}

export class GridValidation implements IGridValidation {
    private _services: IGridServiceLocator;
    private _hooks = new HookRegistry<GridValidationHook>();
    private _validatedColumnNames = new Set<string>();
    //once set, every column stays registered: an expression cannot be taken off a record
    private _hasHooks = false;
    private _isDestroyed = false;

    constructor(parameters: IGridValidationParameters) {
        this._services = parameters.services;
        this._services.whenAvailable('gridApi', gridApi => this._onGridApiAvailable(gridApi));
        this._services.get('grid').events.addEventListener('onDestroyed', this._onDestroyed);
    }

    public get(params: { record: IRecord; columnName: string }): IFieldValidationResult {
        const result: IFieldValidationResult = { error: false, errorMessage: '' };
        //the record keeps the expression after the grid is gone
        if (this._isDestroyed) {
            return result;
        }
        this._hooks.apply(result, params);
        this._getColDef(params.columnName)?.settings?.cell?.onGetValidation?.(result, { record: params.record });
        return result;
    }

    public registerValidation(hook: GridValidationHook, priority?: number): () => void {
        const unregister = this._hooks.register(hook, priority);
        this._hasHooks = true;
        this._syncValidatedColumns();
        return unregister;
    }

    private _onGridApiAvailable(gridApi: GridApi<IRecord>): void {
        this._syncValidatedColumns();
        gridApi.addEventListener('newColumnsLoaded', () => this._syncValidatedColumns());
        this._provider.addEventListener('onRecordLoaded', this._onRecordLoaded);
    }

    //the provider outlives the grid
    private _onDestroyed = (): void => {
        this._isDestroyed = true;
        this._provider.removeEventListener('onRecordLoaded', this._onRecordLoaded);
    };

    //a reload clears a record's fields, and the expressions set on them
    private _onRecordLoaded = (record: IRecord): void => {
        this._validatedColumnNames.forEach(columnName => this._register(record, columnName));
    };

    //only these columns: an expression set elsewhere on any other column is left alone
    private _syncValidatedColumns(): void {
        const columnNames = this._getValidatedColumnNames();
        const added = columnNames.filter(columnName => !this._validatedColumnNames.has(columnName));
        added.forEach(columnName => this._validatedColumnNames.add(columnName));
        for (const record of this._provider.getRecords()) {
            added.forEach(columnName => this._register(record, columnName));
        }
    }

    private _getValidatedColumnNames(): string[] {
        if (!this._hasHooks) {
            const colDefs = (this._services.find('gridApi')?.getColumnDefs() ?? []) as ColDef<IRecord>[];
            return colDefs.filter(colDef => colDef.colId && colDef.settings?.cell?.onGetValidation).map(colDef => colDef.colId!);
        }
        return this._provider.getColumns().map(column => column.name);
    }

    private _register(record: IRecord, columnName: string): void {
        record.expressions.setValidationExpression(columnName, () => this.get({ record, columnName }));
    }

    private _getColDef(columnName: string): ColDef<IRecord> | undefined {
        return this._services.find('gridApi')?.getColumn(columnName)?.getColDef();
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
