import { CommandBarButton, ContextualMenuItemType, IContextualMenuItem, Shimmer, ShimmerElementType, useTheme } from "@fluentui/react";
import { useModel } from "../useModel";
import { useMemo, useState } from "react";
import { getViewSwitcherStyles } from "./styles";
import { useEventEmitter } from "../../../hooks";
import { IDataProviderEventListeners, ISavedQuery } from "@talxis/client-libraries";
import { ViewManagerDialog } from "./ViewManager/ViewManagerDialog/ViewManagerDialog";
import { CreateViewDialog } from "./ViewManager/CreateViewDialog/CreateViewDialog";

export const ViewSwitcher = () => {
    const model = useModel();
    const datasetControl = model.getDatasetControl();
    const labels = model.getLabels();
    const theme = useTheme();
    const styles = useMemo(() => getViewSwitcherStyles(theme), [theme]);
    const viewSwitcher = datasetControl.viewSwitcher;
    const [loading, setLoading] = useState(true);
    const [viewManagerOpen, setViewManagerOpen] = useState(false);
    const [createViewDialogOpen, setCreateViewDialogOpen] = useState(false);
    useEventEmitter<IDataProviderEventListeners>(datasetControl.getDataset(), 'onPreloadFinished', () => setLoading(false));

    const getQueryContextuaMenuItem = (view: ISavedQuery, currentSavedQuery: ISavedQuery): IContextualMenuItem => {
        return {
            key: view.id,
            text: view.displayName,
            className: currentSavedQuery.id === view.id ? styles.selectedViewItem : undefined,
            onClick: () => viewSwitcher.setCurrentSavedQuery(view.id)
        }
    }

    const getViewSwitcherItems = (currentSavedQuery: ISavedQuery): IContextualMenuItem[] => {
        return [
            ...viewSwitcher.getUserQueries().length > 0 ? [{
                key: 'userViewHeader',
                itemType: ContextualMenuItemType.Header,
                iconProps: {
                    iconName: 'AccountBrowser'
                },
                text: labels['user-views'](),
            }] : [],
            ...viewSwitcher.getUserQueries().map(view => getQueryContextuaMenuItem(view, currentSavedQuery)),
            {
                key: 'systemViewHeader',
                itemType: ContextualMenuItemType.Header,
                iconProps: {
                    iconName: 'ViewList'
                },
                text: labels['system-views'](),
            },
            ...viewSwitcher.getSystemQueries().map(view => getQueryContextuaMenuItem(view, currentSavedQuery)),
            {
                key: 'viewsDivider',
                itemType: ContextualMenuItemType.Divider
            },
            ...(viewSwitcher.areUserQueriesEnabled() ? [
                ...(currentSavedQuery.isUserQuery ? [{
                    key: 'saveExistingView',
                    text: labels['save-existing-view'](),
                    iconProps: {
                        iconName: 'Save'
                    },
                }] : [{
                    key: 'saveNewView',
                    text: labels['save-new-view'](),
                    iconProps: {
                        iconName: 'SaveAs'
                    },
                    onClick: () => setCreateViewDialogOpen(true)
                }]),
                {
                    key: 'manageViews',
                    text: labels['manage-views'](),
                    iconProps: {
                        iconName: 'Settings'
                    },
                    onClick: () => setViewManagerOpen(true)
                }] : []),

        ]
    }
    if (loading) {
        return <Shimmer shimmerElements={[
            { type: ShimmerElementType.line, width: 200, height: 10 }
        ]} />
    }
    else {
        const currentSavedQuery = viewSwitcher.getCurrentSavedQuery();
        return <>
            <CommandBarButton
                text={currentSavedQuery.displayName}
                menuProps={{
                    items: getViewSwitcherItems(currentSavedQuery)
                }}
                styles={{
                    root: styles.commandBarButtonRoot,
                    label: styles.commandBarButtonLabel,
                    menuIcon: styles.menuIcon,
                    menuIconExpanded: styles.menuIconExpanded
                }}
            />
            {viewManagerOpen && <ViewManagerDialog />}
            {createViewDialogOpen && <CreateViewDialog onDismiss={() => setCreateViewDialogOpen(false)} />}
        </>
    }
}