import { useContext, useMemo } from "react";
import type { ILabelSet } from "./defineLabels";
import { LabelsContext } from "./LabelsProvider";
import type { LabelsService } from "./LabelsService";
import type { ILabels, Labels } from "./types";

/** The nearest provider's service, for handing on to a runtime. */
export const useLabelsService = (): LabelsService => {
    return useContext(LabelsContext);
};

/** The strings of one set, as the nearest provider gives them. */
export const useLabels = <T extends Labels>(set: ILabelSet<T>): ILabels<T> => {
    const labelsService = useLabelsService();
    return useMemo(() => labelsService.getLabels(set), [labelsService, set]);
};
