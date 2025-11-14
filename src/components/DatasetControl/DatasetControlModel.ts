import { DataProvider, EventEmitter, ICommand } from "@talxis/client-libraries";
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
    private _commands: ICommand[] = [];
    private _commandsLoaded: boolean = false;
    private _debouncedLoadRecordCommands: debounce.DebouncedFunction<(ids: string[]) => void>;

    constructor(deps: IDatasetControlModelDeps) {
        super();
        this._getProps = deps.getProps;
        this._getLabels = deps.getLabels;
        this._registerInterceptors();
        this._setDatasetProperties();
        this._debouncedLoadRecordCommands = debounce((ids) => this.loadCommands(ids))
        //triggering data load is done by platform in non-virtual datasets
        if (this.getDataset().getDataProvider().getProperty('isStandalone')) {
            this.getDataset().paging.loadExactPage(this.getDataset().paging.pageNumber);
        }
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
        this._commands = await this.getDataset().getDataProvider().retrieveRecordCommand({
            recordIds: ids,
            refreshAllRules: true,
            isMainRibbon: true
        });
        this._commands = this._getFilteredCommands(this._commands);
        this._commandsLoaded = true;
        this.dispatchEvent('onRecordCommandsLoaded');
    }
    public retrieveRecordCommands() {
        return this._commands;
    }
    public areCommandsLoaded(): boolean {
        return this._commandsLoaded;
    }
    private _getParameters() {
        return this._getProps().parameters;
    }

    private _setDatasetProperties() {
        const provider = this.getDataset().getDataProvider();
        provider.setProperty('autoSave', this.isAutoSaveEnabled());
        provider.setProperty('groupingType', this._getParameters().GroupType?.raw ?? 'nested');
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

    private _getFilteredCommands(commands: ICommand[]): ICommand[] {
        return commands.filter(command => {
            switch (true) {
                //these handles are handled by the platform in non-standalone mode
                case !this.getDataset().getDataProvider().getProperty('isStandalone') && DataProvider.CONST.NATIVE_COMMAND_IDS.includes(command.commandButtonId): {
                    return false;
                }
            }
            return true;
        })
    }

}