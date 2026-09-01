import { DatasetConstants, IColumn, IEventEmitter, EventEmitter, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { ErrorHelper } from "@utils";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";


/** Strategy interface for managing user-defined (dynamic) column definitions. */
export interface ICustomColumnsStrategy {
    /** @returns The created column name, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onCreateColumn: () => Promise<string | null>;
    /** @returns The deleted column name, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onDeleteColumn: (columnName: string) => Promise<string | null>;
    /** @returns The updated column name, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onUpdateColumn: (columnName: string) => Promise<string | null>;
    /** Fetches/reloads all custom column definitions and returns the resolved `IColumn[]`. */
    onRefresh: () => Promise<IColumn[]>;
    /** Returns the currently loaded custom columns synchronously without a network fetch. */
    onGetColumns: () => IColumn[];

    /** Persists a cell value for a custom column on the given record. */
    onSaveValue: (regardingRecordId: string, column: IColumn, value: any) => Promise<IRecordSaveOperationResult>;
}

/** Manages the lifecycle of dynamic (user-defined) columns and wraps the strategy with error handling. */
export interface ICustomColumnsDataProvider {
    /** EventEmitter for error events raised by column operations. */
    events: IEventEmitter<ICustomColumnsDataProviderEvents>;
    /** @returns The created column name, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    createColumn: () => Promise<string | null>;
    /** @returns The deleted column name, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    deleteColumn: (columnName: string) => Promise<string | null>;
    /** @returns The updated column name, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    updateColumn: (columnName: string) => Promise<string | null>;
    /** Refreshes the list of custom columns from the underlying strategy. */
    refresh: () => Promise<IColumn[]>;
    /** Returns the currently cached list of custom columns. */
    getColumns: () => IColumn[];

    /** Persists a cell value for a custom column on the given record. */
    saveValue: (regardingRecordId: string, column: IColumn, value: any) => Promise<IRecordSaveOperationResult>;
    /** Returns the underlying strategy cast to the given type for strategy-specific operations. */
    getStrategy<T extends ICustomColumnsStrategy>(): T;
    /** Returns `true` when the given column name is a custom (dynamic) column. */
    isCustomColumn: (columnName: string) => boolean;
    /** Disposes event listeners and releases all resources held by the provider. */
    destroy: () => void;
}

/** Errors raised by custom-column operations. */
export interface ICustomColumnsDataProviderEvents {
    onError: (error: any, message: string) => void;
}

/** Wraps an {@link ICustomColumnsStrategy} with the grid's error handling and event dispatch. */
export interface ICustomColumnsDataProviderParameters {
    /** Where column definitions and values are stored. */
    strategy: ICustomColumnsStrategy;
    /** Where the task side and the other modules are reached. Resolve in methods, never in a constructor. */
    services: ITaskGridServiceLocator;
}

export class CustomColumnsDataProvider implements ICustomColumnsDataProvider {
    private _strategy: ICustomColumnsStrategy;
    private _services: ITaskGridServiceLocator;
    public events: IEventEmitter<ICustomColumnsDataProviderEvents> = new EventEmitter();

    constructor(parameters: ICustomColumnsDataProviderParameters) {
        this._strategy = parameters.strategy;
        this._services = parameters.services;
    }
    public getStrategy<T extends ICustomColumnsStrategy>(): T {
        return this._strategy as T;
    }
    public async createColumn(): Promise<string | null> {
        return ErrorHelper.executeWithErrorHandling({
            operation: () => this._strategy.onCreateColumn(),
            onError: (error, message) => this.events.dispatchEvent('onError', error, message)
        })
    }
    public async deleteColumn(columnName: string): Promise<string | null> {
        return ErrorHelper.executeWithErrorHandling({
            operation: () => this._strategy.onDeleteColumn(columnName),
            onError: (error, message) => this.events.dispatchEvent('onError', error, message)
        })
    }
    public async updateColumn(columnName: string): Promise<string | null> {
        return ErrorHelper.executeWithErrorHandling({
            operation: () => this._strategy.onUpdateColumn(columnName),
            onError: (error, message) => this.events.dispatchEvent('onError', error, message)
        })
    }

    public saveValue(regardingRecordId: string, column: IColumn, value: any): Promise<IRecordSaveOperationResult> {
        return this._strategy.onSaveValue(regardingRecordId, column, value);
    }
    
    public destroy(): void {
        this.events.clearEventListeners();
    }
    public getColumns(): IColumn[] {
        return this._strategy.onGetColumns();
    }
    public async refresh(): Promise<IColumn[]> {
        return await this._strategy.onRefresh();
    }
    public isCustomColumn(columnName: string): boolean {
        return columnName.endsWith(DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX);
    }
}