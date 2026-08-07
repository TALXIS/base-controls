import { IPivotProps } from "@fluentui/react";
import { Pivot } from "./pivot";

export interface ITabsComponentProps extends IPivotProps {
}

export interface ITabsComponents {
    onRenderTabs: (props: ITabsComponentProps) => JSX.Element;
}

export const TabComponents: ITabsComponents = {
    onRenderTabs: Pivot
};
