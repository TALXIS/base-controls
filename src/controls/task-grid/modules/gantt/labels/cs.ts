import { translateLabels } from "@core";
import { GANTT_LABELS } from "./en";

export const GANTT_LABELS_CS = translateLabels(GANTT_LABELS, {
    'gantt.zoomSlider': 'Přiblížení',
    'gantt.zoomToFit': 'Přizpůsobit velikosti',
    'gantt.goToToday': 'Přejít na dnešek',
    'gantt.showTask': 'Zobrazit na časové ose',
});
