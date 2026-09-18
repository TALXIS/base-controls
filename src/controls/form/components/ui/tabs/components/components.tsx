import { Pivot } from "./pivot";

export interface ITabsComponentProps {
    children: React.ReactNode;
    expandedTab: string;
    onTabChange: (tabId: string) => void;
}

export interface ITabsComponents {
    onRenderTabs: (props: ITabsComponentProps) => JSX.Element;
}

export const TabComponents: ITabsComponents = {
    onRenderTabs: Pivot
};
