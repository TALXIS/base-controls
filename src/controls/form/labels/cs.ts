import { translateLabels } from "@core";
import { FORM_LABELS } from "./en";

export const FORM_LABELS_CS = translateLabels(FORM_LABELS, {
    'form.save': 'Uložit',
    'form.saving': 'Ukládání...',
    'form.saved': 'Uloženo!',
    'form.unsavedChanges': 'Neuložené změny',
    'form.groupedNotificationsSummary': 'Máte oznámení: {{ count }}. Vyberte pro jejich zobrazení.',
});
