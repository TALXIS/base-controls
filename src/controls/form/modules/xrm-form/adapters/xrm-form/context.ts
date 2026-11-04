import React from "react";
import type { IXrmFormComponents } from "../../interfaces";
import { XrmFormComponents } from "./components";

export const XrmFormComponentsContext = React.createContext<IXrmFormComponents>(XrmFormComponents);

export const useXrmFormComponents = (): IXrmFormComponents => {
    return React.useContext(XrmFormComponentsContext);
};
