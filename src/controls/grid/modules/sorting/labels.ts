import { defineLabels } from "@utils";

/** Every localizable string this module renders. */
export const GRID_SORTING_LABELS = defineLabels({
    'gridSorting.sortTextAscending': 'Sort A to Z',
    'gridSorting.sortTextDescending': 'Sort Z to A',
    'gridSorting.sortDateAscending': 'Sort older to newer',
    'gridSorting.sortDateDescending': 'Sort newer to older',
    'gridSorting.sortNumberAscending': 'Sort smaller to larger',
    'gridSorting.sortNumberDescending': 'Sort larger to smaller',
    'gridSorting.sortTwoOptionsJoint': 'to',
    /** The entry that clears what the column is sorted by. */
    'gridSorting.clear': 'Clear',
    /** What this module's section of a column's menu is called. */
    'gridSorting.menuSection': 'Sorting',
});
