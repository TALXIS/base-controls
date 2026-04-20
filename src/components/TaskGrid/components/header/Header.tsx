import { IHeaderProps } from "../../../DatasetControl/interfaces"
import { ICommandBarItemProps } from "@talxis/react-components";
import * as React from "react"
import { CommandBarButton, ContextualMenuItemType, useTheme } from "@fluentui/react";
import { getHeaderStyles } from "./styles";
import { SettingsCallout } from "./settings-callout";
import { useDatasetControl, useLocalizationService, usePcfContext, useTaskDataProvider, useTaskGridComponents } from "../../context";
import { RecordSelector } from "../grid/record-selector";
import { ViewSwitcher } from "./view-switcher";
import { EditColumns } from "./edit-columns/EditColumns";

interface ITaskGridHeaderProps {
    headerProps: IHeaderProps;
    defaultRender: (props: IHeaderProps) => React.ReactElement;
}

export const Header = (props: ITaskGridHeaderProps) => {
    const localizationService = useLocalizationService();
    const datasetControl = useDatasetControl();
    const styles = React.useMemo(() => getHeaderStyles(), []);
    const provider = useTaskDataProvider();
    const [editColumnsOpen, setEditColumnsOpen] = React.useState(false);
    const pcfContext = usePcfContext();
    const components = useTaskGridComponents();

    const createTaskFromTemplate = (templateId: string) => {
        provider.createTasksFromTemplate(templateId);
    }

    const getCommandBarItems = (items: ICommandBarItemProps[]): ICommandBarItemProps[] => {
        const isTemplatingEnabled = datasetControl.isTemplatingEnabled();
        const isEditColumnsEnabled = datasetControl.getParameters().EnableEditColumns?.raw;
        const isTaskAddingEnabled = provider.isTaskAddingEnabled();
        const isTaskEditingEnabled = provider.isTaskEditingEnabled();
        const isTaskDeletingEnabled = provider.isTaskDeletingEnabled();
        const isShowHierarchyToggleVisible = datasetControl.isShowHierarchyToggleVisible();
        const isHideInactiveTasksToggleVisible = datasetControl.isHideInactiveTasksToggleVisible();
        const selectedIds = provider.getSelectedRecordIds();
        const isLoading = provider.isLoading();

        return [
            ...((isTaskAddingEnabled || isTemplatingEnabled) ? [{
                key: 'new',
                text: localizationService.getLocalizedString('new'),
                disabled: isLoading,
                iconProps: { iconName: 'Add' },
                subMenuProps: {
                    items: [
                        ...(isTaskAddingEnabled ? [{
                            key: 'addTopLevelTask',
                            disabled: isLoading,
                            iconProps: { iconName: 'AddToShoppingList' },
                            text: localizationService.getLocalizedString('topLevel'),
                            onClick: () => { provider.createTask(); }
                        }] : []),
                        ...(isTemplatingEnabled ? [
                            ...(isTaskAddingEnabled ? [{ key: 'divider', itemType: ContextualMenuItemType.Divider }] : []),
                            ...(selectedIds.length === 1 ? [{
                                key: 'templateFromTask',
                                iconProps: { iconName: 'PageList' },
                                text: localizationService.getLocalizedString('templateFromTask'),
                                disabled: isLoading,
                                onClick: () => { provider.createTemplateFromTask(selectedIds[0]); }
                            }] : []),
                            {
                                key: 'taskFromTemplate',
                                iconProps: { iconName: 'AddToShoppingList' },
                                text: localizationService.getLocalizedString('taskFromTemplate'),
                                disabled: isLoading,
                                subMenuProps: {
                                    items: [{ key: 'dummy' }],
                                    focusZoneProps: {
                                        shouldInputLoseFocusOnArrowKey: () => true
                                    },
                                    onRenderMenuList: () => isLoading ? <></> : (
                                        <RecordSelector
                                            provider={datasetControl.getTemplateDataProvider()}
                                            onRenderRecord={(props, defaultRender) => defaultRender({
                                                ...props,
                                                iconProps: { iconName: 'AddToShoppingList' }
                                            })}
                                            onRecordSelected={createTaskFromTemplate} />
                                    )
                                }
                            }
                        ] : [])
                    ]
                }
            }] : []),
            ...(selectedIds.length !== 0 ? [
                ...(isTaskEditingEnabled ? [{
                    key: 'edit',
                    text: localizationService.getLocalizedString('bulkEdit'),
                    disabled: isLoading,
                    iconProps: { iconName: 'Edit' },
                    onClick: () => { provider.editTasks(selectedIds); }
                }] : []),
                ...(isTaskDeletingEnabled ? [{
                    key: 'delete',
                    text: localizationService.getLocalizedString('deleteSelected'),
                    disabled: isLoading,
                    iconProps: { iconName: 'Delete' },
                    onClick: async () => {
                        const result = await pcfContext.navigation.openConfirmDialog({
                            text: localizationService.getLocalizedString("confirmDialog.deleteSelectedRows.text"),
                        });
                        if (result.confirmed) {
                            provider.deleteTasks(selectedIds);
                        }
                    }
                }] : []),
            ] : []),
            ...items,
            ...(isEditColumnsEnabled ? [{
                key: 'editColumns',
                disabled: isLoading,
                text: localizationService.getLocalizedString('editColumns'),
                iconProps: { iconName: 'ColumnOptions' },
                onRender: (item) => <CommandBarButton {...item} onClick={() => setEditColumnsOpen(true)} />
            } as ICommandBarItemProps,
            ] : []),
            ...(isShowHierarchyToggleVisible || isHideInactiveTasksToggleVisible ? [{
                key: 'settings',
                id: 'taskGridSettingsButton',
                disabled: isLoading,
                text: localizationService.getLocalizedString('settings'),
                subMenuProps: {
                    items: [{ key: 'dummy' }],
                    onRenderMenuList: () => <SettingsCallout />
                },
                iconProps: { iconName: 'Settings' },
            }] : [])
        ];
    }

    return props.defaultRender({
        ...props.headerProps,
        onRenderRibbonQuickFindWrapper: (props, defaultRender) => {
            return <div className={styles.root}>
                <ViewSwitcher />
                {defaultRender({
                    ...props,
                    ribbonQuickFindContainerProps: {
                        ...props.ribbonQuickFindContainerProps,
                        className: `${props.ribbonQuickFindContainerProps.className} ${styles.ribbonQuickFindContainer}`,
                    },
                    onRenderRibbon: (props, defaultRender) => {
                        return defaultRender({
                            ...props,
                            onRenderCommandBar: (props, defaultRender) => {
                                return components.onRenderCommandBar({
                                    ...props as any,
                                    items: getCommandBarItems(props.items as any)
                                })
                            }
                        })
                    }
                })}
                {editColumnsOpen &&
                    <EditColumns onDismiss={() => setEditColumnsOpen(false)} />
                }
            </div>
        }
    });
}