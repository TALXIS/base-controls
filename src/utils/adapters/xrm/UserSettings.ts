import { Formatting } from "@talxis/client-libraries";

export interface IUserSettingsParams {
    lcid?: number;
    formatInfoCultureName?: string;
}

export interface IXrmUserSettings extends Xrm.UserSettings {
    formatInfoCultureName?: string;
}

export interface IInternalXrmUserSettings extends IXrmUserSettings {
    initializeFormatting(): void;
}

export class UserSettings implements IInternalXrmUserSettings {
    public dateFormattingInfo: any;
    public defaultDashboardId: string;
    public isGuidedHelpEnabled: boolean;
    public isHighContrastEnabled: boolean;
    public isRTL: boolean;
    public languageId: number;
    public numberFormattingInfo: any;
    public roles: Xrm.Collection.ItemCollection<Xrm.LookupValue>;
    public securityRolePrivileges: string[];
    public securityRoles: string[];
    public transactionCurrency: Xrm.LookupValue;
    public transactionCurrencyId: string;
    public userId: string;
    public userName: string;
    public formatInfoCultureName?: string;

    constructor(params: IUserSettingsParams = {}) {
        this.defaultDashboardId = "";
        this.isGuidedHelpEnabled = false;
        this.isHighContrastEnabled = false;
        this.isRTL = false;
        this.languageId = params.lcid ?? 1033;
        this.securityRolePrivileges = [];
        this.securityRoles = [];
        this.transactionCurrency = {
            id: "",
            entityType: "",
            name: "",
        };
        this.transactionCurrencyId = "";
        this.userId = "";
        this.userName = "";
        this.formatInfoCultureName = params.formatInfoCultureName ?? "en-US";
        this.roles = {
            get: () => [] as any,
            getLength: () => 0,
            forEach: () => undefined,
        } as any;
        if (window.Xrm) {
            this.initializeFormatting();
        }
    }

    public getTimeZoneOffsetMinutes(): number {
        return 0;
    }

    public initializeFormatting(): void {
        const formatting = Formatting.Get(this.formatInfoCultureName);
        this.dateFormattingInfo = formatting.dateFormattingInfo as any;
        this.numberFormattingInfo = formatting.numberFormattingInfo as any;
    }
}
