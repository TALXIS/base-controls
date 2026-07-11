import React from "react";
import { IForm } from "../..";

export const FormContext = React.createContext<IForm | null>(null);

export const useForm = (): IForm => {
    const context = React.useContext(FormContext);
    if (context === null) {
        throw new Error("[Form] This component must be rendered inside a Form component.");
    }
    return context;
}