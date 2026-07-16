import * as React from "react";
import { TabComponents, type ITabsComponents } from "./components";

export interface IFormTabsProps {
    expandedTab: string;
    onChangeTab: (tabId: string) => void;
    children?: React.ReactNode;
    components?: Partial<ITabsComponents>;
}

export const Tabs = (props: IFormTabsProps) => {
    const { children, onChangeTab } = props;
    const components = { ...TabComponents, ...props.components };
    const tabComponents = React.Children.toArray(children).filter(child => React.isValidElement(child));

    return components.onRenderTabs({
        expandedTab: props.expandedTab,
        children: tabComponents.map(tab => components.onRenderTab({
            //@ts-ignore
            tab: tab.props,
            onChangeTab: onChangeTab,
            //@ts-ignore
            children: tab.props.children
        })),
        onChangeTab: onChangeTab,
    })
}
