import * as React from "react";
import { FormUiTabComponents, type IFormUiTabsComponents } from "./components";

export type TabLikeChild = React.ReactElement<{ id: string; label?: string; }>;

export interface IFormTabsProps {
    expandedTab: string;
    onTabChange: (tabId: string) => void;
    children?: TabLikeChild | TabLikeChild[];
    components?: Partial<IFormUiTabsComponents>;
}


export const FormUiTabs = (props: IFormTabsProps) => {
    const { expandedTab, children, onTabChange } = props;
    const components = { ...FormUiTabComponents, ...props.components };

    return components.onRender({
        expandedTab,
        children,
        onTabChange,
    })
};
