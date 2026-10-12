export interface IPageSizeSwitcherLabels {
    /** `start` and `end` are the first and last record on the page. */
    recordRange: string;
    /** `total` is how many records there are. */
    recordTotal: string;
    /** The page size button's tooltip. */
    pageSizeTooltip: string;
}

/** The English defaults for {@link IPageSizeSwitcherLabels}. */
export const PAGE_SIZE_SWITCHER_LABELS: IPageSizeSwitcherLabels = {
    recordRange: '{{ start }} - {{ end }}',
    recordTotal: 'of {{ total }}',
    pageSizeTooltip: 'Records per page',
};
