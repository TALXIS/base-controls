import { useMemo } from "react";
import { ContextualMenuItemType, ICommandBarItemProps } from "@fluentui/react";
import { IDataProviderEventListeners } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { RibbonUi } from "@controls/ribbon";
import { useTaskDataProvider, useTaskGridComponents, useTaskGridLabels, useTaskGridRuntime } from "@controls/task-grid/context";
import { SettingsCallout } from "../settings-callout";
import { getCommandBarStyles } from "./styles";

/** The task commands: New, Edit, Delete, Settings and the Gantt's. */
export const CommandBar = () => {
    const runtime = useTaskGridRuntime();
    const provider = useTaskDataProvider();
    const labels = useTaskGridLabels();
    const components = useTaskGridComponents();
    const styles = useMemo(() => getCommandBarStyles(), []);
    const { rerender } = useRerender();
    const services = runtime.services;
    const templates = services.find('templatesModule');
    const gantt = services.find('ganttModule');
    const selectedIds = provider.getSelectedRecordIds();
    const isLoading = provider.isLoading();

    useEventEmitter<IDataProviderEventListeners>(provider, ['onRecordsSelected', 'onLoading'], rerender);

    const deleteSelected = async () => {
        const result = await services.get('pcfContext').navigation.openConfirmDialog({
            text: labels.getLocalizedString('confirmDialog.deleteSelectedRows.text'),
        });
        if (result.confirmed) {
            provider.deleteTasks(selectedIds);
        }
    };

    const getNewSubMenuItems = (): ICommandBarItemProps[] => {
        const isCreatingEnabled = runtime.isTaskCreatingEnabled();
        if (!templates) {
            return [];
        }
        return [
            ...(isCreatingEnabled ? [{
                key: 'addTopLevelTask',
                disabled: isLoading,
                iconProps: { iconName: 'AddToShoppingList' },
                text: labels.getLocalizedString('topLevel'),
                onClick: () => { provider.createTask(); },
            }, {
                key: 'divider',
                itemType: ContextualMenuItemType.Divider,
            }] : []),
            ...(selectedIds.length === 1 ? [{
                key: 'templateFromTask',
                iconProps: { iconName: 'PageList' },
                text: labels.getLocalizedString('templateFromTask'),
                disabled: isLoading,
                onClick: () => { templates.provider.createTemplateFromTask(provider.getRecordsMap()[selectedIds[0]]); },
            }] : []),
            ...(isCreatingEnabled ? [{
                key: 'taskFromTemplate',
                iconProps: { iconName: 'AddToShoppingList' },
                text: labels.getLocalizedString('taskFromTemplate'),
                disabled: isLoading,
                subMenuProps: {
                    items: [{ key: 'templateSelector' }],
                    focusZoneProps: { shouldInputLoseFocusOnArrowKey: () => true },
                    onRenderMenuList: () => isLoading ? <></> : templates.components.onRenderTemplateSelector({
                        onTemplateSelected: templateId => templates.provider.createTasksFromTemplate({ templateId }),
                    }),
                },
            }] : []),
        ];
    };

    const getNewItem = (): ICommandBarItemProps[] => {
        const subMenuItems = getNewSubMenuItems();
        if (subMenuItems.length === 0 && !runtime.isTaskCreatingEnabled()) {
            return [];
        }
        return [{
            key: 'new',
            text: labels.getLocalizedString('new'),
            disabled: isLoading,
            iconProps: { iconName: 'Add' },
            onClick: subMenuItems.length === 0 ? () => { provider.createTask(); } : undefined,
            subMenuProps: subMenuItems.length === 0 ? undefined : { items: subMenuItems },
        }];
    };

    const getSelectionItems = (): ICommandBarItemProps[] => {
        if (selectedIds.length === 0) {
            return [];
        }
        return [
            ...(runtime.isTaskEditingEnabled() ? [{
                key: 'edit',
                text: labels.getLocalizedString('bulkEdit'),
                disabled: isLoading,
                iconProps: { iconName: 'Edit' },
                onClick: () => { provider.openTaskItems(selectedIds); },
            }] : []),
            ...(runtime.isTaskDeletingEnabled() ? [{
                key: 'delete',
                text: labels.getLocalizedString('deleteSelected'),
                disabled: isLoading,
                iconProps: { iconName: 'Delete' },
                onClick: () => { deleteSelected(); },
            }] : []),
        ];
    };

    const getSettingsItem = (): ICommandBarItemProps[] => {
        if (!runtime.isShowHierarchyToggleVisible() && !runtime.isHideInactiveTasksToggleVisible() && !gantt) {
            return [];
        }
        return [{
            key: 'settings',
            id: 'taskGridSettingsButton',
            disabled: isLoading,
            text: labels.getLocalizedString('settings'),
            iconProps: { iconName: 'Settings' },
            subMenuProps: {
                items: [{ key: 'settingsCallout' }],
                onRenderMenuList: () => <SettingsCallout />,
            },
        }];
    };

    const items = [...getNewItem(), ...getSelectionItems(), ...getSettingsItem(), ...gantt?.onGetCommandBarItems() ?? []];

    if (items.length === 0) {
        return null;
    }
    return <RibbonUi
        items={items}
        align='end'
        className={styles.commandBar}
        components={{ onRenderCommandBar: components.onRenderCommandBar }} />;
};
