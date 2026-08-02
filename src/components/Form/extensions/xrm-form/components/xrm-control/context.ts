import React from "react";
import type { IXrmFormComponents } from "@components/Form/extensions/xrm-form/interfaces";

export const XrmControlComponentsContext = React.createContext<Partial<IXrmFormComponents> | null>(null);

export const useXrmControlComponents = (): Partial<IXrmFormComponents> | null => {
    return React.useContext(XrmControlComponentsContext);
};
