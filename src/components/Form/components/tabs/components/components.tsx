import { ITabProps } from "../..";
import { Pivot } from "./pivot";
import { PivotItem } from "./pivot-item";

export interface ITabsComponentProps {
    children: React.ReactNode;
    expandedTab: string;
    onChangeTab: (tabId: string) => void;
}

export interface ITabComponentProps {
    tab: ITabProps;
    children: React.ReactNode;
    onChangeTab: (tabId: string) => void;
}

export interface ITabsComponents {
    onRenderTabs: (props: ITabsComponentProps) => JSX.Element;
    onRenderTab: (props: ITabComponentProps) => JSX.Element;
}

export const TabComponents: ITabsComponents = {
    onRenderTabs: Pivot,
    onRenderTab: PivotItem
}