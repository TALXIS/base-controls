import { translateLabels } from "@labels";
import { CHECKLIST_LABELS } from "./en";

export const CHECKLIST_LABELS_CS = translateLabels(CHECKLIST_LABELS, {
    'checklist.newItemPlaceholder': 'Přidat položku...',
    'checklist.markItemFinished': 'Označit jako dokončené',
    'checklist.deleteItem': 'Odstranit',
    'checklist.confirmDialog.deleteItem.text': 'Opravdu chcete tuto položku odstranit?',
});
