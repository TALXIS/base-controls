import React from "react";
import { IForm } from "@controls/form/internal/FormModel";
import { ILocalizationService, useContextWithNullCheck } from "@utils";
import { IFormLabels } from "@controls/form/labels";

export const FormContext = React.createContext<IForm | null>(null);
export const FormLocalizationServiceContext = React.createContext<ILocalizationService<IFormLabels> | null>(null);

FormContext.displayName = "FormContext";
FormLocalizationServiceContext.displayName = "FormLocalizationService";

export const useForm = (): IForm => {
    return useContextWithNullCheck(FormContext);
};

export const useLocalizationService = (): ILocalizationService<IFormLabels> => {
    return useContextWithNullCheck(FormLocalizationServiceContext);
};
