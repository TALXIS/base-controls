import React from "react";
import { IPanelComponents } from "./components"

interface IPanelInternalContext {
    components: IPanelComponents;
}
export const PanelInternalContext = React.createContext<IPanelInternalContext>(null as any);

export const usePanel = () => {
    return React.useContext(PanelInternalContext);
}