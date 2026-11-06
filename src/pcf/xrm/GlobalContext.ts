import { IXrmUserSettingsInternal, IUserSettingsParameters, IXrmUserSettings, UserSettings } from "./UserSettings";

export interface IGlobalContextUserSettingsParameters extends IUserSettingsParameters {}

export interface IGlobalContextParameters {
    userSettings?: IGlobalContextUserSettingsParameters;
}

export class GlobalContext {
    public readonly userSettings: IXrmUserSettings;

    constructor(parameters: IGlobalContextParameters = {}) {
        this.userSettings = new UserSettings(parameters.userSettings);
    }

    public initializeFormatting(): void {
        (this.userSettings as IXrmUserSettingsInternal).initializeFormatting();
    }
}
