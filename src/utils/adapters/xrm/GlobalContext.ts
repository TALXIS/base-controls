import { IInternalXrmUserSettings, IUserSettingsParams, IXrmUserSettings, UserSettings } from "./UserSettings";

export interface IGlobalContextUserSettingsParams extends IUserSettingsParams {}

export interface IGlobalContextParams {
    userSettings?: IGlobalContextUserSettingsParams;
}

export class GlobalContext {
    public readonly userSettings: IXrmUserSettings;

    constructor(params: IGlobalContextParams = {}) {
        this.userSettings = new UserSettings(params.userSettings);
    }

    public initializeFormatting(): void {
        (this.userSettings as IInternalXrmUserSettings).initializeFormatting();
    }
}
