import { EventEmitter, IDataProvider, IEventEmitter, IInternalDataProvider } from "@talxis/client-libraries";
import { IDatasetControlServiceLocator, IEventSubscriber } from "../../../runtime/interfaces";

/** What the page size switcher raises. */
export interface IDatasetControlPageSizeSwitcherEvents {
    /** The page size or the records on the page changed. */
    onPageSizeChanged: () => void;
}

/** Which records of how many the current page shows. */
export interface IDatasetControlRecordRange {
    /** The first record on the page, counted from 1; `0` when the page is empty. */
    first: number;
    /** With a trailing `+` when the provider has more pages but no total. */
    last: string;
    /** `undefined` when the provider does not count; `'5000+'` past its count limit. */
    total?: string;
}

export interface IDatasetControlPageSizeSwitcherParameters {
    services: IDatasetControlServiceLocator;
    provider: IDataProvider;
    /** The sizes the menu offers; {@link DEFAULT_PAGE_SIZES} when left out. */
    pageSizes?: number[];
}

/** The sizes the page size switcher offers unless it is given its own. */
export const DEFAULT_PAGE_SIZES = [25, 50, 75, 100, 250];
//what the provider reports past its count limit
const TOTAL_OVER_LIMIT = -1;

/** How many records a page holds, and which of them the page shows. */
export interface IDatasetControlPageSizeSwitcher {
    /** Subscribe to the switcher's events. */
    readonly events: IEventSubscriber<IDatasetControlPageSizeSwitcherEvents>;
    /** How many records a page holds. */
    getPageSize(): number;
    /** The sizes the menu offers. */
    getPageSizes(): number[];
    /** Whether the provider is loading. */
    isLoading(): boolean;
    /** Loads the records in pages of `pageSize`; asks first when there are unsaved changes. */
    setPageSize(pageSize: number): void;
    /** Which records of how many the current page shows. */
    getRecordRange(): IDatasetControlRecordRange;
}

export class DatasetControlPageSizeSwitcher implements IDatasetControlPageSizeSwitcher {
    public readonly events: IEventEmitter<IDatasetControlPageSizeSwitcherEvents> = new EventEmitter<IDatasetControlPageSizeSwitcherEvents>();
    private _services: IDatasetControlServiceLocator;
    private _provider: IInternalDataProvider;
    private _pageSizes: number[];

    constructor(parameters: IDatasetControlPageSizeSwitcherParameters) {
        this._services = parameters.services;
        this._provider = parameters.provider as IInternalDataProvider;
        this._pageSizes = parameters.pageSizes ?? DEFAULT_PAGE_SIZES;
        this._provider.addEventListener('onNewDataLoaded', this._onChanged);
        this._provider.addEventListener('onLoading', this._onChanged);
        this._services.register('pageSizeSwitcher', () => this);
    }

    public getPageSize(): number {
        return this._paging.pageSize;
    }

    public getPageSizes(): number[] {
        return this._pageSizes;
    }

    public isLoading(): boolean {
        return this._provider.isLoading();
    }

    public setPageSize(pageSize: number): void {
        const provider = this._provider;
        provider.executeWithUnsavedChangesBlocker(() => {
            this._paging.setPageSize(pageSize);
            provider.refresh();
        });
    }

    public getRecordRange(): IDatasetControlRecordRange {
        const paging = this._paging;
        const recordCount = this._provider.getRecords().length;
        const pageEnd = paging.pageNumber * paging.pageSize;
        const first = recordCount === 0 ? 0 : (paging.pageNumber - 1) * paging.pageSize + 1;
        if (paging.totalResultCount === undefined) {
            return { first, last: paging.hasNextPage ? `${pageEnd}+` : `${pageEnd - paging.pageSize + recordCount}` };
        }
        if (paging.totalResultCount === TOTAL_OVER_LIMIT) {
            return { first, last: `${pageEnd}`, total: '5000+' };
        }
        return { first, last: `${Math.min(pageEnd, paging.totalResultCount)}`, total: `${paging.totalResultCount}` };
    }

    public destroy(): void {
        this._provider.removeEventListener('onNewDataLoaded', this._onChanged);
        this._provider.removeEventListener('onLoading', this._onChanged);
        if (this._services.find('pageSizeSwitcher') === this) {
            this._services.unregister('pageSizeSwitcher');
        }
        this.events.clearEventListeners();
    }


    private get _paging() {
        return this._provider.getPaging();
    }

    private _onChanged = (): void => {
        this.events.dispatchEvent('onPageSizeChanged');
    };
}
