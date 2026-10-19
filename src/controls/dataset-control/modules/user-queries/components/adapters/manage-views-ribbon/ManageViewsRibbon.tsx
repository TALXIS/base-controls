import { IDataProviderEventListeners } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { useDataProvider, usePcfContext } from "@utils";
import type { IRibbonCommand, IRibbonComponents } from "@controls/ribbon";
import { useRequiredDatasetControlRuntime } from "../../../../../components/adapters/root/context";
import { Ribbon } from "../../../../../components/adapters/ribbon/Ribbon";
import type { DatasetControlUserQueries } from "../../../DatasetControlUserQueries";

export interface IManageViewsRibbonProps {
    userQueries: DatasetControlUserQueries;
    components?: IRibbonComponents;
}

/** Saving the edited views, and deleting the selected ones once the user confirms. */
export const ManageViewsRibbon = (props: IManageViewsRibbonProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    const provider = useDataProvider();
    const pcfContext = usePcfContext();
    const labels = props.userQueries.getLabels();

    useEventEmitter<IDataProviderEventListeners>(provider, ['onRecordColumnValueChanged', 'onAfterSaved'], () => runtime.parts.find('ribbon')?.reload());

    const deleteSelected = async () => {
        const confirmation = await pcfContext.navigation.openConfirmDialog({ text: labels.getLocalizedString('confirmDeleteViews') });
        if (!confirmation.confirmed) {
            return;
        }
        await props.userQueries.deleteViews(provider.getSelectedRecordIds());
    };

    const onLoad = async (): Promise<IRibbonCommand[]> => {
        const commands: IRibbonCommand[] = [];
        if (provider.isDirty()) {
            commands.push({ id: 'save', label: labels.getLocalizedString('save'), iconName: 'Save', onExecute: () => props.userQueries.saveViews() });
        }
        if (provider.getSelectedRecordIds().length > 0) {
            commands.push({ id: 'delete', label: labels.getLocalizedString('delete'), iconName: 'Delete', onExecute: deleteSelected });
        }
        return commands;
    };

    return <Ribbon onLoad={onLoad} components={props.components} />;
};
