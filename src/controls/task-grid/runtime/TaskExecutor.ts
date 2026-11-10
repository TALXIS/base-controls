import { ErrorHelper } from "@core/error-handling";
import { TASK_GRID_LABELS } from "../labels";
import type { ITaskExecuteError, ITaskExecuteLoading, ITaskExecuteParameters, ITaskRuntime } from "./interfaces";

/** Runs operations under the control's loading overlay, and shows each failure once. */
export class TaskExecutor {
    private _runtime: ITaskRuntime;
    private _runningCount = 0;
    //a nested run rethrows an error the inner one already showed
    private _shownErrors = new WeakSet<object>();

    constructor(runtime: ITaskRuntime) {
        this._runtime = runtime;
    }

    public async execute<T>(operation: () => Promise<T>, parameters?: ITaskExecuteParameters): Promise<T | undefined> {
        const hideLoading = this._showLoading(parameters?.loading);
        this._runningCount++;
        try {
            return await operation();
        }
        catch (error) {
            await this._showError(error, parameters?.error);
            if (parameters?.error?.rethrow === false) {
                return undefined;
            }
            throw error;
        }
        finally {
            hideLoading?.();
            this._runningCount--;
            if (this._runningCount === 0) {
                this._shownErrors = new WeakSet();
            }
        }
    }

    private _showLoading(loading?: ITaskExecuteLoading): (() => void) | undefined {
        if (loading?.show === false) {
            return undefined;
        }
        return this._runtime.services.get('datasetControl').loading.show(loading?.message);
    }

    private async _showError(error: unknown, options?: ITaskExecuteError): Promise<void> {
        const isObject = typeof error === 'object' && error !== null;
        if (isObject && this._shownErrors.has(error)) {
            return;
        }
        if (isObject) {
            this._shownErrors.add(error);
        }
        const message = options?.title ?? this._runtime.getLabels(TASK_GRID_LABELS).get('taskGrid.actionFailed');
        await this._runtime.services.get('pcfContext').navigation.openErrorDialog({ message, details: ErrorHelper.getMessageFromError(error) });
    }
}
