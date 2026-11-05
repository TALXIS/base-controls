import { IInternalDataProvider } from "@talxis/client-libraries";
import { DATASET_CONTROL_LABELS } from "../adapters/root/labels";
import type { IDatasetControlRuntime } from "./DatasetControlRuntime";

export interface IDatasetControlUnsavedChangesGuardParameters {
    runtime: IDatasetControlRuntime;
}

/** Asks before anything that reloads the provider throws its unsaved changes away. */
export class DatasetControlUnsavedChangesGuard {
    private _runtime: IDatasetControlRuntime;

    constructor(parameters: IDatasetControlUnsavedChangesGuardParameters) {
        this._runtime = parameters.runtime;
        this._runtime.lifecycle.events.addEventListener('onReady', this._onReady);
        this._runtime.lifecycle.events.addEventListener('onDestroyed', this._onDestroyed);
    }

    private _onReady = (): void => {
        (this._runtime.getProvider() as IInternalDataProvider).setInterceptor('__unsavedChangesBlocker', this._onBlock);
    };

    //the provider has no way to drop an interceptor
    private _onDestroyed = (): void => {
        (this._runtime.getProvider() as IInternalDataProvider | undefined)?.setInterceptor('__unsavedChangesBlocker', (parameters, defaultAction) => defaultAction(parameters));
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
