import { translateLabels } from "@utils";
import { GANTT_NON_WORKING_DAYS_LABELS } from "./labels";

export const GANTT_NON_WORKING_DAYS_LABELS_CS = translateLabels(GANTT_NON_WORKING_DAYS_LABELS, {
    'ganttNonWorkingDays.hideNonWorkingDays': 'Skrýt nepracovní dny',
    'ganttNonWorkingDays.weekend': 'Víkend',
    'ganttNonWorkingDays.loadNonWorkingDaysFailed': 'Nepracovní dny se nepodařilo načíst.',
});
