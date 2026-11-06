import React from "react";
import { IForm } from "../../runtime/FormRuntime";
import { useContextWithNullCheck } from "@core";

export const FormContext = React.createContext<IForm | null>(null);

FormContext.displayName = "FormContext";

export const useForm = (): IForm => {
    return useContextWithNullCheck(FormContext);
};
