import { EventEmitter, ICommand, IDataset, IRecord } from "@talxis/client-libraries";

export interface IGridInlineRibbonModelEvents {
    onBeforeCommandsRefresh: () => void;
    onAfterCommandsRefresh: () => void;
}

interface IDeps {
    onGetRecord: () => IRecord;
    onGetCommandButtonIds: () => string[];
    onGetDataset: () => IDataset;
}

export class GridInlineRibbonModel extends EventEmitter<IGridInlineRibbonModelEvents> {
    private _deps: IDeps;
    private _commands: ICommand[] = [];
    private _loading: boolean = true;
    constructor(deps: IDeps) {
        super();
        this._deps = deps;
        this._registerEventListeners();
    }

    public getCommands(): ICommand[] {
        return this._commands;
    }
    public destroy() {
        this._unregisterEventListeners();
    }
    public isLoading(): boolean {
        return this._loading;
    }
    public refreshCommands = async () => {
        this._loading = true;
        this.dispatchEvent('onBeforeCommandsRefresh');
        this._commands = await this._getDataset().getDataProvider().retrieveRecordCommand({
            recordIds: [this._getRecord().getRecordId()],
            refreshAllRules: true,
            isInline: true,
            isGrouped: this._getRecord().getSummarizationType() === 'grouping'
        })
        this._loading = false;
        this.dispatchEvent('onAfterCommandsRefresh');
    }

    private _registerEventListeners() {
        this._getRecord().addEventListener('onFieldValueChanged', this.refreshCommands);
        this._getRecord().addEventListener('onAfterSaved', this.refreshCommands);
    }
    private _unregisterEventListeners() {
        this._getRecord().removeEventListener('onFieldValueChanged', this.refreshCommands);
        this._getRecord().removeEventListener('onAfterSaved', this.refreshCommands);
    }
    private _getRecord() {
        return this._deps.onGetRecord();
    }
    private _getDataset() {
        return this._deps.onGetDataset();
    }
}