import { CommandBarButton as CommandBarButtonBase, ContextualMenuItemType, IContextualMenuItem, useTheme } from "@fluentui/react"
import * as React from "react"
import { getViewSwitcherStyles } from "./styles";
import { useDatasetControl, useLocalizationService, usePcfContext, useTaskDataProvider } from "../../../context";
import { CreateViewDialog } from "./create-view-dialog";
import { ViewManagerDialog } from "./view-manager";
import { useEventEmitter } from "../../../../../hooks";
import { withButtonLoading } from "@talxis/react-components";

const CommandBarButton = withButtonLoading(CommandBarButtonBase);

export const ViewSwitcher = () => {
    const localizationService = useLocalizationService();
    const datasetControl = useDatasetControl();
    const savedQueryDataProvider = datasetControl.getSavedQueryDataProvider();
    const taskDataProvider = useTaskDataProvider();
    const systemQueries = savedQueryDataProvider.getSystemQueries();
    const userQueries = savedQueryDataProvider.getUserQueries();
    const currentQuery = savedQueryDataProvider.getCurrentQuery();
    const theme = useTheme();
    const styles = React.useMemo(() => getViewSwitcherStyles(theme), []);
    const [showViewManagerDialog, setShowViewManagerDialog] = React.useState(false);
    const [showCreateViewDialog, setShowCreateViewDialog] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    useEventEmitter(savedQueryDataProvider.queryEvents, 'onBeforeUserQueryUpdated', () => {
        setIsLoading(true);
    });
    useEventEmitter(savedQueryDataProvider.queryEvents, 'onAfterUserQueryUpdated', () => {
        setIsLoading(false);
    });

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
                        savedQueryDataProvider.updateUserQuery(taskDataProvider);
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
        {showCreateViewDialog &&
            <CreateViewDialog onDismiss={() => setShowCreateViewDialog(false)} />
        }
        {showViewManagerDialog &&
            <ViewManagerDialog onDismiss={() => setShowViewManagerDialog(false)} />
        }
    </>
}