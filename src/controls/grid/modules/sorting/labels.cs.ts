import { translateLabels } from "@utils";
import { GRID_SORTING_LABELS } from "./labels";

export const GRID_SORTING_LABELS_CS = translateLabels(GRID_SORTING_LABELS, {
    'gridSorting.sortTextAscending': 'Seřadit od A do Z',
    'gridSorting.sortTextDescending': 'Seřadit od Z do A',
    'gridSorting.sortDateAscending': 'Seřadit od nejstaršího',
    'gridSorting.sortDateDescending': 'Seřadit od nejnovějšího',
    'gridSorting.sortNumberAscending': 'Seřadit od nejmenšího',
    'gridSorting.sortNumberDescending': 'Seřadit od největšího',
    'gridSorting.sortTwoOptionsJoint': 'až',
    'gridSorting.clear': 'Vymazat',
    'gridSorting.menuSection': 'Řazení',
});
