import { translateLabels } from "@utils";
import { GANTT_LINKS_LABELS } from "./labels";

export const GANTT_LINKS_LABELS_CS = translateLabels(GANTT_LINKS_LABELS, {
    'ganttLinks.confirmDeleteLink': 'Odstranit tuto závislost?',
    'ganttLinks.linkStart': ' (začátek)',
    'ganttLinks.linkEnd': ' (konec)',
    'ganttLinks.dependency': 'Závislost',
    'ganttLinks.predecessor': 'Předchůdce',
    'ganttLinks.successor': 'Následník',
    'ganttLinks.finishToStart': 'Konec → začátek',
    'ganttLinks.startToStart': 'Začátek → začátek',
    'ganttLinks.finishToFinish': 'Konec → konec',
    'ganttLinks.startToFinish': 'Začátek → konec',
});
