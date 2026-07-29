import React from "react";
import { IForm } from "@components/Form/internal/FormModel";

export const FormContext = React.createContext<IForm | null>(null);

export const useForm = (): IForm => {
    const context = React.useContext(FormContext);
    if(!context) {
        throw new Error("useForm must be used within a FormContext.Provider");
    }
    return context;
}
