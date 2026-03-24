import { useCallback, useMemo, useState } from "react";
import { useViewSwitcher, ViewSwitcherLabelsContext } from "./context";
import { getViewSwitcherStyles } from "./styles";
import { IContextualMenuItem, IContextualMenuListProps, Shimmer, ShimmerElementType, useTheme } from "@fluentui/react";
import { IViewSwitcherLabels } from "./labels";
import { VIEW_SWITCHER_LABELS } from "./labels";
import { MenuList } from "./components/menu-list";
import { ISavedQuery } from "@talxis/client-libraries";
import { getClassNames, useEventEmitter, useIsLoading } from "../..";
import { IViewSwitcherEvents } from "../../utils/view-switcher";
import { useRerender } from "@talxis/react-components";
import { IViewSwitcherComponents } from "./components";
import { components as defaultComponents } from "./components";
import { CreateNewQueryDialog } from "./components/create-new-query-dialog/CreateNewQueryDialog";
import { ViewManagerPanel } from "./components/view-manager-panel";

const USER_VIEW_GROUP_KEY = 'userViews';
const SYSTEM_VIEW_GROUP_KEY = 'systemViews';
const ACTION_GROUP_KEY = 'actions';
const QUERY_ID_PREFIX = 'viewSelector_query'


export interface IViewSwitcherProps {
    enableUserQueries?: boolean;
    labels?: Partial<IViewSwitcherLabels>;
    components?: Partial<IViewSwitcherComponents>;
}

const LoadingShimmer = () => {
    return <Shimmer shimmerElements={[
        { type: ShimmerElementType.line, width: 200, height: 10 }
    ]} />
}

export const ViewSwitcher = (props: IViewSwitcherProps) => {
    const context = useViewSwitcher();
    const components = { ...defaultComponents, ...props.components };

    return <components.LoadingPlaceholder
        loadingPromise={context.areQueriesLoaded()}
        components={{
            Spinner: LoadingShimmer
        }}
    >
        <InternalViewSwitcher {...props} />
    </components.LoadingPlaceholder>
}

const InternalViewSwitcher = (props: IViewSwitcherProps) => {
    const context = useViewSwitcher();
    const labels = { ...VIEW_SWITCHER_LABELS, ...props.labels };
    const components = { ...defaultComponents, ...props.components };
    const { enableUserQueries } = props;
    const currentSavedQuery = context.getCurrentSavedQuery();
    const theme = useTheme();
    const styles = useMemo(() => getViewSwitcherStyles(theme), []);
    const [isLoading, executeWithLoading] = useIsLoading();
    const [createViewDialogOpen, setCreateViewDialogOpen] = useState(false);
    const [viewManagerOpen, setViewManagerOpen] = useState(false);
    const rerender = useRerender();

    useEventEmitter<IViewSwitcherEvents>(context, 'onQueryChanged', rerender);
    useEventEmitter<IViewSwitcherEvents>(context, 'onNewQueryCreated', (queryId: string) => onQueryCreated(queryId));

    const getQueryContextuaMenuItem = (view: ISavedQuery): IContextualMenuItem => {
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
            onClick: () => context.setCurrentSavedQuery(view.id)
        }
    }

    const getViewSwitcherItems = (): IContextualMenuItem[] => {
        return [
            ...context.getUserQueries().map(view => getQueryContextuaMenuItem(view)),
            ...context.getSystemQueries().map(view => getQueryContextuaMenuItem(view)),
            ...(enableUserQueries ? [
                ...(currentSavedQuery.isUserQuery ? [{
                    key: 'saveExistingView',
                    ['data-group-key']: ACTION_GROUP_KEY,
                    text: labels.saveExistingView,
                    hasIcons: true,
                    iconProps: {
                        iconName: 'Save'
                    },
                    //TODO: handle errors
                    onClick: () => {
                        executeWithLoading(() => context.updateCurrentUserQuery())
                    }

                }] : []),
                {
                    key: 'saveNewView',
                    ['data-group-key']: ACTION_GROUP_KEY,
                    text: labels.saveNewView,
                    hasIcons: true,
                    iconProps: {
                        iconName: 'SaveAs'
                    },
                    onClick: () => setCreateViewDialogOpen(true)
                },
                {
                    key: 'manageViews',
                    ['data-group-key']: ACTION_GROUP_KEY,
                    text: labels.manageViews,
                    hasIcons: true,
                    iconProps: {
                        iconName: 'Settings'
                    },
                    onClick: () => setViewManagerOpen(true)
                }] : []),

        ]
    }

    const onFocusQueryItem = (viewId: string) => {
        setTimeout(() => {
            const button = document.getElementById(`${QUERY_ID_PREFIX}_${viewId}`);
            button?.focus();
        }, 0);
    }

    const onQueryCreated = (queryId: string) => {
        setCreateViewDialogOpen(false);
        context.setCurrentSavedQuery(queryId);
    }

    const StableMenuList = useCallback((props?: IContextualMenuListProps) => {
        return <MenuList {...props as any} />
    }, [])

    return <ViewSwitcherLabelsContext.Provider value={labels}>
        <>
            <components.CommandBarButton
                text={currentSavedQuery.displayName}
                isLoading={isLoading}
                title={currentSavedQuery.displayName}
                styles={{
                    root: styles.commandBarButtonRoot,
                    label: styles.commandBarButtonLabel,
                    menuIcon: styles.menuIcon,
                    menuIconExpanded: styles.menuIconExpanded,
                    textContainer: styles.textContainer,

                }}
                menuProps={{
                    delayUpdateFocusOnHover: true,
                    shouldFocusOnMount: false,
                    items: getViewSwitcherItems(),
                    onMenuOpened: () => onFocusQueryItem(currentSavedQuery.id),
                    //hooks do not work if we pass MenuList directly
                    onRenderMenuList: StableMenuList
                }}
            />
            {createViewDialogOpen &&
                <CreateNewQueryDialog onDismiss={() => setCreateViewDialogOpen(false)} />
            }
            {viewManagerOpen &&
                <ViewManagerPanel onDismiss={() => setViewManagerOpen(false)} />
            }
        </>
    </ViewSwitcherLabelsContext.Provider>
}