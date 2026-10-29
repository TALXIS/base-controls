import { defineLabels } from "@utils";

/** The strings of the page size switcher. */
export const PAGE_SIZE_SWITCHER_LABELS = defineLabels({
    /** `start` and `end` are the first and last record on the page. */
    'pageSizeSwitcher.recordRange': '{{ start }} - {{ end }}',
    /** `total` is how many records there are. */
    'pageSizeSwitcher.recordTotal': 'of {{ total }}',
    /** The page size button's tooltip. */
    'pageSizeSwitcher.pageSizeTooltip': 'Records per page',
});
