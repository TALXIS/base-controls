import { translateLabels } from "@core";
import { LINKS_LABELS } from "./en";

export const LINKS_LABELS_CS = translateLabels(LINKS_LABELS, {
    'links.confirmDeleteLink': 'Odstranit tuto závislost?',
    'links.linkStart': ' (začátek)',
    'links.linkEnd': ' (konec)',
    'links.predecessor': 'Předchůdce',
    'links.successor': 'Následník',
    'links.finishToStart': 'Konec → začátek',
    'links.startToStart': 'Začátek → začátek',
    'links.finishToFinish': 'Konec → konec',
    'links.startToFinish': 'Začátek → konec',
});
