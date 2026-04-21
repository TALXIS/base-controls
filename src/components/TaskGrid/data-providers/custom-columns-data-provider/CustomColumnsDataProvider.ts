import { DatasetConstants, IColumn, IEventEmitter, EventEmitter } from "@talxis/client-libraries";
import { ErrorHelper } from "../../../../utils";


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
    /** Returns the underlying strategy cast to the given type for strategy-specific operations. */
    getStrategy<T extends ICustomColumnsStrategy>(): T;
    /** Returns `true` when the given column name is a custom (dynamic) column. */
    isCustomColumn: (columnName: string) => boolean;
    destroy: () => void;
}

export interface ICustomColumnsDataProviderEvents {
    onError: (error: any, message: string) => void;
}

export class CustomColumnsDataProvider implements ICustomColumnsDataProvider {
    private _strategy: ICustomColumnsStrategy;
    public events: IEventEmitter<ICustomColumnsDataProviderEvents> = new EventEmitter();

    constructor(strategy: ICustomColumnsStrategy) {
        this._strategy = strategy;
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