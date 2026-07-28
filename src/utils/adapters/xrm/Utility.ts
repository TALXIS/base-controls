import { GlobalContext, IGlobalContextParams } from "./GlobalContext";

export class Utility {
    private _globalContext: Xrm.GlobalContext;

    constructor(globalContext?: Xrm.GlobalContext) {
        this._globalContext = globalContext ?? new GlobalContext() as any;
    }

    public getGlobalContext(): Xrm.GlobalContext {
        return this._globalContext;
    }

    public setGlobalContext(globalContext: Xrm.GlobalContext): void {
        this._globalContext = globalContext;
    }
}
