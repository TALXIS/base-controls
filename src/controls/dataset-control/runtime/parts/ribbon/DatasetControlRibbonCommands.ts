import { IDataProvider, IInternalDataProvider } from "@talxis/client-libraries";
import type { IRibbonCommand, IRibbon } from "@controls/ribbon";
import type { IDatasetControlRibbonProps } from "../../../adapters/ribbon/Ribbon";
import type { IDatasetControlInternal } from "../../DatasetControlRuntime";
import { RIBBON_LABELS } from "../../../adapters/ribbon/labels";

export interface IDatasetControlRibbonCommandsParameters {
    provider: IDataProvider;
    datasetControl: IDatasetControlInternal;
    getProps: () => IDatasetControlRibbonProps;
}

/** The DatasetControl ribbon's own commands, and when the ribbon loads them again. */
export class DatasetControlRibbonCommands {
    private _provider: IInternalDataProvider;
    private _datasetControl: IDatasetControlInternal;
    private _getProps: () => IDatasetControlRibbonProps;
    private _ribbon?: IRibbon;
    private _wasDirty = false;

    constructor(parameters: IDatasetControlRibbonCommandsParameters) {
        this._provider = parameters.provider as IInternalDataProvider;
        this._datasetControl = parameters.datasetControl;
        this._getProps = parameters.getProps;
    }

    /**
     * Adds the commands to `ribbon` on every load, and reloads it when they change.
     * @returns Detaches from `ribbon`; the provider outlives it.
     */
    public attach(ribbon: IRibbon): () => void {
        this._ribbon = ribbon;
        const unsubscribes = [
            ribbon.hooks.commands.add(this._addCommands),
            this._provider.addEventListener('onRecordsSelected', this._onRecordsSelected),
            this._provider.addEventListener('onRecordColumnValueChanged', this._onDirtyStateChanged),
            this._provider.addEventListener('onAfterSaved', this._onDirtyStateChanged),
            this._provider.addEventListener('onNewDataLoaded', this._onDirtyStateChanged),
        ];
        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe());
            if (this._ribbon === ribbon) {
                this._ribbon = undefined;
            }
        };
    }

    private _addCommands = (commands: IRibbonCommand[]): void => {
        const props = this._getProps();
        const labels = this._datasetControl.getLabels(RIBBON_LABELS);
        const ownCommands: IRibbonCommand[] = [];
        this._wasDirty = this._provider.isDirty();
        if (props.enableSave && this._wasDirty) {
            ownCommands.push({ id: 'save', label: labels.get('ribbon.save'), iconName: 'Save', onExecute: () => this._save() });
        }
        if (props.enableDiscard && this._wasDirty) {
            ownCommands.push({ id: 'discard', label: labels.get('ribbon.discard'), iconName: 'Undo', onExecute: () => this._provider.clearChanges() });
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

    //only when Save and Discard appear or go, so typing does not reload the ribbon
    private _onDirtyStateChanged = (): void => {
        const props = this._getProps();
        if ((props.enableSave || props.enableDiscard) && this._provider.isDirty() !== this._wasDirty) {
            this._ribbon?.reload();
        }
    };
}
