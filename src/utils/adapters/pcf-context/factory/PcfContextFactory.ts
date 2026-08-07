import { Client, Formatting } from "@talxis/client-libraries";
import { XrmFactory } from "@utils/adapters/xrm";
import { Device } from "./Device";
import { FactoryApi, IFactoryApiParams } from "./FactoryApi";
import { IModeParams, Mode } from "./Mode";
import { Resources } from "./Resources";
import { UserSettings } from "@utils/adapters/xrm/UserSettings";

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
 * Creates PCF context objects as a compatibility layer for non-PCF
 * environments.
 *
 * When a base context is provided, existing surfaces are reused. Missing
 * surfaces are filled from helper implementations or Xrm-backed fallbacks so
 * PCF-dependent code can continue to run even when no real PCF host is
 * available.
 */
export class PcfContextFactory {
    /**
     * Builds a context by combining the optional base context with generated
     * fallback implementations.
     *
     * Fallback precedence is:
     * provided `baseContext` surface -> generated fallback surface.
     *
     * The generated context always gets fresh formatting and client helpers,
     * and its `userSettings.numberFormattingInfo` is synchronized with the
     * current formatting configuration.
     *
     * @param params Optional inputs used to seed or override individual PCF
     * context surfaces.
     * @returns A context object shaped like a PCF runtime context.
     */
    public static createContext(params: IPcfContextFactoryParams = {}): ComponentFramework.Context<any, any> {
        const { baseContext, userSettings, mode, factory, fluentDesignLanguage } = params;
        const xrm = XrmFactory.createXrm({ userSettings });

        const context: ComponentFramework.Context<any, any> = {
            ...baseContext,
            formatting: Formatting.Get(userSettings?.formatInfoCultureName),
            client: new Client(),
            userSettings: baseContext?.userSettings ?? new UserSettings(userSettings),
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
            fluentDesignLanguage: fluentDesignLanguage ?? baseContext?.fluentDesignLanguage
        };
        context.userSettings.numberFormattingInfo = Formatting.Get().numberFormattingInfo;
        return context;
    }

    /**
        * Creates the fallback factory surface used when no base factory is
        * available.
        *
        * If `requestRender` is provided, it is forwarded through the factory's
        * `onRequestRender` event so consumers can react to render requests the
        * same way they would in a hosted PCF environment.
        *
        * @param params Optional factory configuration.
        * @returns A factory surface compatible with the PCF context contract.
     */
    private static _createFactoryApi(params?: IFactoryApiParams): ComponentFramework.Factory {
        const factory = new FactoryApi();
        if (params?.requestRender) {
            factory.events.addEventListener("onRequestRender", () => params.requestRender?.());
        }
        return factory;
    }
}