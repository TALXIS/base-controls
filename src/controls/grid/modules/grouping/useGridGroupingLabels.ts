import { ILocalizationService } from "@utils";
import { useGridService } from "../../useGridService";
import { IGridGroupingLabels } from "./labels";

/** Resolves the grouping module's own strings. */
export const useGridGroupingLabels = (): ILocalizationService<IGridGroupingLabels> => {
    return useGridService('grouping')!.getLabels();
};
