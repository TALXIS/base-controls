import { IDateTimeTranslations } from "./interfaces";

export const getDateTimeTranslations = (): IDateTimeTranslations => {
    return {
        goToday: {
            1029: 'Dnes',
            1033: 'Today'
        },
        time: {
            1029: 'Čas',
            1033: 'Time'
        }
    }
}