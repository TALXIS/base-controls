import { Client, Formatting } from "@talxis/client-libraries";

interface IPcfContextFactoryParams {
    context?: ComponentFramework.Context<any, any>;
}


//we expect exrm to be present already? so this piece of code needs to be executed within the window.Xrm context, so the code populating the widnow object needs to run
export class PcfContextFactory {
    private _existingContext?: ComponentFramework.Context<any, any>;
    constructor(params: IPcfContextFactoryParams) {
        this._existingContext = params.context;
    }

    public createContext(): ComponentFramework.Context<any, any> {
        if (this._existingContext) {
            return this._existingContext;
        }
        return {
            //always use our formatting, lcid and format language taken from window.Xrm
            formatting: Formatting.Get(),
            client: new Client(),
            //@ts-ignore - typings, possibly replace the formatting with ours
            userSettings: window.Xrm.Utility.getGlobalContext().userSettings,
            events: {},
            mode: {},
            //@ts-ignore - typings
            webAPI: window.Xrm.WebApi,
            //@ts-ignore - typings
            navigation: window.Xrm.Navigation,
            //@ts-ignore - typings
            utils: window.Xrm.Utility,
            device: {},
            parameters: {},
            updatedProperties: [],
            resources: {},
            factory: {
            },


        }
    }
}