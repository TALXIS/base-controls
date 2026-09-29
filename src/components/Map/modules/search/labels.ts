import { IMapModuleLabels, IMapModuleTranslations } from '../useModuleLabels';

export const searchLabels = {
    searchPlaceholder: {
        1033: "Search {{columns}}, or an address",
        1029: "Hledat {{columns}}, nebo adresu"
    },
    searchPlaceholderNoColumns: {
        1033: "Search for an address",
        1029: "Hledat adresu"
    },
    searchRecords: {
        1033: "Search the records",
        1029: "Vyhledat v záznamech"
    },
    searchPlaces: {
        1033: "Places",
        1029: "Místa"
    },
    searchLooking: {
        1033: "Looking...",
        1029: "Vyhledávám..."
    },
    searchClear: {
        1033: "Clear the search",
        1029: "Zrušit hledání"
    }
};

export type IMapSearchTranslations = IMapModuleTranslations<typeof searchLabels>;
export type IMapSearchLabels = IMapModuleLabels<typeof searchLabels>;
