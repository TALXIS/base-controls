import { EventEmitter, IColumn, IEventEmitter, IFetchXmlDataProviderColumn } from "@talxis/client-libraries";
import { ITaskDataProvider } from "../task-data-provider";
import { ICustomColumnsDataProvider } from "../custom-columns-data-provider/CustomColumnsDataProvider";
import { INativeColumns } from "../../interfaces";

export type ICreateUserQueryResult = { success: true; queryId: string } | { success: false; errorMessage: string; };
export type IUpdateUserQueryResult = { success: true; queryId: string } | { success: false; errorMessage: string; };
export type IDeleteUserQueriesResult = { success: true; deletedQueryIds: string[] } | { success: false; errorMessage: string; failedQueryIds: string[] };

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
    onAfterUserQueriesDeleted: (result: IDeleteUserQueriesResult) => void;
    onBeforeUserQueryUpdated: (queryId: string) => void;
    onAfterUserQueryUpdated: (result: IUpdateUserQueryResult) => void;
    onBeforeUserQueryCreated: (queryName: string) => void;
    onAfterUserQueryCreated: (result: ICreateUserQueryResult) => void;
}


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

export interface ISavedQueryStrategy {
    onGetSystemQueries: () => Promise<ISavedQuery[]>;
    onGetUserQueries: () => Promise<ISavedQuery[]>;
    onDeleteUserQueries: (queryIds: string[]) => Promise<IDeleteUserQueriesResult>;
    onUpdateUserQuery: (currentQuery: ISavedQuery) => Promise<IUpdateUserQueryResult>;
    onCreateUserQuery: (newQuery: { name: string; description?: string }, currentQuery: ISavedQuery) => Promise<ICreateUserQueryResult>;
    onEnableUserQueries?: () => boolean;
}

export interface ISavedQueryDataProvider {
    queryEvents: IEventEmitter<ISavedQueryDataProviderEvents>;
    getSystemQueries: () => ISavedQuery[];
    getUserQueries: () => ISavedQuery[];
    getCurrentQuery: () => ISavedQuery;
    getSavedQuery(id: string): ISavedQuery;
    createUserQuery: (params: ICreateUserQueryParams) => Promise<ICreateUserQueryResult>;
    isUserQuery: (queryId: string) => boolean;
    updateUserQuery: (provider: ITaskDataProvider) => Promise<IUpdateUserQueryResult>;
    deleteUserQueries: (queryIds: string[]) => Promise<IDeleteUserQueriesResult>;
    refresh: () => Promise<void>;
    areUserQueriesEnabled: () => boolean;
}

interface IDeps {
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

    constructor(strategy: ISavedQueryStrategy, deps: IDeps) {
        this._strategy = strategy;
        this._preferredQuery = deps.preferredQuery;
        this._nativeColumns = deps.nativeColumns;
        this._customColumnsDataProvider = deps.customColumnsDataProvider;
    }

    public getSystemQueries(): ISavedQuery[] {
        return this._systemQueries;
    }

    public getUserQueries(): ISavedQuery[] {
        return this._userQueries;
    }

    public getCurrentQuery(): ISavedQuery {
        if (!this._currentQuery) {
            throw new Error('Current query not set');
        }
        return this._currentQuery;
    }

    public areUserQueriesEnabled(): boolean {
        return this._strategy.onEnableUserQueries?.() ?? true;
    }

    public isUserQuery(queryId: string): boolean {
        return this._userQueries.some(q => q.id === queryId);
    }

    public getSavedQuery(id: string): ISavedQuery {
        const query = [...this._systemQueries, ...this._userQueries].find(q => q.id === id);
        if (!query) {
            throw new Error(`Query with id ${id} not found`);
        }
        return {
            ...query,
            ...this._parseSavedQueryMetadata(query)
        }
    }

    public async updateUserQuery(provider: ITaskDataProvider): Promise<IUpdateUserQueryResult> {
        this.queryEvents.dispatchEvent('onBeforeUserQueryUpdated', this.getCurrentQuery().id);
        const result = await this._strategy.onUpdateUserQuery({
            ...this.getCurrentQuery(),
            ...this._getMetadataForSavedQuery(provider)

        })
        this.queryEvents.dispatchEvent('onAfterUserQueryUpdated', result);
        return result;
    }

    public async createUserQuery(params: ICreateUserQueryParams): Promise<ICreateUserQueryResult> {
        const { name, description, provider } = params;
        this.queryEvents.dispatchEvent('onBeforeUserQueryCreated', name);
        const result = await this._strategy.onCreateUserQuery({
            name: name,
            description: description,
        }, {
            ...this.getCurrentQuery(),
            ...this._getMetadataForSavedQuery(provider)
        })
        this.queryEvents.dispatchEvent('onAfterUserQueryCreated', result);
        return result;
    }

    public async deleteUserQueries(queryIds: string[]): Promise<IDeleteUserQueriesResult> {
        this.queryEvents.dispatchEvent('onBeforeUserQueriesDeleted', queryIds);
        const result = await this._strategy.onDeleteUserQueries(queryIds);
        this.queryEvents.dispatchEvent('onAfterUserQueriesDeleted', result);
        return result;
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
        this._includeRequiredColumns(this._currentQuery.columns);
        this._harmonizeColumns(this._currentQuery.columns);
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
                columns.push(columnFromQueries);
            }
        }
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
}