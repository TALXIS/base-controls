import { IDurationTranslations } from "./interfaces";

export const getDefaultDurationTranslations = (): Required<IDurationTranslations> => {
    return {
        minute: {
            1029: 'Minuta',
            1033: 'Minute'
        },
        minutes: {
            1029: 'Minut',
            1033: 'Minutes'
        },
        hour: {
            1029: 'Hodina',
            1033: 'Hour'
        },
        hours: {
            1029: 'Hodiny',
            1033: 'Hours'
        },
        day: {
            1029: 'Den',
            1033: 'Day'
        },
        days: {
            1029: 'Dny',
            1033: 'Days'
        },
    };
};