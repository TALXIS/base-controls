import { FormUiPivot } from "./pivot";

export interface ITabsComponentProps {
    children: React.ReactNode;
    expandedTab: string;
    onTabChange: (tabId: string) => void;
}

export interface IFormUiTabsComponents {
    onRender: (props: ITabsComponentProps) => JSX.Element;
}

export const FormUiTabComponents: IFormUiTabsComponents = {
    onRender: FormUiPivot
};
