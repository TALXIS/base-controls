import { DateFormattingInfo, NumberFormattingInfo } from "./Formatting";

export class UserSettings implements ComponentFramework.UserSettings {
    dateFormattingInfo: ComponentFramework.UserSettingApi.DateFormattingInfo;
    isRTL: boolean;
    languageId: number;
    numberFormattingInfo: ComponentFramework.UserSettingApi.NumberFormattingInfo;
    securityRoles: string[];
    userId: string;
    userName: string;

    constructor() {
        this.userName = 'Test User';
        this.userId = '00000000-0000-0000-0000-000000000000';
        this.securityRoles = [];
        this.languageId = 1033;
        this.isRTL = false;
        this.numberFormattingInfo = new NumberFormattingInfo();
        this.dateFormattingInfo = new DateFormattingInfo();
    }

    getTimeZoneOffsetMinutes(date?: Date | undefined): number {
        // Sample implementation to get timezone offset in minutes
        if (!date) {
            date = new Date(); // If no date is provided, use the current date
        }
        return date.getTimezoneOffset(); // Return timezone offset in minutes
    }
}
