import { FetchXmlBuilder, ICommand, IDataProvider } from '@talxis/client-libraries';
import type { IDatasetControlViewColumn } from '@controls/dataset-control/runtime/interfaces';

type DataSet = ComponentFramework.PropertyTypes.DataSet;
type SortStatus = ComponentFramework.PropertyHelper.DataSetApi.SortStatus;
type FilterExpression = ComponentFramework.PropertyHelper.DataSetApi.FilterExpression;

//a load the host never finishes must not hold up the next one
const HOST_LOAD_TIMEOUT = 15_000;

const HOST_LOADING = 1;
const HOST_LOADED = 2;

//the host sends the id filter in the URL
const MAX_COMMAND_RECORDS = 1000;
//the rows the inline ribbon asked for most recently
const MAX_INLINE_RIBBON_RECORDS = 50;
const FILTER_OPERATOR_AND = 0;
const CONDITION_OPERATOR_IN = 8;

//the empty slot the host puts beside its command bar for a CommandRecords selection
const HOST_STYLE = 'div:has(> div > div > div > ul[data-lp-id^="commandbar-"]:not([data-lp-id^="commandbar-Global"])) > div[role="presentation"]:has(> div[role="presentation"]:only-child:empty) { display: none !important; }';
const HOST_STYLE_ID = 'talxis-powerapps-dataset-bridge';

//every bridge on the page shares the one style element
let hostStyleUsers = 0;

/** The data-sets a PCF bound to a host view receives. */
export interface IPowerAppsDatasetInputs {
    /** The host's view. */
    Dataset: DataSet;
    /** Records the host's commands are evaluated on: the same table, in a view without filters. */
    CommandRecords?: DataSet;
}

/** The host view as our provider is set up from it. */
export interface IPowerAppsDatasetQuery {
    viewId: string;
    title: string;
    /** The host's fetchXml without its view's id. */
    fetchXml: string;
    /** The columns the host shows, in its order. */
    columns: IDatasetControlViewColumn[];
}

export interface IPowerAppsDatasetBridgeParameters {
    context: ComponentFramework.Context<IPowerAppsDatasetInputs>;
}

interface IHostQueryState {
    fetchXml: string;
    searchString?: string;
    /** Changes whenever the host runs a different query. */
    key: string;
}

//undocumented on the host's data-set
type CommandDataSet = DataSet & {
    retrieveRecordCommand(recordIds: string[], specificCommands: string[], filterByPriority: boolean, useNestedFormat: boolean, refreshAllRules: boolean): Promise<ICommand[]>;
};

interface ICommandRecordsLoad {
    recordIds: string[];
    onDone: () => void;
}

interface IPushedLoad {
    pageNumber: number;
    /** The host's query key before the load, when the load changes the query. */
    previousQueryKey?: string;
    onDone: () => void;
}

/** Keeps the host's data-set and our provider on the same query. */
export class PowerAppsDatasetBridge {
    private _context: ComponentFramework.Context<IPowerAppsDatasetInputs>;
    private _provider?: IDataProvider;
    private _hasProviderLoaded = false;
    private _wasHostLoading: boolean;
    private _isHostOwnLoad = false;
    private _pushedLoad?: IPushedLoad;
    private _isPushRequested = false;
    private _isPushing = false;
    private _pushedFiltering = JSON.stringify(null);
    private _selectionRequest = 0;
    private _commandRecordsLoad?: ICommandRecordsLoad;
    private _commandRecordsQueue: Promise<void> = Promise.resolve();
    private _selectedCommandRecordIds: string[] = [];
    private _inlineRibbonRecordIds: string[] = [];

    constructor(parameters: IPowerAppsDatasetBridgeParameters) {
        this._context = parameters.context;
        this._wasHostLoading = this._getDataset().loading;
        this._addHostStyle();
    }

    public destroy(): void {
        hostStyleUsers--;
        if (hostStyleUsers === 0) {
            document.getElementById(HOST_STYLE_ID)?.remove();
        }
    }

    /** Takes the context of every `updateView`; the host hands its data-set over anew each time. */
    public updateView(context: ComponentFramework.Context<IPowerAppsDatasetInputs>): void {
        this._context = context;
        const isLoading = this._getDataset().loading;
        const wasLoading = this._wasHostLoading;
        this._wasHostLoading = isLoading;
        if (this._commandRecordsLoad && this._isCommandRecordsLoadDone(this._commandRecordsLoad)) {
            this._commandRecordsLoad.onDone();
        }
        if (isLoading) {
            //the host reports loading only for the loads it starts itself
            this._isHostOwnLoad ||= !wasLoading && !this._pushedLoad;
            return;
        }
        if (this._pushedLoad && this._isPushedLoadDone(this._pushedLoad)) {
            this._pushedLoad.onDone();
        }
        //a quick find made while we were loading the host shows up only in its search
        if (this._isHostOwnLoad || this._getHostSearchQuery() !== this._provider?.getSearchQuery()) {
            this._isHostOwnLoad = false;
            this._onHostLoaded();
        }
    }

    public getQuery(): IPowerAppsDatasetQuery {
        const dataset = this._getDataset();
        const fetch = FetchXmlBuilder.fetch.fromXml(this._getHostQueryState().fetchXml);
        //the provider would lay the saved view's layout over the host's columns
        fetch.savedqueryid = '';
        fetch.userqueryid = '';
        return {
            viewId: dataset.getViewId(),
            title: dataset.getTitle(),
            fetchXml: fetch.toXml(),
            columns: [...dataset.columns]
                .filter(column => !column.isHidden)
                .sort((a, b) => a.order - b.order)
                .map(column => ({ name: column.name, order: column.order, visualSizeFactor: column.visualSizeFactor })),
        };
    }

    /** Connects the provider the frame created for the host view. */
    public attach(provider: IDataProvider): () => void {
        this._provider = provider;
        this._hasProviderLoaded = false;
        provider.setSearchQuery(this._getHostSearchQuery());
        const removers = [
            provider.addEventListener('onNewDataLoaded', this._onNewDataLoaded),
            provider.addEventListener('onLoading', this._onProviderLoading),
            provider.addEventListener('onRecordsSelected', this._onRecordsSelected),
            provider.addEventListener('onDestroyed', () => detach()),
        ];
        const detach = () => {
            removers.forEach(remove => remove());
            if (this._provider === provider) {
                this._provider = undefined;
                this._onProviderLoading(false);
                void this._selectOnHost([]);
            }
        };
        return detach;
    }

    /** The host's commands for the records as if selected, from the data-set holding them. */
    public async getRecordCommands(frameRecordIds: string[], commandButtonIds: string[]): Promise<ICommand[]> {
        //the host takes an array from the frame's window for a string
        const recordIds = [...frameRecordIds];
        const dataset = await this._getDatasetHolding(recordIds);
        if (!dataset) {
            return [];
        }
        return await (dataset as CommandDataSet).retrieveRecordCommand(recordIds, [...commandButtonIds], false, false, true);
    }

    private async _getDatasetHolding(recordIds: string[]): Promise<DataSet | undefined> {
        if (recordIds.every(id => this._getDataset().records[id])) {
            return this._getDataset();
        }
        if (!this._context.parameters.CommandRecords) {
            return undefined;
        }
        this._inlineRibbonRecordIds = [...new Set([...recordIds, ...this._inlineRibbonRecordIds])].slice(0, MAX_INLINE_RIBBON_RECORDS);
        await this._loadCommandRecords();
        const commandRecords = this._context.parameters.CommandRecords;
        return recordIds.every(id => commandRecords?.records[id]) ? commandRecords : undefined;
    }

    //the host takes an array from the frame's window for a string
    private _onRecordsSelected = (recordIds: string[]): void => {
        void this._selectOnHost([...recordIds]);
    };

    //the host's commands act only on records one of its data-sets has loaded
    private async _selectOnHost(recordIds: string[]): Promise<void> {
        const request = ++this._selectionRequest;
        const dataset = this._getDataset();
        const commandRecords = this._context.parameters.CommandRecords;
        if (!commandRecords || recordIds.every(id => dataset.records[id])) {
            this._selectedCommandRecordIds = [];
            commandRecords?.clearSelectedRecordIds();
            dataset.setSelectedRecordIds(recordIds.filter(id => dataset.records[id]));
            return;
        }
        dataset.clearSelectedRecordIds();
        if (recordIds.length > MAX_COMMAND_RECORDS) {
            console.warn(`The host's commands act on the first ${MAX_COMMAND_RECORDS} of the ${recordIds.length} selected records.`);
        }
        this._selectedCommandRecordIds = recordIds.slice(0, MAX_COMMAND_RECORDS);
        await this._loadCommandRecords();
        if (request === this._selectionRequest) {
            this._selectCommandRecords();
        }
    }

    //one load at a time, so a later one never replaces the filter an earlier one waits on
    private async _loadCommandRecords(): Promise<void> {
        const previous = this._commandRecordsQueue;
        const load = (async () => {
            //an earlier load reports its own failure
            try {
                await previous;
            }
            catch { }
            await this._loadMissingCommandRecords();
        })();
        this._commandRecordsQueue = load;
        await load;
    }

    //the selection first, so the inline ribbon's rows give way at the limit
    private async _loadMissingCommandRecords(): Promise<void> {
        const commandRecords = this._context.parameters.CommandRecords!;
        const recordIds = [...new Set([...this._selectedCommandRecordIds, ...this._inlineRibbonRecordIds])].slice(0, MAX_COMMAND_RECORDS);
        if (recordIds.every(id => commandRecords.records[id])) {
            return;
        }
        const loaded = new Promise<void>(resolve => this._commandRecordsLoad = { recordIds, onDone: resolve });
        commandRecords.filtering.setFilter({
            filterOperator: FILTER_OPERATOR_AND,
            conditions: [{ attributeName: this._getPrimaryIdAttribute(), conditionOperator: CONDITION_OPERATOR_IN, value: recordIds }],
        } as FilterExpression);
        commandRecords.paging.setPageSize(recordIds.length);
        commandRecords.refresh();
        await this._waitForHost(loaded);
        this._commandRecordsLoad = undefined;
        const reloaded = this._context.parameters.CommandRecords!;
        if (reloaded.error) {
            console.error(`The host could not load the records its commands act on: ${reloaded.errorMessage}`);
        }
        //a load may drop what the data-set had selected
        this._selectCommandRecords();
    }

    private _selectCommandRecords(): void {
        const commandRecords = this._context.parameters.CommandRecords;
        commandRecords?.setSelectedRecordIds(this._selectedCommandRecordIds.filter(id => commandRecords.records[id]));
    }

    private _isCommandRecordsLoadDone(load: ICommandRecordsLoad): boolean {
        const commandRecords = this._context.parameters.CommandRecords;
        return !!commandRecords && !commandRecords.loading && (commandRecords.error || load.recordIds.every(id => commandRecords.records[id]));
    }

    private _getPrimaryIdAttribute(): string {
        return this._provider?.getMetadata()?.PrimaryIdAttribute ?? `${this._getDataset().getTargetEntityType()}id`;
    }

    //a quick find or the host's Refresh
    private _onHostLoaded(): void {
        if (!this._provider || !this._hasProviderLoaded) {
            return;
        }
        this._provider.setSearchQuery(this._getHostSearchQuery());
        void this._provider.refresh();
    }

    private _onNewDataLoaded = (): void => {
        this._hasProviderLoaded = true;
        void this._pushQuery();
    };

    private _onProviderLoading = (isLoading: boolean): void => {
        this._fireHostEvent('updatedatasethostloadingstate', { value: isLoading ? HOST_LOADING : HOST_LOADED });
    };

    private _addHostStyle(): void {
        hostStyleUsers++;
        if (document.getElementById(HOST_STYLE_ID)) {
            return;
        }
        const style = document.createElement('style');
        style.id = HOST_STYLE_ID;
        style.textContent = HOST_STYLE;
        document.head.appendChild(style);
    }

    //undocumented event the host listens for
    private _fireHostEvent(name: string, parameters: unknown): void {
        const factory = this._context.factory as ComponentFramework.Factory & { fireEvent: (name: string, parameters: unknown) => void };
        factory.fireEvent(name, parameters);
    }

    //the host's commands act on the host's own query
    private async _pushQuery(): Promise<void> {
        this._isPushRequested = true;
        if (this._isPushing) {
            return;
        }
        this._isPushing = true;
        try {
            while (this._isPushRequested && this._provider) {
                this._isPushRequested = false;
                await this._pushProviderQuery(this._provider);
            }
        }
        finally {
            this._isPushing = false;
        }
    }

    private async _pushProviderQuery(provider: IDataProvider): Promise<void> {
        const { pageNumber, pageSize } = provider.getPaging();
        const dataset = this._getDataset();
        const changes = [
            this._pushPageSize(dataset, pageSize),
            this._pushSorting(dataset, provider.getSorting()),
            this._pushFiltering(dataset, provider.getFiltering()),
        ];
        const isQueryChanged = changes.includes(true);
        if (!isQueryChanged && this._getHostPageNumber() === pageNumber) {
            return;
        }
        await this._loadHostPage(pageNumber, isQueryChanged);
        //the host now and then lands on another page than asked
        if (this._getHostPageNumber() !== pageNumber) {
            await this._loadHostPage(pageNumber, false);
        }
        if (this._getHostPageNumber() !== pageNumber) {
            console.warn(`The host's data-set stayed on page ${this._getHostPageNumber()} instead of ${pageNumber}.`);
        }
    }

    private _pushPageSize(dataset: DataSet, pageSize: number): boolean {
        if (dataset.paging.pageSize === pageSize) {
            return false;
        }
        dataset.paging.setPageSize(pageSize);
        return true;
    }

    private _pushSorting(dataset: DataSet, sorting: SortStatus[]): boolean {
        if (getSortingKey(dataset.sorting) === getSortingKey(sorting)) {
            return false;
        }
        //the host takes sorting only through its array's own methods
        while (dataset.sorting.length > 0) {
            dataset.sorting.pop();
        }
        sorting.forEach(sort => dataset.sorting.push({ name: sort.name, sortDirection: sort.sortDirection }));
        return true;
    }

    //the host hands its filter back reshaped
    private _pushFiltering(dataset: DataSet, filtering: FilterExpression | null): boolean {
        const serialized = JSON.stringify(filtering);
        if (serialized === this._pushedFiltering) {
            return false;
        }
        this._pushedFiltering = serialized;
        if (filtering) {
            dataset.filtering.setFilter(structuredClone(filtering));
        }
        else {
            dataset.filtering.clearFilter();
        }
        return true;
    }

    private async _loadHostPage(pageNumber: number, isQueryChanged: boolean): Promise<void> {
        const previousQueryKey = isQueryChanged ? this._getHostQueryState().key : undefined;
        const loaded = new Promise<void>(resolve => this._pushedLoad = { pageNumber, previousQueryKey, onDone: resolve });
        const dataset = this._getDataset();
        if (pageNumber === 1) {
            dataset.refresh();
        }
        else {
            dataset.paging.loadExactPage(pageNumber);
        }
        await this._waitForHost(loaded);
        this._pushedLoad = undefined;
    }

    private async _waitForHost(loaded: Promise<void>): Promise<void> {
        let timeout: ReturnType<typeof setTimeout> | undefined;
        await Promise.race([loaded, new Promise(resolve => timeout = setTimeout(resolve, HOST_LOAD_TIMEOUT))]);
        clearTimeout(timeout);
    }

    private _isPushedLoadDone(load: IPushedLoad): boolean {
        const isOnPage = this._getHostPageNumber() === load.pageNumber;
        return isOnPage && (load.previousQueryKey === undefined || this._getHostQueryState().key !== load.previousQueryKey);
    }

    //undocumented on the host's paging
    private _getHostPageNumber(): number | undefined {
        return (this._getDataset().paging as ComponentFramework.PropertyHelper.DataSetApi.Paging & { pageNumber?: number }).pageNumber;
    }

    private _getHostSearchQuery(): string {
        return this._getHostQueryState().searchString ?? '';
    }

    private _getDataset(): DataSet {
        return this._context.parameters.Dataset;
    }

    //undocumented: the data-set API exposes neither the search nor the fetchXml
    private _getHostQueryState(): IHostQueryState {
        const factory = this._context.factory as ComponentFramework.Factory & {
            _customControlProperties?: { dynamicData?: { parameters?: { Dataset?: { cachedQueryState?: IHostQueryState } } } };
        };
        const queryState = factory._customControlProperties?.dynamicData?.parameters?.Dataset?.cachedQueryState;
        if (!queryState) {
            throw new Error('The host has no query for the "Dataset" data-set; bind it to a view.');
        }
        return queryState;
    }
}

const getSortingKey = (sorting: SortStatus[]): string => JSON.stringify(sorting.map(sort => [sort.name, sort.sortDirection]));
