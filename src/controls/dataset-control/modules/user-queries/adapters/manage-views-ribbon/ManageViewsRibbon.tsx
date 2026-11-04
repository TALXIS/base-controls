import { useLabels } from "@labels";
import { usePcfContext } from "@pcf";
import { useDataProvider } from "@data";
import type { IRibbonCommand, IRibbonComponents } from "@controls/ribbon";
import { Ribbon } from "../../../../adapters/ribbon/Ribbon";
import type { DatasetControlUserQueries } from "../../DatasetControlUserQueries";
import { USER_QUERIES_LABELS } from "../../labels";

export interface IManageViewsRibbonProps {
    userQueries: DatasetControlUserQueries;
    components?: IRibbonComponents;
}

/** Saving the edited views with the ribbon's Save, and deleting the selected ones once the user confirms. */
export const ManageViewsRibbon = (props: IManageViewsRibbonProps) => {
    const provider = useDataProvider();
    const pcfContext = usePcfContext();
    const labels = useLabels(USER_QUERIES_LABELS);

    const deleteSelected = async () => {
        const confirmation = await pcfContext.navigation.openConfirmDialog({ text: labels.get('userQueries.confirmDeleteViews') });
        if (!confirmation.confirmed) {
            return;
        }
        await props.userQueries.deleteViews(provider.getSelectedRecordIds());
    };

    const onLoad = async (): Promise<IRibbonCommand[]> => {
        const commands: IRibbonCommand[] = [];
        if (provider.getSelectedRecordIds().length > 0) {
            commands.push({ id: 'delete', label: labels.get('userQueries.delete'), iconName: 'Delete', onExecute: deleteSelected });
        }
        return commands;
    };

    return <Ribbon enableSave onLoad={onLoad} components={props.components} />;
};
