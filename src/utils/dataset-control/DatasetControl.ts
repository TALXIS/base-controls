import { Client, DataProvider, EventEmitter, ICommand, IDataset, IInterceptor, IInternalDataProvider, Interceptors } from "@talxis/client-libraries";
import debounce from "debounce";
import { IDatasetControlParameters } from "../../components/DatasetControl/interfaces";


interface IDatasetControlOptions {
    state: ComponentFramework.Dictionary;
    controlId: string;
    onGetPcfContext: () => ComponentFramework.Context<any, any>;
    onGetParameters: () => IDatasetControlParameters;
}

export interface IDatasetControlEvents {
    onRecordCommandsLoaded: () => void;
    onInitialized: () => void;
}

interface IDatasetControlInterceptors {
    onInitialize: () => Promise<void>;
}

export interface IDatasetControl extends EventEmitter<IDatasetControlEvents> {
    setInterceptor<K extends keyof IDatasetControlInterceptors>(event: K, interceptor: IInterceptor<IDatasetControlInterceptors, K>): void;
    isPaginationVisible(): boolean;
    isRecordCountVisible(): boolean;
    isPageSizeSwitcherVisible(): boolean;
    isQuickFindVisible(): boolean;
    isAutoSaveEnabled(): boolean;
    isRibbonVisible(): boolean;
    getHeight(): string | null;
    getDataset(): IDataset;
    getPcfContext(): ComponentFramework.Context<any>;
    getParameters(): IDatasetControlParameters;
    loadCommands(ids: string[]): Promise<void>;
    retrieveRecordCommands(): ICommand[];
    areCommandsLoaded(): boolean;
    destroy(): void;
    init(): Promise<void>;
    getState(): ComponentFramework.Dictionary;
    saveState(): void;
}

export class DatasetControl extends EventEmitter<IDatasetControlEvents> implements IDatasetControl {
    private _hasFirstDataLoaded: boolean = false;
    private _commands: ICommand[] = [];
    private _commandsLoaded: boolean = false;
    private _client: Client = new Client();
    private _options: IDatasetControlOptions;
    private _debouncedLoadRecordCommands: debounce.DebouncedFunction<(ids: string[]) => void>;
    private _interceptors = new Interceptors<IDatasetControlInterceptors>();

    constructor(options: IDatasetControlOptions) {
        super();
        this._options = options
        this._setDatasetProperties();
        this._setState();
        this._debouncedLoadRecordCommands = debounce((ids) => this.loadCommands(ids))
        this._addEventListeners();
        this._debouncedLoadRecordCommands(this.getDataset().getSelectedRecordIds());
    }

    public setInterceptor<K extends keyof IDatasetControlInterceptors>(event: K, interceptor: IInterceptor<IDatasetControlInterceptors, K>): void {
        this._interceptors.setInterceptor(event, interceptor);
    }
    public isPaginationVisible(): boolean {
        return this.getParameters().EnablePagination?.raw ?? true;
    }
    public isRecordCountVisible(): boolean {
        return this.getParameters().EnableRecordCount?.raw ?? true;
    }
    public isPageSizeSwitcherVisible(): boolean {
        return this.getParameters().EnablePageSizeSwitcher?.raw ?? true;
    }
    public isQuickFindVisible(): boolean {
        return this.getParameters().EnableQuickFind?.raw ?? true;
    }
    public isAutoSaveEnabled(): boolean {
        return this.getParameters().EnableAutoSave?.raw ?? false;
    }
    public isRibbonVisible(): boolean {
        return this.getParameters().EnableCommandBar?.raw ?? true;
    }
    public getHeight() {
        return this.getParameters().Height?.raw ?? null;
    }
    public getDataset() {
        return this.getParameters().Grid;
    }
    public getPcfContext() {
        return this._options.onGetPcfContext();
    }
    public async loadCommands(ids: string[]) {
        //we need to to have our ribbon shadow call the retrieveRecordCommand method in Power Apps in order to inject it into Power Apps ribbon.
        if (!this.isRibbonVisible() && this._client.isTalxisPortal()) {
            return;
        }
        this._commands = await this.getDataset().getDataProvider().retrieveRecordCommand({
            recordIds: ids,
            refreshAllRules: true
        });
        this._commandsLoaded = true;
        this.dispatchEvent('onRecordCommandsLoaded');
    }
    public retrieveRecordCommands() {
        return this._commands;
    }
    public areCommandsLoaded(): boolean {
        return this._commandsLoaded;
    }
    public destroy() {
        this.saveState();
        this.getDataset().destroy();
        this.clearEventListeners();
        this._interceptors.clearInterceptors();
    }
    public async init() {
        await this._interceptors.execute('onInitialize', undefined, async () => {
            if (this.getDataset().getDataProvider().getProperty('isStandalone') || !this._client.isTalxisPortal()) {
                await (<IInternalDataProvider>this.getDataset().getDataProvider()).preload();
            }
        });
        await this._executeClientApiScript();
        //this makes sure the current columns go through any dataset interceptors
        this.getDataset().setColumns(this.getDataset().columns);
        this.getDataset().paging.loadExactPage(this.getDataset().paging.pageNumber);
        this.dispatchEvent('onInitialized');
    }
    public getParameters() {
        return this._options.onGetParameters();
    }
    public getState() {
        return this._options.state;
    }
    public saveState() {
        if (!this._hasFirstDataLoaded) {
            return;
        }
        const provider = this.getDataset().getDataProvider();
        const state = this._options.state;
        const DatasetControlState = state.DatasetControlState || {};
        DatasetControlState.columns = provider.getColumns();
        DatasetControlState.linking = provider.getLinking();
        DatasetControlState.sorting = provider.getSorting();
        DatasetControlState.filtering = provider.getFiltering();
        DatasetControlState.pageSize = provider.getPaging().pageSize;
        DatasetControlState.pageNumber = provider.getPaging().pageNumber;
        DatasetControlState.searchQuery = provider.getSearchQuery();
        DatasetControlState.selectedRecordIds = provider.getSelectedRecordIds();
        state.DatasetControlState = DatasetControlState;
        this.getPcfContext().mode.setControlState(state);
    }
    private async _executeClientApiScript(): Promise<void> {
        const clientApiWebresourceName = this.getParameters().ClientApiWebresourceName?.raw;
        const clientApiFunctionName = this.getParameters().ClientApiFunctionName?.raw;
        if (clientApiFunctionName) {
            if (!clientApiFunctionName) {
                throw new Error('ClientApiFunctionName parameter is not set.');
            }
            try {
                //@ts-ignore - typings
                await Xrm.Utility.executeFunction(clientApiWebresourceName, clientApiFunctionName, [{
                    dataset: this.getDataset(),
                    controlId: this._options.controlId
                }]);
            }
            catch (err) {
                console.error('Client API web resource execution failed. Client API will not be enabled! Reason: ', err);
            }
        }
    }

    private _setDatasetProperties() {
        const provider = this.getDataset().getDataProvider();
        provider.setProperty('autoSave', this.isAutoSaveEnabled());
        provider.setProperty('groupingType', this.getParameters().GroupingType?.raw ?? 'nested');
        const inlineRibbonButtonsIds = [
            ...(this.getParameters().InlineRibbonButtonIds?.raw?.split(',') ?? []),
            DataProvider.CONST.SAVE_COMMAND_ID,
            DataProvider.CONST.CLEAR_CHANGES_COMMAND_ID
        ];
        provider.setProperty('inlineRibbonButtonsIds', new Set(inlineRibbonButtonsIds));
    }

    private _addEventListeners() {
        this.getDataset().addEventListener('onRecordsSelected', () => {
            this._debouncedLoadRecordCommands(this.getDataset().getSelectedRecordIds());
        })
        this.getDataset().addEventListener('onRecordColumnValueChanged', () => {
            this._debouncedLoadRecordCommands(this.getDataset().getSelectedRecordIds());
        })
        this.getDataset().addEventListener('onAfterRecordSaved', () => {
            this._debouncedLoadRecordCommands(this.getDataset().getSelectedRecordIds());
        })
        this.getDataset().addEventListener('onFirstDataLoaded', () => {
            this._hasFirstDataLoaded = true;
        })
    }

    private _setState() {
        const state = this._options.state?.DatasetControlState;
        if (!state) {
            return;
        }

        const provider = this.getDataset().getDataProvider();
        provider.setProperty('hasPreviousState', true);
        provider.setLinking(state.linking);
        provider.setSorting(state.sorting);
        provider.setFiltering(state.filtering);
        provider.getPaging().setPageSize(state.pageSize);
        provider.getPaging().setPageNumber(state.pageNumber);
        provider.setSearchQuery(state.searchQuery);
        provider.setSelectedRecordIds(state.selectedRecordIds);
    }

}