import React from "react";
import { IFormXmlModel } from "../internal/FormXmlForm";
import type { IXrmFormContext } from "../xrm-context";

export const FormXmlContext = React.createContext<IFormXmlModel | null>(null);
export const XrmFormContext = React.createContext<IXrmFormContext | null>(null);

FormXmlContext.displayName = "FormXmlContext";
XrmFormContext.displayName = "XrmFormContext";

export const useFormXmlContext = () => {
    const context = React.useContext(FormXmlContext);
    if (!context) {
        throw new Error(`This component must be rendered within ${FormXmlContext.displayName}.Provider.`);
    }
    return context;
}

export const useXrmFormContext = () => {
    const context = React.useContext(XrmFormContext);
    if (!context) {
        throw new Error(`This component must be rendered within ${XrmFormContext.displayName}.Provider.`);
    }
    return context;
}