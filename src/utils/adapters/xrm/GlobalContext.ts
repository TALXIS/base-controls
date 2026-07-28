import { Formatting } from "@talxis/client-libraries";

export interface IGlobalContextParams {
    userSettings?: Xrm.UserSettings;
}

export class GlobalContext {
    public readonly userSettings: Xrm.UserSettings;

    constructor(params: IGlobalContextParams = {}) {
        this.userSettings = params.userSettings ?? {
            dateFormattingInfo: Formatting.Get().dateFormattingInfo as any,
            defaultDashboardId: "",
            isGuidedHelpEnabled: false,
            isHighContrastEnabled: false,
            isRTL: false,
            languageId: 1033,
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
        };
    }
}
