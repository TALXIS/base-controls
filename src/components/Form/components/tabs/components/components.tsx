import { IForm, ITab } from "../../../form/FormModel";
import { Pivot } from "./pivot";
import { PivotItem } from "./pivot-item";

export interface ITabsComponentProps {
    form: IForm;
    children: React.ReactNode;
    onChangeTab?: (tabId: string) => void;
}

export interface ITabComponentProps {
    tab: ITab;
    form: IForm;
    children: React.ReactNode;
    onChangeTab?: (tabId: string) => void;
}

export interface ITabsComponents {
    onRenderTabs: (props: ITabsComponentProps) => JSX.Element;
    onRenderTab: (props: ITabComponentProps) => JSX.Element;
}

export const TabComponents: ITabsComponents = {
    onRenderTabs: Pivot,
    onRenderTab: PivotItem
}