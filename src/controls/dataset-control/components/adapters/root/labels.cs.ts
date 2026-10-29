import { translateLabels } from "@utils";
import { DATASET_CONTROL_LABELS } from "./labels";

export const DATASET_CONTROL_LABELS_CS = translateLabels(DATASET_CONTROL_LABELS, {
    'dataset.unsavedChangesConfirmation': 'Tato akce zahodí všechny neuložené změny. Chcete pokračovat?',
});
