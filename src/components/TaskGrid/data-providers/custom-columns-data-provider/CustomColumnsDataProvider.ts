import { DatasetConstants, IColumn, IEventEmitter, EventEmitter } from "@talxis/client-libraries";
import { ErrorHelper } from "../../../../utils";


export interface ICustomColumnsDataProvider {
    events: IEventEmitter<ICustomColumnsDataProviderEvents>;
    /** @returns The created column name, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    createColumn: () => Promise<string | null>;
    /** @returns The deleted column name, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    deleteColumn: (columnName: string) => Promise<string | null>;
    /** @returns The updated column name, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    updateColumn: (columnName: string) => Promise<string | null>;
    refresh: () => Promise<IColumn[]>;
    getColumns: () => IColumn[];
    getStrategy<T extends ICustomColumnsStrategy>(): T;
    isCreateEnabled: () => boolean;
    isDeleteEnabled: () => boolean;
    isEditEnabled: () => boolean;
    isCustomColumn: (columnName: string) => boolean;
}

export interface ICustomColumnsStrategy {
    /** @returns The created column name, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onCreateColumn: () => Promise<string | null>;
    /** @returns The deleted column name, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onDeleteColumn: (columnName: string) => Promise<string | null>;
    /** @returns The updated column name, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onUpdateColumn: (columnName: string) => Promise<string | null>;
    onRefresh: () => Promise<IColumn[]>;
    onGetColumns: () => IColumn[];
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
    public getColumns(): IColumn[] {
        return this._strategy.onGetColumns();
    }
    public async refresh(): Promise<IColumn[]> {
        return await this._strategy.onRefresh();
    }
    public isCreateEnabled(): boolean {
        return true;
    }
    public isDeleteEnabled(): boolean {
        return true;
    }
    public isEditEnabled(): boolean {
        return true;
    }
    public isCustomColumn(columnName: string): boolean {
        return columnName.endsWith(DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX);
    }
}