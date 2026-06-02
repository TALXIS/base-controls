/**
 * Event arguments for the form OnLoad event.
 * @see https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/events/form-onload
 */
export class XrmOnLoadEventArgs {
    private _errorCallback: ((error: Error) => void) | null = null;

    /**
     * Registers a callback to invoke if the async OnLoad handler rejects or times out.
     * Must be called synchronously before any `await` in the handler.
     */
    preventDefaultOnError(callback: (error: Error) => void): void {
        this._errorCallback = callback;
    }

    /** @internal */
    getErrorCallback(): ((error: Error) => void) | null {
        return this._errorCallback;
    }
}

/**
 * Event arguments for the form OnSave event.
 * @see https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/events/form-onsave
 */
export class XrmOnSaveEventArgs {
    private readonly _saveMode: number;
    private _prevented = false;
    private _asyncTimeoutDisabled = false;
    private _errorCallback: ((error: Error) => void) | null = null;

    constructor(saveMode: number = 1) {
        this._saveMode = saveMode;
    }

    /** Returns the save mode (e.g. 1 = Save, 2 = SaveAndClose). */
    getSaveMode(): number {
        return this._saveMode;
    }

    /** Returns whether `preventDefault()` has been called. */
    isDefaultPrevented(): boolean {
        return this._prevented;
    }

    /**
     * Cancels the save operation.
     * Must be called synchronously — calling after an `await` has no effect.
     */
    preventDefault(): void {
        this._prevented = true;
    }

    /**
     * Disables the 10-second per-handler async timeout for this handler.
     * Must be called synchronously before any `await` in the handler.
     */
    disableAsyncTimeout(): void {
        this._asyncTimeoutDisabled = true;
    }

    /**
     * Registers a callback to invoke if the async OnSave handler rejects or times out,
     * and additionally prevents the save operation in that case.
     */
    preventDefaultOnError(callback: (error: Error) => void): void {
        this._errorCallback = callback;
    }

    /** @internal */
    isAsyncTimeoutDisabled(): boolean {
        return this._asyncTimeoutDisabled;
    }

    /** @internal */
    getErrorCallback(): ((error: Error) => void) | null {
        return this._errorCallback;
    }
}
