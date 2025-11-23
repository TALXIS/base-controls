import { Client, DataProvider, EventEmitter, ICommand } from "@talxis/client-libraries";
import { ITranslation } from "../../hooks";
import { IDatasetControl } from "./interfaces";
import { datasetControlTranslations } from "./translations";
import debounce from "debounce";

type Labels = Required<ITranslation<typeof datasetControlTranslations>>;

interface IDatasetControlModelDeps {
    getProps: () => IDatasetControl;
    getLabels: () => Labels;
}

export interface IDatasetControlModelEvents {
    onRecordCommandsLoaded: () => void;
}

export class DatasetControlModel extends EventEmitter<IDatasetControlModelEvents> {
    private _getProps: () => IDatasetControl;
    private _getLabels: () => Labels;
    private _hasInitialDataLoaded: boolean = false;
    private _commands: ICommand[] = [];
    private _commandsLoaded: boolean = false;
    private _client: Client = new Client();
    private _debouncedLoadRecordCommands: debounce.DebouncedFunction<(ids: string[]) => void>;

    constructor(deps: IDatasetControlModelDeps) {
        super();
        this._getProps = deps.getProps;
        this._getLabels = deps.getLabels;
        this._registerInterceptors();
        this._setDatasetProperties();
        this._setState();
        this._debouncedLoadRecordCommands = debounce((ids) => this.loadCommands(ids))
        this._addEventListeners();
    }

    public isPaginationVisible(): boolean {
        return this._getParameters().EnablePagination?.raw ?? true;
    }
    public isRecordCountVisible(): boolean {
        return this._getParameters().ShowRecordCount?.raw ?? true;
    }
    public isPageSizeSwitcherVisible(): boolean {
        return this._getParameters().EnablePageSizeSwitcher?.raw ?? true;
    }
    public isQuickFindVisible(): boolean {
        return this._getParameters().EnableQuickFind?.raw ?? true;
    }
    public isAutoSaveEnabled(): boolean {
        return this._getParameters().EnableAutoSave?.raw ?? false;
    }
    public isRibbonVisible(): boolean {
        return this._getParameters().EnableCommandBar?.raw ?? true;
    }
    public getDataset() {
        return this._getParameters().Grid;
    }
    public getLabels(): Labels {
        return this._getLabels();
    }
    public getPcfContext() {
        return this._getProps().context;
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
        this._saveState();
        this.getDataset().destroy();
    }
    private _getParameters() {
        return this._getProps().parameters;
    }

    private _setDatasetProperties() {
        const provider = this.getDataset().getDataProvider();
        provider.setProperty('autoSave', this.isAutoSaveEnabled());
        provider.setProperty('groupingType', this._getParameters().GroupType?.raw ?? 'nested');
        const inlineRibbonButtonsIds = [
            ...(this._getParameters().InlineRibbonButtonIds?.raw?.split(',') ?? []),
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
        this.getDataset().addEventListener('onInitialDataLoaded', () => {
            this._hasInitialDataLoaded = true;
        })
    }
    private _registerInterceptors() {
        this.getDataset().setInterceptor('__unsavedChangesBlocker', (parameters, defaultAction) => {
            if (!this.getDataset().isDirty()) {
                return defaultAction(parameters);
            }
            else if (window.confirm(this.getLabels()['saving-discard-all-confirmation']())) {
                //@ts-ignore
                this.getDataset().getDataProvider()['_dirtyRecordIdsSet'].clear();
                //@ts-ignore
                this.getDataset().getDataProvider()['_invalidRecordFieldIdsSet'].clear();
                return defaultAction(parameters);
            }
        })
    }

    private _saveState() {
        if(!this._hasInitialDataLoaded) {
            return;
        }
        const provider = this.getDataset().getDataProvider();
        const state = this._getProps().state || {};
        const DatasetControlState = state.DatasetControlState || {};
        DatasetControlState.columns = provider.getColumns().map(col => {
            return {
                ...col,
                //do not store metadata in state
                metadata: undefined
            }
        });
        DatasetControlState.linking = provider.getLinking();
        DatasetControlState.sorting = provider.getSorting();
        DatasetControlState.filtering = provider.getFiltering();
        DatasetControlState.pageSize = provider.getPaging().pageSize;
        DatasetControlState.pageNumber = provider.getPaging().pageNumber;
        DatasetControlState.searchQuery = provider.getSearchQuery();
        DatasetControlState.selectedRecordIds = provider.getSelectedRecordIds();
        state.DatasetControlState = DatasetControlState;
        this._getProps().context.mode.setControlState(state);
    }

    private _setState() {
        const state = this._getProps().state?.DatasetControlState;
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