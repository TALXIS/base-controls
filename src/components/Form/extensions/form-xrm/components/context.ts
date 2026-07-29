import React from "react";
import { IFormXmlModel } from "../internal/FormXmlForm";
import { XrmFormContext as XrmFormContextClass } from "../xrm-context";

export const FormXmlContext = React.createContext<IFormXmlModel | null>(null);
export const XrmFormContext = React.createContext<XrmFormContextClass| null>(null);

export const useFormXmlContext = () => {
    const context = React.useContext(FormXmlContext);
    if (!context) {
        throw new Error("useFormXmlContext must be used within a FormXmlContext.Provider");
    }
    return context;
}

export const useXrmFormContext = () => {
    const context = React.useContext(XrmFormContext);
    if (!context) {
        throw new Error("useXrmFormContext must be used within a XrmFormContext.Provider");
    }
    return context;
}