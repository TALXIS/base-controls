import type { FormModel } from "../FormModel";

export class XrmExecutionContext {
    private _form: FormModel;
    private _sharedVariables = new Map<string, any>();

    constructor(form: FormModel) {
        this._form = form;
    }

    getContext(): Xrm.GlobalContext {
        return (typeof Xrm !== 'undefined' ? Xrm.Utility?.getGlobalContext?.() : undefined) as Xrm.GlobalContext;
    }

    getFormContext(): Xrm.FormContext {
        return this._form.getFormContext();
    }

    getDepth(): number {
        return 0;
    }

    getEventArgs(): any {
        return null;
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
}
