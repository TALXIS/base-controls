import { translateLabels } from "@utils";
import { PAGE_SIZE_SWITCHER_LABELS } from "./labels";

export const PAGE_SIZE_SWITCHER_LABELS_CS = translateLabels(PAGE_SIZE_SWITCHER_LABELS, {
    'pageSizeSwitcher.recordRange': '{{ start }} - {{ end }}',
    'pageSizeSwitcher.recordTotal': 'z {{ total }}',
    'pageSizeSwitcher.pageSizeTooltip': 'Záznamů na stránku',
});
