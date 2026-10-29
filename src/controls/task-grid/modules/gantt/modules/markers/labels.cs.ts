import { translateLabels } from "@utils";
import { GANTT_MARKERS_LABELS } from "./labels";

export const GANTT_MARKERS_LABELS_CS = translateLabels(GANTT_MARKERS_LABELS, {
    'ganttMarkers.today': 'Dnes',
    'ganttMarkers.projectStart': 'Začátek projektu',
    'ganttMarkers.projectEnd': 'Konec projektu',
    'ganttMarkers.loadMarkersFailed': 'Značky se nepodařilo načíst.',
});
