import { IMapModuleLabels, IMapModuleTranslations } from '../useModuleLabels';

export const geocodingLabels = {
    geocodingAddresses: {
        1033: "Resolving addresses, one at a time... {{done}} of {{count}}",
        1029: "Vyhledávání adres, jedné po druhé... {{done}} z {{count}}"
    },
    geocodingFailed: {
        1033: "The geo-coding service could not be reached, so {{count}} records have no pin.",
        1029: "Geokódovací službu nebylo možné kontaktovat, takže {{count}} záznamů nemá bod."
    },
    geocodingUnplaceable: {
        1033: "{{count}} addresses could not be found by the geo-coding service, so those records have no pin.",
        1029: "{{count}} adres geokódovací služba nenašla, takže tyto záznamy nemají bod."
    },
    geocodingCapped: {
        1033: "{{count}} addresses were left without a pin for now: the geo-coding service's usage policy limits how many one view may resolve.",
        1029: "{{count}} adres zatím zůstalo bez bodu: pravidla použití geokódovací služby omezují, kolik jich lze v jednom pohledu vyhledat."
    }
};

export type IMapGeocodingTranslations = IMapModuleTranslations<typeof geocodingLabels>;
export type IMapGeocodingLabels = IMapModuleLabels<typeof geocodingLabels>;
