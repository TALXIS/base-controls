import { GlobalContext, IGlobalContextParams, IGlobalContextUserSettingsParams } from "./GlobalContext";
import { Navigation } from "./Navigation";
import { Utility } from "./Utility";
import { WebApi } from "./WebApi";

interface IXrmFactoryParams {
    userSettings?: IGlobalContextUserSettingsParams;
}

export class XrmFactory {
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