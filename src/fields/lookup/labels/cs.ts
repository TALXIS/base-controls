import { translateLabels } from "@core";
import { LOOKUP_LABELS } from "./en";

export const LOOKUP_LABELS_CS = translateLabels(LOOKUP_LABELS, {
    'lookup.search': 'Vyhledejte',
    'lookup.newRecord': 'Nový záznam',
    'lookup.searching': 'Hledám...',
    'lookup.noRecordsFound': 'Nebyly nalezeny žádné záznamy',
    'lookup.resultsFrom': 'Výsledky z:',
    'lookup.noName': '(Bez názvu)',
    'lookup.placeholder': 'Vyhledejte',
    'lookup.record': 'Záznam',
    'lookup.all': 'Vše'
});
