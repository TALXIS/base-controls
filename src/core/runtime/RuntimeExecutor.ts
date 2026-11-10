import { EventEmitter } from "@talxis/client-libraries";
import type { IEventSubscriber } from "../events";
import type { IRuntimeLoading } from "./RuntimeLoading";

export interface IRuntimeExecuteLoading {
    /** `false` runs the operation in the background; defaults to `true`. */
    show?: boolean;
    /** Drawn under the spinner. */
    message?: string;
}

export interface IRuntimeExecuteError {
    /** Titles the shown error; the details come from what the operation threw. */
    title?: string;
    /** `false` resolves `undefined` instead of throwing; defaults to `true`. */
    rethrow?: boolean;
}

export interface IRuntimeExecuteParameters {
    loading?: IRuntimeExecuteLoading;
    error?: IRuntimeExecuteError;
}

export interface IRuntimeExecutorEvents {
    /** Fires once per thrown error, however many runs it passes through. */
    onExecuteFailed: (error: unknown, title?: string) => void;
}

/** Runs operations that may throw, such as a consumer's code. */
export interface IRuntimeExecutor {
    readonly events: IEventSubscriber<IRuntimeExecutorEvents>;
    /** Runs the operation under the loading and reports its failure. */
    execute<T>(operation: () => T | Promise<T>, parameters: IRuntimeExecuteParameters & { error: { rethrow: false } }): Promise<T | undefined>;
    execute<T>(operation: () => T | Promise<T>, parameters?: IRuntimeExecuteParameters): Promise<T>;
}

export interface IRuntimeExecutorParameters {
    /** Shown while a run waits. */
    loading: IRuntimeLoading;
}

export class RuntimeExecutor implements IRuntimeExecutor {
    public readonly events = new EventEmitter<IRuntimeExecutorEvents>();
    private _loading: IRuntimeLoading;
    private _runningCount = 0;
    //an outer run rethrows what an inner one already reported
    private _reportedErrors = new WeakSet<object>();

    constructor(parameters: IRuntimeExecutorParameters) {
        this._loading = parameters.loading;
    }

    public execute<T>(operation: () => T | Promise<T>, parameters: IRuntimeExecuteParameters & { error: { rethrow: false } }): Promise<T | undefined>;
    public execute<T>(operation: () => T | Promise<T>, parameters?: IRuntimeExecuteParameters): Promise<T>;
    public async execute<T>(operation: () => T | Promise<T>, parameters?: IRuntimeExecuteParameters): Promise<T | undefined> {
        const hideLoading = parameters?.loading?.show === false ? undefined : this._loading.show(parameters?.loading?.message);
        this._runningCount++;
        try {
            return await operation();
        }
        catch (error) {
            this._report(error, parameters?.error?.title);
            if (parameters?.error?.rethrow === false) {
                return undefined;
            }
            throw error;
        }
        finally {
            hideLoading?.();
            this._runningCount--;
            if (this._runningCount === 0) {
                this._reportedErrors = new WeakSet();
            }
        }
    }

    private _report(error: unknown, title?: string): void {
        if (typeof error === 'object' && error !== null) {
            if (this._reportedErrors.has(error)) {
                return;
            }
            this._reportedErrors.add(error);
        }
        this.events.dispatchEvent('onExecuteFailed', error, title);
    }
}
