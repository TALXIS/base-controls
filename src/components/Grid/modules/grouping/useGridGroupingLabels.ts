import { ILocalizationService } from "@utils";
import { useGridService } from "../../grid/useGridService";
import { IGridGroupingLabels } from "./labels";

/**
 * Resolves the grouping module's own strings.
 *
 * Only its own components render them, and those only exist when the module does — so this is not
 * optional the way the service itself is.
 */
export const useGridGroupingLabels = (): ILocalizationService<IGridGroupingLabels> => {
    return useGridService('grouping')!.getLabels();
};
