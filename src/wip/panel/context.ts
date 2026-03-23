import React from "react";
import { components, IPanelComponents } from "./components"
import { IPanelLabels, PANEL_LABELS } from "./labels";
import { IPanelProps } from "./Panel";


export const PanelComponentsContext = React.createContext<IPanelComponents>(components);
export const PanelLabelsContext = React.createContext<IPanelLabels>(PANEL_LABELS);
export const PanelPropsContext = React.createContext<IPanelProps>({});

export const usePanelComponents = () => {
    return React.useContext(PanelComponentsContext);
}

export const usePanelLabels = () => {
    return React.useContext(PanelLabelsContext);
}

export const usePanelProps = () => {
    return React.useContext(PanelPropsContext);
}