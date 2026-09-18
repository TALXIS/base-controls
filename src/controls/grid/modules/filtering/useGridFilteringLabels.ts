import { ILocalizationService } from "@utils";
import { useGridService } from "../../useGridService";
import { IGridFilteringLabels } from "./labels";

/** Resolves the filtering module's own strings. */
export const useGridFilteringLabels = (): ILocalizationService<IGridFilteringLabels> => {
    return useGridService('filtering')!.getLabels();
};
