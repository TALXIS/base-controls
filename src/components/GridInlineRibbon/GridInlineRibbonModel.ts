import { EventEmitter, ICommand } from "@talxis/client-libraries";
import { IGridInlineRibbon } from "./interfaces";

export interface IGridInlineRibbonModelEvents {
    onBeforeCommandsRefresh: () => void;
    onAfterCommandsRefresh: () => void;
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
    public refreshCommands = async (refreshAllRules?: boolean) => {
        this._loading = true;
        this.dispatchEvent('onBeforeCommandsRefresh');
        this._commands = await this._getDataProvider().retrieveRecordCommand({
            recordIds: [this._getRecord().getRecordId()],
            specificCommands: this._getProps().parameters.CommandButtonIds?.raw?.split(',').map(id => id.trim()) ?? [],
            refreshAllRules: refreshAllRules ?? false
        })
        console.log(this._commands);
        this._loading = false;
        this.dispatchEvent('onAfterCommandsRefresh');
    }
    private _refreshCommandsWithRules = () => {
        this.refreshCommands(true);
    }

    private _registerEventListeners() {
        this._getRecord().addEventListener('onFieldValueChanged', this._refreshCommandsWithRules);
        this._getRecord().addEventListener('onAfterSaved', this._refreshCommandsWithRules);
    }
    private _unregisterEventListeners() {
        this._getRecord().removeEventListener('onFieldValueChanged',this._refreshCommandsWithRules);
        this._getRecord().removeEventListener('onAfterSaved', this._refreshCommandsWithRules);
    }
    private _getRecord() {
        return this._getProps().parameters.Record.raw;
    }
    private _getDataProvider() {
        return this._getRecord().getDataProvider();
    }
}