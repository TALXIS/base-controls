import { Formatting } from "@talxis/client-libraries";

export interface IGlobalContextUserSettingsParams {
    lcid?: number;
    formatInfoCultureName?: string;
}

export interface IGlobalContextParams {
    userSettings?: IGlobalContextUserSettingsParams;
}

type IXrmUserSettings = Xrm.UserSettings & {
    formatInfoCultureName?: string;
};

export class GlobalContext {
    public readonly userSettings: Xrm.UserSettings;

    constructor(params: IGlobalContextParams = {}) {
        this.userSettings = {
            dateFormattingInfo: {} as any,
            defaultDashboardId: "",
            formatInfoCultureName: params.userSettings?.formatInfoCultureName ?? "en-US",
            isGuidedHelpEnabled: false,
            isHighContrastEnabled: false,
            isRTL: false,
            languageId: params.userSettings?.lcid ?? 1033,
            roles: {
                get: () => [] as any,
                getLength: () => 0,
                forEach: () => undefined,
            } as any,
            securityRolePrivileges: [],
            securityRoles: [],
            transactionCurrency: {
                id: "",
                entityType: "",
                name: "",
            },
            transactionCurrencyId: "",
            userId: "",
            userName: "",
            getTimeZoneOffsetMinutes: () => 0,
        } as IXrmUserSettings;
    }

    public initializeFormatting(): void {
        const formatting = Formatting.Get((this.userSettings as IXrmUserSettings).formatInfoCultureName);
        this.userSettings.dateFormattingInfo = formatting.dateFormattingInfo as any;
    }
}
