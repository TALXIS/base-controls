import { GlobalContext, IGlobalContextParams } from "./GlobalContext";
import { INavigationParams, Navigation } from "./Navigation";
import { IUtilityParams, Utility } from "./Utility";
import { IWebApiParams, WebApi } from "./WebApi";

interface IXrmFactoryParams {
    globalContext?: IGlobalContextParams;
    utility?: IUtilityParams;
    navigation?: INavigationParams;
    webApi?: IWebApiParams;
}

export class XrmFactory {
    public static createXrm(params: IXrmFactoryParams = {}): Xrm.XrmStatic {
        if (window.Xrm) {
            return window.Xrm;
        }

        const globalContext = new GlobalContext(params.globalContext);
        const utility = new Utility({
            ...params.utility,
            globalContext: params.utility?.globalContext ?? globalContext,
        });

        return {
            Utility: utility as any,
            Navigation: new Navigation() as any,
            WebApi: new WebApi() as any,
        } as Xrm.XrmStatic;
    }
}