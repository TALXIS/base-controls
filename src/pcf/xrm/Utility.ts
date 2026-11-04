import { GlobalContext } from "./GlobalContext";
import { notImplemented } from "./utils";

export class Utility {
    private _globalContext: Xrm.GlobalContext;

    constructor(globalContext?: Xrm.GlobalContext) {
        this._globalContext = globalContext ?? new GlobalContext() as any;
    }

    public getGlobalContext(): Xrm.GlobalContext {
        return this._globalContext;
    }

    public getEntityMetadata(entityName: string, attributes?: string[]): Promise<Xrm.Metadata.EntityMetadata> {
        void entityName;
        void attributes;
        return notImplemented("Utility.getEntityMetadata");
    }
}
