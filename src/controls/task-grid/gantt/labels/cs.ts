import { translateLabels } from "@labels";
import { GANTT_LABELS } from "./en";

export const GANTT_LABELS_CS = translateLabels(GANTT_LABELS, {
    'gantt.zoomSlider': 'Přiblížení',
    'gantt.zoomOut': 'Oddálit',
    'gantt.zoomIn': 'Přiblížit',
    'gantt.zoomToFit': 'Přizpůsobit velikosti',
    'gantt.goToToday': 'Přejít na dnešek',
    'gantt.showTask': 'Zobrazit na časové ose',
});
