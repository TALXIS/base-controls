import { IDateTimeTranslations } from "./interfaces";

export const getDateTimeTranslations = (userSettings: ComponentFramework.UserSettings): IDateTimeTranslations => {
    return {
        time: {
            1029: 'Čas',
            1033: 'Time'
        },
        days: userSettings.dateFormattingInfo.dayNames,
        months: userSettings.dateFormattingInfo.monthNames,
    }
}


/* days: ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'],
shortDays: ['N', 'P', 'Ú', 'S', 'Č', 'P', 'S'],
months: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Zaří', 'Říjen', 'Listopad', 'Prosinec'],
shortMonths: ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'],
prevMonthAriaLabel: 'Přejít na předchozí měsíc',
nextMonthAriaLabel: 'Přejít na další měsíc',
prevYearAriaLabel: 'Přejít na předchozí rok',
nextYearAriaLabel: 'Přejít na další rok', */