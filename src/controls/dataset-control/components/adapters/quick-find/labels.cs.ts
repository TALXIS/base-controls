import { translateLabels } from "@utils";
import { QUICK_FIND_LABELS } from "./labels";

export const QUICK_FIND_LABELS_CS = translateLabels(QUICK_FIND_LABELS, {
    'quickFind.searchPlaceholder': 'Hledat {{ collection }}...',
    'quickFind.defaultCollectionName': 'záznamy',
    'quickFind.leadingWildcardWarning': 'Pro rychlejší výsledky nezačínejte hvězdičkou (*)',
    'quickFind.columnsHintStart': 'Použít',
    'quickFind.columnsHintOperator': 'začíná na',
    'quickFind.columnsHintEnd': 'filtr na tyto sloupce:',
});
