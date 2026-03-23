import React from "react";
import { IViewSwitcher } from "../../utils/view-switcher";
import { IViewSwitcherLabels, VIEW_SWITCHER_LABELS } from "./labels";

export const ViewSwitcherContext = React.createContext<IViewSwitcher>(null as any);
export const ViewSwitcherLabelsContext = React.createContext<IViewSwitcherLabels>(VIEW_SWITCHER_LABELS);

export const useViewSwitcher = () => {
    return React.useContext(ViewSwitcherContext);
}

export const useViewSwitcherLabels = () => {
    return React.useContext(ViewSwitcherLabelsContext);
}