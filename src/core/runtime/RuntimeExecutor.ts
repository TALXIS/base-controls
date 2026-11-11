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

//an error shows once across every runtime it passes through
let runningCount = 0;
let reportedErrors = new WeakSet<object>();

export class RuntimeExecutor implements IRuntimeExecutor {
    public readonly events = new EventEmitter<IRuntimeExecutorEvents>();
    private _loading: IRuntimeLoading;

    constructor(parameters: IRuntimeExecutorParameters) {
        this._loading = parameters.loading;
    }

    public execute<T>(operation: () => T | Promise<T>, parameters: IRuntimeExecuteParameters & { error: { rethrow: false } }): Promise<T | undefined>;
    public execute<T>(operation: () => T | Promise<T>, parameters?: IRuntimeExecuteParameters): Promise<T>;
    public async execute<T>(operation: () => T | Promise<T>, parameters?: IRuntimeExecuteParameters): Promise<T | undefined> {
        const hideLoading = parameters?.loading?.show === false ? undefined : this._loading.show(parameters?.loading?.message);
        runningCount++;
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
            runningCount--;
            if (runningCount === 0) {
                reportedErrors = new WeakSet();
            }
        }
    }

    private _report(error: unknown, title?: string): void {
        if (typeof error === 'object' && error !== null) {
            if (reportedErrors.has(error)) {
                return;
            }
            reportedErrors.add(error);
        }
        this.events.dispatchEvent('onExecuteFailed', error, title);
    }
}
