import { translateLabels } from "@core";
import { MARKERS_LABELS } from "./en";

export const MARKERS_LABELS_CS = translateLabels(MARKERS_LABELS, {
    'markers.today': 'Dnes',
    'markers.projectStart': 'Začátek projektu',
    'markers.projectEnd': 'Konec projektu',
    'markers.loadMarkersFailed': 'Značky se nepodařilo načíst.',
});
