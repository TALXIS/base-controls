import { IMapModuleLabels, IMapModuleTranslations } from '../useModuleLabels';

export const filterLabels = {
    filters: {
        1033: "Filters",
        1029: "Filtry"
    },
    filtersActive: {
        1033: "Filters ({{count}})",
        1029: "Filtry ({{count}})"
    },
    filtersClear: {
        1033: "Clear the filters",
        1029: "Zrušit filtry"
    },
    filtersClose: {
        1033: "Close the filters",
        1029: "Zavřít filtry"
    }
};

export type IMapFilterTranslations = IMapModuleTranslations<typeof filterLabels>;
export type IMapFilterLabels = IMapModuleLabels<typeof filterLabels>;
