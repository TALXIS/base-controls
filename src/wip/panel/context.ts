import React from "react";
import { IPanelComponents } from "./components"

export const PanelComponentsContext = React.createContext<IPanelComponents>(null as any);

export const usePanelComponents = () => {
    return React.useContext(PanelComponentsContext);
}