import { useContext, useMemo } from "react";
import type { ILabelSet } from "./defineLabels";
import { LocalizationContext } from "./LocalizationProvider";
import type { LocalizationService } from "./LocalizationService";
import type { ILabels, Labels } from "./types";

/** The nearest provider's service, for handing on to a runtime. */
export const useLocalization = (): LocalizationService => {
    return useContext(LocalizationContext);
};

/** The strings of one set, as the nearest provider gives them. */
export const useLabels = <T extends Labels>(set: ILabelSet<T>): ILabels<T> => {
    const localization = useLocalization();
    return useMemo(() => localization.getLabels(set), [localization, set]);
};
