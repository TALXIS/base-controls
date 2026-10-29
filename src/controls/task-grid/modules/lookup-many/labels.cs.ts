import { translateLabels } from "@utils";
import { LOOKUP_MANY_LABELS } from "./labels";

export const LOOKUP_MANY_LABELS_CS = translateLabels(LOOKUP_MANY_LABELS, {
    'lookupMany.noRecordsFound': 'Nebyly nalezeny žádné záznamy.',
    'lookupMany.loading': 'Načítání...',
    'lookupMany.loadLookupManyFailed': 'Související záznamy se nepodařilo načíst.',
});
