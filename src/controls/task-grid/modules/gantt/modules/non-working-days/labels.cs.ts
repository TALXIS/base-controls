import { translateLabels } from "@utils";
import { NON_WORKING_DAYS_LABELS } from "./labels";

export const NON_WORKING_DAYS_LABELS_CS = translateLabels(NON_WORKING_DAYS_LABELS, {
    'nonWorkingDays.hideNonWorkingDays': 'Skrýt nepracovní dny',
    'nonWorkingDays.weekend': 'Víkend',
    'nonWorkingDays.loadNonWorkingDaysFailed': 'Nepracovní dny se nepodařilo načíst.',
});
