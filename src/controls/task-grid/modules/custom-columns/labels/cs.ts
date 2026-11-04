import { translateLabels } from "@core";
import { CUSTOM_COLUMNS_LABELS } from "./en";

export const CUSTOM_COLUMNS_LABELS_CS = translateLabels(CUSTOM_COLUMNS_LABELS, {
    'customColumns.addCustomColumn': 'Přidat vlastní sloupec',
    'customColumns.editCustomColumn': 'Upravit vlastní sloupec',
    'customColumns.deleteCustomColumn': 'Odstranit vlastní sloupec',
    'customColumns.confirmColumnDelete': 'Chcete odstranit tento sloupec a jeho hodnoty ve všech úkolech?',
    'customColumns.customColumnsFailed': 'Vlastní sloupec se nepodařilo změnit.',
    'customColumns.loadCustomColumnsFailed': 'Hodnoty vlastních sloupců se nepodařilo načíst.',
    'customColumns.newColumnName': 'Vlastní sloupec {{ number }}',
    'customColumns.yes': 'Ano',
    'customColumns.no': 'Ne',
});
