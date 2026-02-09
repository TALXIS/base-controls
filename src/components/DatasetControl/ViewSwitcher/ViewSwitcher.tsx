import { CommandBarButton, ContextualMenuItemType, IContextualMenuItem, Shimmer, ShimmerElementType, ShimmerLine, Spinner, useTheme } from "@fluentui/react";
import { useModel } from "../useModel";
import { useMemo, useState } from "react";
import { getViewSwitcherStyles } from "./styles";
import { useEventEmitter } from "../../../hooks";
import { IDatasetControlEvents } from "../../../utils/dataset-control";
import { IDataProviderEventListeners, ISavedQuery } from "@talxis/client-libraries";

export const ViewSwitcher = () => {
    const model = useModel();
    const datasetControl = model.getDatasetControl();
    const labels = model.getLabels();
    const theme = useTheme();
    const styles = useMemo(() => getViewSwitcherStyles(theme), [theme]);
    const viewSwitcher = datasetControl.viewSwitcher;
    const [loading, setLoading] = useState(true);
    useEventEmitter<IDataProviderEventListeners>(datasetControl.getDataset(), 'onPreloadFinished', () => setLoading(false));

    const getViewSwitcherItems = (currentSavedQuery: ISavedQuery): IContextualMenuItem[] => {
        return [
            ...viewSwitcher.getUserQueries().length > 0 ? [{
                key: 'userViewHeader',
                itemType: ContextualMenuItemType.Header,
                iconProps: {
                    iconName: 'ViewList'
                },
                text: labels['user-views'](),
            }] : [],
            ...viewSwitcher.getUserQueries().map(view => {
                return {
                    key: view.id,
                    text: view.displayName,
                    className: currentSavedQuery.id === view.id ? styles.selectedViewItem : undefined,

                } as IContextualMenuItem
            }),
            {
                key: 'systemViewHeader',
                itemType: ContextualMenuItemType.Header,
                iconProps: {
                    iconName: 'ViewList'
                },
                text: labels['system-views'](),
            },
            ...viewSwitcher.getSystemQueries().map(view => {
                return {
                    key: view.id,
                    text: view.displayName,
                    className: currentSavedQuery.id === view.id ? styles.selectedViewItem : undefined,
                    onClick: () => viewSwitcher.setCurrentSavedQuery(view.id)

                } as IContextualMenuItem
            })
        ]
    }
    if (loading) {
        return <Shimmer shimmerElements={[
            {type: ShimmerElementType.line, width: 200, height: 10}
        ]} />
    }
    else {
        const currentSavedQuery = viewSwitcher.getCurrentSavedQuery();
        return <CommandBarButton
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
    }
}