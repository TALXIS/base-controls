import React from "react";
import { IViewSwitcher } from "../../utils/view-switcher";
import { IViewSwitcherLabels, VIEW_SWITCHER_LABELS } from "./labels";
import { components, IViewSwitcherComponents } from "./components";

interface INewQueryDialogContext {
    name: string;
}

export const ViewSwitcherContext = React.createContext<IViewSwitcher>(null as any);
export const ViewSwitcherComponentsContext = React.createContext<IViewSwitcherComponents>(components);
export const ViewSwitcherLabelsContext = React.createContext<IViewSwitcherLabels>(VIEW_SWITCHER_LABELS);
export const ViewSwitcherNewQueryDialogContext = React.createContext<INewQueryDialogContext>(null as any);

export const useViewSwitcher = () => {
    return React.useContext(ViewSwitcherContext);
}

export const useViewSwitcherLabels = () => {
    return React.useContext(ViewSwitcherLabelsContext);
}

export const useViewSwitcherNewQueryDialogContext = () => {
    return React.useContext(ViewSwitcherNewQueryDialogContext);
}

export const useViewSwitcherComponents = () => {
    return React.useContext(ViewSwitcherComponentsContext);
}