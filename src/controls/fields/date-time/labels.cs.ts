import { translateLabels } from "@utils";
import { DATE_TIME_LABELS } from "./labels";

export const DATE_TIME_LABELS_CS = translateLabels(DATE_TIME_LABELS, {
    'dateTime.time': 'Čas',
    'dateTime.goToToday': 'Přejít na dnešek',
    'dateTime.invalidTimeInput': 'Neplatný časový formát.'
});
