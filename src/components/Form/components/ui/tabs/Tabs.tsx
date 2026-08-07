import * as React from "react";
import { TabComponents, type ITabsComponents } from "./components";
import { getPivotStyles } from "./styles";
import { useTheme } from "@fluentui/react";

export type TabLikeChild = React.ReactElement<{ id: string; label?: string; }>;

export interface IFormTabsProps {
    expandedTab: string;
    onTabChange: (tabId: string) => void;
    children?: TabLikeChild | TabLikeChild[];
    components?: Partial<ITabsComponents>;
}


export const Tabs = (props: IFormTabsProps) => {
    const { expandedTab, children, onTabChange } = props;
    const components = { ...TabComponents, ...props.components };
    const theme = useTheme();
    const styles = getPivotStyles(theme);

    return components.onRenderTabs({
        overflowBehavior: 'menu',
        selectedKey: expandedTab,
        className: styles.pivotContainer,
        styles: {
            root: styles.pivot,
            itemContainer: styles.itemContainer
        },
        children: children,
        onLinkClick: (item) => onTabChange?.(item?.props.itemKey!),
    })
};
