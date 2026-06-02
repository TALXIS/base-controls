import type { FormModel } from "../FormModel";

export class XrmExecutionContext {
    private _form: FormModel;
    private _sharedVariables = new Map<string, any>();
    private _eventArgs: any = null;
    private _depth = 0;

    constructor(form: FormModel) {
        this._form = form;
    }

    getContext(): Xrm.GlobalContext {
        return (typeof Xrm !== 'undefined' ? Xrm.Utility?.getGlobalContext?.() : undefined) as Xrm.GlobalContext;
    }

    getFormContext(): Xrm.FormContext {
        return this._form.getFormContext();
    }

    /**
     * Returns the 1-based index of this handler in the event pipeline.
     * Set by the event dispatcher before invoking each handler.
     */
    getDepth(): number {
        return this._depth;
    }

    /**
     * Returns the event-specific arguments object for the current event
     * (e.g. `XrmOnLoadEventArgs` or `XrmOnSaveEventArgs`), or `null` for
     * events that carry no args (Loaded, OnChange).
     */
    getEventArgs(): any {
        return this._eventArgs;
    }

    getEventSource(): any {
        return this._form.getFormContext();
    }

    getSharedVariable<T>(key: string): T {
        return this._sharedVariables.get(key) as T;
    }

    setSharedVariable(key: string, value: any): void {
        this._sharedVariables.set(key, value);
    }

    // ------------------------------------------------------------------
    // Internal mutators called by the event dispatcher
    // ------------------------------------------------------------------

    /** @internal Set by dispatcher before invoking each handler (1-based). */
    setDepth(depth: number): void {
        this._depth = depth;
    }

    /** @internal Set by dispatcher to provide event-specific args. */
    setEventArgs(args: any): void {
        this._eventArgs = args;
    }

    /** @internal Clear shared variables and reset depth between independent dispatches. */
    resetForDispatch(): void {
        this._sharedVariables.clear();
        this._depth = 0;
        this._eventArgs = null;
    }
}
