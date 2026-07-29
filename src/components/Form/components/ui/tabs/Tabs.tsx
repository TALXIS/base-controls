import * as React from "react";
import { TabComponents, type ITabsComponents } from "./components";

export type TabLikeChild = React.ReactElement<{ id: string; label?: string; }>;

export interface IFormTabsProps {
    expandedTab: string;
    onChangeTab: (tabId: string) => void;
    children?: TabLikeChild | TabLikeChild[];
    components?: Partial<ITabsComponents>;
}

export const Tabs = (props: IFormTabsProps) => {
    const { expandedTab, children, onChangeTab } = props;
    const components = { ...TabComponents, ...props.components };

    return components.onRenderTabs({
        expandedTab,
        children,
        onChangeTab,
    });
};
