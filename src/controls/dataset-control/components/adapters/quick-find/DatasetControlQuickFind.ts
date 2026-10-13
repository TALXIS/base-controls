import { EventEmitter, IDataProvider, IColumn, IEventEmitter, IInternalDataProvider } from "@talxis/client-libraries";
import { IEventSubscriber } from "@utils";
import { IDatasetControlServiceLocator } from "../../../runtime/interfaces";

/** What the quick find raises. */
export interface IDatasetControlQuickFindEvents {
    /** The query was edited. */
    onQueryChanged: () => void;
}

export interface IDatasetControlQuickFindParameters {
    services: IDatasetControlServiceLocator;
    provider: IDataProvider;
}

/** What the user searches the provider for. */
export interface IDatasetControlQuickFind {
    /** Subscribe to the quick find's events. */
    readonly events: IEventSubscriber<IDatasetControlQuickFindEvents>;
    /** The query in the box, searched or not. */
    getQuery(): string;
    /** Edits the query without searching. */
    setQuery(query: string): void;
    /** The columns a search matches on; empty when the provider cannot search. */
    getColumns(): IColumn[];
    /** Whether the query starts with a wildcard, which searches slowly. */
    isLikeQuery(): boolean;
    /** Searches the provider for the query; asks first when there are unsaved changes. */
    search(): void;
    /** Empties the query and searches again. */
    clear(): void;
}

export class DatasetControlQuickFind implements IDatasetControlQuickFind {
    public readonly events: IEventEmitter<IDatasetControlQuickFindEvents> = new EventEmitter<IDatasetControlQuickFindEvents>();
    private _services: IDatasetControlServiceLocator;
    private _provider: IInternalDataProvider;
    private _query: string;

    constructor(parameters: IDatasetControlQuickFindParameters) {
        this._services = parameters.services;
        this._provider = parameters.provider as IInternalDataProvider;
        this._query = this._provider.getSearchQuery() ?? '';
        this._services.register('quickFind', () => this);
    }

    public getQuery(): string {
        return this._query;
    }

    /** Edits the query without searching. */
    public setQuery(query: string): void {
        this._query = query;
        this.events.dispatchEvent('onQueryChanged');
    }

    /** The columns a search matches on; empty when the provider cannot search. */
    public getColumns(): IColumn[] {
        return this._provider.getQuickFindColumns();
    }

    /** Whether the query starts with a wildcard, which searches slowly. */
    public isLikeQuery(): boolean {
        return this._query.startsWith('*');
    }

    public search(): void {
        const provider = this._provider;
        provider.executeWithUnsavedChangesBlocker(() => {
            provider.setSearchQuery(this._query);
            provider.refresh();
        });
    }

    public clear(): void {
        this.setQuery('');
        this.search();
    }

    public destroy(): void {
        if (this._services.find('quickFind') === this) {
            this._services.unregister('quickFind');
        }
        this.events.clearEventListeners();
    }
}
