import { useModel } from "@components/DatasetControl/useModel";
import { ICheckListDatasetControl } from "./CheckListDatasetControl";

/**
 * Returns the control backing the current mount — the field mapping, the dataset, the localization.
 *
 * No context of its own: the dataset control renderer already publishes the instance it was handed, and
 * every part of the checklist renders inside it. The cast is what that context cannot carry, since it
 * types the instance as the generic `IDatasetControl` — and a checklist is only ever built with a
 * {@link CheckListDatasetControl}.
 *
 * @throws Outside a `CheckList`.
 */
export const useDatasetControl = (): ICheckListDatasetControl => {
    return useModel().getDatasetControl() as ICheckListDatasetControl;
}

/**
 * Returns the service resolving every string the checklist renders.
 * @throws Outside a `CheckList`.
 */
export const useLocalizationService = () => {
    return useDatasetControl().getLocalizationService();
}
