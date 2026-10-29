import { translateLabels } from "@utils";
import { GRID_LABELS } from "./labels";

export const GRID_LABELS_CS = translateLabels(GRID_LABELS, {
    'grid.noRecordsFound': 'Nebyly nalezeny žádné záznamy.',
    'grid.valueLocked': 'Tuto hodnotu nelze upravit.',
    'grid.recordLocked': 'Tento záznam nelze upravit.',
    'grid.columnLocked': 'Tento sloupec nelze upravit.',
    'grid.recordSaveErrorTitle': 'Vaše změny nebyly uloženy',
    'grid.recordSaveErrorDismiss': 'Zavřít',
});
