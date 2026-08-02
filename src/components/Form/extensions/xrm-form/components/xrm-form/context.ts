import React from "react";
import type { IXrmFormComponents } from "@components/Form/extensions/xrm-form/interfaces";

export const XrmFormComponentsContext = React.createContext<Partial<IXrmFormComponents> | null>(null);

export const useXrmFormComponents = (): Partial<IXrmFormComponents> | null => {
    return React.useContext(XrmFormComponentsContext);
};
