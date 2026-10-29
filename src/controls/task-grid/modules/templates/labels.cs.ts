import { translateLabels } from "@utils";
import { TEMPLATES_LABELS } from "./labels";

export const TEMPLATES_LABELS_CS = translateLabels(TEMPLATES_LABELS, {
    'templates.task': 'Úkol',
    'templates.fromTemplate': 'Ze šablony',
    'templates.saveAsTemplate': 'Uložit jako šablonu',
    'templates.searchTemplates': 'Hledat šablony',
    'templates.noTemplates': 'Nebyly nalezeny žádné šablony',
    'templates.creatingTasksFromTemplate': 'Vytváření úkolů ze šablony...',
    'templates.savingTemplate': 'Ukládání šablony...',
    'templates.templatesFailed': 'Šablonu se nepodařilo použít.',
});
