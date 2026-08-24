import { CommandBarButton as CommandBarButtonBase, ContextualMenuItemType, IContextualMenuItem, useTheme } from "@fluentui/react"
import { usePcfContext } from "@utils";
import * as React from "react"
import { getViewSwitcherStyles } from "./styles";
import { useDatasetControl, useLocalizationService, useTaskDataProvider } from "@components/TaskGrid/context";
import { useEventEmitter } from "@hooks";
import { withButtonLoading } from "@legacy";

const CommandBarButton = withButtonLoading(CommandBarButtonBase);

/** The view dropdown. Lists the personal views and their commands when the user-queries module is registered. */
export const ViewSwitcher = () => {
    const localizationService = useLocalizationService();
    const datasetControl = useDatasetControl();
    const savedQueryDataProvider = datasetControl.getSavedQueryDataProvider();
    const userQueriesModule = datasetControl.getModules().userQueries;
    const taskDataProvider = useTaskDataProvider();
    const systemQueries = savedQueryDataProvider.getSystemQueries();
    const userQueries = savedQueryDataProvider.getUserQueries();
    const currentQuery = savedQueryDataProvider.getCurrentQuery();
    const theme = useTheme();
    const styles = React.useMemo(() => getViewSwitcherStyles(theme), []);
    const [showViewManagerDialog, setShowViewManagerDialog] = React.useState(false);
    const [showCreateViewDialog, setShowCreateViewDialog] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    useEventEmitter(userQueriesModule?.provider.events, 'onBeforeUserQueryUpdated', () => {
        setIsLoading(true);
    });
    useEventEmitter(userQueriesModule?.provider.events, 'onAfterUserQueryUpdated', () => {
        setIsLoading(false);
    });

    const isQueryIdCurrent = (queryId: string): boolean => {
        return currentQuery.id === queryId;
    }

    const getViewSwitcherItems = (): IContextualMenuItem[] => {
        const userQueriesEnabled = !!userQueriesModule;
        const isViewManagerEnabled = userQueriesModule?.enableQueryManager ?? false;
        const isSaveAsNewEnabled = userQueriesModule?.enableSaveAsNewQuery ?? false;
        const isSaveEnabled = userQueriesModule?.enableSaveQueryChanges ?? false;

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
                ...(isSaveAsNewEnabled ? [
                {
                    key: 'saveNewView',
                    text: localizationService.getLocalizedString('saveAsNew'),
                    iconProps: { iconName: 'SaveAs' },
                    onClick: () => setShowCreateViewDialog(true)
                }] : []),
                ...(userQueriesModule?.provider.isUserQuery(currentQuery.id) && isSaveEnabled ? [{
                    key: 'saveExistingView',
                    text: localizationService.getLocalizedString('saveExisting'),
                    iconProps: { iconName: 'Save' },
                    onClick: async () => {
                        userQueriesModule?.provider.updateFromGridState(currentQuery, taskDataProvider);
                    }
                }] : []),
                ...(isViewManagerEnabled ? [
                {
                    key: 'manageView',
                    text: localizationService.getLocalizedString('manageViews'),
                    iconProps: { iconName: 'Settings' },
                    onClick: () => setShowViewManagerDialog(true)
                }
            ] : [])
            ] : [])
        ];
    }
    return <>
        <CommandBarButton
            isLoading={isLoading}
            disabled={taskDataProvider.isLoading()}
            styles={{
                label: styles.commandBarButtonLabel,
                menuIcon: styles.menuIcon,
                menuIconExpanded: styles.menuIconExpanded
            }}
            menuProps={{
                items: getViewSwitcherItems()
            }} text={currentQuery.name} />
        {showCreateViewDialog && userQueriesModule &&
            <userQueriesModule.components.CreateView onDismiss={() => setShowCreateViewDialog(false)} />
        }
        {showViewManagerDialog && userQueriesModule &&
            <userQueriesModule.components.ViewManager onDismiss={() => setShowViewManagerDialog(false)} />
        }
    </>
}