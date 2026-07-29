import React from "react";
import { IForm } from "@components/Form/internal/FormModel";
import { IRecord } from "@talxis/client-libraries";

export const FormContext = React.createContext<IForm | null>(null);

export const useFormContext = (): IForm => {
    const context = React.useContext(FormContext);
    if(!context) {
        throw new Error("useFormContext must be used within a FormContext.Provider");
    }
    return context;
}
