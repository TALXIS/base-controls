import { Client, DataProvider, Dataset, EventEmitter, ICommand, IDataProvider, IDataset, IEventEmitter, IInterceptor, IInternalDataProvider, Interceptors, ISavedQuery } from "@talxis/client-libraries";
import debounce from "debounce";
import { IDatasetControlParameters } from "../../components/DatasetControl/interfaces";
import { DatasetControlViewSwitcher } from "./view-switcher/DatasetControlViewSwitcher";
import { DatasetControlEditColumns } from "./edit-columns/DatasetControlEditColumns";
import { IEditColumns } from "../edit-columns";
import { IQuickFind } from "../quick-find";
import { DatasetControlQuickFind } from "./quick-find/DatasetControlQuickFind";
import { IViewSwitcher } from "../view-switcher/ViewSwitcherBase";

export interface ISimpleDatasetControl extends EventEmitter<IDatasetControlEvents> {
    editColumns: IEditColumns;
    viewSwitcher: IViewSwitcher;
    quickFind: IQuickFind;
    getDataset: () => IDataset;
    refresh: () => void;
    requestRemount: () => void;
    destroy: () => void;
}

export interface IDatasetControlFactory {
    /**
     * This method should return the class (not an instance) of the data provider that will be used by the dataset control. The dataset control will instantiate the provider by itself, passing the options returned from `getDataProviderOptions` to the provider's constructor.
     */
    getDataProviderClass: () => new (...args: any[]) => IDataProvider;
    /**
     * This object will be passed into the provider's constructor when instantiating the provider. It can be used to pass any additional configuration or dependencies that the provider might need.
     */
    getDataProviderOptions: () => {[key: string]: any};
}


export class SimpleDatasetControl extends EventEmitter<IDatasetControlEvents> implements ISimpleDatasetControl {
    private _DataProviderClass: new (...args: any[]) => IDataProvider;
    private _args: {[ key: string ]: any };
    private _dataset!: IDataset;
    private _provider!: IDataProvider;
    private _viewSwitcher: IViewSwitcher;
    private _quickFind: IQuickFind;

    constructor(factory: IDatasetControlFactory) {
        super();
        this._DataProviderClass = factory.getDataProviderClass();
        this._args = factory.getDataProviderOptions();
        this._provider = new this._DataProviderClass(this._args);
        this._dataset = new Dataset(this._provider);
        this._viewSwitcher = new DatasetControlViewSwitcher(this as any);
        this._quickFind = new DatasetControlQuickFind(this as any);
    }

    public get editColumns(): IEditColumns {
        return new DatasetControlEditColumns({ datasetControl: this as any });
    }
    public get viewSwitcher(): IViewSwitcher {
        return this._viewSwitcher;
    }
    public get quickFind(): IQuickFind {
        return this._quickFind
    }
    public refresh(): void {
        this._dataset.refresh();
    }
    public requestRemount(): void {
        this.dispatchEvent('onRemountRequested');
    }
    public destroy(): void {
        this._dataset.destroy();
        this.clearEventListeners();
    }
    public getDataset() {
        return this._dataset;
    }
}


interface IDatasetControlOptions {
    state: ComponentFramework.Dictionary;
    controlId: string;
    onGetPcfContext: () => ComponentFramework.Context<any, any>;
    onGetParameters: () => IDatasetControlParameters;
    onSaveState?: (state: ComponentFramework.Dictionary) => void;
}

export interface IDatasetControlEvents {
    onRecordCommandsLoaded: () => void;
    onRemountRequested: () => void;
    onEditColumnsRequested: () => void;
}

interface IDatasetControlInterceptors {
}

type IRemountRequestContext = | { reason: 'saved-query-changed'; data: { newQueryId: string } } | { reason: 'flush-state' } | { reason: 'saved-query-added'; data: { newQueryId: string } }
// Add more reasons here with specific data types as needed

export interface IDatasetControl extends IEventEmitter<IDatasetControlEvents> {
    editColumns: IEditColumns;
    viewSwitcher: IViewSwitcher;
    quickFind: IQuickFind;
    setInterceptor<K extends keyof IDatasetControlInterceptors>(event: K, interceptor: IInterceptor<IDatasetControlInterceptors, K>): void;
    isPaginationVisible(): boolean;
    getControlId(): string;
    isRecordCountVisible(): boolean;
    isPageSizeSwitcherVisible(): boolean;
    isQuickFindVisible(): boolean;
    isAutoSaveEnabled(): boolean;
    isRibbonVisible(): boolean;
    getUserQueryScope(): string | null;
    getHeight(): string | null;
    getDataset(): IDataset;
    refresh(): void;
    getPcfContext(): ComponentFramework.Context<any>;
    getParameters(): IDatasetControlParameters;
    loadCommands(ids: string[]): Promise<void>;
    retrieveRecordCommands(): ICommand[];
    areCommandsLoaded(): boolean;
    isEditColumnsVisible(): boolean;
    isViewSwitcherVisible(): boolean;
    isEditFiltersVisible(): boolean;
    //this should be removed once we have a custom edit columns button in the ribbon
    requestEditColumns(): void;
    destroy(): void;
    requestRemount(context?: IRemountRequestContext): void;
    init(): Promise<void>;
    getState(): ComponentFramework.Dictionary;
    saveState(): void;
}

export class DatasetControl extends EventEmitter<IDatasetControlEvents> implements IDatasetControl {
    private _commands: ICommand[] = [];
    private _commandsLoaded: boolean = false;
    private _client: Client = new Client();
    private _options: IDatasetControlOptions;
    private _debouncedLoadRecordCommands: debounce.DebouncedFunction<(ids: string[]) => void>;
    private _interceptors = new Interceptors<IDatasetControlInterceptors>();
    private _remountRequestContext: IRemountRequestContext | null = null;
    private _viewSwitcher: IViewSwitcher;
    private _quickFind: IQuickFind;

    constructor(options: IDatasetControlOptions) {
        super();
        this._options = options;
        this._debouncedLoadRecordCommands = debounce((ids) => this.loadCommands(ids));
        this._viewSwitcher = new DatasetControlViewSwitcher(this)
        this._quickFind = new DatasetControlQuickFind(this);
        this._setEntityMetadata();
        this._setColumnsFromLegacyParameter();
        this._setDatasetProperties();
        this._loadState(this._options.controlId, this._options.state);
        this._addEventListeners();
        this._debouncedLoadRecordCommands(this.getDataset().getSelectedRecordIds());
    }

    public get editColumns(): IEditColumns {
        return new DatasetControlEditColumns({ datasetControl: this });
    }
    public get viewSwitcher(): IViewSwitcher {
        return this._viewSwitcher;
    }
    public get quickFind(): IQuickFind {
        return this._quickFind;
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
    public async refresh(): Promise<void> {
        //we can use this to check for pending changes before refreshing the dataset, but for now we'll just refresh directly
        this.getDataset().refresh();
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
    public requestEditColumns(): void {
        this.dispatchEvent('onEditColumnsRequested');
    }
    public isViewSwitcherVisible(): boolean {
        return true;
        //return !!this.getParameters().EnableViewSwitcher?.raw && !this._isUsingLegacyColumnsBinding;
    }
    public isEditColumnsVisible(): boolean {
        return this.getParameters().EnableEditColumns?.raw ?? false;
    }
    public isEditFiltersVisible(): boolean {
        return false;
    }
    public getHeight() {
        return this.getParameters().Height?.raw ?? null;
    }
    public getUserQueryScope(): string | null {
        return this.getParameters().UserQueryScope?.raw ?? null;
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
    public requestRemount(context?: IRemountRequestContext): void {
        this._remountRequestContext = context ?? null;
        this.dispatchEvent('onRemountRequested');
    }
    public async init() {
        await this._executeClientApiScript();
        this.getDataset().paging.loadExactPage(this.getDataset().paging.pageNumber);
    }
    public getParameters() {
        return this._options.onGetParameters();
    }
    public getState() {
        return this._options.state;
    }
    public getControlId() {
        return this._options.controlId;
    }
    public saveState() {
        const provider = this.getDataset().getDataProvider();
        const currentViewId = provider.getViewId();
        const state = this._options.state;
        const controlState = state[this._options.controlId];
        const DatasetControlState = controlState.DatasetControlState || {};
        controlState.DatasetControlState = DatasetControlState;
        state[this._options.controlId] = controlState;

        DatasetControlState.viewId = currentViewId;
        DatasetControlState.SavedQueries = provider.getSavedQueries().map(query => query.id === currentViewId ? this._enrichQueryWithCurrentState(query, provider) : query);

        switch (this._remountRequestContext?.reason) {
            case 'flush-state': {
                state[this._options.controlId] = {};
                break;
            }
            case 'saved-query-changed':
            case 'saved-query-added': {
                DatasetControlState.viewId = this._remountRequestContext.data.newQueryId;
                if (this._remountRequestContext.reason === 'saved-query-added') {
                    DatasetControlState.SavedQueries = DatasetControlState.SavedQueries.filter((query: ISavedQuery) => query.id !== DataProvider.CONST.DEFAULT_VIEW_ID);
                }
                break;
            }
        }
        this._options.onSaveState?.(state);
    }

    private _enrichQueryWithCurrentState(query: ISavedQuery, provider: IDataProvider): ISavedQuery {
        return {
            ...query,
            columns: provider.getColumns(),
            fetchXml: provider.getFetchXml(),
            selectedRecordIds: provider.getSelectedRecordIds(),
            pageNumber: provider.getPaging().pageNumber,
            userFilter: provider.getFiltering() ?? undefined,
            searchQuery: provider.getSearchQuery()
        };
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
        provider.setProperty('fetchSavedQueries', this.isViewSwitcherVisible());
        provider.setProperty('fetchUserQueries', false);
        provider.setProperty('userQueryScopeId', this.getUserQueryScope() ?? undefined);

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
        });
    }

    private _loadState(controlId: string, state: ComponentFramework.Dictionary) {
        if (state[controlId]?.DatasetControlState) {
            const DatasetControlState = state[controlId].DatasetControlState;
            const provider = this.getDataset().getDataProvider();
            provider.setMetadata({
                ...provider.getMetadata(),
                SavedQueries: DatasetControlState.SavedQueries
            });
            provider.setViewId(DatasetControlState.viewId);
            provider.setProperty('hasPreviousState', true);
        }
        else if (!state[controlId]) {
            state[controlId] = {};
        }
    }

    private _setEntityMetadata() {
        const entityMetadata = this.getParameters().EntityMetadata;
        if(entityMetadata) {
            this.getDataset().getDataProvider().setMetadata(entityMetadata);
        }
    }
    
    private _setColumnsFromLegacyParameter() {
        const columnsParameter = this.getPcfContext().parameters.Columns?.raw;
        if (columnsParameter) {
            console.warn('Setting columns via `Columns` parameter is deprecated. Please set columns using SavedQueries in Entity Metadata instead.');
            this.getDataset().getDataProvider().setColumns(JSON.parse(columnsParameter));
        }
    }

}