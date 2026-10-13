import { useEffect, useMemo } from "react";
import { ContextualMenuItemType, IContextualMenuItem } from "@fluentui/react";
import { useEventEmitter, useLatest } from "@hooks";
import { useRerender } from "@legacy";
import { ErrorBoundary, LocalizationService } from "@utils";
import { Shimmer } from "@ui/shimmer";
import { ILoadingBoundaryComponents, LoadingBoundary } from "@ui/loading-boundary";
import { IDatasetControlView } from "../../../runtime";
import { DatasetControlUi } from "../../ui";
import { useRequiredDatasetControlRuntime } from "../root";
import { IViewSwitcherLabels, VIEW_SWITCHER_LABELS } from "./labels";
import { DatasetControlViewSwitcher, IDatasetControlViewSwitcher, IDatasetControlViewSwitcherEvents } from "./DatasetControlViewSwitcher";
import { IViewSwitcherComponents } from "./components";
import { getViewSwitcherStyles } from "./styles";

/** Props for `DatasetControl.ViewSwitcher`. */
export interface IViewSwitcherProps {
    /** Called at mount and on every `reload()`; returns the views to list. */
    onLoad: () => Promise<IDatasetControlView[]>;
    /** Called with the switcher once it exists, before the first load. */
    onReady?: (viewSwitcher: IDatasetControlViewSwitcher) => void;
    /** Overrides for the switcher's strings. */
    labels?: Partial<IViewSwitcherLabels>;
    /** Replacements for the switcher's pieces. */
    components?: IViewSwitcherComponents;
}

/** Switches the control between the views its `onLoad` returns, listed by their group. */
export const ViewSwitcher = (props: IViewSwitcherProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    const propsRef = useLatest(props);
    const viewSwitcher = useMemo(() => new DatasetControlViewSwitcher({ services: runtime.services, onLoad: () => propsRef.current.onLoad() }), []);
    const labels = useMemo(() => new LocalizationService<IViewSwitcherLabels>({ ...VIEW_SWITCHER_LABELS, ...props.labels }), [props.labels]);
    const styles = useMemo(() => getViewSwitcherStyles(), []);
    const { rerender } = useRerender();
    const { loadingBoundary, errorMessage, ...button } = props.components ?? {};
    const views = viewSwitcher.getViews();
    const currentView = viewSwitcher.getCurrentView();

    useEventEmitter<IDatasetControlViewSwitcherEvents>(viewSwitcher.events, ['onBeforeLoad', 'onLoaded'], rerender);

    useEffect(() => {
        propsRef.current.onReady?.(viewSwitcher);
        viewSwitcher.reload();
        return () => viewSwitcher.destroy();
    }, []);

    const loadingBoundaryComponents: Partial<ILoadingBoundaryComponents> = {
        onRenderContainer: () => <Shimmer className={styles.shimmer} styles={{ shimmerWrapper: styles.shimmerWrapper }} />,
        ...loadingBoundary,
    };

    const getGroups = (): Map<string, IDatasetControlView[]> => {
        const groups = new Map<string, IDatasetControlView[]>();
        for (const view of views ?? []) {
            const group = view.group ?? labels.getLocalizedString('ungroupedViewsHeader');
            groups.set(group, [...groups.get(group) ?? [], view]);
        }
        return groups;
    };

    const items: IContextualMenuItem[] = [...getGroups()].flatMap(([group, groupViews], index) => [
        ...(index > 0 ? [{ key: `${group}-divider`, itemType: ContextualMenuItemType.Divider }] : []),
        { key: `${group}-header`, itemType: ContextualMenuItemType.Header, iconProps: { iconName: 'ViewList' }, text: group },
        ...groupViews.map(view => ({ key: view.id, text: view.name, onClick: () => viewSwitcher.select(view.id) })),
    ]);

    return <ErrorBoundary error={viewSwitcher.getError()} onRetry={() => viewSwitcher.reload()} components={errorMessage}>
        <LoadingBoundary isLoading={views === undefined} components={loadingBoundaryComponents}>
            <DatasetControlUi.ViewSwitcher
                text={currentView?.name ?? ''}
                items={items}
                selectedKey={currentView?.id}
                components={button} />
        </LoadingBoundary>
    </ErrorBoundary>;
};
