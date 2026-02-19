import { Client, DataProvider, EventEmitter, ICommand, IDataProvider, IDataset, IEventEmitter, IInterceptor, IInternalDataProvider, Interceptors, ISavedQuery } from "@talxis/client-libraries";
import debounce from "debounce";
import { IDatasetControlParameters } from "../../components/DatasetControl/interfaces";
import { EditColumns, IEditColumns } from "./EditColumns";
import { IViewSwitcher, ViewSwitcher } from "./ViewSwitcher";


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
    private _isUsingLegacyColumnsBinding: boolean = false;
    private _viewSwitcher: ViewSwitcher;

    constructor(options: IDatasetControlOptions) {
        super();
        this._options = options;
        this._setDatasetProperties();
        this._loadState(this._options.controlId, this._options.state);
        this._debouncedLoadRecordCommands = debounce((ids) => this.loadCommands(ids))
        this._addEventListeners();
        this._debouncedLoadRecordCommands(this.getDataset().getSelectedRecordIds());
        this._isUsingLegacyColumnsBinding = !!this.getPcfContext().parameters['Columns']?.raw;
        this._viewSwitcher = new ViewSwitcher(this);
        this._showLegacyColumnsWarning();
    }

    public get editColumns(): IEditColumns {
        return new EditColumns({ datasetControl: this });
    }
    public get viewSwitcher(): IViewSwitcher {
        return this._viewSwitcher;
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
        provider.setProperty('fetchUserQueries', true);
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

    private _showLegacyColumnsWarning() {
        if (this._isUsingLegacyColumnsBinding && this._options.onGetParameters().EnableViewSwitcher?.raw) {
            console.warn('View Switcher requires columns to be set via Entity Metadata. It will not be visible when using legacy Columns binding.');
        }
    }

}