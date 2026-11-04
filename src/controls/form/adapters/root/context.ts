import React from "react";
import { IFormRuntime } from "../../runtime/FormRuntime";
import { useContextWithNullCheck } from "@core";

export const FormContext = React.createContext<IFormRuntime | null>(null);

FormContext.displayName = "FormContext";

export const useForm = (): IFormRuntime => {
    return useContextWithNullCheck(FormContext);
};
