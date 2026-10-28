import { ILocalizationService } from "@utils";
import { useGridModule } from "../../useGridModule";
import { IGridFilteringLabels } from "./labels";

/** Resolves the filtering module's own strings. */
export const useGridFilteringLabels = (): ILocalizationService<IGridFilteringLabels> => {
    return useGridModule('filtering').getLabels();
};
