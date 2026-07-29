import { Client, Formatting } from "@talxis/client-libraries";
import { XrmFactory } from "@utils/adapters/xrm";
import { Device } from "./Device";
import { FactoryApi, IFactoryApiParams } from "./FactoryApi";
import { IModeParams, Mode } from "./Mode";
import { Resources } from "./Resources";
import { ControlTheme } from "@utils/theme";

interface IPcfContextUserSettingsParams {
    lcid?: number;
    formatInfoCultureName?: string;
}

interface IPcfContextFactoryParams {
    baseContext?: ComponentFramework.Context<any, any>;
    userSettings?: IPcfContextUserSettingsParams;
    mode?: IModeParams;
    factory?: IFactoryApiParams;
    fluentDesignLanguage?: ComponentFramework.FluentDesignState
}

/**
 * Creates a PCF context by reusing surfaces from an existing base context when
 * available and filling the remaining gaps with local sample implementations.
 */
export class PcfContextFactory {
    /**
     * Builds a PCF context from the provided base context and per-surface
     * override params.
     */
    public static createContext(params: IPcfContextFactoryParams = {}): ComponentFramework.Context<any, any> {
        const { baseContext, userSettings, mode, factory, fluentDesignLanguage } = params;
        const xrm = XrmFactory.createXrm({ userSettings });

        const context: ComponentFramework.Context<any, any> = {
            formatting: Formatting.Get(),
            client: new Client(),
            userSettings: baseContext?.userSettings ?? xrm.Utility.getGlobalContext().userSettings as any,
            events: baseContext?.events ?? {},
            mode: baseContext?.mode ?? new Mode(mode),
            webAPI: baseContext?.webAPI ?? xrm.WebApi as any,
            navigation: baseContext?.navigation ?? xrm.Navigation as any,
            utils: baseContext?.utils ?? xrm.Utility as any,
            device: baseContext?.device ?? new Device(),
            parameters: baseContext?.parameters ?? {},
            updatedProperties: baseContext?.updatedProperties ?? [],
            resources: baseContext?.resources ?? new Resources(),
            factory: baseContext?.factory ?? this._createFactoryApi(factory),
            //fluentDesignLanguage: fluentDesignLanguage ?? baseContext?.fluentDesignLanguage
        };
        context.userSettings.numberFormattingInfo = Formatting.Get().numberFormattingInfo;
        return context;
    }

    /**
     * Creates the sample factory surface and wires the optional requestRender
     * callback through the factory event emitter.
     */
    private static _createFactoryApi(params?: IFactoryApiParams): ComponentFramework.Factory {
        const factory = new FactoryApi();
        if (params?.requestRender) {
            factory.events.addEventListener("onRequestRender", () => params.requestRender?.());
        }
        return factory;
    }
}