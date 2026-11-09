import { ITranslations } from "@interfaces/context";
import { ITranslation } from "@hooks/useControlLabels";

/**
 * The strings the core control itself shows. Every module carries its own, next to the UI that shows them,
 * so a map without the search module never ships the search strings.
 */
export const mapLabels = {
    mapProvider: {
        1033: "Map provider",
        1029: "Poskytovatel mapy"
    },
    loadingPins: {
        1033: "Loading pins... {{count}}",
        1029: "Načítání bodů... {{count}}"
    },
    pinsTruncated: {
        1033: "Showing the first {{count}} pins of this view.",
        1029: "Zobrazeno prvních {{count}} bodů tohoto pohledu."
    }
};

export type IMapTranslations = Partial<ITranslations<typeof mapLabels>>;

/** The core labels resolved for the current language. Handed to providers so their chrome can be localized too. */
export type IMapLabels = Required<ITranslation<IMapTranslations>>;
