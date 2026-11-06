import { translateLabels } from "@labels";
import { TASK_CHECKLIST_LABELS } from "./en";

export const TASK_CHECKLIST_LABELS_CS = translateLabels(TASK_CHECKLIST_LABELS, {
    'taskChecklist.checklist': 'Kontrolní seznam',
    'taskChecklist.loadChecklistFailed': 'Kontrolní seznamy se nepodařilo načíst.',
});
