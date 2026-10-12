import { useState } from "react";
import { ContextualMenuItemType, IButtonProps, IContextualMenuItem } from "@fluentui/react";
import { useEventEmitter } from "@hooks";
import { DatasetControl, useRequiredDatasetControlRuntime, ViewSwitcherUiComponents } from "@controls/dataset-control";
import { useTaskDataProvider, useTaskGridLabels, useTaskGridRuntime } from "@controls/task-grid/context";
import { IUserQueryDataProviderEvents } from "@controls/task-grid/modules/interfaces";

/** The views, with the personal-view commands below them when the user-queries feature is on. */
export const ViewSwitcher = () => {
    const runtime = useTaskGridRuntime();
    const datasetControl = useRequiredDatasetControlRuntime();
    const provider = useTaskDataProvider();
    const labels = useTaskGridLabels();
    const userQueries = runtime.services.find('userQueriesModule');
    const [dialog, setDialog] = useState<'create' | 'manage'>();
    const [isSaving, setIsSaving] = useState(false);

    useEventEmitter<IUserQueryDataProviderEvents>(userQueries?.provider.events, 'onBeforeUserQueryUpdated', () => setIsSaving(true));
    useEventEmitter<IUserQueryDataProviderEvents>(userQueries?.provider.events, 'onAfterUserQueryUpdated', () => setIsSaving(false));

    const saveChanges = () => {
        const query = runtime.services.get('savedQueryDataProvider').getSavedQuery(datasetControl.getViewId()!);
        userQueries?.provider.updateFromGridState(query, provider);
    };

    const getCommands = (): IContextualMenuItem[] => {
        if (!userQueries) {
            return [];
        }
        const viewId = datasetControl.getViewId();
        const commands: IContextualMenuItem[] = [
            ...(userQueries.enableSaveAsNewQuery ? [{
                key: 'saveNewView',
                text: labels.getLocalizedString('saveAsNew'),
                iconProps: { iconName: 'SaveAs' },
                onClick: () => setDialog('create'),
            }] : []),
            ...(userQueries.enableSaveQueryChanges && viewId && userQueries.provider.isUserQuery(viewId) ? [{
                key: 'saveExistingView',
                text: labels.getLocalizedString('saveExisting'),
                iconProps: { iconName: 'Save' },
                onClick: saveChanges,
            }] : []),
            ...(userQueries.enableQueryManager ? [{
                key: 'manageView',
                text: labels.getLocalizedString('manageViews'),
                iconProps: { iconName: 'Settings' },
                onClick: () => setDialog('manage'),
            }] : []),
        ];
        return commands.length === 0 ? [] : [{ key: 'viewsDivider', itemType: ContextualMenuItemType.Divider }, ...commands];
    };

    const renderButton = (props: IButtonProps) => ViewSwitcherUiComponents.onRenderButton({
        ...props,
        disabled: isSaving || provider.isLoading(),
        menuProps: props.menuProps && { ...props.menuProps, items: [...props.menuProps.items, ...getCommands()] },
    });

    return <>
        <DatasetControl.ViewSwitcher components={{ onRenderButton: renderButton }} />
        {dialog === 'create' && userQueries?.components.onRenderCreateView({ onDismiss: () => setDialog(undefined) })}
        {dialog === 'manage' && userQueries?.components.onRenderViewManager({ onDismiss: () => setDialog(undefined) })}
    </>;
};
