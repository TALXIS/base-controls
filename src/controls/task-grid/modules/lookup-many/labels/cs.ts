import { translateLabels } from "@core";
import { LOOKUP_MANY_LABELS } from "./en";

export const LOOKUP_MANY_LABELS_CS = translateLabels(LOOKUP_MANY_LABELS, {
    'lookupMany.noRecordsFound': 'Nebyly nalezeny žádné záznamy.',
    'lookupMany.loading': 'Načítání...',
    'lookupMany.loadLookupManyFailed': 'Související záznamy se nepodařilo načíst.',
    'lookupMany.remove': 'Odebrat {{ name }}',
});
