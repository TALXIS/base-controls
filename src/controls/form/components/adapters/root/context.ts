import React from "react";
import { IForm } from "@components/Form/internal/FormModel";
import { ILocalizationService, useContextWithNullCheck } from "@utils";
import { IFormLabels } from "@components/Form/labels";

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
