export const getDefaultDateTimeTranslations = (dateFormattingInfo: ComponentFramework.UserSettingApi.DateFormattingInfo) => {
    return {
        time: {
            1029: 'Čas',
            1033: 'Time',
            1045: 'Czas'
        },
        goToToday: {
            1029: 'Přejít na dnešek',
            1033: 'Go to today',
            1045: 'Przejdź do dzisiaj'
        },
        invalidTimeInput: {
            1029: 'Neplatný časový formát.',
            1033: 'Invalid time format.',
            1045: 'Nieprawidłowy format czasu.'
        },
        days: dateFormattingInfo.dayNames,
        months: dateFormattingInfo.monthNames,
        shortDays: dateFormattingInfo.shortestDayNames,
        shortMonths: dateFormattingInfo.abbreviatedMonthNames,
    }
};