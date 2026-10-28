import { ILocalizationService } from "@utils";
import { useGridModule } from "../../useGridModule";
import { IGridGroupingLabels } from "./labels";

/** Resolves the grouping module's own strings. */
export const useGridGroupingLabels = (): ILocalizationService<IGridGroupingLabels> => {
    return useGridModule('grouping').getLabels();
};
