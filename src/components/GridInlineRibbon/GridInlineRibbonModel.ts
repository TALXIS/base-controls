import { EventEmitter, ICommand } from "@talxis/client-libraries";
import { IGridInlineRibbon } from "./interfaces";

export interface IGridInlineRibbonModelEvents {
    onLoading: (isLoading: boolean) => void;
}

export class GridInlineRibbonModel extends EventEmitter<IGridInlineRibbonModelEvents> {
    private _getProps: () => IGridInlineRibbon;
    private _commands: ICommand[] = [];
    private _loading: boolean = true;
    constructor(getProps: () => IGridInlineRibbon) {
        super();
        this._getProps = getProps;
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
        this.dispatchEvent('onLoading', true);
        this._loading = true;
        this._commands = await this._getDataProvider().retrieveRecordCommand({
            recordIds: [this._getRecord().getRecordId()]
        })
        this._loading = false;
        this.dispatchEvent('onLoading', false);
    }

    private _registerEventListeners() {
        this._getDataProvider().addEventListener('onRecordColumnValueChanged', this.refreshCommands);
        this._getDataProvider().addEventListener('onAfterRecordSaved', this.refreshCommands);
    }
    private _unregisterEventListeners() {
        this._getDataProvider().removeEventListener('onRecordColumnValueChanged', this.refreshCommands);
        this._getDataProvider().removeEventListener('onAfterRecordSaved', this.refreshCommands);
    }
    private _getRecord() {
        return this._getProps().parameters.Record.raw;
    }
    private _getDataProvider() {
        return this._getRecord().getDataProvider();
    }
}