import { ILocalizationService } from "@utils";
import { useGridService } from "../../grid/useGridService";
import { IGridFilteringLabels } from "./labels";

/**
 * Resolves the filtering module's own strings.
 *
 * Only its own components render them, and those only exist when the module does — so this is not
 * optional the way the service itself is.
 */
export const useGridFilteringLabels = (): ILocalizationService<IGridFilteringLabels> => {
    return useGridService('filtering')!.getLabels();
};
