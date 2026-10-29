import { ReactNode, useEffect } from "react";
import { ContextualMenuItemType, IContextualMenuItem } from "@fluentui/react";
import { useRerender } from "@legacy";
import { useLabels, useDataProviderEvents } from "@utils";
import { IDatasetControlView, IDatasetControlViewGroup } from "../../../runtime";
import { DatasetControlUi } from "../../ui";
import { useDatasetControlPart, useRequiredDatasetControlRuntime } from "../root";
import { VIEW_SWITCHER_LABELS } from "./labels";
import { DatasetControlViewSwitcher } from "./DatasetControlViewSwitcher";
import { IViewSwitcherComponents } from "./components";

/** Props for `DatasetControl.ViewSwitcher`. */
export interface IViewSwitcherProps {
    /** Replacements for the switcher's pieces. */
    components?: IViewSwitcherComponents;
    /** What adds to the switcher, such as `DatasetControl.UserQueries`. */
    children?: ReactNode;
}

/** Switches the control between the views its `onLoadViews` returns, listed by their group. */
export const ViewSwitcher = (props: IViewSwitcherProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    const provider = useDataProviderEvents(['onLoading']);
    const viewSwitcher = useDatasetControlPart('viewSwitcher', () => new DatasetControlViewSwitcher({ services: runtime.services }));
    const labels = useLabels(VIEW_SWITCHER_LABELS);
    const views = viewSwitcher.getViews();
    const currentView = viewSwitcher.getCurrentView();
    const { rerender } = useRerender();

    useEffect(() => () => viewSwitcher.destroy(), []);

    const getGroups = (): Map<string, { group: IDatasetControlViewGroup; views: IDatasetControlView[] }> => {
        const ungrouped: IDatasetControlViewGroup = { id: 'ungrouped', name: labels.get('viewSwitcher.ungroupedViewsHeader') };
        const groups = new Map<string, { group: IDatasetControlViewGroup; views: IDatasetControlView[] }>();
        for (const view of views) {
            const group = view.group ?? ungrouped;
            const entry = groups.get(group.id) ?? { group, views: [] };
            entry.views.push(view);
            groups.set(group.id, entry);
        }
        return groups;
    };

    const viewItems: IContextualMenuItem[] = [...getGroups().values()].flatMap(({ group, views: groupViews }, index) => [
        ...(index > 0 ? [{ key: `${group.id}-divider`, itemType: ContextualMenuItemType.Divider }] : []),
        { key: `${group.id}-header`, itemType: ContextualMenuItemType.Header, iconProps: { iconName: 'ViewList' }, text: group.name },
        ...groupViews.map(view => ({ key: view.id, text: view.name, onClick: () => viewSwitcher.select(view.id) })),
    ]);

    return <>
        <DatasetControlUi.ViewSwitcher
            text={currentView?.name ?? ''}
            items={viewSwitcher.getItems(viewItems)}
            selectedKey={currentView?.id}
            //the items are read as the menu opens, so what children registered is in it
            onMenuClick={rerender}
            disabled={provider.isLoading()}
            components={props.components} />
        {props.children}
    </>;
};
