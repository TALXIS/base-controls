import { EventEmitter, ICommand, IDataProvider, IRecord } from "@talxis/client-libraries";

export interface IGridInlineRibbonModelEvents {
    onBeforeCommandsRefresh: () => void;
    onAfterCommandsRefresh: () => void;
}

interface IDeps {
    getRecord: () => IRecord;
    getCommandButtonIds: () => string[];
    getProvider: () => IDataProvider;
}

export class GridInlineRibbonModel {
    public readonly events = new EventEmitter<IGridInlineRibbonModelEvents>();
    private _deps: IDeps;
    private _commands: ICommand[] = [];
    private _loading: boolean = true;
    private _recordUnsubscribes: (() => void)[] = [];
    constructor(deps: IDeps) {
        this._deps = deps;
        this._addEventListeners();
    }

    public getCommands(): ICommand[] {
        return this._commands;
    }
    public destroy() {
        this._recordUnsubscribes.forEach(unsubscribe => unsubscribe());
    }
    public isLoading(): boolean {
        return this._loading;
    }
    public refreshCommands = async () => {
        this._loading = true;
        this.events.dispatchEvent('onBeforeCommandsRefresh');
        try {
            this._commands = await this._getProvider().retrieveRecordCommand({
                recordIds: [this._getRecord().getRecordId()],
                refreshAllRules: true,
                isInline: true,
                isGrouped: this._getRecord().getSummarizationType() === 'grouping'
            })
        }
        finally {
            this._loading = false;
            this.events.dispatchEvent('onAfterCommandsRefresh');
        }
    }

    private _addEventListeners() {
        this._recordUnsubscribes = [
            this._getRecord().addEventListener('onFieldValueChanged', this.refreshCommands),
            this._getRecord().addEventListener('onAfterSaved', this.refreshCommands),
        ];
    }
    private _getRecord() {
        return this._deps.getRecord();
    }
    private _getProvider() {
        return this._deps.getProvider();
    }
}