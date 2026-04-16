import { DatasetConstants, IColumn } from "@talxis/client-libraries";

export type ICreateColumnResult = { success: true; columnName: string } | { success: false; errorMessage: string };
export type ISaveValueResult = { success: true; recordId: string } | { success: false; errorMessage: string };
export type IDeleteColumnResult = { success: true; columnName: string } | { success: false; errorMessage: string };
export type IUpdateColumnResult = { success: true; columnName: string } | { success: false; errorMessage: string };

export interface ICustomColumnsDataProvider {
    createColumn: () => Promise<ICreateColumnResult>;
    deleteColumn: (columnName: string) => Promise<IDeleteColumnResult>;
    updateColumn: (columnName: string) => Promise<IUpdateColumnResult>;
    refresh: () => Promise<IColumn[]>;
    getColumns: () => IColumn[];
    getStrategy<T extends ICustomColumnsStrategy>(): T;
    isCreateEnabled: () => boolean;
    isDeleteEnabled: () => boolean;
    isEditEnabled: () => boolean;
    isCustomColumn: (columnName: string) => boolean;
}

export interface ICustomColumnsStrategy {
    onCreateColumn: () => Promise<ICreateColumnResult>;
    onDeleteColumn: (columnName: string) => Promise<IDeleteColumnResult>;
    onUpdateColumn: (columnName: string) => Promise<IUpdateColumnResult>;
    onRefresh: () => Promise<IColumn[]>;
    onGetColumns: () => IColumn[];

}

export class CustomColumnsDataProvider implements ICustomColumnsDataProvider {
    private _strategy: ICustomColumnsStrategy;

    constructor(strategy: ICustomColumnsStrategy) {
        this._strategy = strategy;
    }
    public async createColumn(): Promise<ICreateColumnResult> {
        return await this._strategy.onCreateColumn();
    }
    public getStrategy<T extends ICustomColumnsStrategy>(): T {
        return this._strategy as T;
    }
    public async deleteColumn(columnName: string): Promise<IDeleteColumnResult> {
        return await this._strategy.onDeleteColumn(columnName);
    }
    public async updateColumn(columnName: string): Promise<IUpdateColumnResult> {
        return await this._strategy.onUpdateColumn(columnName);
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