import { translateLabels } from "@utils";
import { DURATION_LABELS } from "./labels";

export const DURATION_LABELS_CS = translateLabels(DURATION_LABELS, {
    'duration.minuteWords': 'min, minuta, minuty, minute, minutu, minutě, minutou, minut, minutám, minutách, minutami, minutam, minutach',
    'duration.hourWords': 'hod, hodina, hodiny, hodině, hodinu, hodinou, hodine, hodin, hodinám, hodinách, hodinami, hodinam, hodinach',
    'duration.dayWords': 'den, dne, dni, dnu, dnem, dny, dnů, dnům, dnech, dní, dnom'
});
