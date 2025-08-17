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

interface IEvents {
    onRecordCommandsLoaded: () => void;
}

export class DatasetControlModel extends EventEmitter<IEvents> {
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
        this._debouncedLoadRecordCommands = debounce((ids) => this.loadCommands())
        this.getDataset().paging.loadExactPage(this.getDataset().paging.pageNumber);
        this._addEventListeners();
    }

    public isPaginationVisible(): boolean {
        if (this._getParameters().EnablePagination?.raw !== false) {
            return true;
        }
        return false;
    }
    public isRecordCountVisible(): boolean {
        if (this._getParameters().ShowRecordCount?.raw !== false) {
            return true;
        }
        return false;
    }
    public isPageSizeSwitcherVisible(): boolean {
        if (this._getParameters().EnablePageSizeSwitcher?.raw !== false) {
            return true;
        }
        return false;
    }
    public isQuickFindVisible(): boolean {
        return this._getParameters().EnableQuickFind?.raw ?? false;
    }
    public isAutoSaveEnabled(): boolean {
        return this._getParameters().AutoSave?.raw === true;
    }
    public isRibbonVisible(): boolean {
        return true;
    }
    public isUnsavedChangesMessageBarVisible(): boolean {
        switch (true) {
            case !this.getDataset().isDirty():
            case this.getDataset().error:
            case this.isAutoSaveEnabled(): {
                return false;
            }
            default: {
                return true;
            }
        }
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
    public async loadCommands() {
        this._commands = await this.getDataset().getCommands();
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
    private _addEventListeners() {
        if (this.isRibbonVisible()) {
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
    }
    private _registerInterceptors() {
        this.getDataset().setInterceptor('__unsavedChangesBlocker', (defaultAction: any) => {
            if (!this.getDataset().isDirty()) {
                return defaultAction();
            }
            else if (window.confirm(this.getLabels()['saving-discard-all-confirmation']())) {
                //@ts-ignore
                this.getDataset().getDataProvider()['_dirtyRecordIdsSet'].clear();
                //@ts-ignore
                this.getDataset().getDataProvider()['_invalidRecordFieldIdsSet'].clear();
                return defaultAction();
            }
        })
    }

    private _getFilteredCommands(commands: ICommand[]): ICommand[] {
        return commands.filter(command => {
            switch (true) {
                //these handles are handled by the platform in non-virtual datasets
                case !this.getDataset().isVirtual() && DataProvider.CONST.NATIVE_COMMAND_IDS.includes(command.commandButtonId): {
                    return false;
                }
                //no need to display these button when auto save is active
                case this.isAutoSaveEnabled(): {
                    switch (command.commandButtonId) {
                        case DataProvider.CONST.SAVE_COMMAND_ID:
                        case DataProvider.CONST.CLEAR_CHANGES_COMMAND_ID: {
                            return false;
                        }
                    }
                    if (command.commandButtonId === DataProvider.CONST.SAVE_COMMAND_ID)
                        return false;
                }
            }
            return true;
        })
    }

}