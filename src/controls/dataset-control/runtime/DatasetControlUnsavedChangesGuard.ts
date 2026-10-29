import { IDataProvider, IInternalDataProvider } from "@talxis/client-libraries";
import { DATASET_CONTROL_LABELS } from "../components/adapters/root/labels";
import type { IDatasetControlRuntime } from "./DatasetControlRuntime";

export interface IDatasetControlUnsavedChangesGuardParameters {
    runtime: IDatasetControlRuntime;
}

/** Asks before anything that reloads the provider throws its unsaved changes away. */
export class DatasetControlUnsavedChangesGuard {
    private _runtime: IDatasetControlRuntime;

    constructor(parameters: IDatasetControlUnsavedChangesGuardParameters) {
        this._runtime = parameters.runtime;
        this._runtime.events.addEventListener('onLoaded', this._onLoaded);
    }

    private _onLoaded = (provider: IDataProvider): void => {
        (provider as IInternalDataProvider).setInterceptor('__unsavedChangesBlocker', this._onBlock);
    };

    private _onBlock = (parameters: any, defaultAction: (parameters: any) => any): any => {
        const provider = this._runtime.getProvider()!;
        if (!provider.isDirty()) {
            return defaultAction(parameters);
        }
        if (!window.confirm(this._runtime.getLabels(DATASET_CONTROL_LABELS).get('dataset.unsavedChangesConfirmation'))) {
            return undefined;
        }
        provider.clearChanges();
        return defaultAction(parameters);
    };
}
