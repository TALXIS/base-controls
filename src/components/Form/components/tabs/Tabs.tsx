import * as React from "react";
import { TabComponents, type ITabsComponents } from "./components";

export interface IFormTabsProps {
    expandedTab: string;
    onChangeTab: (tabId: string) => void;
    children?: React.ReactNode;
    components?: Partial<ITabsComponents>;
}

export const Tabs = (props: IFormTabsProps) => {
    const { expandedTab, children, onChangeTab } = props;
    const components = { ...TabComponents, ...props.components };

    return components.onRenderTabs({
        expandedTab: expandedTab,
        children: children,
        onChangeTab: onChangeTab,
    })
}
