import { GlobalContext, IGlobalContextParams } from "./GlobalContext";

export interface IUtilityParams {
    globalContext?: IGlobalContextParams | Xrm.GlobalContext;
}

export class Utility {
    private _globalContext: Xrm.GlobalContext;

    constructor(params: IUtilityParams = {}) {
        this._globalContext = params.globalContext instanceof GlobalContext
            ? params.globalContext as any
            : params.globalContext
                ? new GlobalContext(params.globalContext as IGlobalContextParams) as any
                : new GlobalContext() as any;
    }

    public getGlobalContext(): Xrm.GlobalContext {
        return this._globalContext;
    }
}
