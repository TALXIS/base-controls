import { EventEmitter, IDataProvider, IEventEmitter, IInternalDataProvider } from "@talxis/client-libraries";
import { IEventSubscriber } from "@utils";
import { IDatasetControlServiceLocator } from "../../../runtime/interfaces";

/** What the pagination raises. */
export interface IDatasetControlPaginationEvents {
    /** The page changed, or a page started loading. */
    onPagingChanged: () => void;
}

export interface IDatasetControlPaginationParameters {
    services: IDatasetControlServiceLocator;
    provider: IDataProvider;
}

/** Moves the provider between its pages. */
export interface IDatasetControlPagination {
    /** Subscribe to the pagination's events. */
    readonly events: IEventSubscriber<IDatasetControlPaginationEvents>;
    /** The current page, counted from 1. */
    getPageNumber(): number;
    /** Whether there is a page before this one and nothing is loading. */
    canMovePrevious(): boolean;
    /** Whether there is a page after this one and nothing is loading. */
    canMoveNext(): boolean;
    /** Loads the first page; asks first when there are unsaved changes. */
    moveFirst(): void;
    /** Loads the previous page; asks first when there are unsaved changes. */
    movePrevious(): void;
    /** Loads the next page; asks first when there are unsaved changes. */
    moveNext(): void;
}

export class DatasetControlPagination implements IDatasetControlPagination {
    public readonly events: IEventEmitter<IDatasetControlPaginationEvents> = new EventEmitter<IDatasetControlPaginationEvents>();
    private _services: IDatasetControlServiceLocator;
    private _provider: IInternalDataProvider;

    constructor(parameters: IDatasetControlPaginationParameters) {
        this._services = parameters.services;
        this._provider = parameters.provider as IInternalDataProvider;
        this._provider.addEventListener('onNewDataLoaded', this._onPagingChanged);
        this._provider.addEventListener('onLoading', this._onPagingChanged);
        this._services.register('pagination', () => this);
    }

    public getPageNumber(): number {
        return this._paging.pageNumber;
    }

    public canMovePrevious(): boolean {
        return this._paging.hasPreviousPage && !this._provider.isLoading();
    }

    public canMoveNext(): boolean {
        return this._paging.hasNextPage && !this._provider.isLoading();
    }

    public moveFirst(): void {
        this._provider.executeWithUnsavedChangesBlocker(() => this._paging.reset());
    }

    public movePrevious(): void {
        this._provider.executeWithUnsavedChangesBlocker(() => this._paging.loadExactPage(this._paging.pageNumber - 1));
    }

    public moveNext(): void {
        this._provider.executeWithUnsavedChangesBlocker(() => this._paging.loadExactPage(this._paging.pageNumber + 1));
    }

    //the provider outlives the pagination
    public destroy(): void {
        this._provider.removeEventListener('onNewDataLoaded', this._onPagingChanged);
        this._provider.removeEventListener('onLoading', this._onPagingChanged);
        if (this._services.find('pagination') === this) {
            this._services.unregister('pagination');
        }
        this.events.clearEventListeners();
    }


    private get _paging() {
        return this._provider.getPaging();
    }

    private _onPagingChanged = (): void => {
        this.events.dispatchEvent('onPagingChanged');
    };
}
