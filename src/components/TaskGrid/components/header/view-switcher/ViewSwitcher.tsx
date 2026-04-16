import { CommandBarButton, ContextualMenuItemType, IContextualMenuItem, useTheme } from "@fluentui/react"
import * as React from "react"
import { getViewSwitcherStyles } from "./styles";
import { useDatasetControl, useLocalizationService, usePcfContext, useTaskDataProvider } from "../../../context";
import { CreateViewDialog } from "./create-view-dialog";
import { ViewManagerDialog } from "./view-manager";

export const ViewSwitcher = () => {
    const localizationService = useLocalizationService();
    const datasetControl = useDatasetControl();
    const context = usePcfContext();
    const savedQueryDataProvider = datasetControl.getSavedQueryDataProvider();
    const taskDataProvider = useTaskDataProvider();
    const systemQueries = savedQueryDataProvider.getSystemQueries();
    const userQueries = savedQueryDataProvider.getUserQueries();
    const currentQuery = savedQueryDataProvider.getCurrentQuery();
    const theme = useTheme();
    const styles = React.useMemo(() => getViewSwitcherStyles(theme), []);
    const [showViewManagerDialog, setShowViewManagerDialog] = React.useState(false);
    const [showCreateViewDialog, setShowCreateViewDialog] = React.useState(false);

    const isQueryIdCurrent = (queryId: string): boolean => {
        return currentQuery.id === queryId;
    }

    const getViewSwitcherItems = (): IContextualMenuItem[] => {
        const userQueriesEnabled = savedQueryDataProvider.areUserQueriesEnabled();
        const mapQuery = (query: { id: string; name: string }): IContextualMenuItem => ({
            key: query.id,
            text: query.name,
            className: isQueryIdCurrent(query.id) ? styles.selectedViewItem : undefined,
            onClick: () => datasetControl.changeSavedQuery(query.id)
        });

        return [
            ...(userQueriesEnabled && userQueries.length > 0 ? [{
                key: 'userViewHeader',
                itemType: ContextualMenuItemType.Header,
                iconProps: { iconName: 'ViewList' },
                text: localizationService.getLocalizedString('myViews'),
            }] : []),
            ...(userQueriesEnabled ? userQueries.map(mapQuery) : []),
            {
                key: 'systemViewHeader',
                itemType: ContextualMenuItemType.Header,
                iconProps: { iconName: 'ViewList' },
                text: localizationService.getLocalizedString('systemViews'),
            },
            ...systemQueries.map(mapQuery),
            ...(userQueriesEnabled ? [
                {
                    key: 'viewsDivider',
                    itemType: ContextualMenuItemType.Divider
                },
                {
                    key: 'saveNewView',
                    text: localizationService.getLocalizedString('saveAsNew'),
                    iconProps: { iconName: 'SaveAs' },
                    onClick: () => setShowCreateViewDialog(true)
                },
                ...(savedQueryDataProvider.isUserQuery(currentQuery.id) ? [{
                    key: 'saveExistingView',
                    text: localizationService.getLocalizedString('saveExisting'),
                    iconProps: { iconName: 'Save' },
                    onClick: async () => {
                        const result = await savedQueryDataProvider.updateUserQuery(taskDataProvider);
                        if (!result.success) {
                            context.navigation.openErrorDialog({ message: result.errorMessage });
                        }
                    }
                }] : []),
                {
                    key: 'manageView',
                    text: localizationService.getLocalizedString('manageViews'),
                    iconProps: { iconName: 'Settings' },
                    onClick: () => setShowViewManagerDialog(true)
                }
            ] : [])
        ];
    }
    return <>
        <CommandBarButton
            disabled={taskDataProvider.isLoading()}
            styles={{
                label: styles.commandBarButtonLabel,
                menuIcon: styles.menuIcon,
                menuIconExpanded: styles.menuIconExpanded
            }}
            menuProps={{
                items: getViewSwitcherItems()
            }} text={currentQuery.name} />
        {showCreateViewDialog &&
            <CreateViewDialog onDismiss={() => setShowCreateViewDialog(false)} />
        }
        {showViewManagerDialog &&
            <ViewManagerDialog onDismiss={() => setShowViewManagerDialog(false)} />
        }
    </>
}