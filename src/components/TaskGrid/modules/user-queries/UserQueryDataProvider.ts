import { EventEmitter, IColumn, IFetchXmlDataProviderColumn } from "@talxis/client-libraries";
import { ErrorHelper } from "@utils";
import { IDeletedUserQueriesResult, ISavedQuery, ISavedQueryMetadata, IUserQueryStrategy } from "@components/TaskGrid/providers/saved-query";
import { ITaskDataProvider } from "@components/TaskGrid/providers/task";
import { ICreateUserQueryParams, IUserQueryDataProvider, IUserQueryDataProviderEvents } from "../interfaces";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/**
 * Wraps an {@link IUserQueryStrategy} with everything the grid needs around it: the lifecycle events, the
 * error handling that surfaces a failing strategy in the grid's own error dialog, the cached list of
 * views, and the capture of the grid's current state into a view.
 */
/** Constructor parameters for {@link UserQueryDataProvider}. */
export interface IUserQueryDataProviderParameters {
    /** Where the views are stored. */
    strategy: IUserQueryStrategy;
    /** Where the task side and the other modules are reached. Resolve in methods, never in a constructor. */
    services: ITaskGridServiceLocator;
}

export class UserQueryDataProvider implements IUserQueryDataProvider {
    private _strategy: IUserQueryStrategy;
    private _services: ITaskGridServiceLocator;
    private _queries: ISavedQuery[] = [];
    public events = new EventEmitter<IUserQueryDataProviderEvents>();

    constructor(parameters: IUserQueryDataProviderParameters) {
        this._strategy = parameters.strategy;
        this._services = parameters.services;
    }

    /** The views as they now stand, kept in step by every operation below. */
    public getQueries(): ISavedQuery[] {
        return this._queries;
    }

    public isUserQuery(queryId: string): boolean {
        return this._strategy.onIsUserQuery(queryId);
    }

    public async refresh(): Promise<ISavedQuery[]> {
        this._queries = await this._strategy.onGetUserQueries();
        return this._queries;
    }

    public async create(params: ICreateUserQueryParams): Promise<string | null> {
        const { name, description, currentQuery, provider } = params;
        this.events.dispatchEvent('onBeforeUserQueryCreated', name);
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const savedQuery: ISavedQuery = {
                    ...currentQuery,
                    ...this._getMetadataForSavedQuery(provider)
                };
                const result = await this._strategy.onCreateUserQuery({
                    name: name,
                    description: description,
                }, savedQuery);
                if (result) {
                    this._queries = [...this._queries, { ...savedQuery, id: result, name: name, description: description }];
                }
                this.events.dispatchEvent('onAfterUserQueryCreated', result);
                return result;
            },
            onError: (error, message) => this.events.dispatchEvent('onError', error, message)
        })
    }

    public async update(query: ISavedQuery): Promise<string | null> {
        this.events.dispatchEvent('onBeforeUserQueryUpdated', query.id);
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const result = await this._strategy.onUpdateUserQuery(query);
                if (result) {
                    this._queries = this._queries.map(existing => existing.id === query.id ? query : existing);
                }
                this.events.dispatchEvent('onAfterUserQueryUpdated', result);
                return result;
            },
            onError: (error, message) => this.events.dispatchEvent('onError', error, message)
        })
    }

    public async updateFromGridState(currentQuery: ISavedQuery, provider: ITaskDataProvider): Promise<string | null> {
        return this.update({
            ...currentQuery,
            ...this._getMetadataForSavedQuery(provider)
        });
    }

    public async delete(queryIds: string[]): Promise<IDeletedUserQueriesResult> {
        this.events.dispatchEvent('onBeforeUserQueriesDeleted', queryIds);
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const result = await this._strategy.onDeleteUserQueries(queryIds);
                //drop them here too, so getQueries() does not keep serving deleted views until a refresh
                this._queries = this._queries.filter(query => !result.deletedQueryIds.includes(query.id));
                this.events.dispatchEvent('onAfterUserQueriesDeleted', result);
                return result;
            },
            onError: (error, message) => this.events.dispatchEvent('onError', error, message)
        })
    }

    public destroy() {
        this.events.clearEventListeners();
    }

    private _getMetadataForSavedQuery(provider: ITaskDataProvider): ISavedQueryMetadata {
        const metadata: ISavedQueryMetadata = {
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
        };
        //the modules' own slices, each written under its own key - a saved view reopens with whatever they
        //had when it was saved
        this._services.get('savedQueryDataProvider').applyStateHooks(metadata);
        return metadata;
    }

    private _addPropToMetadataQueryCol(col: IFetchXmlDataProviderColumn, propName: keyof IColumn, propValue: any) {
        if (propValue != undefined) {
            (col as any)[propName] = propValue;
        }
    }
}
