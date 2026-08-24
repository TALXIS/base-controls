import { IHeaderProps } from "@components/DatasetControl/interfaces"
import { ICommandBarItemProps } from "@legacy";
import * as React from "react"
import { ContextualMenuItemType, useTheme } from "@fluentui/react";
import { getHeaderStyles } from "./styles";
import { SettingsCallout } from "./settings-callout";
import { useDatasetControl, useLocalizationService, usePcfContext, useRootElementId, useTaskDataProvider, useTaskGridComponents } from "@components/TaskGrid/context";
import { ViewSwitcher } from "./view-switcher";
import { EditColumns as EditColumnsBase } from "@components/DatasetControl/EditColumns/EditColumns";

interface ITaskGridHeaderProps {
    headerProps: IHeaderProps;
    defaultRender: (props: IHeaderProps) => React.ReactElement;
}

/** The bar above the grid: the ribbon, the view switcher, quick find and the settings callout. */
export const Header = (props: ITaskGridHeaderProps) => {
    const localizationService = useLocalizationService();
    const datasetControl = useDatasetControl();
    const styles = React.useMemo(() => getHeaderStyles(), []);
    const provider = useTaskDataProvider();
    const [editColumnsOpen, setEditColumnsOpen] = React.useState(false);
    const pcfContext = usePcfContext();
    const components = useTaskGridComponents();
    const rootElementId = useRootElementId();
    const customColumns = datasetControl.getModules().customColumns;
    const EditColumnsComponent = customColumns?.components.EditColumns ?? EditColumnsBase;

    const hasContent = () => {
        return datasetControl.isViewSwitcherEnabled() ||
            datasetControl.isTaskCreatingEnabled() ||
            !!datasetControl.getModules().templates ||
            datasetControl.isTaskEditingEnabled() ||
            datasetControl.isTaskDeletingEnabled() ||
            datasetControl.isEditColumnsVisible() ||
            datasetControl.isShowHierarchyToggleVisible() ||
            datasetControl.isHideInactiveTasksToggleVisible();
    }

    const createTaskFromTemplate = (templateId: string) => {
        provider.createTasksFromTemplate(templateId);
    }

    const getNewSubMenuItems = (
        isTaskAddingEnabled: boolean,
        selectedIds: string[],
        isLoading: boolean,
    ): ICommandBarItemProps[] => {
        const templates = datasetControl.getModules().templates;
        return [
            ...(isTaskAddingEnabled ? [{
                key: 'addTopLevelTask',
                disabled: isLoading,
                iconProps: { iconName: 'AddToShoppingList' },
                text: localizationService.getLocalizedString('topLevel'),
                onClick: () => { provider.createTask(); }
            }] : []),
            ...(templates ? [
                ...(isTaskAddingEnabled ? [{ key: 'divider', itemType: ContextualMenuItemType.Divider }] : []),
                ...(selectedIds.length === 1 ? [{
                    key: 'templateFromTask',
                    iconProps: { iconName: 'PageList' },
                    text: localizationService.getLocalizedString('templateFromTask'),
                    disabled: isLoading,
                    onClick: () => { templates.provider.createTemplateFromTask(provider.getRecordsMap()[selectedIds[0]]); }
                }] : []),
                ...(isTaskAddingEnabled ? [{
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
                            <templates.components.TemplateSelector onTemplateSelected={createTaskFromTemplate} />
                        )
                    }
                }] : [])
            ] : [])
        ];
    }

    const getCommandBarItems = (items: ICommandBarItemProps[]): ICommandBarItemProps[] => {
        const isTemplatingEnabled = !!datasetControl.getModules().templates;
        const isEditColumnsEnabled = datasetControl.isEditColumnsVisible();
        const isTaskAddingEnabled = datasetControl.isTaskCreatingEnabled();
        const isTaskEditingEnabled = datasetControl.isTaskEditingEnabled();
        const isTaskDeletingEnabled = datasetControl.isTaskDeletingEnabled();
        const isShowHierarchyToggleVisible = datasetControl.isShowHierarchyToggleVisible();
        const isHideInactiveTasksToggleVisible = datasetControl.isHideInactiveTasksToggleVisible();
        const selectedIds = provider.getSelectedRecordIds();
        const isLoading = provider.isLoading();

        return [
            ...((getNewSubMenuItems(isTaskAddingEnabled, selectedIds, isLoading).length > 0) ? [{
                key: 'new',
                text: localizationService.getLocalizedString('new'),
                disabled: isLoading,
                iconProps: { iconName: 'Add' },
                onClick: (isTaskAddingEnabled && !isTemplatingEnabled) ? () => { provider.createTask(); } : undefined,
                subMenuProps: (isTaskAddingEnabled && !isTemplatingEnabled) ? undefined : { items: getNewSubMenuItems(isTaskAddingEnabled, selectedIds, isLoading) }
            }] : []),
            ...(selectedIds.length !== 0 ? [
                ...(isTaskEditingEnabled ? [{
                    key: 'edit',
                    text: localizationService.getLocalizedString('bulkEdit'),
                    disabled: isLoading,
                    iconProps: { iconName: 'Edit' },
                    onClick: () => { provider.openTaskItems(selectedIds); }
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
                onClick: () => setEditColumnsOpen(true)
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

    if (!hasContent()) return <></>

    return props.defaultRender({
        ...props.headerProps,
        onRenderRibbonQuickFindWrapper: (props, defaultRender) => {
            return <div className={styles.root}>
                {datasetControl.isViewSwitcherEnabled() &&
                    <ViewSwitcher />
                }
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
                    <EditColumnsComponent
                        onDismiss={() => setEditColumnsOpen(false)}
                        showScopeSelector={datasetControl.isEditColumnsScopeSelectorEnabled()}
                        panelProps={{
                            isBlocking: true,
                            onOuterClick: () => { },
                            focusTrapZoneProps: {
                                forceFocusInsideTrap: false
                            },
                            layerProps: {
                                hostId: rootElementId,
                                styles: {
                                    root: styles.editColumnsLayerHost
                                }
                            }
                        }} />
                }
            </div>
        }
    });
}