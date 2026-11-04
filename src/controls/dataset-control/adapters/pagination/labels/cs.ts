import { translateLabels } from "@core";
import { PAGINATION_LABELS } from "./en";

export const PAGINATION_LABELS_CS = translateLabels(PAGINATION_LABELS, {
    'pagination.firstPageTooltip': 'První stránka',
    'pagination.previousPageTooltip': 'Předchozí',
    'pagination.nextPageTooltip': 'Další',
    'pagination.currentPage': 'Stránka {{ number }}',
});
