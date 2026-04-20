import { EventEmitter, IColumn, IEventEmitter, IFetchXmlDataProviderColumn } from "@talxis/client-libraries";
import { ITaskDataProvider } from "../task-data-provider";
import { ICustomColumnsDataProvider } from "../custom-columns-data-provider/CustomColumnsDataProvider";
import { INativeColumns } from "../../interfaces";
import { ErrorHelper } from "../../../../utils";


export interface ICreateUserQueryParams {
    name: string;
    provider: ITaskDataProvider;
    description?: string;
}

export interface IUpdateUserQueryParams {
    queryId: string;
    queryMetadata: ISavedQueryMetadata;
}

export interface ISavedQueryDataProviderEvents {
    onBeforeUserQueriesDeleted: (queryIds: string[]) => void;
    onAfterUserQueriesDeleted: (result: IDeletedUserQueriesResult) => void;
    onBeforeUserQueryUpdated: (queryId: string) => void;
    onAfterUserQueryUpdated: (result: string | null) => void;
    onBeforeUserQueryCreated: (queryName: string) => void;
    onAfterUserQueryCreated: (result: string | null) => void;
    onError: (error: any, message: string) => void;
}

export type IDeletedUserQueriesResult = {success: true; deletedQueryIds: string[]} | {success: false; deletedQueryIds: string[]; errors: {queryId: string; error: any}[]};


export interface ISavedQuery extends ISavedQueryMetadata {
    id: string;
    name: string;
}

export interface ISavedQueryMetadata {
    columns: IColumn[]
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression;
    linking?: ComponentFramework.PropertyHelper.DataSetApi.LinkEntityExposedExpression[];
    isFlatListEnabled?: boolean;
    searchQuery?: string | undefined;
}

const REQUIRED_COLUMNS = ['subject', 'parentId', 'stackRank', 'path', 'stateCode'];

/** Strategy interface for loading and persisting system and user-defined saved views (queries). */
export interface ISavedQueryStrategy {
    /** Returns the built-in (non-deletable) views. At least one system query must be returned. */
    onGetSystemQueries: () => Promise<ISavedQuery[]>;
    /** Returns views saved by the current user. */
    onGetUserQueries: () => Promise<ISavedQuery[]>;
    /** Deletes the specified user views. Returns a per-query success/failure result. */
    onDeleteUserQueries: (queryIds: string[]) => Promise<IDeletedUserQueriesResult>;
    /** @returns The updated query id, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onUpdateUserQuery: (currentQuery: ISavedQuery) => Promise<string | null>;
    /** @returns The created query id, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onCreateUserQuery: (newQuery: { name: string; description?: string }, currentQuery: ISavedQuery) => Promise<string | null>;
}

/** Manages system and user-defined saved views and exposes view lifecycle operations. */
export interface ISavedQueryDataProvider {
    /** EventEmitter for saved-query lifecycle events (create, update, delete, errors). */
    queryEvents: IEventEmitter<ISavedQueryDataProviderEvents>;
    /** Returns the full list of non-deletable system views. */
    getSystemQueries: () => ISavedQuery[];
    /** Returns the full list of user-created views. */
    getUserQueries: () => ISavedQuery[];
    /** Returns the currently active saved query. Throws if `refresh` has not been called yet. */
    getCurrentQuery: () => ISavedQuery;
    /** Looks up a query by id across system and user queries. Throws if not found. */
    getSavedQuery(id: string): ISavedQuery;
    /** @returns The created query id, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    createUserQuery: (params: ICreateUserQueryParams) => Promise<string | null>;
    /** Returns `true` when the given query id belongs to a user view (as opposed to a system view). */
    isUserQuery: (queryId: string) => boolean;
    /** @returns The updated query id, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    updateUserQuery: (provider: ITaskDataProvider) => Promise<string | null>;
    /** Deletes the specified user views. Returns a per-query success/failure result. */
    deleteUserQueries: (queryIds: string[]) => Promise<IDeletedUserQueriesResult>;
    /** Fetches system and user queries from the strategy and sets the initial active query. */
    refresh: () => Promise<void>;
    /** Ensures all required native columns (subject, parentId, stackRank, path, stateCode) are present in the provided columns array. */
    includeRequiredColumns: (columns: IColumn[]) => void;
    /** Enforces column constraints: subject is never hidden; path column is always read-only. */
    harmonizeColumns: (columns: IColumn[]) => void;
    destroy: () => void;
}

interface ISavedQueryDataProviderParameters {
    nativeColumns: INativeColumns;
    customColumnsDataProvider?: ICustomColumnsDataProvider;
    preferredQuery?: Partial<ISavedQuery> & { id: string };
}

export class SavedQueryDataProvider implements ISavedQueryDataProvider {
    private _strategy: ISavedQueryStrategy
    private _systemQueries: ISavedQuery[] = [];
    private _currentQuery?: ISavedQuery;
    private _userQueries: ISavedQuery[] = [];
    private _customColumnsDataProvider?: ICustomColumnsDataProvider;
    private _nativeColumns: INativeColumns;
    private _preferredQuery?: Partial<ISavedQuery> & { id: string };
    public queryEvents = new EventEmitter<ISavedQueryDataProviderEvents>();

    constructor(strategy: ISavedQueryStrategy, parameters: ISavedQueryDataProviderParameters) {
        this._strategy = strategy;
        this._preferredQuery = parameters.preferredQuery;
        this._nativeColumns = parameters.nativeColumns;
        this._customColumnsDataProvider = parameters.customColumnsDataProvider;
    }

    public getSystemQueries(): ISavedQuery[] {
        return this._systemQueries;
    }

    public getUserQueries(): ISavedQuery[] {
        return this._userQueries;
    }

    public getCurrentQuery(): ISavedQuery {
        if (!this._currentQuery) {
            throw new Error('Current query is not set. Make sure to call refresh() and wait for it to complete before accessing the current query.');
        }
        return this._currentQuery;
    }

    public isUserQuery(queryId: string): boolean {
        return this._userQueries.some(q => q.id === queryId);
    }

    public getSavedQuery(id: string): ISavedQuery {
        const query = [...this._systemQueries, ...this._userQueries].find(q => q.id === id);
        if (!query) {
            throw new Error(`Query with id ${id} not found. Make sure to call refresh() and wait for it to complete before accessing the saved query.`);
        }
        return {
            ...query,
            ...this._parseSavedQueryMetadata(query)
        }
    }

    public async updateUserQuery(provider: ITaskDataProvider): Promise<string | null> {
        this.queryEvents.dispatchEvent('onBeforeUserQueryUpdated', this.getCurrentQuery().id);
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const result = await this._strategy.onUpdateUserQuery({
                    ...this.getCurrentQuery(),
                    ...this._getMetadataForSavedQuery(provider)

                });
                this.queryEvents.dispatchEvent('onAfterUserQueryUpdated', result);
                return result;
            },
            onError: (error, message) => this.queryEvents.dispatchEvent('onError', error, message)
        })
    }

    public async createUserQuery(params: ICreateUserQueryParams): Promise<string | null> {
        const { name, description, provider } = params;
        this.queryEvents.dispatchEvent('onBeforeUserQueryCreated', name);
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const result = await this._strategy.onCreateUserQuery({
                    name: name,
                    description: description,
                }, {
                    ...this.getCurrentQuery(),
                    ...this._getMetadataForSavedQuery(provider)
                })
                this.queryEvents.dispatchEvent('onAfterUserQueryCreated', result);
                return result;
            },
            onError: (error, message) => this.queryEvents.dispatchEvent('onError', error, message)
        })
    }

    public async deleteUserQueries(queryIds: string[]): Promise<IDeletedUserQueriesResult> {
        this.queryEvents.dispatchEvent('onBeforeUserQueriesDeleted', queryIds);
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const result = await this._strategy.onDeleteUserQueries(queryIds);
                this.queryEvents.dispatchEvent('onAfterUserQueriesDeleted', result);
                return result;
            },
            onError: (error, message) => this.queryEvents.dispatchEvent('onError', error, message)
        })
    }

    public async destroy() {
        this.queryEvents.clearEventListeners();
    }

    public async refresh() {
        const systemQueries = await this._strategy.onGetSystemQueries();
        const userQueries = await this._strategy.onGetUserQueries();
        const allQueries = [...systemQueries, ...userQueries];
        this._systemQueries = systemQueries;
        this._userQueries = userQueries;
        if (this._systemQueries.length === 0) {
            throw new Error('At least one system query is required');
        }
        this._currentQuery = allQueries.find(q => q.id === this._preferredQuery?.id) ?? userQueries[0] ?? systemQueries[0];
        this._currentQuery = {
            ...this._currentQuery,
            //makes sure custom columns from the current query are properly merged with the columns from the custom columns data provider strategy
            ...this._parseSavedQueryMetadata(this._currentQuery)
        }
        this.includeRequiredColumns(this._currentQuery.columns);
        this.harmonizeColumns(this._currentQuery.columns);
    }

    private _getMetadataForSavedQuery(provider: ITaskDataProvider): ISavedQueryMetadata {
        return {
            sorting: provider.getSorting(),
            filtering: provider.getFiltering() ?? undefined,
            linking: provider.getLinking(),
            searchQuery: provider.getSearchQuery(),
            isFlatListEnabled: provider.isFlatListEnabled(),
            columns: [
                ...provider.getColumns().map((col: any) => {
                    const newCol = {
                        name: col.name,
                        isHidden: col.isHidden,
                        dataType: col.dataType,
                        order: col.order,
                        visualSizeFactor: col.visualSizeFactor,
                        metadata: {}
                    }
                    this._addPropToMetadataQueryCol(newCol, 'isVirtual', col.isVirtual);
                    this._addPropToMetadataQueryCol(newCol, 'autoHeight', col.autoHeight);
                    return newCol;
                })
            ]
        }
    }

    private _addPropToMetadataQueryCol(col: IFetchXmlDataProviderColumn, propName: keyof IColumn, propValue: any) {
        if (propValue != undefined) {
            (col as any)[propName] = propValue;
        }
    }

    private _isCustomColumnResolvable(name: string, customColumnsMap: Map<string, IColumn>): boolean {
        return !this._customColumnsDataProvider!.isCustomColumn(name) ||
            !!customColumnsMap.get(name);
    }

    private _parseSavedQueryMetadata(metadata: ISavedQueryMetadata): ISavedQueryMetadata {
        const parsed = metadata;
        if (!this._customColumnsDataProvider) {
            return parsed;
        }
        const customColumnsMap = new Map(this._customColumnsDataProvider.getColumns().map(col => [col.name, col]));
        let columns = parsed.columns.filter(col => this._isCustomColumnResolvable(col.name, customColumnsMap));
        columns = columns.map(col => {
            const customCol = customColumnsMap.get(col.name);
            return customCol ? { ...customCol, ...col, metadata: { ...customCol.metadata, ...col.metadata } } : col;
        })
        return {
            ...parsed,
            sorting: parsed.sorting?.filter(sort => this._isCustomColumnResolvable(sort.name, customColumnsMap)),
            columns: columns,
            filtering: parsed.filtering ? {
                ...parsed.filtering,
                conditions: parsed.filtering.conditions.filter(condition => this._isCustomColumnResolvable(condition.attributeName, customColumnsMap))
            } : undefined
        };
    }

    public includeRequiredColumns(columns: IColumn[]) {
        const allQueries = [...this.getSystemQueries(), ...this.getUserQueries()];
        const allQueryColumns = [...new Map(allQueries.flatMap(query => query.columns.map(col => [col.name, col]))).values()];
        for (const requiredColumnName of REQUIRED_COLUMNS) {
            const mappedRequiredColumnName = this._nativeColumns[requiredColumnName as keyof INativeColumns];
            if (!columns.find(col => col.name === mappedRequiredColumnName)) {
                const columnFromQueries = allQueryColumns.find(col => col.name === mappedRequiredColumnName);
                if (!columnFromQueries) {
                    throw new Error(`Required column ${mappedRequiredColumnName} is missing from both current query and all available queries`);
                }
                columns.push(columnFromQueries);
            }
        }
    }

    public harmonizeColumns(columns: IColumn[]) {
        for (const column of columns) {
            switch (column.name) {
                case this._nativeColumns.subject: {
                    column.isHidden = false;
                    break;
                }
                case this._nativeColumns.path: {
                    column.metadata = {
                        ...column.metadata,
                        IsValidForUpdate: false
                    }
                    break;
                }
            }
        }
    }
}