import { IDataProvider, IInternalDataProvider } from "@talxis/client-libraries";
import type { IRibbonCommand, IRibbonRuntime } from "@controls/ribbon";
import type { IDatasetControlRibbonProps } from "../../../adapters/ribbon/Ribbon";
import type { IDatasetControlRuntime } from "../../DatasetControlRuntime";
import { RIBBON_LABELS } from "../../../adapters/ribbon/labels";

export interface IDatasetControlRibbonCommandsParameters {
    provider: IDataProvider;
    datasetControl: IDatasetControlRuntime;
    onGetProps: () => IDatasetControlRibbonProps;
}

/** The DatasetControl ribbon's own commands, and when the ribbon loads them again. */
export class DatasetControlRibbonCommands {
    private _provider: IInternalDataProvider;
    private _datasetControl: IDatasetControlRuntime;
    private _onGetProps: () => IDatasetControlRibbonProps;
    private _ribbon?: IRibbonRuntime;
    private _wasDirty = false;
    private _unsubscribes: (() => void)[] = [];

    constructor(parameters: IDatasetControlRibbonCommandsParameters) {
        this._provider = parameters.provider as IInternalDataProvider;
        this._datasetControl = parameters.datasetControl;
        this._onGetProps = parameters.onGetProps;
    }

    /** Adds the commands to `ribbon` on every load, and reloads it when they change. */
    public attach(ribbon: IRibbonRuntime): void {
        this._ribbon = ribbon;
        this._unsubscribes = [
            ribbon.registerCommands(this._addCommands),
            this._provider.addEventListener('onRecordsSelected', this._onRecordsSelected),
            this._provider.addEventListener('onRecordColumnValueChanged', this._onDirtyStateChanged),
            this._provider.addEventListener('onAfterSaved', this._onDirtyStateChanged),
            this._provider.addEventListener('onNewDataLoaded', this._onDirtyStateChanged),
        ];
    }

    //the provider outlives the ribbon
    public destroy(): void {
        this._unsubscribes.forEach(unsubscribe => unsubscribe());
    }

    private _addCommands = (commands: IRibbonCommand[]): void => {
        const props = this._onGetProps();
        const labels = this._datasetControl.getLabels(RIBBON_LABELS);
        const ownCommands: IRibbonCommand[] = [];
        this._wasDirty = this._provider.isDirty();
        if (props.enableSave) {
            ownCommands.push({ id: 'save', label: labels.get('ribbon.save'), iconName: 'Save', isDisabled: !this._wasDirty, onExecute: () => this._save() });
        }
        if (props.enableRefresh) {
            ownCommands.push({ id: 'refresh', label: labels.get('ribbon.refresh'), iconName: 'Refresh', onExecute: () => this._refresh() });
        }
        commands.unshift(...ownCommands);
    };

    private async _save(): Promise<void> {
        await this._provider.save();
    }

    private async _refresh(): Promise<void> {
        await this._provider.executeWithUnsavedChangesBlocker(() => this._provider.refresh());
    }

    private _onRecordsSelected = (): void => {
        this._ribbon?.reload();
    };

    //only when Save turns on or off, so typing does not reload the ribbon
    private _onDirtyStateChanged = (): void => {
        if (this._onGetProps().enableSave && this._provider.isDirty() !== this._wasDirty) {
            this._ribbon?.reload();
        }
    };
}
