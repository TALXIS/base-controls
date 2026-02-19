import { CommandBarButton, ContextualMenuItem, Icon, IContextualMenuItem, Shimmer, ShimmerElementType, useTheme } from "@fluentui/react";
import { useModel } from "../useModel";
import { useMemo, useState } from "react";
import { getViewSwitcherStyles } from "./styles";
import { useEventEmitter } from "../../../hooks";
import { IDataProviderEventListeners, ISavedQuery } from "@talxis/client-libraries";
import { CreateViewDialog } from "./ViewManager/CreateViewDialog/CreateViewDialog";
import { Text } from '@fluentui/react/lib/Text';
import { getClassNames } from "../../../utils";
import { ViewManagerPanel } from "./ViewManager/ViewManagerPanel/ViewManagerPanel";

const USER_VIEW_GROUP_KEY = 'userViews';
const SYSTEM_VIEW_GROUP_KEY = 'systemViews';
const ACTION_GROUP_KEY = 'actions';
const QUERY_ID_PREFIX = 'viewSelector_query'

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
        const isSelected = currentSavedQuery.id === view.id;
        const classNames = getClassNames([styles.viewItem, isSelected ? styles.selectedViewItem : undefined]);
        return {
            key: view.id,
            id: `${QUERY_ID_PREFIX}_${view.id}`,
            text: view.displayName,
            hasIcons: view.isDefault,
            title: view.displayName,
            iconProps: view.isDefault ? { iconName: 'CheckMark' } : undefined,
            className: classNames,
            ['data-is-default']: view.isDefault,
            ['data-group-key']: view.isUserQuery ? USER_VIEW_GROUP_KEY : SYSTEM_VIEW_GROUP_KEY,
            onClick: () => viewSwitcher.setCurrentSavedQuery(view.id)
        }
    }

    const getViewSwitcherItems = (currentSavedQuery: ISavedQuery): IContextualMenuItem[] => {
        return [
            ...viewSwitcher.getUserQueries().map(view => getQueryContextuaMenuItem(view, currentSavedQuery)),
            ...viewSwitcher.getSystemQueries().map(view => getQueryContextuaMenuItem(view, currentSavedQuery)),
            ...(viewSwitcher.areUserQueriesEnabled() ? [
                ...(currentSavedQuery.isUserQuery ? [{
                    key: 'saveExistingView',
                    ['data-group-key']: ACTION_GROUP_KEY,
                    text: labels['save-existing-view'](),
                    hasIcons: true,
                    iconProps: {
                        iconName: 'Save'
                    },
                    //TODO: handle errors
                    onClick: () => viewSwitcher.updateCurrentUserQuery()
                    
                }] : []),
                {
                    key: 'saveNewView',
                    ['data-group-key']: ACTION_GROUP_KEY,
                    text: labels['save-new-view'](),
                    hasIcons: true,
                    iconProps: {
                        iconName: 'SaveAs'
                    },
                    onClick: () => setCreateViewDialogOpen(true)
                },
                {
                    key: 'manageViews',
                    ['data-group-key']: ACTION_GROUP_KEY,
                    text: labels['manage-views'](),
                    hasIcons: true,
                    iconProps: {
                        iconName: 'Settings'
                    },
                    onClick: () => setViewManagerOpen(true)
                }] : []),

        ]
    }

    const onRenderMenuSection = (section: { items: IContextualMenuItem[], label?: string; iconName?: string, itemRenderer?: (item: IContextualMenuItem) => JSX.Element }) => {
        const { items, label, iconName, itemRenderer } = section;
        const headerClassNames = getClassNames([styles.menuSectionHeader, ...(label || iconName ? [styles.menuSectionHeaderPadding] : [])]);
        return <>
            <div className={headerClassNames}>
                {iconName && <Icon className={styles.menuSectionHeaderLabel} iconName={iconName} />}
                {label && <Text className={styles.menuSectionHeaderLabel}>{label}</Text>}
            </div>
            <div className={styles.menuSectionContent}>
                {items.map(item => itemRenderer?.({
                    ...item,
                    onRenderIcon: item['data-is-default'] ? () => {
                        return <Text className={styles.defaultViewLabel}>{labels['default']()}</Text>
                    } : undefined
                }))}
            </div>
        </>
    }

    const onFocusQueryItem = (viewId: string) => {
        setTimeout(() => {
            const button = document.getElementById(`${QUERY_ID_PREFIX}_${viewId}`);
            button?.focus();
        }, 0);
    }

    const onViewManagerDismissed = (shouldRemount: boolean) => {
        if(shouldRemount) {
            datasetControl.requestRemount({
                reason: 'flush-state'
            });
        }
        else {
            setViewManagerOpen(false);
        }
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
                    delayUpdateFocusOnHover: true,
                    shouldFocusOnMount: false,
                    onMenuOpened: (t) => onFocusQueryItem(currentSavedQuery.id),
                    onRenderMenuList: (props) => {
                        const myViewItems = props?.items.filter(item => item['data-group-key'] === USER_VIEW_GROUP_KEY) ?? [];
                        const systemViewItems = props?.items.filter(item => item['data-group-key'] === SYSTEM_VIEW_GROUP_KEY) ?? [];
                        const actionItems = props?.items.filter(item => item['data-group-key'] === ACTION_GROUP_KEY) ?? [];

                        return <div className={styles.menuCallout}>
                            {myViewItems.length > 0 && onRenderMenuSection({ label: labels["user-views"](), items: myViewItems, iconName: 'Contact', itemRenderer: props?.defaultMenuItemRenderer as any })}
                            {systemViewItems.length > 0 && onRenderMenuSection({ label: labels["system-views"](), items: systemViewItems, iconName: 'ViewList', itemRenderer: props?.defaultMenuItemRenderer as any })}
                            {actionItems.length > 0 && onRenderMenuSection({ items: actionItems, itemRenderer: props?.defaultMenuItemRenderer as any })}
                        </div>
                    },
                    items: getViewSwitcherItems(currentSavedQuery)
                }}
                styles={{
                    root: styles.commandBarButtonRoot,
                    label: styles.commandBarButtonLabel,
                    menuIcon: styles.menuIcon,
                    menuIconExpanded: styles.menuIconExpanded
                }}
            />
            {viewManagerOpen && <ViewManagerPanel onDismiss={onViewManagerDismissed} />}
            {createViewDialogOpen && <CreateViewDialog onDismiss={() => setCreateViewDialogOpen(false)} />}
        </>
    }
}