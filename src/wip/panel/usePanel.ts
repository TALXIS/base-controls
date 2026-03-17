import React from "react";
import { IPanelComponents } from "./components"

interface IPanelContext {
    components: IPanelComponents;
}
export const PanelContext = React.createContext<IPanelContext>(null as any);

export const usePanel = () => {
    return React.useContext(PanelContext);
}