import React from "react";
import { ControlComponents, IControlComponents } from "./components";

export const ControlComponentContext = React.createContext<IControlComponents>(ControlComponents);

export const useControlComponents = (): IControlComponents => {
    return React.useContext(ControlComponentContext);
}