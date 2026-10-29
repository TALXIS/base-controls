import { translateLabels } from "@utils";
import { CHECK_LIST_LABELS } from "./labels";

export const CHECK_LIST_LABELS_CS = translateLabels(CHECK_LIST_LABELS, {
    'checkList.newItemPlaceholder': 'Přidat položku...',
    'checkList.markItemFinished': 'Označit jako dokončené',
    'checkList.deleteItem': 'Odstranit',
    'checkList.confirmDialog.deleteItem.text': 'Opravdu chcete tuto položku odstranit?',
});
