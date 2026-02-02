import { CommandBarButton, ContextualMenuItemType, IContextualMenuItem, useTheme } from "@fluentui/react";
import { useModel } from "../useModel";
import { useMemo } from "react";
import { getViewSwitcherStyles } from "./styles";
import { ViewSwitcherModel } from "./ViewSwitcherModel";

export const ViewSwitcher = () => {
    const model = useModel();
    const labels = model.getLabels();
    const theme = useTheme();
    const styles = useMemo(() => getViewSwitcherStyles(theme), [theme]);
    const viewSwitcher = useMemo(() => new ViewSwitcherModel(model.getDatasetControl()), []);

    const getViewSwitcherItems = (): IContextualMenuItem[] => {
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
                    className: viewSwitcher.getCurrentSavedQuery().id === view.id ? styles.selectedViewItem : undefined,

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
                    className: viewSwitcher.getCurrentSavedQuery().id === view.id ? styles.selectedViewItem : undefined,

                } as IContextualMenuItem
            })
        ]
    }

    return <CommandBarButton
        text={viewSwitcher.getCurrentSavedQuery().displayName}
        menuProps={{
            items: getViewSwitcherItems()
        }}
        styles={{
            label: styles.commandBarButtonLabel,
            menuIcon: styles.menuIcon,
            menuIconExpanded: styles.menuIconExpanded
        }}
    />
}