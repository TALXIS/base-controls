import { translateLabels } from "@labels";
import { CHECK_LIST_LABELS } from "./en";

export const CHECK_LIST_LABELS_CS = translateLabels(CHECK_LIST_LABELS, {
    'checkList.newItemPlaceholder': 'Přidat položku...',
    'checkList.markItemFinished': 'Označit jako dokončené',
    'checkList.deleteItem': 'Odstranit',
    'checkList.confirmDialog.deleteItem.text': 'Opravdu chcete tuto položku odstranit?',
});
