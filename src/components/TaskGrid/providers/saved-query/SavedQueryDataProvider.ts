import { DataTypes, EventEmitter, IColumn, IEventEmitter, IFetchXmlDataProviderColumn } from "@talxis/client-libraries";
import { ITaskDataProvider } from "../task";
import { ICustomColumnsDataProvider } from "../custom-columns/CustomColumnsDataProvider";
import { INativeColumns } from "@components/TaskGrid/interfaces";
import { ErrorHelper, ILocalizationService } from "@utils";
import { ITaskGridLabels } from "@components/TaskGrid/labels";


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

export type IDeletedUserQueriesResult = { success: true; deletedQueryIds: string[] } | { success: false; deletedQueryIds: string[]; errors: { queryId: string; error: any }[] };


export interface ISavedQuery extends ISavedQueryMetadata {
    id: string;
    name: string;
    description?: string;
}

export interface ISavedQueryMetadata {
    columns: IColumn[]
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression;
    linking?: ComponentFramework.PropertyHelper.DataSetApi.LinkEntityExposedExpression[];
    isFlatListEnabled?: boolean;
    searchQuery?: string | undefined;
    quickFindColumns?: string[];
}

export const PATH_COLUMN_NAME = 'path__virtual';
const REQUIRED_COLUMNS = ['subject', 'parentId', 'stackRank', 'stateCode'];

/**
 * The personal-views half of {@link ISavedQueryStrategy}. Supplying one is what enables the
 * user-queries feature — there is no separate flag.
 */
export interface IUserQueryStrategy {
    /** Returns views saved by the current user. */
    onGetUserQueries: () => Promise<ISavedQuery[]>;
    /** Whether the given query id is one of the user's own views, as opposed to a system view. */
    onIsUserQuery: (queryId: string) => boolean;
    /** Deletes the specified user views. Returns a per-query success/failure result. */
    onDeleteUserQueries: (queryIds: string[]) => Promise<IDeletedUserQueriesResult>;
    /** @returns The updated query id, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onUpdateUserQuery: (currentQuery: ISavedQuery) => Promise<string | null>;
    /** @returns The created query id, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onCreateUserQuery: (newQuery: { name: string; description?: string }, currentQuery: ISavedQuery) => Promise<string | null>;
}

/** Strategy interface for loading the system (non-deletable) saved views. */
export interface ISavedQueryStrategy {
    /** Returns the built-in (non-deletable) views. At least one system query must be returned. */
    onGetSystemQueries: () => Promise<ISavedQuery[]>;
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
    /** Captures the grid's current columns, filters and sorting into the active user view and persists it. */
    updateCurrentUserQueryFromGridState: (provider: ITaskDataProvider) => Promise<string | null>;
    /** Deletes the specified user views. Returns a per-query success/failure result. */
    deleteUserQueries: (queryIds: string[]) => Promise<IDeletedUserQueriesResult>;
    /** The personal-views implementation behind the saved-query strategy, if there is one. */
    readonly userQuery: IUserQueryStrategy | undefined;
    /** Returns `true` when the saved-query strategy supplied an {@link IUserQueryStrategy}. */
    isUserQueriesEnabled: () => boolean;
    /** @returns The updated query id, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    updateUserQuery: (query: ISavedQuery) => Promise<string | null>;
    /** Fetches system and user queries from the strategy and sets the initial active query. */
    refresh: () => Promise<void>;

    /** Disposes event listeners and releases all resources held by the provider. */
    destroy: () => void;
}

interface ISavedQueryDataProviderParameters {
    /**
     * The personal-views implementation, from the descriptor's `onCreateUserQueryStrategy`. Absent
     * means the user-queries feature is off: no *My views*, no save commands and no view manager.
     */
    userQueryStrategy?: IUserQueryStrategy;
    nativeColumns: INativeColumns;
    localizationService: ILocalizationService<ITaskGridLabels>;
    customColumnsDataProvider?: ICustomColumnsDataProvider;
    preferredQuery?: Partial<ISavedQuery> & { id: string };
}

export class SavedQueryDataProvider implements ISavedQueryDataProvider {
    private _strategy: ISavedQueryStrategy
    private _userQuery?: IUserQueryStrategy;
    private _systemQueries: ISavedQuery[] = [];
    private _currentQuery?: ISavedQuery;
    private _userQueries: ISavedQuery[] = [];
    private _customColumnsDataProvider?: ICustomColumnsDataProvider;
    private _nativeColumns: INativeColumns;
    private _localizationService: ILocalizationService<ITaskGridLabels>;
    private _systemQueriesColumnsMap: Map<string, IColumn> = new Map();
    private _preferredQuery?: Partial<ISavedQuery> & { id: string };
    public queryEvents = new EventEmitter<ISavedQueryDataProviderEvents>();

    constructor(strategy: ISavedQueryStrategy, parameters: ISavedQueryDataProviderParameters) {
        this._strategy = strategy;
        this._userQuery = parameters.userQueryStrategy;
        this._preferredQuery = parameters.preferredQuery;
        this._nativeColumns = parameters.nativeColumns;
        this._customColumnsDataProvider = parameters.customColumnsDataProvider;
        this._localizationService = parameters.localizationService;
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

    public get userQuery(): IUserQueryStrategy | undefined {
        return this._userQuery;
    }

    public isUserQueriesEnabled(): boolean {
        return !!this.userQuery;
    }

    public isUserQuery(queryId: string): boolean {
        return this.userQuery?.onIsUserQuery(queryId) ?? false;
    }

    public getSavedQuery(id: string): ISavedQuery {
        const query = [...this._systemQueries, ...this._userQueries].find(q => q.id === id);
        if (!query) {
            throw new Error(`Query with id ${id} not found. Make sure to call refresh() and wait for it to complete before accessing the saved query.`);
        }
        return query;
    }

    public async updateUserQuery(query: ISavedQuery): Promise<string | null> {
        this.queryEvents.dispatchEvent('onBeforeUserQueryUpdated', query.id);
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const result = await this._requireUserQuery().onUpdateUserQuery(query);
                this.queryEvents.dispatchEvent('onAfterUserQueryUpdated', result);
                return result;
            },
            onError: (error, message) => this.queryEvents.dispatchEvent('onError', error, message)
        })
    }

    public async updateCurrentUserQueryFromGridState(provider: ITaskDataProvider): Promise<string | null> {
        return this.updateUserQuery({
            ...this.getCurrentQuery(),
            ...this._getMetadataForSavedQuery(provider)
        });
    }

    public async createUserQuery(params: ICreateUserQueryParams): Promise<string | null> {
        const { name, description, provider } = params;
        this.queryEvents.dispatchEvent('onBeforeUserQueryCreated', name);
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const result = await this._requireUserQuery().onCreateUserQuery({
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
                const result = await this._requireUserQuery().onDeleteUserQueries(queryIds);
                //drop them here too, so getUserQueries() does not keep serving deleted views until a refresh
                this._userQueries = this._userQueries.filter(query => !result.deletedQueryIds.includes(query.id));
                this.queryEvents.dispatchEvent('onAfterUserQueriesDeleted', result);
                return result;
            },
            onError: (error, message) => this.queryEvents.dispatchEvent('onError', error, message)
        })
    }

    public async destroy() {
        this.queryEvents.clearEventListeners();
    }

    //called from inside the ErrorHelper operations, so an exotic strategy surfaces the grid's own
    //error dialog instead of an unhandled rejection
    private _requireUserQuery(): IUserQueryStrategy {
        const userQueryStrategy = this.userQuery;
        if (!userQueryStrategy) {
            throw new Error('The user queries feature is off: the saved query strategy has no user query strategy behind it.');
        }
        return userQueryStrategy;
    }

    public async refresh() {
        const systemQueries = await this._strategy.onGetSystemQueries();
        const userQueries = await this.userQuery?.onGetUserQueries() ?? [];
        if (systemQueries.length === 0) {
            throw new Error('At least one system query is required');
        }
        this._includePathColumn(systemQueries[0].columns);
        const allQueries = [...systemQueries, ...userQueries];
        this._systemQueries = systemQueries
        this._userQueries = userQueries;

        const systemQueryColumnEntries = systemQueries.flatMap(
            query => query.columns.map(col => [col.name, col] as [string, IColumn])
        );
        const customColumnEntries = this._customColumnsDataProvider
            ? this._customColumnsDataProvider.getColumns().map(col => [col.name, col] as [string, IColumn])
            : [];

        this._systemQueriesColumnsMap = new Map<string, IColumn>([
            ...systemQueryColumnEntries,
            ...customColumnEntries
        ]);

        const preferredQueryInAllQueries = allQueries.find(q => q.id === this._preferredQuery?.id);
        this._currentQuery = preferredQueryInAllQueries ?? userQueries[0] ?? systemQueries[0];
        //preferred query might have some required columns missing
        this._currentQuery = this._processQueries([{
            ...this._currentQuery,
            ...(preferredQueryInAllQueries ? this._preferredQuery : {}),
        }])[0];
    }

    private _processQueries(queries: ISavedQuery[]) {
        return queries.map(query => {
            this._includeRequiredColumns(query.columns);
            this._harmonizeColumns(query.columns);
            return {
                ...query,
                ...this._parseSavedQueryMetadata(query)
            }
        })
    }

    private _includeRequiredColumns(columns: IColumn[]) {
        const allQueries = [...this.getSystemQueries(), ...this.getUserQueries()];
        const allQueryColumns = [...new Map(allQueries.flatMap(query => query.columns.map(col => [col.name, col]))).values()];
        for (const requiredColumnName of REQUIRED_COLUMNS) {
            const mappedRequiredColumnName = this._nativeColumns[requiredColumnName as keyof INativeColumns];
            if (!columns.find(col => col.name === mappedRequiredColumnName)) {
                const columnFromQueries = allQueryColumns.find(col => col.name === mappedRequiredColumnName);
                if (!columnFromQueries) {
                    throw new Error(`Required column ${mappedRequiredColumnName} is missing from both current query and all available queries`);
                }
                columns.push({
                    ...columnFromQueries,
                    isHidden: true
                });
            }
        }
        this._includePathColumn(columns);
    }

    private _harmonizeColumns(columns: IColumn[]) {
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

    private _includePathColumn(columns: IColumn[]) {
        if (!columns.find(col => col.name === PATH_COLUMN_NAME)) {
            columns.push({
                name: PATH_COLUMN_NAME,
                dataType: DataTypes.Multiple,
                displayName: this._localizationService.getLocalizedString('path'),
                isVirtual: true,
                visualSizeFactor: 300,
                isHidden: true
            })
        }
        return columns;
    }

    private _getMetadataForSavedQuery(provider: ITaskDataProvider): ISavedQueryMetadata {
        return {
            sorting: provider.getSorting(),
            filtering: provider.getFiltering() ?? undefined,
            linking: provider.getLinking(),
            searchQuery: provider.getSearchQuery(),
            isFlatListEnabled: provider.isFlatListEnabled(),
            quickFindColumns: provider.getQuickFindColumns().map(col => col.name),
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


    private _parseSavedQueryMetadata(metadata: ISavedQueryMetadata): ISavedQueryMetadata {
        const parsed = metadata;

        // Enrich partial column definitions with full definitions from system queries
        let columns = parsed.columns.map(col => {
            const systemCol = this._systemQueriesColumnsMap.get(col.name);
            return systemCol ? { ...systemCol, ...col, metadata: { ...systemCol.metadata, ...col.metadata } } : col;
        });

        return { ...parsed, columns };
    }
}