import { GlobalContext, IGlobalContextParams, IGlobalContextUserSettingsParams } from "./GlobalContext";
import { Navigation } from "./Navigation";
import { Utility } from "./Utility";
import { WebApi } from "./WebApi";

interface IXrmFactoryParams {
    userSettings?: IGlobalContextUserSettingsParams;
}

/**
 * Creates the Xrm surface used by local adapter code.
 *
 * When a host page already provides `window.Xrm`, that instance is reused.
 * Otherwise a minimal fallback Xrm object is composed from the local sample
 * adapter classes.
 */
export class XrmFactory {
    /**
     * Returns the active Xrm instance, creating a minimal fallback when the
     * runtime does not provide one.
     */
    public static createXrm(params: IXrmFactoryParams = {}): Xrm.XrmStatic {
        if (window.Xrm) {
            return window.Xrm;
        }

        const globalContextParams: IGlobalContextParams = {
            userSettings: params.userSettings,
        };
        const globalContext = new GlobalContext(globalContextParams) as any;
        const utility = new Utility(globalContext);
        const xrm = {
            Utility: utility as any,
            Navigation: new Navigation() as any,
            WebApi: new WebApi() as any,
        } as Xrm.XrmStatic;

        window.Xrm = xrm;
        globalContext.initializeFormatting();

        return xrm;
    }
}