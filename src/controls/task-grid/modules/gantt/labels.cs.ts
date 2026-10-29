import { translateLabels } from "@utils";
import { GANTT_LABELS } from "./labels";

export const GANTT_LABELS_CS = translateLabels(GANTT_LABELS, {
    'gantt.zoomSlider': 'Přiblížení',
    'gantt.zoomToFit': 'Přizpůsobit velikosti',
    'gantt.goToToday': 'Přejít na dnešek',
});
