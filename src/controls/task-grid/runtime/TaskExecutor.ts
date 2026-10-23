import { ErrorHelper } from "@utils/error-handling";
import type { ITaskExecuteError, ITaskExecuteLoading, ITaskExecuteOptions, ITaskRuntime } from "./interfaces";

interface IRun {
    message?: string;
}

/** Runs operations with the grid's loading overlay, and shows each failure once. */
export class TaskExecutor {
    private _runtime: ITaskRuntime;
    private _runs: IRun[] = [];
    //a nested run rethrows an error the inner one already showed
    private _shownErrors = new WeakSet<object>();

    constructor(runtime: ITaskRuntime) {
        this._runtime = runtime;
    }

    public async execute<T>(operation: () => Promise<T>, options?: ITaskExecuteOptions): Promise<T | undefined> {
        const run = this._startLoading(options?.loading);
        try {
            return await operation();
        }
        catch (error) {
            await this._showError(error, options?.error);
            if (options?.error?.rethrow === false) {
                return undefined;
            }
            throw error;
        }
        finally {
            this._endLoading(run);
        }
    }

    private _startLoading(loading?: ITaskExecuteLoading): IRun | undefined {
        if (loading?.show === false) {
            return undefined;
        }
        const run: IRun = { message: loading?.message };
        this._runs.push(run);
        this._runtime.getProvider().setLoading(true, run.message);
        return run;
    }

    private _endLoading(run: IRun | undefined): void {
        if (run) {
            this._runs.splice(this._runs.indexOf(run), 1);
        }
        //the latest run still going shows its message again
        const latest = this._runs[this._runs.length - 1];
        if (latest) {
            this._runtime.getProvider().setLoading(true, latest.message);
            return;
        }
        if (run) {
            this._runtime.getProvider().setLoading(false);
        }
        this._shownErrors = new WeakSet();
    }

    private async _showError(error: unknown, options?: ITaskExecuteError): Promise<void> {
        const isObject = typeof error === 'object' && error !== null;
        if (isObject && this._shownErrors.has(error)) {
            return;
        }
        if (isObject) {
            this._shownErrors.add(error);
        }
        const message = options?.title ?? this._runtime.getLabels().getLocalizedString('actionFailed');
        await this._runtime.services.get('pcfContext').navigation.openErrorDialog({ message, details: ErrorHelper.getMessageFromError(error) });
    }
}
