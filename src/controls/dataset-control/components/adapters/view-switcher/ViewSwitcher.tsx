import { useEffect, useMemo } from "react";
import { ContextualMenuItemType, IContextualMenuItem } from "@fluentui/react";
import { IDatasetControlView } from "../../../runtime";
import { DatasetControlUi, IViewSwitcherUiComponents } from "../../ui";
import { LocalizationService } from "@utils";
import { useRequiredDatasetControlRuntime } from "../root";
import { IViewSwitcherLabels, VIEW_SWITCHER_LABELS } from "./labels";
import { DatasetControlViewSwitcher } from "./DatasetControlViewSwitcher";

export interface IViewSwitcherProps {
    labels?: Partial<IViewSwitcherLabels>;
    components?: Partial<IViewSwitcherUiComponents>;
}

/** Switches the control between the views `onLoad` returned, listed by their group. */
export const ViewSwitcher = (props: IViewSwitcherProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    const viewSwitcher = useMemo(() => new DatasetControlViewSwitcher({ services: runtime.services }), []);
    const labels = useMemo(() => new LocalizationService<IViewSwitcherLabels>({ ...VIEW_SWITCHER_LABELS, ...props.labels }), [props.labels]);
    const currentView = viewSwitcher.getCurrentView();

    useEffect(() => () => viewSwitcher.destroy(), []);

    const getGroups = (): Map<string, IDatasetControlView[]> => {
        const groups = new Map<string, IDatasetControlView[]>();
        for (const view of viewSwitcher.getViews()) {
            const group = view.group ?? labels.getLocalizedString('ungroupedViewsHeader');
            groups.set(group, [...groups.get(group) ?? [], view]);
        }
        return groups;
    };

    const items: IContextualMenuItem[] = [...getGroups()].flatMap(([group, views], index) => [
        ...(index > 0 ? [{ key: `${group}-divider`, itemType: ContextualMenuItemType.Divider }] : []),
        { key: `${group}-header`, itemType: ContextualMenuItemType.Header, iconProps: { iconName: 'ViewList' }, text: group },
        ...views.map(view => ({ key: view.id, text: view.name, onClick: () => viewSwitcher.select(view.id) })),
    ]);

    return <DatasetControlUi.ViewSwitcher
        text={currentView?.name ?? ''}
        items={items}
        selectedKey={currentView?.id}
        components={props.components} />;
};
