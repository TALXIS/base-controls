import React from "react";
import { IForm } from "@components/Form/internal/FormModel";

export const FormContext = React.createContext<IForm | null>(null);

FormContext.displayName = "FormContext";

export const useForm = (): IForm => {
    const context = React.useContext(FormContext);
    if(!context) {
        throw new Error(`This component must be rendered within ${FormContext.displayName}.Provider.`);
    }
    return context;
}
