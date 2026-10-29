import React from "react";
import { IForm } from "@controls/form/internal/FormModel";
import { useContextWithNullCheck } from "@utils";

export const FormContext = React.createContext<IForm | null>(null);

FormContext.displayName = "FormContext";

export const useForm = (): IForm => {
    return useContextWithNullCheck(FormContext);
};
