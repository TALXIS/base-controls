import { IDateTimeTranslations } from "./interfaces";

export const getDefaultDateTimeTranslations = (dateFormattingInfo: ComponentFramework.UserSettingApi.DateFormattingInfo): Required<IDateTimeTranslations> => {
    return {
        time: {
            1029: 'Čas',
            1033: 'Time'
        },
        goToToday: {
            1029: 'Přejít na dnešek',
            1033: 'Go to today'
        },
        invalidTimeInput: {
            1029: 'Neplatný časový formát.',
            1033: 'Invalid time format.'
        },
        days: dateFormattingInfo.dayNames,
        months: dateFormattingInfo.monthNames,
        shortDays: dateFormattingInfo.shortestDayNames,
        shortMonths: dateFormattingInfo.abbreviatedMonthNames,
    };
};