import { Client, Formatting } from "@talxis/client-libraries";
import { Device } from "./Device";
import { FactoryApi, IFactoryApiParams } from "./FactoryApi";
import { IModeParams, Mode } from "./Mode";
import { Resources } from "./Resources";

interface IPcfContextFactoryParams {
    baseContext?: ComponentFramework.Context<any, any>;
    mode?: IModeParams;
    factory?: IFactoryApiParams;
}

export class PcfContextFactory {
    public static createContext(params: IPcfContextFactoryParams = {}): ComponentFramework.Context<any, any> {
        if(!window.Xrm) {
            //call the Xrm creation code?
        }
        const { baseContext, mode, factory } = params;

        return {
            formatting: Formatting.Get(),
            client: new Client(),
            userSettings: baseContext?.userSettings ?? window.Xrm.Utility.getGlobalContext().userSettings as any,
            events: baseContext?.events ?? {},
            mode: baseContext?.mode ?? new Mode(mode),
            webAPI: baseContext?.webAPI ?? window.Xrm.WebApi as any,
            navigation: baseContext?.navigation ?? window.Xrm.Navigation as any,
            utils: baseContext?.utils ?? window.Xrm.Utility as any,
            device: baseContext?.device ?? new Device(),
            parameters: baseContext?.parameters ?? {},
            updatedProperties: baseContext?.updatedProperties ?? [],
            resources: baseContext?.resources ?? new Resources(),
            factory: baseContext?.factory ?? this._createFactoryApi(factory),
        };
    }

    private static _createFactoryApi(params?: IFactoryApiParams): ComponentFramework.Factory {
        const factory = new FactoryApi();
        if (params?.requestRender) {
            factory.events.addEventListener("onRequestRender", () => params.requestRender?.());
        }
        return factory;
    }
}