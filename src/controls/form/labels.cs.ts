import { translateLabels } from "@utils";
import { FORM_LABELS } from "./labels";

export const FORM_LABELS_CS = translateLabels(FORM_LABELS, {
    'form.save': 'Uložit',
    'form.saving': 'Ukládání...',
    'form.saved': 'Uloženo!',
    'form.unsavedChanges': 'Neuložené změny',
    'form.groupedNotificationsSummary': 'Máte oznámení: {{ count }}. Vyberte pro jejich zobrazení.',
});
