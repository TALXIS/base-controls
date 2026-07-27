import React from "react";
import { IFormXmlModel } from "../../FormXmlForm";

export const FormXmlContext = React.createContext<IFormXmlModel | null>(null);

export const useFormXmlContext = () => {
    const context = React.useContext(FormXmlContext);
    if (!context) {
        throw new Error("useFormXmlContext must be used within a FormXmlContext.Provider");
    }
    return context;
}