import { EventEmitter, ICommand, IDataProvider, IRecord } from "@talxis/client-libraries";

export interface IGridInlineRibbonModelEvents {
    onBeforeCommandsRefreshed: () => void;
    onAfterCommandsRefreshed: () => void;
}

interface IDeps {
    onGetRecord: () => IRecord;
    onGetCommandButtonIds: () => string[];
    onGetProvider: () => IDataProvider;
}

export class GridInlineRibbonModel extends EventEmitter<IGridInlineRibbonModelEvents> {
    private _deps: IDeps;
    private _commands: ICommand[] = [];
    private _loading: boolean = true;
    private _recordUnsubscribes: (() => void)[] = [];
    constructor(deps: IDeps) {
        super();
        this._deps = deps;
        this._registerEventListeners();
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
        this.dispatchEvent('onBeforeCommandsRefreshed');
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
            this.dispatchEvent('onAfterCommandsRefreshed');
        }
    }

    private _registerEventListeners() {
        this._recordUnsubscribes = [
            this._getRecord().addEventListener('onFieldValueChanged', this.refreshCommands),
            this._getRecord().addEventListener('onAfterSaved', this.refreshCommands),
        ];
    }
    private _getRecord() {
        return this._deps.onGetRecord();
    }
    private _getProvider() {
        return this._deps.onGetProvider();
    }
}