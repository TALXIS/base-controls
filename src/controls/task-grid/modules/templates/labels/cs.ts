import { translateLabels } from "@labels";
import { TEMPLATES_LABELS } from "./en";

export const TEMPLATES_LABELS_CS = translateLabels(TEMPLATES_LABELS, {
    'templates.task': 'Úkol',
    'templates.fromTemplate': 'Ze šablony',
    'templates.saveAsTemplate': 'Uložit jako šablonu',
    'templates.searchTemplates': 'Hledat šablony',
    'templates.noTemplates': 'Nebyly nalezeny žádné šablony',
    'templates.name': 'Název',
    'templates.savingTemplate': 'Ukládání šablony...',
    'templates.creatingTasks': 'Vytváření úkolů ze šablony...',
    'templates.templatesFailed': 'Šablonu se nepodařilo použít.',
});
