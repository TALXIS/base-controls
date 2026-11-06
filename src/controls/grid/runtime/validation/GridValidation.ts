import { ColDef, GridApi } from "ag-grid-community";
import { IDataProvider, IFieldValidationResult, IRecord } from "@talxis/client-libraries";
import { HookRegistry, IHookPoint } from "@core";
import { IGridServiceRegistryInternal } from "..";
import { getColumnContext } from "../columns/colDef";
import { listenToGridApi } from "../grid/listenToGridApi";

/** A hook over whether a record's value in a column is valid. */
export type GridValidationHook = (result: IFieldValidationResult, parameters: { record: IRecord; columnName: string }) => void;

export interface IGridValidationParameters {
    services: IGridServiceRegistryInternal;
}

export interface IGridValidationHooks {
    /** Every column of every record. */
    readonly validation: IHookPoint<GridValidationHook>;
}

/** What the grid says about the values its records hold, registered into each record it loads. */
export interface IGridValidation {
    readonly hooks: IGridValidationHooks;
}

/** What the grid's own parts read of it. */
export interface IGridValidationInternal extends IGridValidation {
    /** Whether the record's value in the column is valid, after the hooks and the column's `validationHook`. */
    get(parameters: { record: IRecord; columnName: string }): IFieldValidationResult;
}

export class GridValidation implements IGridValidationInternal {
    private _services: IGridServiceRegistryInternal;
    public readonly hooks = {
        validation: new HookRegistry<GridValidationHook>({ onChange: () => this._onHooksChanged() }),
    };
    private _validatedColumnNames = new Set<string>();
    //once set, every column stays registered: an expression cannot be taken off a record
    private _hasHooks = false;
    private _isDestroyed = false;

    constructor(parameters: IGridValidationParameters) {
        this._services = parameters.services;
        this._services.observe('gridApi', gridApi => this._onGridApiAvailable(gridApi));
    }

    public get(parameters: { record: IRecord; columnName: string }): IFieldValidationResult {
        const result: IFieldValidationResult = { error: false, errorMessage: '' };
        //the record keeps the expression after the grid is gone
        if (this._isDestroyed) {
            return result;
        }
        this.hooks.validation.apply(result, parameters);
        getColumnContext(this._getColDef(parameters.columnName)).cell?.validationHook?.(result, { record: parameters.record });
        return result;
    }

    private _onHooksChanged(): void {
        this._hasHooks = true;
        this._syncValidatedColumns();
    }

    private _onGridApiAvailable(gridApi: GridApi<IRecord>): () => void {
        this._syncValidatedColumns();
        const stopGridApi = listenToGridApi(gridApi, { newColumnsLoaded: this._onNewColumnsLoaded });
        const stopProvider = this._provider.addEventListener('onRecordLoaded', this._onRecordLoaded);
        return () => {
            stopGridApi();
            stopProvider();
        };
    }

    private _onNewColumnsLoaded = (): void => {
        this._syncValidatedColumns();
    };

    /** Leaves the records' validators in place but has them answer valid from now on. */
    public destroy(): void {
        this._isDestroyed = true;
    }

    //a reload clears a record's fields, and the expressions set on them
    private _onRecordLoaded = (record: IRecord): void => {
        this._validatedColumnNames.forEach(columnName => this._setValidation(record, columnName));
    };

    //only these columns: an expression set elsewhere on any other column is left alone
    private _syncValidatedColumns(): void {
        const columnNames = this._getValidatedColumnNames();
        const added = columnNames.filter(columnName => !this._validatedColumnNames.has(columnName));
        added.forEach(columnName => this._validatedColumnNames.add(columnName));
        for (const record of this._provider.getRecords()) {
            added.forEach(columnName => this._setValidation(record, columnName));
        }
    }

    private _getValidatedColumnNames(): string[] {
        if (!this._hasHooks) {
            const colDefs = (this._services.find('gridApi')?.getColumnDefs() ?? []) as ColDef<IRecord>[];
            return colDefs.filter(colDef => colDef.colId && getColumnContext(colDef).cell?.validationHook).map(colDef => colDef.colId!);
        }
        return this._provider.getColumns().map(column => column.name);
    }

    private _setValidation(record: IRecord, columnName: string): void {
        record.expressions.setValidationExpression(columnName, () => this.get({ record, columnName }));
    }

    private _getColDef(columnName: string): ColDef<IRecord> | undefined {
        return this._services.find('gridApi')?.getColumn(columnName)?.getColDef();
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
